import type { ApiResponse } from "@shared/index";

/**
 * Empty means "same origin", which is how the Docker image serves this app —
 * Express hands out the client and the API from one host, so every path below
 * comes out relative. The fallback is not cosmetic: without it an unset
 * variable would put the literal string "undefined" in front of every request.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "";

/** Readable on purpose so it can be echoed back in a header the server checks. */
const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "X-CSRF-Token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * A failure the server described, or one this client could not get past.
 *
 * Fields are declared and assigned rather than written as constructor
 * parameter properties: this project builds with `erasableSyntaxOnly`, which
 * only permits TypeScript that vanishes without emitting code.
 */
export class ApiError extends Error {
  readonly code: string;
  /** 0 when the request never produced a response at all. */
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

const readCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const isEnvelope = <T>(value: unknown): value is ApiResponse<T> =>
  typeof value === "object" && value !== null && "success" in value;

/**
 * Whether a session plausibly exists.
 *
 * The access and refresh tokens are httpOnly and unreadable from here by
 * design, so the CSRF cookie is the only signal this side has — and it is a
 * dependable one: all three are issued together, cleared together, and this one
 * carries the refresh token's lifetime exactly.
 *
 * It exists so the app can avoid asking about a session that provably is not
 * there. The browser writes every 4xx to the console, and a guest loading the
 * page used to produce two of them; noise there is how real errors end up
 * ignored. This mirrors the server's own rule in `csrf.ts` — a request with no
 * session cookie has no session to ride.
 */
export const hasSessionCookie = (): boolean => readCookie(CSRF_COOKIE) !== null;

let refreshInFlight: Promise<void> | null = null;

/**
 * Trades the refresh cookie for a new session.
 *
 * Shared between callers on purpose: the server rotates the refresh token on
 * every use, so two refreshes racing would leave the loser holding a token that
 * has already been spent. Everyone waits on the same attempt instead.
 */
const refreshSession = (): Promise<void> => {
  refreshInFlight ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: csrfHeaders("POST"),
  })
    .then((response) => {
      if (!response.ok) {
        throw new ApiError("UNAUTHORIZED", "Session expired", response.status);
      }
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
};

const csrfHeaders = (method: string): Record<string, string> => {
  if (SAFE_METHODS.has(method)) return {};
  const token = readCookie(CSRF_COOKIE);
  return token ? { [CSRF_HEADER]: token } : {};
};

async function send<T>(
  path: string,
  options: RequestOptions,
  mayRetry: boolean,
): Promise<T> {
  const { method = "GET", body, signal } = options;

  const headers: Record<string, string> = { ...csrfHeaders(method) };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      // The session lives in httpOnly cookies, so every call has to carry them.
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "Network error — check your connection and try again",
      0,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      "INVALID_RESPONSE",
      "The server returned an unreadable response",
      response.status,
    );
  }

  if (!isEnvelope<T>(payload)) {
    throw new ApiError(
      "INVALID_RESPONSE",
      "The server returned an unexpected response",
      response.status,
    );
  }

  if (!payload.success) {
    const failure = new ApiError(
      payload.error.code,
      payload.error.message,
      response.status,
      payload.error.details,
    );

    // A 401 usually means the short-lived access cookie aged out while the
    // refresh cookie is still good. Renew once and replay, so the user never
    // sees a session that quietly expired underneath them.
    //
    // Gated on there being a session at all: a guest gets 401 too, and renewing
    // nothing would only spend a second request to be told the same thing.
    if (
      response.status === 401 &&
      mayRetry &&
      !path.startsWith("/auth/refresh") &&
      hasSessionCookie()
    ) {
      try {
        await refreshSession();
      } catch {
        throw failure;
      }
      return send<T>(path, options, false);
    }

    throw failure;
  }

  return payload.data;
}

/**
 * The single path to the API. Unwraps the success envelope so callers receive
 * the payload itself, and funnels every way a request can fail into one ApiError.
 */
export const apiRequest = <T>(path: string, options: RequestOptions = {}): Promise<T> =>
  send<T>(path, options, true);

/** A message worth showing a user, whatever actually went wrong. */
export const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Something went wrong";

import type { ApiResponse } from "@shared/index";

const API_URL = import.meta.env.VITE_API_URL;

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
  token?: string | null;
  signal?: AbortSignal;
}

const isEnvelope = <T>(value: unknown): value is ApiResponse<T> =>
  typeof value === "object" && value !== null && "success" in value;

/**
 * The single path to the API.
 *
 * Unwraps the success envelope so callers receive the payload itself, and
 * funnels every way a request can fail — transport, unreadable body, or a
 * failure the server described — into one ApiError.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, signal } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
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
    throw new ApiError(
      payload.error.code,
      payload.error.message,
      response.status,
      payload.error.details,
    );
  }

  return payload.data;
}

/** A message worth showing a user, whatever actually went wrong. */
export const errorMessage = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Something went wrong";

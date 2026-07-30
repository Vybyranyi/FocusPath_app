import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, errorMessage } from "@api/client";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const ok = (data: unknown = null) => jsonResponse({ success: true, data });
const failure = (code: string, message: string, status: number) =>
  jsonResponse({ success: false, error: { code, message } }, status);

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  document.cookie = "csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const initAt = (call: number) => fetchMock.mock.calls[call][1] as RequestInit;
const urlAt = (call: number) => fetchMock.mock.calls[call][0] as string;

describe("apiRequest", () => {
  it("returns the payload rather than the envelope around it", async () => {
    fetchMock.mockResolvedValue(ok({ user: { _id: "1" } }));

    await expect(apiRequest("/auth/me")).resolves.toEqual({ user: { _id: "1" } });
  });

  it("sends cookies on every call, since the session is one", async () => {
    fetchMock.mockResolvedValue(ok());

    await apiRequest("/habits/");

    expect(initAt(0).credentials).toBe("include");
  });

  it("turns a described failure into an ApiError carrying its code and status", async () => {
    fetchMock.mockResolvedValue(failure("NOT_FOUND", "User not found", 404));

    await expect(apiRequest("/auth/me")).rejects.toMatchObject({
      name: "ApiError",
      code: "NOT_FOUND",
      message: "User not found",
      status: 404,
    });
  });

  it("carries field-level detail through when the server sends it", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: { gender: ["Gender is not valid"] },
          },
        },
        400,
      ),
    );

    await expect(apiRequest("/auth/register")).rejects.toMatchObject({
      details: { gender: ["Gender is not valid"] },
    });
  });

  it("rejects a body that is not the envelope at all", async () => {
    // A proxy or load balancer answering with its own error page, for instance.
    fetchMock.mockResolvedValue(jsonResponse({ message: "Bad gateway" }, 502));

    await expect(apiRequest("/habits/")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      status: 502,
    });
  });

  it("rejects a body that is not JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>gateway timeout</html>", { status: 504 }),
    );

    await expect(apiRequest("/habits/")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("reports a transport failure without inventing a status", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiRequest("/habits/")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
  });

  it("only declares a JSON content type when it actually sends a body", async () => {
    fetchMock.mockResolvedValue(ok());

    await apiRequest("/habits/1", { method: "DELETE" });

    expect(initAt(0).headers).not.toHaveProperty("Content-Type");
    expect(initAt(0).body).toBeUndefined();
  });

  it("serialises the body it is given", async () => {
    fetchMock.mockResolvedValue(ok());

    await apiRequest("/auth/login", { method: "POST", body: { email: "a@b.c" } });

    expect(initAt(0).headers).toMatchObject({ "Content-Type": "application/json" });
    expect(initAt(0).body).toBe('{"email":"a@b.c"}');
  });
});

describe("CSRF", () => {
  it("echoes the readable csrf cookie back in a header on state-changing calls", async () => {
    document.cookie = "csrf_token=abc123; path=/";
    fetchMock.mockResolvedValue(ok());

    await apiRequest("/habits/", { method: "POST", body: {} });

    expect(initAt(0).headers).toMatchObject({ "X-CSRF-Token": "abc123" });
  });

  it("does not bother on reads, which cannot change anything", async () => {
    document.cookie = "csrf_token=abc123; path=/";
    fetchMock.mockResolvedValue(ok());

    await apiRequest("/habits/");

    expect(initAt(0).headers).not.toHaveProperty("X-CSRF-Token");
  });

  it("sends no header when there is no cookie to echo", async () => {
    fetchMock.mockResolvedValue(ok());

    await apiRequest("/auth/login", { method: "POST", body: {} });

    expect(initAt(0).headers).not.toHaveProperty("X-CSRF-Token");
  });
});

describe("session renewal", () => {
  it("renews once and replays the request when the access cookie has aged out", async () => {
    fetchMock
      .mockResolvedValueOnce(failure("UNAUTHORIZED", "Not authenticated", 401))
      .mockResolvedValueOnce(ok())
      .mockResolvedValueOnce(ok({ habits: [] }));

    await expect(apiRequest("/habits/")).resolves.toEqual({ habits: [] });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(urlAt(1)).toContain("/auth/refresh");
    expect(urlAt(2)).toContain("/habits/");
  });

  it("gives up with the original failure when renewal is refused", async () => {
    fetchMock
      .mockResolvedValueOnce(failure("UNAUTHORIZED", "Not authenticated", 401))
      .mockResolvedValueOnce(failure("UNAUTHORIZED", "Session expired", 401));

    await expect(apiRequest("/habits/")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });

  it("does not try to renew a refusal from the renewal endpoint itself", async () => {
    fetchMock.mockResolvedValue(failure("UNAUTHORIZED", "Not authenticated", 401));

    await expect(apiRequest("/auth/refresh", { method: "POST" })).rejects.toBeInstanceOf(
      ApiError,
    );

    // One call, not an endless chain of retries against the same endpoint.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("renews once for several requests that expire together", async () => {
    // The server rotates the refresh token on use, so a second concurrent
    // renewal would be spending a token the first one already replaced.
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/auth/refresh")) return Promise.resolve(ok());
      return fetchMock.mock.calls.filter((call) => !String(call[0]).includes("refresh"))
        .length <= 3
        ? Promise.resolve(failure("UNAUTHORIZED", "Not authenticated", 401))
        : Promise.resolve(ok({ done: true }));
    });

    await Promise.allSettled([
      apiRequest("/habits/"),
      apiRequest("/habits/daily"),
      apiRequest("/auth/me"),
    ]);

    const refreshCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/auth/refresh"),
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it("does not retry a failure that is not about authentication", async () => {
    fetchMock.mockResolvedValue(failure("NOT_FOUND", "Habit not found", 404));

    await expect(apiRequest("/habits/1")).rejects.toMatchObject({ code: "NOT_FOUND" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("errorMessage", () => {
  it("uses the server's wording when there is one", () => {
    expect(errorMessage(new ApiError("NOT_FOUND", "User not found", 404))).toBe(
      "User not found",
    );
  });

  it("falls back for anything that is not an ApiError", () => {
    expect(errorMessage(new Error("boom"))).toBe("Something went wrong");
    expect(errorMessage("a bare string")).toBe("Something went wrong");
  });
});

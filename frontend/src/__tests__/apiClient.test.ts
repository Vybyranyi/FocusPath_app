import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, errorMessage } from "@api/client";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The options object the client passed to fetch on its most recent call. */
const lastInit = () => fetchMock.mock.calls[0][1] as RequestInit;

describe("apiRequest", () => {
  it("returns the payload rather than the envelope around it", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ success: true, data: { token: "abc", user: { _id: "1" } } }),
    );

    await expect(apiRequest("/auth/token")).resolves.toEqual({
      token: "abc",
      user: { _id: "1" },
    });
  });

  it("turns a described failure into an ApiError carrying its code and status", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { success: false, error: { code: "NOT_FOUND", message: "User not found" } },
        404,
      ),
    );

    await expect(apiRequest("/auth/token")).rejects.toMatchObject({
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

    await expect(apiRequest("/auth/")).rejects.toMatchObject({
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
      status: 504,
    });
  });

  it("reports a transport failure without inventing a status", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiRequest("/habits/")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      status: 0,
    });
  });

  it("sends the bearer token when one is supplied", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

    await apiRequest("/habits/", { token: "abc" });

    expect(lastInit().headers).toMatchObject({ Authorization: "Bearer abc" });
  });

  it("omits the Authorization header when there is no token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

    await apiRequest("/habits/", { token: null });

    expect(lastInit().headers).not.toHaveProperty("Authorization");
  });

  it("only declares a JSON content type when it actually sends a body", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

    await apiRequest("/habits/1", { method: "DELETE" });

    expect(lastInit().headers).not.toHaveProperty("Content-Type");
    expect(lastInit().body).toBeUndefined();
  });

  it("serialises the body it is given", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: true, data: null }));

    await apiRequest("/auth/token", { method: "POST", body: { email: "a@b.c" } });

    expect(lastInit().headers).toMatchObject({ "Content-Type": "application/json" });
    expect(lastInit().body).toBe('{"email":"a@b.c"}');
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

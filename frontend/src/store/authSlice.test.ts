import { describe, it, expect, beforeEach } from "vitest";
import reducer, { logout, registerUser, loginUser } from "./authSlice";
import type { IAuthSlice } from "./authSlice";

const initialState: IAuthSlice = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return initial state", () => {
    expect(reducer(undefined, { type: "" })).toEqual({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  });

  it("should handle logout", () => {
    const prevState: IAuthSlice = {
      user: { _id: "1", name: "Test", surname: "User", birthday: "2020-01-01", gender: "male", email: "test@mail.com", createdAt: "2020", updatedAt: "2020" },
      token: "123",
      loading: false,
      error: null,
    };

    const state = reducer(prevState, logout());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it("should handle registerUser.pending", () => {
    const state = reducer(initialState, { type: registerUser.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("should handle registerUser.fulfilled", () => {
    const payload = {
      user: { _id: "1", name: "Test", surname: "User", birthday: "2020-01-01", gender: "male", email: "test@mail.com", createdAt: "2020", updatedAt: "2020" },
      token: "jwt_token",
    };

    const state = reducer(initialState, {
      type: registerUser.fulfilled.type,
      payload,
    });

    expect(state.loading).toBe(false);
    expect(state.user).toEqual(payload.user);
    expect(state.token).toBe("jwt_token");
    expect(localStorage.getItem("token")).toBe("jwt_token");
  });

  it("should handle registerUser.rejected", () => {
    const state = reducer(initialState, {
      type: registerUser.rejected.type,
      payload: "Registration failed",
    });

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Registration failed");
  });

  it("should handle loginUser.fulfilled", () => {
    const payload = {
      user: { _id: "1", name: "Test", surname: "User", birthday: "2020-01-01", gender: "male", email: "test@mail.com", createdAt: "2020", updatedAt: "2020" },
      token: "jwt_token",
    };

    const state = reducer(initialState, {
      type: loginUser.fulfilled.type,
      payload,
    });

    expect(state.user).toEqual(payload.user);
    expect(state.token).toBe("jwt_token");
  });
});

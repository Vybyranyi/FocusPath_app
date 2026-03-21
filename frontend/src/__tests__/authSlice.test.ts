import { describe, it, expect, beforeEach } from "vitest";
import reducer, { logout, registerUser, loginUser, verifyToken } from '../store/authSlice';
import type { IAuthSlice } from '../store/authSlice';

const initialState: IAuthSlice = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const mockUser = {
  _id: "1",
  name: "Test",
  surname: "User",
  birthday: "2020-01-01",
  gender: "male" as const,
  email: "test@mail.com",
  createdAt: "2020",
  updatedAt: "2020",
};

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return initial state", () => {
    expect(reducer(undefined, { type: "" })).toEqual(initialState);
  });

  it("should handle logout", () => {
    const prevState: IAuthSlice = {
      user: mockUser,
      token: "123",
      loading: false,
      error: null,
    };

    const state = reducer(prevState, logout());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  // --- REGISTER ---
  it("should handle registerUser.pending", () => {
    const state = reducer(initialState, { type: registerUser.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("should handle registerUser.fulfilled", () => {
    const payload = { user: mockUser, token: "jwt_token" };

    const state = reducer(initialState, {
      type: registerUser.fulfilled.type,
      payload,
    });

    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
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

  // --- LOGIN ---
  it("should handle loginUser.pending", () => {
    const state = reducer(initialState, { type: loginUser.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("should handle loginUser.fulfilled", () => {
    const payload = { user: mockUser, token: "jwt_token" };

    const state = reducer(initialState, {
      type: loginUser.fulfilled.type,
      payload,
    });

    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe("jwt_token");
    expect(localStorage.getItem("token")).toBe("jwt_token");
  });

  it("should handle loginUser.rejected", () => {
    const state = reducer(initialState, {
      type: loginUser.rejected.type,
      payload: "Login failed",
    });

    expect(state.loading).toBe(false);
    expect(state.error).toBe("Login failed");
  });

  // --- VERIFY TOKEN ---
  it("should handle verifyToken.pending", () => {
    const state = reducer(initialState, { type: verifyToken.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("should handle verifyToken.fulfilled", () => {
    const payload = { user: mockUser };

    const state = reducer(initialState, {
      type: verifyToken.fulfilled.type,
      payload,
    });

    expect(state.loading).toBe(false);
    expect(state.user).toEqual(mockUser);
  });

  it("should handle verifyToken.rejected", () => {
    localStorage.setItem("token", "old_token");

    const state = reducer(
      { ...initialState, token: "old_token", user: mockUser },
      {
        type: verifyToken.rejected.type,
        payload: "Token verification failed",
      }
    );

    expect(state.loading).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.error).toBe("Token verification failed");
    expect(localStorage.getItem("token")).toBeNull();
  });

});

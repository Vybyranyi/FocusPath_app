import { describe, it, expect } from "vitest";
import reducer, {
  deleteAccount,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../store/authSlice";
import type { IAuthSlice } from "../store/authSlice";

const initialState: IAuthSlice = {
  user: null,
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

const signedIn: IAuthSlice = { user: mockUser, loading: false, error: null };

describe("authSlice", () => {
  it("starts with nobody signed in", () => {
    expect(reducer(undefined, { type: "" })).toEqual(initialState);
  });

  it("never stores a token, since the session is a cookie the page cannot read", () => {
    const state = reducer(initialState, {
      type: loginUser.fulfilled.type,
      payload: { user: mockUser },
    });

    expect(state).not.toHaveProperty("token");
    expect(localStorage.getItem("token")).toBeNull();
  });

  describe("registerUser", () => {
    it("marks the request in flight and clears the last error", () => {
      const state = reducer(
        { ...initialState, error: "previous" },
        { type: registerUser.pending.type },
      );

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("signs the new account in", () => {
      const state = reducer(initialState, {
        type: registerUser.fulfilled.type,
        payload: { user: mockUser },
      });

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
    });

    it("surfaces the reason it failed", () => {
      const state = reducer(initialState, {
        type: registerUser.rejected.type,
        payload: "User already exists",
      });

      expect(state.loading).toBe(false);
      expect(state.error).toBe("User already exists");
    });
  });

  describe("loginUser", () => {
    it("signs the account in", () => {
      const state = reducer(initialState, {
        type: loginUser.fulfilled.type,
        payload: { user: mockUser },
      });

      expect(state.user).toEqual(mockUser);
    });

    it("surfaces the reason it failed", () => {
      const state = reducer(initialState, {
        type: loginUser.rejected.type,
        payload: "Invalid credentials",
      });

      expect(state.error).toBe("Invalid credentials");
    });
  });

  describe("fetchCurrentUser", () => {
    it("restores the session the cookies belong to", () => {
      const state = reducer(initialState, {
        type: fetchCurrentUser.fulfilled.type,
        payload: { user: mockUser },
      });

      expect(state.user).toEqual(mockUser);
    });

    it("treats no session as ordinary rather than as an error to show", () => {
      // Every visitor who has not signed in takes this path on first load;
      // surfacing it would put a red message on the login screen for everyone.
      const state = reducer(signedIn, {
        type: fetchCurrentUser.rejected.type,
        payload: "Not authenticated",
      });

      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe("logoutUser", () => {
    it("signs out once the server confirms", () => {
      const state = reducer(signedIn, { type: logoutUser.fulfilled.type });

      expect(state.user).toBeNull();
    });

    it("signs out locally even if the request failed", () => {
      // The cookies may survive, but keeping someone in the app after they
      // asked to leave is the worse of the two outcomes.
      const state = reducer(signedIn, { type: logoutUser.rejected.type });

      expect(state.user).toBeNull();
    });
  });

  describe("deleteAccount", () => {
    it("clears the user once the account is gone", () => {
      const state = reducer(signedIn, { type: deleteAccount.fulfilled.type });

      expect(state.user).toBeNull();
    });

    it("keeps the user signed in when the password was wrong", () => {
      const state = reducer(signedIn, {
        type: deleteAccount.rejected.type,
        payload: "Password is incorrect",
      });

      expect(state.user).toEqual(mockUser);
      expect(state.error).toBe("Password is incorrect");
    });
  });
});

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "@shared/index";

const API_URL = import.meta.env.VITE_API_URL;

export interface IAuthSlice {
    user: User | null;
    token: string | null;
    loading: boolean,
    error: string | null,
}

const initialState: IAuthSlice = {
    user: null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null,
}

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (userData: { name: string; surname: string; birthday: Date; gender: "male" | "female"; email: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_URL}/auth/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (!res.ok) {
                return rejectWithValue(data.message || "Registration failed");
            };
            return data;
        } catch (error) {
            return rejectWithValue("Network error during registration");
        };
    }
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${API_URL}/auth/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(userData),
            });
            const data = await res.json();
            if (!res.ok) {
                return rejectWithValue(data.message || "Login failed");
            };
            return data;
        } catch (error) {
            return rejectWithValue("Network error during login");
        };
    }
);

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (data: { name: string; surname: string; birthday: string; gender: "male" | "female"; email: string; avatar?: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: IAuthSlice };
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`,
                },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) return rejectWithValue(json.message || "Update failed");
            return json;
        } catch {
            return rejectWithValue("Network error during profile update");
        }
    }
);

export const changePassword = createAsyncThunk(
    "auth/changePassword",
    async (data: { currentPassword: string; newPassword: string }, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: IAuthSlice };
            const res = await fetch(`${API_URL}/auth/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`,
                },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) return rejectWithValue(json.message || "Password change failed");
            return json;
        } catch {
            return rejectWithValue("Network error during password change");
        }
    }
);

export const deleteAccount = createAsyncThunk(
    "auth/deleteAccount",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: IAuthSlice };
            const res = await fetch(`${API_URL}/auth/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${state.auth.token}` },
            });
            const json = await res.json();
            if (!res.ok) return rejectWithValue(json.message || "Delete failed");
            return json;
        } catch {
            return rejectWithValue("Network error during account deletion");
        }
    }
);

export const verifyToken = createAsyncThunk(
    "auth/verifyToken",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return rejectWithValue("No token found");
            }
            const res = await fetch(`${API_URL}/auth/token`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                return rejectWithValue(data.message || "Token verification failed");
            }
            return data;
        } catch (error) {
            return rejectWithValue("Network error during token verification");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem("token");
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(changePassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(deleteAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAccount.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                localStorage.removeItem("token");
            })
            .addCase(deleteAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        builder
            .addCase(verifyToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyToken.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })
            .addCase(verifyToken.rejected, (state, action) => {
                state.loading = false;
                state.token = null;
                state.user = null;
                state.error = action.payload as string;
                localStorage.removeItem("token");
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
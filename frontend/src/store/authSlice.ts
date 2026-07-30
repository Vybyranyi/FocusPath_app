import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { User } from "@shared/index";
import { apiRequest, errorMessage } from "@api/client";
import type { RootState } from "@store/store";

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

/** What the credential endpoints hand back. */
interface Session {
    token: string;
    user: User;
}

const tokenOf = (getState: () => unknown) => (getState() as RootState).auth.token;

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (
        userData: {
            name: string;
            surname: string;
            birthday: Date;
            gender: "male" | "female";
            email: string;
            password: string;
        },
        { rejectWithValue },
    ) => {
        try {
            return await apiRequest<Session>("/auth/", { method: "POST", body: userData });
        } catch (error) {
            return rejectWithValue(errorMessage(error));
        }
    },
);

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (userData: { email: string; password: string }, { rejectWithValue }) => {
        try {
            return await apiRequest<Session>("/auth/token", { method: "POST", body: userData });
        } catch (error) {
            return rejectWithValue(errorMessage(error));
        }
    },
);

export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (
        data: {
            name: string;
            surname: string;
            birthday: string;
            gender: "male" | "female";
            email: string;
            avatar?: string;
        },
        { getState, rejectWithValue },
    ) => {
        try {
            return await apiRequest<{ user: User }>("/auth/profile", {
                method: "PATCH",
                body: data,
                token: tokenOf(getState),
            });
        } catch (error) {
            return rejectWithValue(errorMessage(error));
        }
    },
);

export const changePassword = createAsyncThunk(
    "auth/changePassword",
    async (
        data: { currentPassword: string; newPassword: string },
        { getState, rejectWithValue },
    ) => {
        try {
            return await apiRequest<null>("/auth/password", {
                method: "PATCH",
                body: data,
                token: tokenOf(getState),
            });
        } catch (error) {
            return rejectWithValue(errorMessage(error));
        }
    },
);

export const deleteAccount = createAsyncThunk(
    "auth/deleteAccount",
    async (_, { getState, rejectWithValue }) => {
        try {
            return await apiRequest<null>("/auth/", {
                method: "DELETE",
                token: tokenOf(getState),
            });
        } catch (error) {
            return rejectWithValue(errorMessage(error));
        }
    },
);

export const verifyToken = createAsyncThunk(
    "auth/verifyToken",
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem("token");
        if (!token) {
            return rejectWithValue("No token found");
        }
        try {
            return await apiRequest<{ user: User }>("/auth/token", { token });
        } catch (error) {
            return rejectWithValue(errorMessage(error));
        }
    },
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

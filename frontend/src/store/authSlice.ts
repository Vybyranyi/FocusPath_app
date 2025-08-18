import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL;

export interface IUser {
    _id: string;
    name: string;
    surname: string;
    birthday: string;
    gender: "male" | "female";
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface IAuthSlice {
    user: IUser | null;
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
            const res = await fetch(`${API_URL}/auth/register`, {
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
            const res = await fetch(`${API_URL}/auth/login`, {
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
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
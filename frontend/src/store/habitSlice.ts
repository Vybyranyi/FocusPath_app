import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IHabit } from "@pages/CreateHabit/CreateHabit";
import type { RootState } from '@store/store';
import { useAppSelector } from "@store/hooks";

const API_URL = import.meta.env.VITE_API_URL;

export interface IHabitSlice {
    habits: IHabit[];
    loading: boolean;
    error: string | null;
};

const initialState: IHabitSlice = {
    habits: [],
    loading: false,
    error: null,
};

export const createHabit = createAsyncThunk(
    "habit/createHabit",
    async (habitData: IHabit, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;
            const userId = useAppSelector(state => state.auth);
            if (!userId) {
                return rejectWithValue("User not authenticated");
            }

            const res = await fetch(`${API_URL}/habits/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.auth.token}`
                },
                body: JSON.stringify({
                    ...habitData,
                    userId
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Habit creation failed");
            };
            return data;
        } catch (error) {
            return rejectWithValue("Network error during habit creation");
        }
    }
);

const habitSlice = createSlice({
    name: "habit",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createHabit.pending, (state) => {
                state.loading = true;
            })
            .addCase(createHabit.fulfilled, (state, action) => {
                state.loading = false;
                state.habits.push(action.payload);
            })
            .addCase(createHabit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default habitSlice.reducer;
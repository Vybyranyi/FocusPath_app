import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IHabit } from "@pages/CreateHabit/CreateHabit";
import type { RootState } from '@store/store';

const API_URL = import.meta.env.VITE_API_URL;

// export interface IHabit {
//     color: string;
//     emoji: string;
//     habitName: string;
//     habitDescription: string;
//     startDate: Date | undefined;
//     aiEnabled: boolean;
//     duration: string;
//     habitType: 'build' | 'quit';
// }

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
            const user = state.auth.user;

            if (!user) {
                return rejectWithValue("User not authenticated");
            }

            const body = {
                title: habitData.habitName.trim(),
                startDate: habitData.startDate ? new Date(habitData.startDate).toISOString() : new Date().toISOString(),
                duration: Number(habitData.duration),
                type: habitData.habitType,
                color: habitData.color,
                icon: habitData.emoji,
                userID: user,
            };

            const res = await fetch(`${API_URL}/habits/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${state.auth.token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Habit creation failed");
            }

            return data;
        } catch (error) {
            console.error("Habit creation error:", error);
            return rejectWithValue("Network error during habit creation");
        }
    }
);

export const getAllHabits = createAsyncThunk(
    "habit/getAllHabits",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState;

            const res = await fetch(`${API_URL}/habits/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${state.auth.token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to fetch habits");
            }

            return data;
        } catch (error) {
            console.error("Error fetching habits:", error);
            return rejectWithValue("Network error during habit fetching");
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

        builder
            .addCase(getAllHabits.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllHabits.fulfilled, (state, action) => {
                state.loading = false;
                state.habits = action.payload.habits;
            })
            .addCase(getAllHabits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default habitSlice.reducer;
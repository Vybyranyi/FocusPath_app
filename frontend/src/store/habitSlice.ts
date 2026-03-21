import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { IHabit } from "@pages/CreateHabit";
import type { RootState } from "@store/store";

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

interface DayInfo {
  dayTitle: string;
  date: Date;
  completed: boolean;
  _id: string;
}

export interface habitForDate {
  _id: string;
  title: string;
  type: string;
  color: string;
  icon: string;
  currentStreak: number;
  isCompleted: boolean;
  dayInfo: DayInfo;
}

export interface IHabitSlice {
  habits: IHabit[];
  habitsForDate: habitForDate[];
  loading: boolean;
  error: string | null;
}

const initialState: IHabitSlice = {
  habits: [],
  habitsForDate: [],
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
        startDate: habitData.startDate
          ? new Date(habitData.startDate).toISOString()
          : new Date().toISOString(),
        duration: Number(habitData.duration),
        type: habitData.habitType,
        color: habitData.color,
        icon: habitData.emoji,
      };

      const res = await fetch(`${API_URL}/habits/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.token}`,
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
  },
);

export const createAIHabit = createAsyncThunk(
  "habit/createAIHabit",
  async (habitData: IHabit, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const user = state.auth.user;

      if (!user) {
        return rejectWithValue("User not authenticated");
      }

      const body = {
        title: habitData.habitName.trim(),
        startDate: habitData.startDate
          ? new Date(habitData.startDate).toISOString()
          : new Date().toISOString(),
        duration: habitData.duration ? Number(habitData.duration) : null,
        type: habitData.habitType,
        color: habitData.color,
        icon: habitData.emoji,
      };

      const res = await fetch(`${API_URL}/habits/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "AI habit creation failed");
      }

      return data;
    } catch (error) {
      console.error("AI Habit creation error:", error);
      return rejectWithValue("Network error during AI habit creation");
    }
  },
);

export const getHabitsForDate = createAsyncThunk(
  "habit/getHabitsForDate",
  async (date: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;

      const formattedDate = new Date(date).toISOString().split("T")[0];
      const url = `${API_URL}/habits/daily?date=${formattedDate}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(
          data.message || "Failed to fetch habits for the date",
        );
      }
      return data;
    } catch (error) {
      console.error("Error fetching habits for date:", error);
      return rejectWithValue("Network error during fetching habits for date");
    }
  },
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
          Authorization: `Bearer ${state.auth.token}`,
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
  },
);

// export const getHabitById = createAsyncThunk();

// export const updateHabit = createAsyncThunk();

// export const deleteHabit = createAsyncThunk();

// export const updateDayTitle = createAsyncThunk();

// export const markHabitCompletion = createAsyncThunk();

const habitSlice = createSlice({
  name: "habit",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createHabit.pending, (state) => {
        state.loading = true;
        state.error = null;
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
      .addCase(createAIHabit.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAIHabit.fulfilled, (state, action) => {
        state.loading = false;
        state.habits.push(action.payload);
      })
      .addCase(createAIHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getHabitsForDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getHabitsForDate.fulfilled, (state, action) => {
        state.loading = false;
        state.habitsForDate = action.payload.habits || [];
      })
      .addCase(getHabitsForDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(getAllHabits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllHabits.fulfilled, (state, action) => {
        state.loading = false;
        state.habits = action.payload.habits || [];
      })
      .addCase(getAllHabits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default habitSlice.reducer;

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

export interface Step {
  _id: string;
  title: string;
  completed: boolean;
}

export interface habitForDate {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  steps?: Step[];
  startDate: string;
  type: string;
  color: string;
  icon: string;
  currentStreak: number;
  isCompleted: boolean;
  duration: number;
  completedCount: number;
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

export const markHabitCompletion = createAsyncThunk(
  "habit/markHabitCompletion",
  async (
    { habitId, date, completed }: { habitId: string; date: Date | string; completed: boolean },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as RootState;
      const res = await fetch(`${API_URL}/habits/${habitId}/complete`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify({
          date: new Date(date).toISOString(),
          completed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to update habit completion");
      }
      return { habitId, completed, updatedHabit: data.habit || data };
    } catch (error) {
      return rejectWithValue("Network error during habit completion update");
    }
  },
);

export const toggleHabitStep = createAsyncThunk(
  "habit/toggleHabitStep",
  async (
    { habitId, stepId }: { habitId: string; stepId: string },
    { getState, rejectWithValue },
  ) => {
    try {
      const state = getState() as RootState;
      const res = await fetch(`${API_URL}/habits/${habitId}/steps/${stepId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to toggle step");
      }
      return { habitId, stepId, completed: data.completed };
    } catch (error) {
      return rejectWithValue("Network error during toggling step");
    }
  },
);

export const deleteHabit = createAsyncThunk(
  "habit/deleteHabit",
  async (habitId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const res = await fetch(`${API_URL}/habits/${habitId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        return rejectWithValue(data.message || "Failed to delete habit");
      }
      return habitId;
    } catch (error) {
      return rejectWithValue("Network error during habit deletion");
    }
  },
);

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

    builder.addCase(markHabitCompletion.fulfilled, (state, action) => {
      const { habitId, completed, updatedHabit } = action.payload;
      const habit = state.habitsForDate.find((h) => h._id === habitId);
      if (habit) {
        const wasCompleted = habit.dayInfo.completed;
        habit.dayInfo.completed = completed;
        if (updatedHabit) {
          habit.currentStreak  = updatedHabit.currentStreak;
          habit.isCompleted    = updatedHabit.isCompleted;
        }
        // Update completedCount locally based on the change
        if (completed && !wasCompleted) habit.completedCount += 1;
        if (!completed && wasCompleted) habit.completedCount  = Math.max(0, habit.completedCount - 1);
      }
    });

    builder
      .addCase(toggleHabitStep.pending, (state, action) => {
        // Optimistic update
        const { habitId, stepId } = action.meta.arg;
        const habit = state.habitsForDate.find((h) => h._id === habitId);
        if (habit && habit.steps) {
          const step = habit.steps.find((s) => s._id === stepId);
          if (step) {
            step.completed = !step.completed;
          }
        }
      })
      .addCase(toggleHabitStep.fulfilled, (state, action) => {
        // Confirmation from server (we already optimistically updated, if anything mismatch we can correct here)
        const { habitId, stepId, completed } = action.payload;
        const habit = state.habitsForDate.find((h) => h._id === habitId);
        if (habit && habit.steps) {
          const step = habit.steps.find((s) => s._id === stepId);
          if (step) {
            step.completed = completed;
          }
        }
      })
      .addCase(toggleHabitStep.rejected, (state, action) => {
        // Rollback on failure
        const { habitId, stepId } = action.meta.arg;
        const habit = state.habitsForDate.find((h) => h._id === habitId);
        if (habit && habit.steps) {
          const step = habit.steps.find((s) => s._id === stepId);
          if (step) {
            // Revert back
            step.completed = !step.completed;
          }
        }
      });

    builder
      .addCase(deleteHabit.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteHabit.fulfilled, (state, action) => {
        state.loading = false;
        // Remove from habits and habitsForDate
        state.habits = state.habits.filter((h) => h._id !== action.payload);
        state.habitsForDate = state.habitsForDate.filter((h) => h._id !== action.payload);
      })
      .addCase(deleteHabit.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default habitSlice.reducer;

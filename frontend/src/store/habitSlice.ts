import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Habit } from "@shared/index";
import type { IHabit } from "@pages/CreateHabit";
import { apiRequest, errorMessage } from "@api/client";

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
  habits: Habit[];
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

/** The form's shape, translated into what the API expects. */
const toHabitBody = (habitData: IHabit, allowAutoDuration = false) => ({
  title: habitData.habitName.trim(),
  startDate: habitData.startDate
    ? new Date(habitData.startDate).toISOString()
    : new Date().toISOString(),
  duration:
    allowAutoDuration && !habitData.duration ? null : Number(habitData.duration),
  type: habitData.habitType,
  color: habitData.color,
  icon: habitData.emoji,
});

export const createHabit = createAsyncThunk(
  "habit/createHabit",
  async (habitData: IHabit, { rejectWithValue }) => {
    try {
      return await apiRequest<{ habit: Habit }>("/habits/", {
        method: "POST",
        body: toHabitBody(habitData),
      });
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const createAIHabit = createAsyncThunk(
  "habit/createAIHabit",
  async (habitData: IHabit, { rejectWithValue }) => {
    try {
      return await apiRequest<{ habit: Habit }>("/habits/ai", {
        method: "POST",
        body: toHabitBody(habitData, true),
      });
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const getHabitsForDate = createAsyncThunk(
  "habit/getHabitsForDate",
  async (date: string, { rejectWithValue }) => {
    try {
      const day = new Date(date).toISOString().split("T")[0];
      return await apiRequest<{ date: string; habits: habitForDate[] }>(
        `/habits/daily?date=${day}`,
      );
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const getAllHabits = createAsyncThunk(
  "habit/getAllHabits",
  async (_, { rejectWithValue }) => {
    try {
      return await apiRequest<{ habits: Habit[] }>("/habits/");
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const markHabitCompletion = createAsyncThunk(
  "habit/markHabitCompletion",
  async (
    { habitId, date, completed }: { habitId: string; date: Date | string; completed: boolean },
    { rejectWithValue },
  ) => {
    try {
      const { habit } = await apiRequest<{ habit: Habit }>(
        `/habits/${habitId}/complete`,
        {
          method: "PATCH",
          body: { date: new Date(date).toISOString(), completed },
        },
      );
      return { habitId, completed, updatedHabit: habit };
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const toggleHabitStep = createAsyncThunk(
  "habit/toggleHabitStep",
  async (
    { habitId, stepId }: { habitId: string; stepId: string },
    { rejectWithValue },
  ) => {
    try {
      const { completed } = await apiRequest<{ stepId: string; completed: boolean }>(
        `/habits/${habitId}/steps/${stepId}`,
        { method: "PATCH" },
      );
      return { habitId, stepId, completed };
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

export const deleteHabit = createAsyncThunk(
  "habit/deleteHabit",
  async (habitId: string, { rejectWithValue }) => {
    try {
      await apiRequest<{ habitId: string }>(`/habits/${habitId}`, {
        method: "DELETE",
      });
      return habitId;
    } catch (error) {
      return rejectWithValue(errorMessage(error));
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
        state.habits.push(action.payload.habit);
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
        state.habits.push(action.payload.habit);
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
          habit.currentStreak = updatedHabit.currentStreak;
          habit.isCompleted = updatedHabit.isCompleted;
        }
        // Update completedCount locally based on the change
        if (completed && !wasCompleted) habit.completedCount += 1;
        if (!completed && wasCompleted) habit.completedCount = Math.max(0, habit.completedCount - 1);
      }
    });

    builder
      .addCase(toggleHabitStep.pending, (state, action) => {
        // Optimistic update
        const { habitId, stepId } = action.meta.arg;
        const habit = state.habitsForDate.find((h) => h._id === habitId);
        const step = habit?.steps?.find((s) => s._id === stepId);
        if (step) {
          step.completed = !step.completed;
        }
      })
      .addCase(toggleHabitStep.fulfilled, (state, action) => {
        // Confirmation from the server; corrects the guess above if it differed.
        const { habitId, stepId, completed } = action.payload;
        const habit = state.habitsForDate.find((h) => h._id === habitId);
        const step = habit?.steps?.find((s) => s._id === stepId);
        if (step) {
          step.completed = completed;
        }
      })
      .addCase(toggleHabitStep.rejected, (state, action) => {
        // Rollback on failure
        const { habitId, stepId } = action.meta.arg;
        const habit = state.habitsForDate.find((h) => h._id === habitId);
        const step = habit?.steps?.find((s) => s._id === stepId);
        if (step) {
          step.completed = !step.completed;
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

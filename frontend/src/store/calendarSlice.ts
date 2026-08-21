import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { startOfWeek, addWeeks } from 'date-fns';

interface CalendarState {
    currentWeekStart: string; // ISO string
}

const initialState: CalendarState = {
    currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString(),
};

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        nextWeek: (state) => {
            const current = new Date(state.currentWeekStart);
            state.currentWeekStart = addWeeks(current, 1).toISOString();
        },
        prevWeek: (state) => {
            const current = new Date(state.currentWeekStart);
            state.currentWeekStart = addWeeks(current, -1).toISOString();
        },
        /**
         * Back to the week containing today.
         *
         * Its own action rather than `setCurrentWeek(startOfWeek(new Date()))`
         * at the call site: "which week is now" is the slice's own arithmetic,
         * and it already owns the Monday-start convention.
         */
        thisWeek: (state) => {
            state.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
        },
        setCurrentWeek: (state, action: PayloadAction<string>) => {
            state.currentWeekStart = action.payload;
        },
    },
});

export const { nextWeek, prevWeek, thisWeek, setCurrentWeek } = calendarSlice.actions;
export default calendarSlice.reducer;

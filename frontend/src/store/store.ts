import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@store/authSlice';
import habitReducer from '@store/habitSlice';
import calendarReducer from '@store/calendarSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        habit: habitReducer,
        calendar: calendarReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
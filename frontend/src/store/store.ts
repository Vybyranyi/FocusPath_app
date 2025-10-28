import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@store/authSlice';
import habitReducer from '@store/habitSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        habit: habitReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
import { configureStore } from "@reduxjs/toolkit";
import carReducer from "./carSlice";
import notificationReducer from "./notificationSlice";

export const store = configureStore({
  reducer: {
    cars: carReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

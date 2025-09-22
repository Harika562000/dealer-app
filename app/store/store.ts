import { configureStore } from "@reduxjs/toolkit";
import carReducer from "./carSlice";
import notificationReducer from "./notificationSlice";
import recommendationReducer from "./recommendationSlice";
import userBehaviorReducer from "./userBehaviorSlice";

export const store = configureStore({
  reducer: {
    cars: carReducer,
    notifications: notificationReducer,
    userBehavior: userBehaviorReducer,
    recommendations: recommendationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

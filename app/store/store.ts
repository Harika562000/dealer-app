import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import bookedTestDrivesReducer from "./bookedTestDriveSlice";
import carReducer from "./carSlice";
import notificationReducer from "./notificationSlice";
import recommendationReducer from "./recommendationSlice";
import serviceReducer from "./serviceSlice";
import userBehaviorReducer from "./userBehaviorSlice";

// Persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["service", "notifications"], // Only persist service and notifications
};

// Combine reducers
const rootReducer = combineReducers({
  cars: carReducer,
  notifications: notificationReducer,
  userBehavior: userBehaviorReducer,
  recommendations: recommendationReducer,
    bookedTestDrives: bookedTestDrivesReducer,
  service: serviceReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './features/uiSlice';
import userReducer from './features/userSlice';

const store = configureStore({
  reducer: {
    ui: uiReducer,
    user: userReducer,
    // Add other reducers here as they are created
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['user/initializeAuth/fulfilled', 'user/loginUser/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.user'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates', 'user.user'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store; 
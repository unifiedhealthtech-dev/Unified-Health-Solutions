// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { loginRegisterApi } from './services/loginRegisterApi';

export const store = configureStore({
  reducer: {
    [loginRegisterApi.reducerPath]: loginRegisterApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loginRegisterApi.middleware),
});

setupListeners(store.dispatch);
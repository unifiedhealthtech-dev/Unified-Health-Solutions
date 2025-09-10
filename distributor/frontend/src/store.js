// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { loginRegisterApi } from './services/loginRegisterApi';
import { inventoryApi } from './services/inventoryApi';
export const store = configureStore({
  reducer: {
    [loginRegisterApi.reducerPath]: loginRegisterApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loginRegisterApi.middleware, inventoryApi.middleware),
});

setupListeners(store.dispatch);
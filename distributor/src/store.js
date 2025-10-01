import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import authReducer from './redux/slices/authSlice';
import { loginApi } from './services/loginApi';
import { inventoryApi } from './services/inventoryApi';
import {distributorConnectionsApi} from "./services/distributorConnectionsApi"
import { partiesApi } from './services/partiesApi';
import { notificationsApi } from './services/notificationsApi';
import {  distributorOrdersApi } from './services/distributorOrdersApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // persist auth slice
};

const rootReducer = combineReducers({
  auth: authReducer,
  [loginApi.reducerPath]: loginApi.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  [distributorConnectionsApi.reducerPath]: distributorConnectionsApi.reducer,
  [partiesApi.reducerPath]: partiesApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [distributorOrdersApi.reducerPath]: distributorOrdersApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    }).concat(loginApi.middleware, inventoryApi.middleware, distributorConnectionsApi.middleware, partiesApi.middleware, notificationsApi.middleware, distributorOrdersApi.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

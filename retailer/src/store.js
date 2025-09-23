import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import authReducer from './redux/slices/authSlice';
import { loginApi } from './services/loginApi';
import { retailerConnectionsApi } from './services/retailerConnectionsApi';
import { notificationsApi } from './services/notificationsApi';
import { retailerInventoryApi } from './services/retailerInventoryApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth, not API data
};

const rootReducer = combineReducers({
  auth: authReducer,
  [loginApi.reducerPath]: loginApi.reducer,
  [retailerConnectionsApi.reducerPath]: retailerConnectionsApi.reducer,
  [notificationsApi.reducerPath]: notificationsApi.reducer,
  [retailerInventoryApi.reducerPath]: retailerInventoryApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat( // Fixed: Properly close the concat method
      loginApi.middleware,
      retailerConnectionsApi.middleware,
      notificationsApi.middleware,
      retailerInventoryApi.middleware,
    ), // This closing parenthesis was missing
  });
setupListeners(store.dispatch);

export const persistor = persistStore(store);
// App.js
import React, { useState, useCallback } from 'react'; // ✅ Import useCallback
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import NotFound from "./pages/NotFound";
import Overview from "./pages/Overview";
import PurchaseOrders from "./pages/PurchaseOrders";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Payments from "./pages/Payments";
import Returns from "./pages/Returns";
import Reports from "./pages/Reports";
import Compliance from "./pages/Compliance";
import AllDistributors from "./pages/AllDistributors";
import ConnectedDistributors from "./pages/ConnectedDistributors";
import Settings from "./pages/Settings";
import NotificationsPage from './pages/NotificationsPage';

// Import notification components
import RealTimeNotificationToast from './components/ui/RealTimeNotificationToast';
import { useSocketNotifications } from './hooks/useSocketNotifications';
import { useDispatch } from 'react-redux';
import { notificationsApi } from './services/notificationsApi';

// Redux Store — make sure this is imported!
import { store, persistor } from './store'; // ✅ Critical — was missing in your snippet!

// Create React Query client
const queryClient = new QueryClient();

// Define routes
const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Registration /> },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      { index: true, element: <Overview /> },
      { path: "overview", element: <Overview /> },
      { path: "purchase-orders", element: <PurchaseOrders /> },
      { path: "inventory", element: <Inventory /> },
      { path: "sales", element: <Sales /> },
      { path: "payments", element: <Payments /> },
      { path: "returns", element: <Returns /> },
      { path: "reports", element: <Reports /> },
      { path: "compliance", element: <Compliance /> },
      { path: "all-distributors", element: <AllDistributors /> },
      { path: "connected-distributors", element: <ConnectedDistributors /> },
      { path: "settings", element: <Settings /> },
      { path: "notifications", element: <NotificationsPage /> }, // ✅ Add Notifications route
    ],
  },
  { path: "*", element: <NotFound /> },
]);

// ✅ FIXED: Notification Toast Manager Component
const NotificationToastManager = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const dispatch = useDispatch();

  // ✅ Memoize this function — CRITICAL FIX
  const handleNewNotification = useCallback((notification) => {
    setToasts(prev => {
      // ✅ Optional: Prevent duplicates
      if (prev.some(t => t.notification_id === notification.notification_id)) {
        return prev;
      }
      return [...prev, notification];
    });
    dispatch(notificationsApi.util.invalidateTags(['Notifications']));
  }, [dispatch]); // ✅ Only depends on dispatch (stable)

  // ✅ Initialize socket — now safe
  useSocketNotifications(handleNewNotification);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.notification_id !== id));
  }, []);

  return (
    <>
      {children}
      {toasts.map(toast => (
        <RealTimeNotificationToast
          key={toast.notification_id}
          notification={toast}
          onClose={() => removeToast(toast.notification_id)}
        />
      ))}
    </>
  );
};

// ✅ AppRoot
const AppRoot = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationToastManager>
        <RouterProvider router={router} />
      </NotificationToastManager>
    </TooltipProvider>
  </QueryClientProvider>
);

// ✅ Final Export
const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppRoot />
    </PersistGate>
  </Provider>
);

export default App;
// src/App.js
import React, { useState, useCallback } from "react"; // ✅ Import useCallback
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

// Import pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Parties from "./pages/Parties";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Compliance from "./pages/Compliance";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import NotificationsPage from "./pages/NotificationsPage";

// Import notification components
import RealTimeNotificationToast from "./components/ui/RealTimeNotificationToast";
import { useSocketNotifications } from "./hooks/useSocketNotifications";
import { useDispatch } from "react-redux";
import { notificationsApi } from "./services/notificationsApi";

// Redux Store
import { store, persistor } from "./store";

// Create Query Client
const queryClient = new QueryClient();

// ✅ Notification Toast Manager Component — Optimized & Stable
const NotificationToastManager = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const dispatch = useDispatch();

  // ✅ Memoize this — prevents infinite loop
  const handleNewNotification = useCallback((notification) => {
    setToasts(prev => {
      // ✅ Avoid duplicates — extra safety
      if (prev.some(t => t.notification_id === notification.notification_id)) {
        return prev;
      }
      return [...prev, notification];
    });
    dispatch(notificationsApi.util.invalidateTags(["Notifications"]));
  }, [dispatch]); // ✅ Only depends on dispatch (stable)

  // ✅ Initialize socket — now safe
  useSocketNotifications(handleNewNotification);

  // ✅ Also memoize this
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

// ✅ Main App Component
const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <NotificationToastManager>
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
                v7_fetcherPersist: true,
                v7_skipActionErrorRevalidation: true,
              }}
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes with Layout */}
                <Route
                  path="/dashboard"
                  element={
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  }
                />
                <Route
                  path="/parties"
                  element={
                    <AppLayout>
                      <Parties />
                    </AppLayout>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <AppLayout>
                      <Orders />
                    </AppLayout>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <AppLayout>
                      <Inventory />
                    </AppLayout>
                  }
                />
                <Route
                  path="/billing"
                  element={
                    <AppLayout>
                      <Billing />
                    </AppLayout>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <AppLayout>
                      <Payments />
                    </AppLayout>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <AppLayout>
                      <Reports />
                    </AppLayout>
                  }
                />
                <Route
                  path="/compliance"
                  element={
                    <AppLayout>
                      <Compliance />
                    </AppLayout>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <AppLayout>
                      <NotificationsPage />
                    </AppLayout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <AppLayout>
                      <div className="p-6">
                        <h1 className="text-2xl font-bold">Settings Module</h1>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </AppLayout>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationToastManager>
        </TooltipProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
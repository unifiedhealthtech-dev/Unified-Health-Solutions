import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import NotFound from "./pages/NotFound";

// Import page components
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

// Create React Query client
const queryClient = new QueryClient();

// Define routes (React Router v7)
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Registration />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      {
        index: true,
        element: <Overview />,
      },
      {
        path: "overview",
        element: <Overview />,
      },
      {
        path: "purchase-orders",
        element: <PurchaseOrders />,
      },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "sales",
        element: <Sales />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
      {
        path: "returns",
        element: <Returns />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
      {
        path: "compliance",
        element: <Compliance />,
      },
      {
        path: "all-distributors",
        element: <AllDistributors />,
      },
      {
        path: "connected-distributors",
        element: <ConnectedDistributors />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  ShoppingCart, 
  Package, 
  Receipt, 
  CreditCard, 
  RotateCcw, 
  FileText, 
  Shield, 
  Settings,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  LogOut,
  User
} from "lucide-react";

// Import module components
import PurchaseOrders from "../components/modules/PurchaseOrders";
import Inventory from "../components/modules/Inventory";
import Sales from "../components/modules/Sales";
import Payments from "../components/modules/Payments";
import Returns from "../components/modules/Returns";
import Reports from "../components/modules/Reports";
import Compliance from "../components/modules/Compliance";
import SettingsModule from "../components/modules/Settings";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Clear any stored session/auth data
      sessionStorage.clear();
      localStorage.clear();
    } catch (_) {
      // no-op
    }
    navigate("/login");
  };

  const handleProfile = () => {
    setActiveTab("settings");
  };

  const quickStats = [
    { title: "Today's Sales", value: "₹45,680", change: "+12%", icon: TrendingUp, color: "text-success" },
    { title: "Pending Orders", value: "23", change: "+5", icon: ShoppingCart, color: "text-warning" },
    { title: "Low Stock Items", value: "8", change: "-2", icon: AlertTriangle, color: "text-destructive" },
    { title: "Total Customers", value: "1,247", change: "+28", icon: Users, color: "text-primary" },
  ];

  const quickActions = [
    { label: "New Purchase Order", icon: Plus, action: () => setActiveTab("purchase-orders") },
    { label: "New Bill", icon: Receipt, action: () => setActiveTab("sales") },
    { label: "Add Stock", icon: Package, action: () => setActiveTab("inventory") },
    { label: "Search Distributor", icon: Search, action: () => {} },
    { label: "Due Payments", icon: CreditCard, action: () => setActiveTab("payments") },
  ];

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Calendar },
    { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "sales", label: "Sales / Billing", icon: Receipt },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "returns", label: "Returns", icon: RotateCcw },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "compliance", label: "Compliance", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
  return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                        </div>
                        <IconComponent className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="lg"
                        className="h-20 flex-col gap-2"
                        onClick={action.action}
                      >
                        <IconComponent className="h-6 w-6" />
                        <span className="text-xs text-center">{action.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "purchase-orders":
        return <PurchaseOrders />;
      case "inventory":
        return <Inventory />;
      case "sales":
        return <Sales />;
      case "payments":
        return <Payments />;
      case "returns":
        return <Returns />;
      case "reports":
        return <Reports />;
      case "compliance":
        return <Compliance />;
      case "settings":
        return <SettingsModule />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-card flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">PharmaRetail</p>
              <p className="text-sm text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => setActiveTab(item.id)}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@pharmaretail.com</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header - For all pages except Settings */}
        {activeTab !== "settings" && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.id === activeTab)?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your pharmacy operations efficiently
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleProfile}>
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

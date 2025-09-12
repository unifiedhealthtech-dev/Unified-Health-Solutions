import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  Calendar
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

  const tabs = [
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

  return (
    <div className="min-h-screen bg-gradient-card">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PharmaRetail Dashboard
              </h1>
              <p className="text-muted-foreground">Complete pharmacy management at your fingertips</p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-9 mb-6">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
          </TabsContent>

          {/* Module Tabs */}
          <TabsContent value="purchase-orders">
            <PurchaseOrders />
          </TabsContent>

          <TabsContent value="inventory">
            <Inventory />
          </TabsContent>

          <TabsContent value="sales">
            <Sales />
          </TabsContent>

          <TabsContent value="payments">
            <Payments />
          </TabsContent>

          <TabsContent value="returns">
            <Returns />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          <TabsContent value="compliance">
            <Compliance />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsModule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

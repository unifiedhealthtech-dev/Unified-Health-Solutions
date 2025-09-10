import { Button } from '../components/ui/button';
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  Receipt, 
  AlertTriangle,
  Clock,
  IndianRupee
} from 'lucide-react';
import { Badge } from '../components/ui/badge';

const Dashboard = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: "Today's Sales",
      value: "₹2,45,678",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp,
      description: "vs yesterday"
    },
    {
      title: "Pending Orders",
      value: "147",
      change: "-8 from yesterday",
      trend: "down", 
      icon: Clock,
      description: "Orders to process"
    },
    {
      title: "Stock Items", 
      value: "2,847",
      change: "23 low stock",
      trend: "neutral",
      icon: Package,
      description: "Total inventory"
    },
    {
      title: "Active Parties",
      value: "156",
      change: "+3 new this week",
      trend: "up",
      icon: Users,
      description: "Customers & suppliers"
    }
  ];

  const quickActions = [
    { title: "New Order", icon: Plus, variant: "medical", description: "Create sales order" },
    { title: "New Bill", icon: Receipt, variant: "secondary", description: "Generate invoice" },
    { title: "Add Stock", icon: Package, variant: "success", description: "Update inventory" },
    { title: "Search Party", icon: Search, variant: "outline", description: "Find customer" }
  ];

  const recentOrders = [
    { id: "ORD-001", party: "Apollo Pharmacy", amount: "₹45,678", status: "Processing", time: "2 hours ago" },
    { id: "ORD-002", party: "MedPlus Store", amount: "₹23,456", status: "Delivered", time: "4 hours ago" },
    { id: "ORD-003", party: "Guardian Pharmacy", amount: "₹67,890", status: "Pending", time: "6 hours ago" },
    { id: "ORD-004", party: "Wellness Store", amount: "₹12,345", status: "Processing", time: "1 day ago" }
  ];

  const lowStockItems = [
    { name: "Paracetamol 500mg", current: 45, minimum: 100, batch: "PCM001", expiry: "Dec 2024" },
    { name: "Amoxicillin 250mg", current: 23, minimum: 50, batch: "AMX002", expiry: "Jan 2025" },
    { name: "Cetirizine 10mg", current: 12, minimum: 75, batch: "CET003", expiry: "Mar 2025" },
    { name: "Omeprazole 20mg", current: 8, minimum: 40, batch: "OME004", expiry: "Feb 2025" }
  ];

  const getStatusBadge = (status) => {
    const variants = {
      Processing: "warning",
      Delivered: "success", 
      Pending: "destructive"
    };
    return variants[status] || "secondary";
  };

  return (
    <div className="p-6 space-y-6 bg-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your pharmaceutical distribution overview.
          </p>
        </div>
        <Button variant="medical" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Quick Order
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs flex items-center gap-1 ${
                stat.trend === 'up' ? 'text-success' : 
                stat.trend === 'down' ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {stat.change}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used operations for faster workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="lg"
                className="h-20 flex-col gap-2"
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest order activities and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.id}</p>
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.party}</p>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Items requiring immediate restocking attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning-light/10">
                  <div className="space-y-1">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Batch: {item.batch}</span>
                      <span>Exp: {item.expiry}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm">
                      <span className="text-warning font-medium">{item.current}</span>
                      <span className="text-muted-foreground"> / {item.minimum}</span>
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Low Stock
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="warning" className="w-full">
                Manage Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due Payments Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Payment Summary
          </CardTitle>
          <CardDescription>
            Outstanding payments and collections overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-success-light rounded-lg">
              <p className="text-2xl font-bold text-success">₹4,56,789</p>
              <p className="text-sm text-success">Collections Due</p>
            </div>
            <div className="text-center p-4 bg-warning-light rounded-lg">
              <p className="text-2xl font-bold text-warning">₹2,34,567</p>
              <p className="text-sm text-warning">Payments Due</p>
            </div>
            <div className="text-center p-4 bg-primary-light rounded-lg">
              <p className="text-2xl font-bold text-primary">₹2,22,222</p>
              <p className="text-sm text-primary">Net Outstanding</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

// Import RTK Query hooks
import {
  useGetDashboardDataQuery,
  useGetStockItemsQuery,
  useGetRecentOrdersQuery // ← You'll create this
} from '../services/inventoryApi';

const Dashboard = () => {
  const navigate = useNavigate();

  // API Queries
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardDataQuery();
  const { data: stockData, isLoading: isStockLoading } = useGetStockItemsQuery({
    status: 'Low Stock,Critical'
  });
  const { data: ordersData, isLoading: isOrdersLoading } = useGetRecentOrdersQuery({ limit: 4 });

  // Loading state
  if (isDashboardLoading || isStockLoading || isOrdersLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Quick Actions
  const quickActions = [
    {
      title: "New Order",
      icon: Plus,
      variant: "medical",
      description: "Create sales order",
      onClick: () => navigate('/orders/new')
    },
    {
      title: "New Bill",
      icon: Receipt,
      variant: "secondary",
      description: "Generate invoice",
      onClick: () => navigate('/billing/new')
    },
    {
      title: "Add Stock",
      icon: Package,
      variant: "success",
      description: "Update inventory",
      onClick: () => navigate('/inventory/add')
    },
    {
      title: "Search Party",
      icon: Search,
      variant: "outline",
      description: "Find customer",
      onClick: () => navigate('/parties?search=')
    }
  ];

  // Get status badge variant
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
        <Button variant="medical" size="lg" onClick={() => navigate('/orders/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Quick Order
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Today's Sales",
            value: dashboardData?.todaySales || "₹0",
            change: dashboardData?.salesChange || "+0%",
            trend: dashboardData?.salesChange?.startsWith('+') ? 'up' : 'down',
            icon: TrendingUp,
            description: "vs yesterday"
          },
          {
            title: "Pending Orders",
            value: dashboardData?.pendingOrders || "0",
            change: dashboardData?.orderChange || "0 from yesterday",
            trend: dashboardData?.orderChange?.startsWith('-') ? 'down' : 'up',
            icon: Clock,
            description: "Orders to process"
          },
          {
            title: "Stock Items",
            value: dashboardData?.totalProducts || "0",
            change: `${dashboardData?.lowStockItems || 0} low stock`,
            trend: "neutral",
            icon: Package,
            description: "Total inventory"
          },
          {
            title: "Active Parties",
            value: dashboardData?.activeParties || "0",
            change: dashboardData?.partyChange || "+0 new this week",
            trend: "up",
            icon: Users,
            description: "Customers & suppliers"
          }
        ].map((stat, index) => (
          <Card key={index} className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs flex items-center gap-1 ${
                stat.trend === 'up' ? 'text-success' : 
                stat.trend === 'down' ? 'text-destructive' : 
                'text-muted-foreground'
              }`}>
                {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {stat.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {stat.change}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="lg"
                className="flex-col h-20 gap-2"
                onClick={action.onClick}
              >
                <action.icon className="w-5 h-5" />
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest order activities and status updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordersData?.data?.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{order.orderId}</p>
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.partyName}</p>
                    <p className="text-xs text-muted-foreground">{order.updatedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => navigate('/orders')}>
                View All Orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>
              Items requiring immediate restocking attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stockData?.data?.filter(item => 
                item.status === 'Low Stock' || item.status === 'Critical'
              ).slice(0, 4).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg border-warning/20 bg-warning-light/10">
                  <div className="space-y-1">
                    <p className="font-medium">{item.productDetails.genericName}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Batch: {item.batchNumber}</span>
                      <span>Exp: {new Date(item.expiryDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm">
                      <span className="font-medium text-warning">{item.currentStock}</span>
                      <span className="text-muted-foreground"> / {item.minimumStock}</span>
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="warning" className="w-full" onClick={() => navigate('/inventory')}>
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
            <IndianRupee className="w-5 h-5" />
            Payment Summary
          </CardTitle>
          <CardDescription>
            Outstanding payments and collections overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 text-center rounded-lg bg-success-light">
              <p className="text-2xl font-bold text-success">
                ₹{dashboardData?.collectionsDue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-success">Collections Due</p>
            </div>
            <div className="p-4 text-center rounded-lg bg-warning-light">
              <p className="text-2xl font-bold text-warning">
                ₹{dashboardData?.paymentsDue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-warning">Payments Due</p>
            </div>
            <div className="p-4 text-center rounded-lg bg-primary-light">
              <p className="text-2xl font-bold text-primary">
                ₹{dashboardData?.netOutstanding?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-primary">Net Outstanding</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
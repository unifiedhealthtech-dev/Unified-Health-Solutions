import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ShoppingCart, AlertTriangle, Users } from "lucide-react";
import { Plus, Receipt, Package, Search, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
const Overview = () => {
  const quickStats = [
    { title: "Today's Sales", value: "₹45,680", change: "+12%", icon: TrendingUp, color: "text-success" },
    { title: "Pending Orders", value: "23", change: "+5", icon: ShoppingCart, color: "text-warning" },
    { title: "Low Stock Items", value: "8", change: "-2", icon: AlertTriangle, color: "text-destructive" },
    { title: "Total Customers", value: "1,247", change: "+28", icon: Users, color: "text-primary" },
  ];

  const quickActions = [
    { label: "New Purchase Order", icon: Plus, path: "/dashboard/purchase-orders" },
    { label: "New Bill", icon: Receipt, path: "/dashboard/sales" },
    { label: "Add Stock", icon: Package, path: "/dashboard/inventory" },
    { label: "Search Distributor", icon: Search, path: "/dashboard/all-distributors" },
    { label: "Due Payments", icon: CreditCard, path: "/dashboard/payments" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className="flex-col h-20 gap-2"
                  asChild
                >
                  <Link to={action.path}>
                    <IconComponent className="w-6 h-6" />
                    <span className="text-xs text-center">{action.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;
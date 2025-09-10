import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Plus, Upload, RefreshCw, Trash2, AlertTriangle, Package } from "lucide-react";

const Inventory = () => {
  const [inventory] = useState([
    {
      productCode: "MED001",
      name: "Paracetamol 500mg",
      hsn: "30049099",
      batch: "PCM240115",
      mfgDate: "2024-01-15",
      expDate: "2026-01-15",
      packSize: "10x10",
      mrp: 45.00,
      ptr: 38.25,
      tax: 12,
      qty: 850,
      minStock: 100,
      status: "In Stock"
    },
    {
      productCode: "MED002",
      name: "Amoxicillin 250mg",
      hsn: "30041000",
      batch: "AMX240110",
      mfgDate: "2024-01-10",
      expDate: "2025-06-10",
      packSize: "10x10",
      mrp: 125.50,
      ptr: 106.68,
      tax: 12,
      qty: 25,
      minStock: 50,
      status: "Low Stock"
    },
    {
      productCode: "MED003",
      name: "Cetirizine 10mg",
      hsn: "30049099",
      batch: "CET240105",
      mfgDate: "2024-01-05",
      expDate: "2024-03-15",
      packSize: "10x10",
      mrp: 28.75,
      ptr: 24.44,
      tax: 12,
      qty: 150,
      minStock: 100,
      status: "Near Expiry"
    },
  ]);

  const getStatusBadge = (status, qty, minStock) => {
    if (status === "Near Expiry") {
      return <Badge variant="destructive">Near Expiry</Badge>;
    }
    if (qty <= minStock) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  const stockSummary = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(item => item.qty <= item.minStock).length,
    nearExpiry: inventory.filter(item => item.status === "Near Expiry").length,
    totalValue: inventory.reduce((sum, item) => sum + (item.qty * item.ptr), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold">Inventory Management</h2>
          <p className="text-muted-foreground">Track and manage your stock levels</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Adjust Stock
          </Button>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stockSummary.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-warning">{stockSummary.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Near Expiry</p>
                <p className="text-2xl font-bold text-destructive">{stockSummary.nearExpiry}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{stockSummary.totalValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Complete inventory with stock levels and expiry tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search products..." className="max-w-sm" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>MFG Date</TableHead>
                <TableHead>EXP Date</TableHead>
                <TableHead>Pack Size</TableHead>
                <TableHead>MRP</TableHead>
                <TableHead>PTR</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productCode}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.hsn}</TableCell>
                  <TableCell>{item.batch}</TableCell>
                  <TableCell>{item.mfgDate}</TableCell>
                  <TableCell className={item.status === "Near Expiry" ? "text-destructive font-medium" : ""}>
                    {item.expDate}
                  </TableCell>
                  <TableCell>{item.packSize}</TableCell>
                  <TableCell>₹{item.mrp.toFixed(2)}</TableCell>
                  <TableCell>₹{item.ptr.toFixed(2)}</TableCell>
                  <TableCell>{item.tax}%</TableCell>
                  <TableCell className={item.qty <= item.minStock ? "text-warning font-medium" : ""}>
                    {item.qty}
                  </TableCell>
                  <TableCell>{item.minStock}</TableCell>
                  <TableCell>
                    {getStatusBadge(item.status, item.qty, item.minStock)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;

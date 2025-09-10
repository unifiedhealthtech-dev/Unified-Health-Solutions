import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Plus, Upload, RefreshCw, Trash2, AlertTriangle, Package, Edit, Receipt, Download, CreditCard, DollarSign } from "lucide-react";

const CombinedManagement = () => {
  const [inventory, setInventory] = useState([
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

  const [payments, setPayments] = useState([
    {
      id: 1,
      billNo: "BILL-2024-001",
      customerName: "John Doe",
      billAmount: 2450.00,
      amountPaid: 2450.00,
      mode: "UPI",
      referenceNo: "UPI123456789",
      paymentDate: "2024-01-15",
      status: "Paid"
    },
    {
      id: 2,
      billNo: "BILL-2024-002",
      customerName: "Jane Smith",
      billAmount: 1850.00,
      amountPaid: 1000.00,
      mode: "Cash",
      referenceNo: "",
      paymentDate: "2024-01-14",
      status: "Partial"
    },
    {
      id: 3,
      billNo: "BILL-2024-003",
      customerName: "Robert Wilson",
      billAmount: 3200.00,
      amountPaid: 0.00,
      mode: "",
      referenceNo: "",
      paymentDate: "",
      status: "Pending"
    },
  ]);

  const [newPayment, setNewPayment] = useState({
    billNo: "",
    amountPaid: "",
    mode: "",
    referenceNo: "",
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const getInventoryStatusBadge = (status, qty, minStock) => {
    if (status === "Near Expiry") {
      return <Badge variant="destructive">Near Expiry</Badge>;
    }
    if (qty <= minStock) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <Badge variant="default">Paid</Badge>;
      case "Partial":
        return <Badge variant="secondary">Partial</Badge>;
      case "Pending":
        return <Badge variant="destructive">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stockSummary = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(item => item.qty <= item.minStock).length,
    nearExpiry: inventory.filter(item => item.status === "Near Expiry").length,
    totalValue: inventory.reduce((sum, item) => sum + (item.qty * item.ptr), 0)
  };

  const paymentSummary = {
    totalReceived: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
    totalPending: payments.reduce((sum, payment) => sum + (payment.billAmount - payment.amountPaid), 0),
    totalTransactions: payments.length,
    paidBills: payments.filter(p => p.status === "Paid").length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* --- */}
      {/* Inventory Management Section */}
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
                      {getInventoryStatusBadge(item.status, item.qty, item.minStock)}
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

      {/* --- */}
      {/* Payment Management Section */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-3xl font-bold">Payment Management</h2>
            <p className="text-muted-foreground">Track payments and manage outstanding amounts</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold text-success">₹{paymentSummary.totalReceived.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Pending</p>
                  <p className="text-2xl font-bold text-destructive">₹{paymentSummary.totalPending.toLocaleString()}</p>
                </div>
                <CreditCard className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Bills</p>
                  <p className="text-2xl font-bold">{paymentSummary.totalTransactions}</p>
                </div>
                <Receipt className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paid Bills</p>
                  <p className="text-2xl font-bold text-success">{paymentSummary.paidBills}</p>
                </div>
                <Receipt className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Payment Form */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>Add a new payment entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="billNo">Bill No</Label>
                <Input
                  id="billNo"
                  placeholder="Enter or search bill number"
                  value={newPayment.billNo}
                  onChange={(e) => setNewPayment({...newPayment, billNo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  placeholder="Enter amount"
                  value={newPayment.amountPaid}
                  onChange={(e) => setNewPayment({...newPayment, amountPaid: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select value={newPayment.mode} onValueChange={(value) => setNewPayment({...newPayment, mode: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                    <SelectItem value="RTGS">RTGS</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="referenceNo">Reference No</Label>
                <Input
                  id="referenceNo"
                  placeholder="Transaction/Cheque reference"
                  value={newPayment.referenceNo}
                  onChange={(e) => setNewPayment({...newPayment, referenceNo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={newPayment.paymentDate}
                  onChange={(e) => setNewPayment({...newPayment, paymentDate: e.target.value})}
                />
              </div>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment
              </Button>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card className="lg:col-span-2 shadow-medium">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Bill Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.billNo}</TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell>₹{payment.billAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-success">₹{payment.amountPaid.toFixed(2)}</TableCell>
                      <TableCell className={payment.billAmount - payment.amountPaid > 0 ? "text-destructive" : "text-success"}>
                        ₹{(payment.billAmount - payment.amountPaid).toFixed(2)}
                      </TableCell>
                      <TableCell>{payment.mode || "-"}</TableCell>
                      <TableCell>{payment.paymentDate || "-"}</TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Receipt className="w-3 h-3" />
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
      </div>
    </div>
  );
};

export default CombinedManagement;

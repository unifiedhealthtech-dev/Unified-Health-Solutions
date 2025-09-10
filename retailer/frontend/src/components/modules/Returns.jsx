import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "../ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  Plus, RotateCcw, CheckCircle, X, Printer, AlertTriangle
} from "lucide-react";

const Returns = () => {
  const [returns] = useState([
    {
      returnNo: "RET-2024-001",
      returnDate: "2024-01-15",
      billNo: "BILL-2024-001",
      customerName: "John Doe",
      totalCreditAmount: 1250.0,
      status: "Approved",
      reason: "Expired Product",
    },
    {
      returnNo: "RET-2024-002",
      returnDate: "2024-01-14",
      billNo: "BILL-2024-003",
      customerName: "Jane Smith",
      totalCreditAmount: 850.0,
      status: "Pending",
      reason: "Damaged Product",
    },
  ]);

  const [newReturn, setNewReturn] = useState({
    returnNo: "RET-2024-003",
    returnDate: new Date().toISOString().split("T")[0],
    billNo: "",
  });

  const [returnItems, setReturnItems] = useState([
    {
      productName: "Paracetamol 500mg",
      batch: "PCM240115",
      qty: 2,
      expiry: "2024-02-15",
      reason: "Expired",
      creditAmount: 90.0,
    },
    {
      productName: "Cetirizine 10mg",
      batch: "CET240105",
      qty: 1,
      expiry: "2024-03-15",
      reason: "Near Expiry",
      creditAmount: 28.75,
    },
  ]);

  const returnSummary = {
    totalReturns: returns.length,
    pendingReturns: returns.filter((r) => r.status === "Pending").length,
    approvedReturns: returns.filter((r) => r.status === "Approved").length,
    totalCreditValue: returns.reduce(
      (sum, ret) => sum + ret.totalCreditAmount,
      0
    ),
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <Badge variant="default">Approved</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const addReturnItem = () => {
    setReturnItems([
      ...returnItems,
      {
        productName: "",
        batch: "",
        qty: 1,
        expiry: "",
        reason: "",
        creditAmount: 0,
      },
    ]);
  };

  const updateReturnItemField = (index, field, value) => {
    setReturnItems((currentItems) => {
      const newItems = [...currentItems];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
      };
      return newItems;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold">Returns & Credit Notes</h2>
          <p className="text-muted-foreground">
            Manage product returns and credit notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Return
          </Button>
        </div>
      </div>

      {/* Returns Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Returns
                </p>
                <p className="text-2xl font-bold">{returnSummary.totalReturns}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">
                  {returnSummary.pendingReturns}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-success">
                  {returnSummary.approvedReturns}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credit Value</p>
                <p className="text-2xl font-bold text-success">
                  ₹{returnSummary.totalCreditValue.toLocaleString()}
                </p>
              </div>
              <RotateCcw className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Return Form */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Create Return</CardTitle>
            <CardDescription>Initialize a new product return</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="returnNo">Return No</Label>
              <Input
                id="returnNo"
                value={newReturn.returnNo}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="returnDate">Return Date</Label>
              <Input
                id="returnDate"
                type="date"
                value={newReturn.returnDate}
                onChange={(e) =>
                  setNewReturn({ ...newReturn, returnDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="billNo">Original Bill No</Label>
              <Input
                id="billNo"
                placeholder="Enter bill number"
                value={newReturn.billNo}
                onChange={(e) =>
                  setNewReturn({ ...newReturn, billNo: e.target.value })
                }
              />
            </div>
            <Button className="w-full">Create Return</Button>
          </CardContent>
        </Card>

        {/* Returns List */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader>
            <CardTitle>Recent Returns</CardTitle>
            <CardDescription>Track return status and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Credit Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((returnItem) => (
                  <TableRow key={returnItem.returnNo}>
                    <TableCell className="font-medium">
                      {returnItem.returnNo}
                    </TableCell>
                    <TableCell>{returnItem.returnDate}</TableCell>
                    <TableCell>{returnItem.billNo}</TableCell>
                    <TableCell>{returnItem.customerName}</TableCell>
                    <TableCell className="text-success">
                      ₹{returnItem.totalCreditAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(returnItem.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Printer className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="w-3 h-3" />
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

      {/* Return Items Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Return Items</CardTitle>
              <CardDescription>Products in current return request</CardDescription>
            </div>
            <Button onClick={addReturnItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Credit Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={item.productName}
                      placeholder="Product name"
                      className="w-48"
                      onChange={(e) =>
                        updateReturnItemField(index, "productName", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.batch}
                      placeholder="Batch number"
                      className="w-32"
                      onChange={(e) =>
                        updateReturnItemField(index, "batch", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.qty}
                      className="w-20"
                      min="1"
                      onChange={(e) =>
                        updateReturnItemField(index, "qty", Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={item.expiry}
                      className="w-40"
                      onChange={(e) =>
                        updateReturnItemField(index, "expiry", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={item.reason}
                      onValueChange={(value) =>
                        updateReturnItemField(index, "reason", value)
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                        <SelectItem value="Near Expiry">Near Expiry</SelectItem>
                        <SelectItem value="Wrong Product">Wrong Product</SelectItem>
                        <SelectItem value="Defective">Defective</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.creditAmount}
                      className="w-32"
                      step="0.01"
                      onChange={(e) =>
                        updateReturnItemField(index, "creditAmount", Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <X className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Cancel</Button>
            <Button>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Return
            </Button>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Credit Note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Returns;

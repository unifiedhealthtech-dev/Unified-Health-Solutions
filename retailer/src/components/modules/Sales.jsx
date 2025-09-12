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
import { Separator } from "../ui/separator";
import {
  Receipt, Printer, Mail, Download, Plus, Trash2
} from "lucide-react";

const Sales = () => {
  const [billData, setBillData] = useState({
    billNo: "BILL-2024-001",
    billDate: new Date().toISOString().split("T")[0],
    billType: "Cash",
    customerName: "",
    customerMobile: "",
  });

  const [billItems, setBillItems] = useState([
    {
      productCode: "MED001",
      name: "Paracetamol 500mg",
      batch: "PCM240115",
      expiry: "2026-01-15",
      qty: 2,
      rate: 45.0,
      tax: 12,
      netValue: 100.8,
    },
    {
      productCode: "MED002",
      name: "Amoxicillin 250mg",
      batch: "AMX240110",
      expiry: "2025-06-10",
      qty: 1,
      rate: 125.5,
      tax: 12,
      netValue: 140.56,
    },
  ]);

  const billTotals = {
    subtotal: billItems.reduce((sum, item) => sum + item.qty * item.rate, 0),
    tax: billItems.reduce(
      (sum, item) => sum + (item.qty * item.rate * item.tax) / 100,
      0
    ),
    total: billItems.reduce((sum, item) => sum + item.netValue, 0),
  };

  const calculateNetValue = (qty, rate, tax) => qty * rate * (1 + tax / 100);

  const handleAddItem = () => {
    setBillItems([
      ...billItems,
      {
        productCode: "",
        name: "",
        batch: "",
        expiry: "",
        qty: 1,
        rate: 0,
        tax: 12,
        netValue: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const updateItemField = (index, field, value) => {
    setBillItems((currentItems) => {
      const newItems = [...currentItems];
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        netValue:
          field === "qty" || field === "rate" || field === "tax"
            ? calculateNetValue(
                field === "qty" ? value : newItems[index].qty,
                field === "rate" ? value : newItems[index].rate,
                field === "tax" ? value : newItems[index].tax
              )
            : newItems[index].netValue,
      };
      return newItems;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold">Sales & Billing</h2>
          <p className="text-muted-foreground">
            Generate bills and manage sales transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Receipt className="w-4 h-4 mr-2" />
            Generate Bill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bill Header Information */}
        <Card className="lg:col-span-1 shadow-medium">
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
            <CardDescription>Enter bill and customer details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="billNo">Bill No</Label>
              <Input
                id="billNo"
                value={billData.billNo}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="billDate">Bill Date</Label>
              <Input
                id="billDate"
                type="date"
                value={billData.billDate}
                onChange={(e) =>
                  setBillData({ ...billData, billDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="billType">Bill Type</Label>
              <Select
                value={billData.billType}
                onValueChange={(value) =>
                  setBillData({ ...billData, billType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                placeholder="Enter customer name"
                value={billData.customerName}
                onChange={(e) =>
                  setBillData({ ...billData, customerName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="customerMobile">Mobile</Label>
              <Input
                id="customerMobile"
                placeholder="Enter mobile number"
                value={billData.customerMobile}
                onChange={(e) =>
                  setBillData({ ...billData, customerMobile: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Bill Summary */}
        <Card className="lg:col-span-2 shadow-medium">
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
            <CardDescription>Current bill totals and amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="text-2xl font-bold">{billItems.length}</p>
              </div>
              <div className="text-center p-4 bg-accent-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-2xl font-bold">
                  ₹{billTotals.subtotal.toFixed(2)}
                </p>
              </div>
              <div className="text-center p-4 bg-warning-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tax</p>
                <p className="text-2xl font-bold">₹{billTotals.tax.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-success-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-3xl font-bold">₹{billTotals.total.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Grid */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bill Items</CardTitle>
              <CardDescription>Add products to the current bill</CardDescription>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead>Net Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={item.productCode}
                      placeholder="Product code"
                      className="w-32"
                      onChange={(e) =>
                        updateItemField(index, "productCode", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.name}
                      placeholder="Product name"
                      onChange={(e) =>
                        updateItemField(index, "name", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>{item.batch}</TableCell>
                  <TableCell>{item.expiry}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.qty}
                      className="w-20"
                      min="1"
                      onChange={(e) =>
                        updateItemField(index, "qty", Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                  <TableCell>{item.tax}%</TableCell>
                  <TableCell className="font-medium">
                    ₹{item.netValue.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Cancel</Button>
            <Button>
              <Receipt className="w-4 h-4 mr-2" />
              Generate Bill
            </Button>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;

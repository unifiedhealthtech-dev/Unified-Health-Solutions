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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "sonner";
import {
  Receipt, Printer, Mail, Download, Plus, Trash2, X, Check
} from "lucide-react";

const Sales = () => {
  const [billData, setBillData] = useState({
    billNo: "BILL-2024-001",
    billDate: new Date().toISOString().split("T")[0],
    billType: "Cash",
    customerName: "",
    customerMobile: "",
  });

  // State for bill management
  const [isBillGenerated, setIsBillGenerated] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({
    to: "",
    subject: "",
    message: ""
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

  // Handler functions for buttons
  const handleGenerateBill = () => {
    if (billItems.length === 0) {
      toast.error("Please add at least one item to the bill");
      return;
    }
    
    if (!billData.customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    // Generate new bill number
    const newBillNo = `BILL-2024-${String(Date.now()).slice(-6)}`;
    setBillData({ ...billData, billNo: newBillNo });
    setIsBillGenerated(true);
    toast.success("Bill generated successfully!");
  };

  const handleCancelBill = () => {
    if (window.confirm("Are you sure you want to cancel this bill? All data will be lost.")) {
      setBillData({
        billNo: `BILL-2024-${String(Date.now()).slice(-6)}`,
        billDate: new Date().toISOString().split("T")[0],
        billType: "Cash",
        customerName: "",
        customerMobile: "",
      });
      setBillItems([]);
      setIsBillGenerated(false);
      toast.info("Bill cancelled");
    }
  };

  const handlePrintBill = () => {
    if (!isBillGenerated) {
      toast.error("Please generate the bill first");
      return;
    }
    
    // Create a printable version of the bill
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    toast.success("Bill sent to printer");
  };

  const handleEmailBill = () => {
    if (!isBillGenerated) {
      toast.error("Please generate the bill first");
      return;
    }
    setEmailData({
      to: billData.customerMobile ? `${billData.customerName}@example.com` : "",
      subject: `Bill ${billData.billNo} - ${billData.billDate}`,
      message: `Dear ${billData.customerName},\n\nPlease find attached your bill ${billData.billNo} dated ${billData.billDate}.\n\nTotal Amount: ₹${billTotals.total.toFixed(2)}\n\nThank you for your business!`
    });
    setShowEmailDialog(true);
  };

  const handleSendEmail = () => {
    if (!emailData.to.trim()) {
      toast.error("Please enter recipient email");
      return;
    }
    
    // Simulate email sending
    toast.success(`Bill sent to ${emailData.to}`);
    setShowEmailDialog(false);
  };

  const handleExportBill = () => {
    if (!isBillGenerated) {
      toast.error("Please generate the bill first");
      return;
    }
    
    // Create CSV content
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${billData.billNo}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Bill exported successfully");
  };

  const generatePrintContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill ${billData.billNo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .bill-info { margin-bottom: 20px; }
          .customer-info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PharmaRetail</h1>
          <h2>Bill No: ${billData.billNo}</h2>
        </div>
        
        <div class="bill-info">
          <p><strong>Date:</strong> ${billData.billDate}</p>
          <p><strong>Type:</strong> ${billData.billType}</p>
        </div>
        
        <div class="customer-info">
          <p><strong>Customer:</strong> ${billData.customerName}</p>
          <p><strong>Mobile:</strong> ${billData.customerMobile}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Batch</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Tax %</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${billItems.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.batch}</td>
                <td>${item.qty}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>${item.tax}%</td>
                <td>₹${item.netValue.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p>Subtotal: ₹${billTotals.subtotal.toFixed(2)}</p>
          <p>Tax: ₹${billTotals.tax.toFixed(2)}</p>
          <p><strong>Total: ₹${billTotals.total.toFixed(2)}</strong></p>
        </div>
      </body>
      </html>
    `;
  };

  const generateCSVContent = () => {
    const headers = ['Product Code', 'Name', 'Batch', 'Expiry', 'Qty', 'Rate', 'Tax %', 'Net Value'];
    const rows = billItems.map(item => [
      item.productCode,
      item.name,
      item.batch,
      item.expiry,
      item.qty,
      item.rate,
      item.tax,
      item.netValue
    ]);
    
    const csvContent = [
      ['Bill No', billData.billNo],
      ['Date', billData.billDate],
      ['Customer', billData.customerName],
      ['Mobile', billData.customerMobile],
      ['Type', billData.billType],
      [],
      headers,
      ...rows,
      [],
      ['Subtotal', billTotals.subtotal],
      ['Tax', billTotals.tax],
      ['Total', billTotals.total]
    ].map(row => row.join(',')).join('\n');
    
    return csvContent;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateBill} disabled={isBillGenerated}>
            <Receipt className="w-4 h-4 mr-2" />
            {isBillGenerated ? "Bill Generated" : "Generate Bill"}
          </Button>
          {isBillGenerated && (
            <Button variant="outline" onClick={handleCancelBill}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
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
            <Button variant="outline" onClick={handleCancelBill}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleGenerateBill} disabled={isBillGenerated}>
              <Receipt className="w-4 h-4 mr-2" />
              {isBillGenerated ? "Bill Generated" : "Generate Bill"}
            </Button>
            <Button variant="outline" onClick={handlePrintBill} disabled={!isBillGenerated}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleEmailBill} disabled={!isBillGenerated}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" onClick={handleExportBill} disabled={!isBillGenerated}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Bill</DialogTitle>
            <DialogDescription>Send the bill to customer via email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailTo">To</Label>
              <Input
                id="emailTo"
                type="email"
                placeholder="customer@example.com"
                value={emailData.to}
                onChange={(e) => setEmailData({...emailData, to: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                value={emailData.subject}
                onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailMessage">Message</Label>
              <textarea
                id="emailMessage"
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md resize-none"
                value={emailData.message}
                onChange={(e) => setEmailData({...emailData, message: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;

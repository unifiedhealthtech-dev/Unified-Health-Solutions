import { useState, useRef } from "react";
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
  Plus, RotateCcw, CheckCircle, X, Printer, AlertTriangle, Trash2, Eye, Edit
} from "lucide-react";

const Returns = () => {
  const createReturnCardRef = useRef(null);

  const [returns, setReturns] = useState([
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

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isCreatingReturn, setIsCreatingReturn] = useState(false);

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
    if (!newReturn.billNo) {
      alert('Please enter the original bill number first before adding items.');
      return;
    }
    
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

  const handleCreateReturn = () => {
    if (!newReturn.billNo) {
      alert('Please enter the original bill number.');
      return;
    }
    
    if (returnItems.length === 0) {
      alert('Please add at least one item to the return.');
      return;
    }

    // Validate return items
    const hasInvalidItems = returnItems.some(item => 
      !item.productName || !item.batch || !item.reason || item.creditAmount <= 0
    );
    
    if (hasInvalidItems) {
      alert('Please fill in all required fields for return items.');
      return;
    }

    const returnToAdd = {
      ...newReturn,
      customerName: "N/A", // Placeholder
      totalCreditAmount: returnItems.reduce((sum, item) => sum + item.creditAmount, 0),
      status: "Pending",
      reason: "N/A",
    };
    
    setReturns(prev => [returnToAdd, ...prev]);
    
    // Show success message
    alert(`Return ${newReturn.returnNo} created successfully!`);
    
    // Reset form
    setNewReturn({
      returnNo: `RET-2024-00${returns.length + 2}`,
      returnDate: new Date().toISOString().split("T")[0],
      billNo: "",
    });
    setReturnItems([]);
    setIsCreatingReturn(false);
  };

  const handleResetNewReturn = () => {
    setNewReturn({
      returnNo: `RET-2024-00${returns.length + 2}`,
      returnDate: new Date().toISOString().split("T")[0],
      billNo: "",
    });
    setReturnItems([]);
    setIsCreatingReturn(true);
    if (createReturnCardRef.current) {
      createReturnCardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const updateReturnStatus = (returnNo, status) => {
    const returnItem = returns.find(r => r.returnNo === returnNo);
    if (returnItem) {
      const confirmMessage = status === 'Approved' 
        ? `Are you sure you want to approve return ${returnNo}?`
        : `Are you sure you want to reject return ${returnNo}?`;
      
      if (window.confirm(confirmMessage)) {
        setReturns(returns.map(r => r.returnNo === returnNo ? { ...r, status } : r));
        alert(`Return ${returnNo} has been ${status.toLowerCase()}.`);
      }
    }
  };

  const deleteReturn = (returnNo) => {
    if (window.confirm(`Are you sure you want to delete return ${returnNo}? This action cannot be undone.`)) {
      setReturns(returns.filter(r => r.returnNo !== returnNo));
      alert(`Return ${returnNo} has been deleted.`);
    }
  };

  const removeReturnItem = (index) => {
    if (window.confirm('Are you sure you want to remove this item from the return?')) {
      setReturnItems(returnItems.filter((_, i) => i !== index));
    }
  };

  const handlePrintReturn = (returnNo) => {
    const returnItem = returns.find(r => r.returnNo === returnNo);
    if (returnItem) {
      // Create a print-friendly version
      const printContent = `
        <html>
          <head>
            <title>Return Details - ${returnNo}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .details { margin: 20px 0; }
              .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .table th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>RETURN DETAILS</h1>
              <h2>Return No: ${returnNo}</h2>
            </div>
            <div class="details">
              <p><strong>Date:</strong> ${returnItem.returnDate}</p>
              <p><strong>Bill No:</strong> ${returnItem.billNo}</p>
              <p><strong>Customer:</strong> ${returnItem.customerName}</p>
              <p><strong>Status:</strong> ${returnItem.status}</p>
              <p><strong>Total Credit Amount:</strong> ₹${returnItem.totalCreditAmount.toFixed(2)}</p>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handlePrintCreditNote = () => {
    if (returnItems.length === 0) {
      alert('No items to print in credit note.');
      return;
    }

    const totalAmount = returnItems.reduce((sum, item) => sum + item.creditAmount, 0);
    const printContent = `
      <html>
        <head>
          <title>Credit Note</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CREDIT NOTE</h1>
            <h2>Return No: ${newReturn.returnNo}</h2>
            <p>Date: ${newReturn.returnDate}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Expiry</th>
                <th>Reason</th>
                <th>Credit Amount</th>
              </tr>
            </thead>
            <tbody>
              ${returnItems.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.batch}</td>
                  <td>${item.qty}</td>
                  <td>${item.expiry}</td>
                  <td>${item.reason}</td>
                  <td>₹${item.creditAmount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total Credit Amount: ₹${totalAmount.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCancelReturn = () => {
    if (returnItems.length > 0) {
      if (window.confirm('Are you sure you want to cancel this return? All items will be removed.')) {
        setReturnItems([]);
        alert('Return cancelled successfully.');
      }
    } else {
      alert('No items to cancel.');
    }
  };

  const handleApproveReturn = () => {
    if (returnItems.length === 0) {
      alert('No items to approve in this return.');
      return;
    }

    const totalAmount = returnItems.reduce((sum, item) => sum + item.creditAmount, 0);
    if (window.confirm(`Are you sure you want to approve this return with a total credit amount of ₹${totalAmount.toFixed(2)}?`)) {
      alert('Return approved successfully! Credit note has been generated.');
      setReturnItems([]);
      setNewReturn({
        returnNo: `RET-2024-00${returns.length + 2}`,
        returnDate: new Date().toISOString().split("T")[0],
        billNo: "",
      });
    }
  };

  const handleViewReturn = (returnNo) => {
    const returnItem = returns.find(r => r.returnNo === returnNo);
    if (returnItem) {
      setSelectedReturn(returnItem);
      alert(`Viewing details for return ${returnNo}:\n\nDate: ${returnItem.returnDate}\nBill No: ${returnItem.billNo}\nCustomer: ${returnItem.customerName}\nStatus: ${returnItem.status}\nCredit Amount: ₹${returnItem.totalCreditAmount.toFixed(2)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleResetNewReturn}>
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
        <Card className="shadow-medium" ref={createReturnCardRef}>
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
            <Button className="w-full" onClick={handleCreateReturn} disabled={!newReturn.billNo}>
              Create Return
            </Button>
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
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewReturn(returnItem.returnNo)}
                          title="View Details"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        {returnItem.status === 'Pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => updateReturnStatus(returnItem.returnNo, 'Approved')}
                              title="Approve Return"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => updateReturnStatus(returnItem.returnNo, 'Rejected')}
                              title="Reject Return"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handlePrintReturn(returnItem.returnNo)}
                          title="Print Return Details"
                        >
                          <Printer className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteReturn(returnItem.returnNo)}
                          title="Delete Return"
                        >
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

      {/* Return Items Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Return Items</CardTitle>
              <CardDescription>Products in current return request</CardDescription>
            </div>
            <Button onClick={addReturnItem} disabled={!newReturn.billNo}>
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
                    <Button size="sm" variant="destructive" onClick={() => removeReturnItem(index)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleCancelReturn}>
              Cancel
            </Button>
            <Button onClick={handleApproveReturn} disabled={returnItems.length === 0}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Return
            </Button>
            <Button variant="outline" onClick={handlePrintCreditNote} disabled={returnItems.length === 0}>
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

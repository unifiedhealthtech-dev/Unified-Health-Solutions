import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import React from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Receipt,
  Send,
  Download,
  Printer,
  Calculator,
  Building2,
  Calendar,
  User,
  CreditCard,
  DollarSign,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Separator } from '../components/ui/separator';

const Billing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewBill, setShowNewBill] = useState(false);

  // Mock bills data
  const bills = [
    {
      billNo: 'INV-2024-001',
      billDate: '2024-01-15',
      billType: 'Credit',
      partyCode: 'PRT-001',
      partyName: 'Apollo Pharmacy - Banjara Hills',
      totalItems: 12,
      grossAmount: 45678.50,
      discountAmount: 2284.00,
      taxAmount: 7801.00,
      netAmount: 51195.50,
      paidAmount: 20000.00,
      balanceAmount: 31195.50,
      dueDate: '2024-01-30',
      status: 'Partially Paid',
      paymentMode: 'Credit',
      createdBy: 'Admin'
    },
    {
      billNo: 'INV-2024-002',
      billDate: '2024-01-14',
      billType: 'Cash',
      partyCode: 'PRT-002',
      partyName: 'MedPlus Health Services',
      totalItems: 8,
      grossAmount: 28560.00,
      discountAmount: 1428.00,
      taxAmount: 4864.00,
      netAmount: 31996.00,
      paidAmount: 31996.00,
      balanceAmount: 0,
      dueDate: '2024-01-14',
      status: 'Paid',
      paymentMode: 'Cash',
      createdBy: 'Sales Team'
    },
    {
      billNo: 'INV-2024-003',
      billDate: '2024-01-13',
      billType: 'Online',
      partyCode: 'PRT-003',
      partyName: 'Guardian Pharmacy',
      totalItems: 15,
      grossAmount: 67890.00,
      discountAmount: 3400.00,
      taxAmount: 11608.00,
      netAmount: 76098.00,
      paidAmount: 0,
      balanceAmount: 76098.00,
      dueDate: '2024-01-28',
      status: 'Pending',
      paymentMode: 'UPI',
      createdBy: 'Admin'
    }
  ];

  // Mock bill items for new bill form
  const [billItems, setBillItems] = useState([
    { productCode: '', productName: '', batch: '', expiry: '', qty: '', rate: '', discount: 0, taxPercent: 18, netValue: 0 }
  ]);

  const [billForm, setBillForm] = useState({
    billNo: 'INV-2024-004', // Auto-generated
    billDate: new Date().toISOString().split('T')[0],
    billType: 'Credit',
    stockPoint: 'Main Store',
    dueDate: '',
    partyCode: '',
    partyName: '',
    partyGst: '',
    partyAddress: '',
    partyCity: '',
    partyMobile: ''
  });

  const [billTotals, setBillTotals] = useState({
    grossAmount: 0,
    discountAmount: 0,
    taxAmount: 0,
    netAmount: 0
  });

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          bill.partyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      Paid: "default",
      'Partially Paid': "secondary", 
      Pending: "destructive",
      Cancelled: "outline"
    };
    return variants[status] || "secondary";
  };

  const addBillItem = () => {
    setBillItems([...billItems, { 
      productCode: '', productName: '', batch: '', expiry: '', qty: '', rate: '', discount: 0, taxPercent: 18, netValue: 0 
    }]);
  };

  const removeBillItem = (index) => {
    if (billItems.length > 1) {
      setBillItems(billItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    // This would calculate based on billItems
    // Mock calculation for now
    setBillTotals({
      grossAmount: 45678.50,
      discountAmount: 2284.00,
      taxAmount: 7801.00,
      netAmount: 51195.50
    });
  };

  const handleSubmitBill = (e) => {
    e.preventDefault();
    console.log('Creating bill:', billForm, billItems, billTotals);
    setShowNewBill(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
          <p className="text-muted-foreground">
            Create and manage pharmaceutical sales invoices and billing
          </p>
        </div>
        
        <Dialog open={showNewBill} onOpenChange={setShowNewBill}>
          <DialogTrigger asChild>
            <Button variant="medical" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Generate Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Generate New Bill</DialogTitle>
              <DialogDescription>
                Create a new pharmaceutical sales invoice
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitBill} className="space-y-6">
              {/* Bill Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="billNo">Bill No</Label>
                  <Input
                    id="billNo"
                    value={billForm.billNo}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billDate">Bill Date</Label>
                  <Input
                    id="billDate"
                    type="date"
                    value={billForm.billDate}
                    onChange={(e) => setBillForm({ ...billForm, billDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Bill Type</Label>
                  <Select value={billForm.billType} onValueChange={(value) => setBillForm({ ...billForm, billType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Credit">Credit</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={billForm.dueDate}
                    onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Party Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Party Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Party</Label>
                      <Select onValueChange={(value) => setBillForm({ ...billForm, partyCode: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Party" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRT-001">Apollo Pharmacy - Banjara Hills</SelectItem>
                          <SelectItem value="PRT-002">MedPlus Health Services</SelectItem>
                          <SelectItem value="PRT-003">Guardian Pharmacy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="partyGst">Party GSTIN</Label>
                      <Input
                        id="partyGst"
                        value={billForm.partyGst}
                        onChange={(e) => setBillForm({ ...billForm, partyGst: e.target.value })}
                        placeholder="36XXXXXXXXXXXXX"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="partyAddress">Address</Label>
                      <Input
                        id="partyAddress"
                        value={billForm.partyAddress}
                        onChange={(e) => setBillForm({ ...billForm, partyAddress: e.target.value })}
                        placeholder="Party address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="partyMobile">Mobile</Label>
                      <Input
                        id="partyMobile"
                        value={billForm.partyMobile}
                        onChange={(e) => setBillForm({ ...billForm, partyMobile: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Items */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Bill Items</CardTitle>
                    <Button type="button" variant="outline" onClick={addBillItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Code</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Expiry</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Disc%</TableHead>
                          <TableHead>Tax%</TableHead>
                          <TableHead>Net Value</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {billItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                placeholder="PRD001"
                                value={item.productCode}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].productCode = e.target.value;
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Product Name"
                                value={item.productName}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].productName = e.target.value;
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Batch"
                                value={item.batch}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].batch = e.target.value;
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="date"
                                value={item.expiry}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].expiry = e.target.value;
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.qty}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].qty = e.target.value;
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0.00"
                                value={item.rate}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].rate = e.target.value;
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.discount}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].discount = Number(e.target.value);
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={item.taxPercent}
                                onChange={(e) => {
                                  const newItems = [...billItems];
                                  newItems[index].taxPercent = Number(e.target.value);
                                  setBillItems(newItems);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="₹0.00"
                                value={item.netValue}
                                disabled
                                className="bg-muted"
                              />
                            </TableCell>
                            <TableCell>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeBillItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Bill Totals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Bill Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Gross Amount</Label>
                      <p className="text-xl font-semibold">₹{billTotals.grossAmount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Discount</Label>
                      <p className="text-xl font-semibold text-success">-₹{billTotals.discountAmount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Tax Amount</Label>
                      <p className="text-xl font-semibold">₹{billTotals.taxAmount.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-muted-foreground">Net Amount</Label>
                      <p className="text-2xl font-bold text-primary">₹{billTotals.netAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNewBill(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={calculateTotals}>
                  Calculate
                </Button>
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
                <Button type="submit" variant="medical">
                  Generate Bill
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Bills</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold">₹2.45L</p>
              </div>
              <DollarSign className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Bills</p>
                <p className="text-2xl font-bold text-warning">12</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-destructive">₹1.23L</p>
              </div>
              <CreditCard className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by bill number or party name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Bill Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partially">Partially Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bills List</CardTitle>
          <CardDescription>
            Total {filteredBills.length} bills found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Details</TableHead>
                  <TableHead>Party Information</TableHead>
                  <TableHead>Bill Summary</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => (
                  <TableRow key={bill.billNo}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{bill.billNo}</span>
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {bill.billDate}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {bill.billType}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          By: {bill.createdBy}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{bill.partyName}</p>
                        <p className="text-sm text-muted-foreground">{bill.partyCode}</p>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {bill.dueDate}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div><strong>Items:</strong> {bill.totalItems}</div>
                        <div><strong>Gross:</strong> ₹{bill.grossAmount.toLocaleString()}</div>
                        <div><strong>Discount:</strong> ₹{bill.discountAmount.toLocaleString()}</div>
                        <div className="font-medium text-primary">
                          <strong>Net:</strong> ₹{bill.netAmount.toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div><strong>Paid:</strong> ₹{bill.paidAmount.toLocaleString()}</div>
                        <div className={`font-medium ${bill.balanceAmount > 0 ? 'text-destructive' : 'text-success'}`}>
                          <strong>Balance:</strong> ₹{bill.balanceAmount.toLocaleString()}
                        </div>
                        <div className="text-muted-foreground">
                          {bill.paymentMode}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={getStatusBadge(bill.status)}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="View Bill">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Print Bill">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Email Bill">
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Bill">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
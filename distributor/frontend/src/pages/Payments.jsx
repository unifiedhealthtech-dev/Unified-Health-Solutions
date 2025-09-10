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
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Receipt,
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

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddPayment, setShowAddPayment] = useState(false);

  // Mock payments data
  const payments = [
    {
      id: 'PAY-2024-001',
      paymentDate: '2024-01-15',
      partyCode: 'PRT-001',
      partyName: 'Apollo Pharmacy - Banjara Hills',
      billNo: 'INV-2024-001',
      billAmount: 51195.50,
      paidAmount: 20000.00,
      balanceAmount: 31195.50,
      paymentMode: 'UPI',
      referenceNo: 'UPI240115001234',
      paymentType: 'Collection',
      status: 'Completed',
      createdBy: 'Admin',
      remarks: 'Partial payment received'
    },
    {
      id: 'PAY-2024-002',
      paymentDate: '2024-01-14',
      partyCode: 'SUP-001',
      partyName: 'Sun Pharmaceutical Industries',
      billNo: 'PURCHASE-001',
      billAmount: 234567.00,
      paidAmount: 234567.00,
      balanceAmount: 0,
      paymentMode: 'NEFT',
      referenceNo: 'NEFT240114567890',
      paymentType: 'Payment',
      status: 'Completed',
      createdBy: 'Accounts Team',
      remarks: 'Purchase payment settled'
    },
    {
      id: 'PAY-2024-003',
      paymentDate: '2024-01-13',
      partyCode: 'PRT-002',
      partyName: 'MedPlus Health Services',
      billNo: 'INV-2024-002',
      billAmount: 31996.00,
      paidAmount: 31996.00,
      balanceAmount: 0,
      paymentMode: 'Cash',
      referenceNo: 'CASH-001',
      paymentType: 'Collection',
      status: 'Completed',
      createdBy: 'Sales Team',
      remarks: 'Full payment received in cash'
    }
  ];

  const [paymentForm, setPaymentForm] = useState({
    paymentId: 'PAY-2024-004', // Auto-generated
    paymentDate: new Date().toISOString().split('T')[0],
    partyCode: '',
    partyName: '',
    billNo: '',
    billAmount: '',
    paidAmount: '',
    paymentMode: 'Cash',
    referenceNo: '',
    paymentType: 'Collection',
    remarks: ''
  });

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.billNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode = modeFilter === 'all' || payment.paymentMode.toLowerCase() === modeFilter;
    const matchesType = typeFilter === 'all' || payment.paymentType.toLowerCase() === typeFilter;

    return matchesSearch && matchesMode && matchesType;
  });

  const getStatusBadge = (status) => {
    const variants = {
      Completed: "default",
      Pending: "secondary",
      Failed: "destructive",
      Processing: "outline"
    };
    return variants[status] || "secondary";
  };

  const getPaymentModeIcon = (mode) => {
    switch (mode.toLowerCase()) {
      case 'cash': return Banknote;
      case 'upi': return Smartphone;
      case 'neft':
      case 'rtgs': return Building2;
      case 'cheque': return FileText;
      default: return CreditCard;
    }
  };

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    console.log('Adding payment:', paymentForm);
    setShowAddPayment(false);
  };

  // Calculate totals
  const totalCollections = payments
    .filter(p => p.paymentType === 'Collection')
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const totalPayments = payments
    .filter(p => p.paymentType === 'Payment')
    .reduce((sum, p) => sum + p.paidAmount, 0);

  const pendingCollections = 458967; // Mock data
  const pendingPayments = 234567; // Mock data

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Track collections, payments, and financial transactions
          </p>
        </div>

        <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
          <DialogTrigger asChild>
            <Button variant="medical" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Payment Entry</DialogTitle>
              <DialogDescription>
                Record a new payment or collection transaction
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentId">Payment ID</Label>
                  <Input
                    id="paymentId"
                    value={paymentForm.paymentId}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Party</Label>
                <Select onValueChange={(value) => setPaymentForm({ ...paymentForm, partyCode: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRT-001">Apollo Pharmacy - Banjara Hills</SelectItem>
                    <SelectItem value="PRT-002">MedPlus Health Services</SelectItem>
                    <SelectItem value="SUP-001">Sun Pharmaceutical Industries</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bill Number</Label>
                  <Select onValueChange={(value) => setPaymentForm({ ...paymentForm, billNo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INV-2024-001">INV-2024-001 (₹51,195)</SelectItem>
                      <SelectItem value="INV-2024-002">INV-2024-002 (₹31,996)</SelectItem>
                      <SelectItem value="INV-2024-003">INV-2024-003 (₹76,098)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidAmount">Amount Paid *</Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    step="0.01"
                    value={paymentForm.paidAmount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select value={paymentForm.paymentMode} onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMode: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="NEFT">NEFT</SelectItem>
                      <SelectItem value="RTGS">RTGS</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select value={paymentForm.paymentType} onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Collection">Collection (Received)</SelectItem>
                      <SelectItem value="Payment">Payment (Made)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNo">Reference Number</Label>
                <Input
                  id="referenceNo"
                  value={paymentForm.referenceNo}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNo: e.target.value })}
                  placeholder="Transaction/Reference Number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddPayment(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="medical">
                  Add Payment
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
                <p className="text-sm font-medium text-muted-foreground">Collections Today</p>
                <p className="text-2xl font-bold text-success">₹{totalCollections.toLocaleString()}</p>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payments Made</p>
                <p className="text-2xl font-bold text-primary">₹{totalPayments.toLocaleString()}</p>
              </div>
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Collections</p>
                <p className="text-2xl font-bold text-warning">₹{pendingCollections.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-destructive">₹{pendingPayments.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-destructive" />
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
                  placeholder="Search by payment ID, party name, or bill number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="neft">NEFT</SelectItem>
                <SelectItem value="rtgs">RTGS</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Payment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="collection">Collections</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            Total {filteredPayments.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Details</TableHead>
                  <TableHead>Party & Bill Info</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const ModeIcon = getPaymentModeIcon(payment.paymentMode);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{payment.id}</span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {payment.paymentDate}
                          </div>
                          <Badge variant={payment.paymentType === 'Collection' ? 'default' : 'secondary'}>
                            {payment.paymentType}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            By: {payment.createdBy}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{payment.partyName}</p>
                          <p className="text-sm text-muted-foreground">{payment.partyCode}</p>
                          <div className="text-sm font-medium text-primary">
                            Bill: {payment.billNo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Bill Amount: ₹{payment.billAmount.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ModeIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{payment.paymentMode}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Ref: {payment.referenceNo}
                          </div>
                          {payment.remarks && (
                            <div className="text-xs text-muted-foreground">
                              {payment.remarks}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <div className={`font-medium text-lg ${
                            payment.paymentType === 'Collection' ? 'text-success' : 'text-primary'
                          }`}>
                            {payment.paymentType === 'Collection' ? '+' : '-'}₹{payment.paidAmount.toLocaleString()}
                          </div>
                          {payment.balanceAmount > 0 && (
                            <div className="text-sm text-warning">
                              Balance: ₹{payment.balanceAmount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getStatusBadge(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Print Receipt">
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit Payment">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete Payment">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
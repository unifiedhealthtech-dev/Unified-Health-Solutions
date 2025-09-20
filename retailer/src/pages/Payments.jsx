import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload, RefreshCw, Trash2, AlertTriangle, Package, Edit, Receipt, Download, CreditCard, DollarSign, Search, X, Check } from "lucide-react";

const Payments = () => {
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

  const [showEditPayment, setShowEditPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");

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

  const paymentSummary = {
    totalReceived: payments.reduce((sum, payment) => sum + payment.amountPaid, 0),
    totalPending: payments.reduce((sum, payment) => sum + (payment.billAmount - payment.amountPaid), 0),
    totalTransactions: payments.length,
    paidBills: payments.filter(p => p.status === "Paid").length,
  };

  const filteredPayments = payments.filter(payment =>
    payment.billNo.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
    payment.customerName.toLowerCase().includes(paymentSearchQuery.toLowerCase())
  );

  const handleAddPayment = () => {
    if (!newPayment.billNo || !newPayment.amountPaid || !newPayment.mode) {
      toast.error("Please fill in required fields");
      return;
    }

    const newPaymentEntry = {
      id: payments.length + 1,
      billNo: newPayment.billNo,
      customerName: "New Customer", // This would be fetched from bill data
      billAmount: parseFloat(newPayment.amountPaid) * 1.2, // Assuming 20% markup
      amountPaid: parseFloat(newPayment.amountPaid),
      mode: newPayment.mode,
      referenceNo: newPayment.referenceNo,
      paymentDate: newPayment.paymentDate,
      status: "Paid"
    };

    setPayments([...payments, newPaymentEntry]);
    setNewPayment({
      billNo: "",
      amountPaid: "",
      mode: "",
      referenceNo: "",
      paymentDate: new Date().toISOString().split('T')[0],
    });
    toast.success("Payment added successfully!");
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowEditPayment(true);
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      setPayments(payments.filter(p => p.id !== paymentId));
      toast.success("Payment deleted successfully!");
    }
  };

  const handleViewReceipt = (payment) => {
    toast.info(`Generating receipt for ${payment.billNo}`);
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold text-success">₹{paymentSummary.totalReceived.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
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
              <CreditCard className="w-8 h-8 text-destructive" />
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
              <Receipt className="w-8 h-8 text-primary" />
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
              <Receipt className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Add Payment Form */}
        <Card className="lg:col-span-1 shadow-medium">
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
            <Button className="w-full" onClick={handleAddPayment}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </Button>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card className="lg:col-span-3 shadow-medium">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input 
                  placeholder="Search payments..." 
                  className="pl-10"
                  value={paymentSearchQuery}
                  onChange={(e) => setPaymentSearchQuery(e.target.value)}
                />
              </div>
            </div>
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
                {filteredPayments.map((payment) => (
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
                        <Button size="sm" variant="outline" onClick={() => handleEditPayment(payment)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewReceipt(payment)}>
                          <Receipt className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePayment(payment.id)}>
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

      {/* Edit Payment Dialog */}
      <Dialog open={showEditPayment} onOpenChange={setShowEditPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Update payment information</DialogDescription>
          </DialogHeader>
          {editingPayment && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editBillNo">Bill No</Label>
                <Input
                  id="editBillNo"
                  value={editingPayment.billNo}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomerName">Customer Name</Label>
                <Input
                  id="editCustomerName"
                  value={editingPayment.customerName}
                  onChange={(e) => setEditingPayment({...editingPayment, customerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAmountPaid">Amount Paid</Label>
                <Input
                  id="editAmountPaid"
                  type="number"
                  value={editingPayment.amountPaid}
                  onChange={(e) => setEditingPayment({...editingPayment, amountPaid: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMode">Payment Mode</Label>
                <Select value={editingPayment.mode} onValueChange={(value) => setEditingPayment({...editingPayment, mode: value})}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label htmlFor="editReferenceNo">Reference No</Label>
                <Input
                  id="editReferenceNo"
                  value={editingPayment.referenceNo}
                  onChange={(e) => setEditingPayment({...editingPayment, referenceNo: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPaymentDate">Payment Date</Label>
                <Input
                  id="editPaymentDate"
                  type="date"
                  value={editingPayment.paymentDate}
                  onChange={(e) => setEditingPayment({...editingPayment, paymentDate: e.target.value})}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditPayment(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingPayment) {
                const updatedPayments = payments.map(p => 
                  p.id === editingPayment.id ? editingPayment : p
                );
                setPayments(updatedPayments);
                setShowEditPayment(false);
                toast.success("Payment updated successfully!");
              }
            }}>
              Update Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;

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
  Calendar,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Filter
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
import { Textarea } from '../components/ui/textarea';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 10; // Number of orders per page

  // Mock orders data
  const orders = [
    {
      orderNo: 'ORD-2024-001',
      orderDate: '2024-01-15',
      partyCode: 'PRT-001',
      partyName: 'Apollo Pharmacy - Banjara Hills',
      totalItems: 12,
      totalQty: 450,
      grossAmount: '₹45,678',
      discount: '₹2,280',
      netAmount: '₹43,398',
      status: 'Processing',
      dueDate: '2024-01-20',
      createdBy: 'Admin'
    },
    {
      orderNo: 'ORD-2024-002',
      orderDate: '2024-01-14',
      partyCode: 'PRT-002',
      partyName: 'MedPlus Health Services',
      totalItems: 8,
      totalQty: 320,
      grossAmount: '₹28,560',
      discount: '₹1,428',
      netAmount: '₹27,132',
      status: 'Completed',
      dueDate: '2024-01-19',
      createdBy: 'Sales Team'
    },
    {
      orderNo: 'ORD-2024-003',
      orderDate: '2024-01-13',
      partyCode: 'PRT-003',
      partyName: 'Guardian Pharmacy',
      totalItems: 15,
      totalQty: 600,
      grossAmount: '₹67,890',
      discount: '₹3,400',
      netAmount: '₹64,490',
      status: 'Pending',
      dueDate: '2024-01-18',
      createdBy: 'Admin'
    }
    // Add more orders as needed
  ];

  // Mock order items for new order form
  const [orderItems, setOrderItems] = useState([
    { productCode: '', productName: '', batch: '', expiry: '', qty: '', rate: '', discount: 0, taxPercent: 18, netValue: 0 }
  ]);

  const [orderForm, setOrderForm] = useState({
    orderNo: 'ORD-2024-004', // Auto-generated
    orderDate: new Date().toISOString().split('T')[0],
    partyCode: '',
    partyName: '',
    remarks: ''
  });

  // Filter orders according to search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.partyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination - slice the filtered orders for current page
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);

  const getStatusBadge = (status) => {
    const variants = {
      Processing: "default",
      Completed: "secondary", 
      Pending: "destructive",
      Cancelled: "outline"
    };
    return variants[status] || "secondary";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing': return Clock;
      case 'Completed': return CheckCircle;
      case 'Pending': return Clock;
      case 'Cancelled': return XCircle;
      default: return Clock;
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { 
      productCode: '', productName: '', batch: '', expiry: '', qty: '', rate: '', discount: 0, taxPercent: 18, netValue: 0 
    }]);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    console.log('Creating order:', orderForm, orderItems);
    setShowNewOrder(false);
  };

  const handlePageChange = (page) => {
    if(page >= 1 && page <= totalPages){
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Create and manage sales orders for your pharmaceutical distribution
          </p>
        </div>
        
        <Dialog open={showNewOrder} onOpenChange={setShowNewOrder}>
          <DialogTrigger asChild>
            <Button variant="medical" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                Enter order details and add products to create a new sales order
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="orderNo">Order No</Label>
                  <Input
                    id="orderNo"
                    value={orderForm.orderNo}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderForm.orderDate}
                    onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Party</Label>
                  <Select value={orderForm.partyCode} onValueChange={(value) => setOrderForm({ ...orderForm, partyCode: value })}>
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
              </div>

              {/* Product Items Table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Order Items</h3>
                  <Button type="button" variant="outline" onClick={addOrderItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

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
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              placeholder="PRD001"
                              value={item.productCode}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].productCode = e.target.value;
                                setOrderItems(newItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Product Name"
                              value={item.productName}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].productName = e.target.value;
                                setOrderItems(newItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Batch"
                              value={item.batch}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].batch = e.target.value;
                                setOrderItems(newItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={item.expiry}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].expiry = e.target.value;
                                setOrderItems(newItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.qty}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].qty = e.target.value;
                                setOrderItems(newItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={item.rate}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].rate = e.target.value;
                                setOrderItems(newItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.discount}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].discount = Number(e.target.value);
                                setOrderItems(newItems);
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.taxPercent}
                              onChange={(e) => {
                                const newItems = [...orderItems];
                                newItems[index].taxPercent = Number(e.target.value);
                                setOrderItems(newItems);
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
                              onClick={() => removeOrderItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  placeholder="Any special instructions or notes..."
                  value={orderForm.remarks}
                  onChange={(e) => setOrderForm({ ...orderForm, remarks: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowNewOrder(false)}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary">
                  Save Draft
                </Button>
                <Button type="submit" variant="medical">
                  Create Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number or party name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            Total {filteredOrders.length} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Party Information</TableHead>
                  <TableHead>Order Summary</TableHead>
                  <TableHead>Financial Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <TableRow key={order.orderNo}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{order.orderNo}</span>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {order.orderDate}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            By: {order.createdBy}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{order.partyName}</p>
                          <p className="text-sm text-muted-foreground">{order.partyCode}</p>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {order.dueDate}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{order.totalItems} items</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Qty: {order.totalQty}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><strong>Gross:</strong> {order.grossAmount}</div>
                          <div><strong>Discount:</strong> {order.discount}</div>
                          <div className="font-medium text-primary">
                            <strong>Net:</strong> {order.netAmount}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant={getStatusBadge(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="View Order">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit Order">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Print Order">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Cancel Order">
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

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-3 py-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border"
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : ''}`}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;

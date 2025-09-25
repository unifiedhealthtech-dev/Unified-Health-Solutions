import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Clock } from 'lucide-react';
import { 
  Plus, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Package,
  Calendar,
  ShoppingCart
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { toast } from 'sonner';
import {
  useGetDistributorOrdersQuery,
  useUpdateOrderStatusMutation
} from '../services/distributorOrdersApi';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState(''); // 'confirm' or 'reject'
  const [reason, setReason] = useState('');

  const PAGE_SIZE = 10;
  
  const { data: ordersData, isLoading, refetch } = useGetDistributorOrdersQuery({ 
    status: statusFilter, 
    page: currentPage, 
    limit: PAGE_SIZE 
  });
  
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  
  const orders = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination || {};
  console.log('Orders data:', ordersData);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter change
  }, [statusFilter]);

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.Retailer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus({
        orderId: selectedOrder.order_id,
        status: actionType === 'confirm' ? 'confirmed' : 'rejected',
        reason
      }).unwrap();
      
      toast.success(`Order ${actionType === 'confirm' ? 'confirmed' : 'rejected'} successfully!`);
      setShowActionDialog(false);
      setReason('');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update order status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: "warning",
      confirmed: "success",
      rejected: "destructive",
      processing: "default",
      shipped: "secondary",
      delivered: "outline"
    };
    return variants[status] || "secondary";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'rejected': return XCircle;
      case 'pending': return Clock;
      default: return Package;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
          <p className="text-muted-foreground">
            Manage retailer orders and update their status
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by order number or retailer name..."
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
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
          <CardDescription>
            Total {filteredOrders.length} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">Loading orders...</div>
          ) : (
            <>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Retailer</TableHead>
                      <TableHead>Order Summary</TableHead>
                      <TableHead>Financial Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => {
                      const StatusIcon = getStatusIcon(order.status);
                      return (
                        <TableRow key={order.order_id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{order.order_number}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.order_date).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{order.Retailer?.name}</p>
                              <p className="text-sm text-muted-foreground">{order.Retailer?.phone}</p>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{order.total_items} items</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Total Qty: {order.total_items}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <div className="font-medium text-primary">
                                Net: ₹{Number(order.total_amount).toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-4 h-4" />
                              <Badge variant={getStatusBadge(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setSelectedOrder(order)}
                                title="View Order"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {order.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setActionType('confirm');
                                      setShowActionDialog(true);
                                    }}
                                  >
                                    Confirm
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setActionType('reject');
                                      setShowActionDialog(true);
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(pagination.total_pages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.total_pages))}
                    disabled={currentPage === pagination.total_pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order #{selectedOrder.order_number} from {selectedOrder.Retailer?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Order Date</Label>
                  <div>{new Date(selectedOrder.order_date).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge variant={getStatusBadge(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Retailer</Label>
                  <div>{selectedOrder.Retailer?.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedOrder.Retailer?.phone}</div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <div>{selectedOrder.notes || "No notes"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item) => (
                      <TableRow key={item.item_id}>
                        <TableCell>
                          {item.Product?.generic_name || item.product_code}
                        </TableCell>
                        <TableCell>{item.batch_number}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{Number(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell>₹{Number(item.total_price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'confirm' ? 'Confirm Order' : 'Reject Order'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'confirm' 
                ? 'Are you sure you want to confirm this order?' 
                : 'Please provide a reason for rejection:'}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'reject' && (
            <div className="py-4 space-y-4">
              <Label htmlFor="rejectionReason">Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter rejection reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={actionType === 'confirm' ? "success" : "destructive"}
              onClick={handleStatusUpdate}
            >
              {actionType === 'confirm' ? 'Confirm Order' : 'Reject Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
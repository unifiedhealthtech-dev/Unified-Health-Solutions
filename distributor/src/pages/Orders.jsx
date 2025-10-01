import React, { useState, useEffect } from 'react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// Icons
import {
  CheckCircle,
  XCircle,
  Eye,
  Search,
  FileText,
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  User,
  Phone,
  MapPin,
  Edit,
  Trash2,
  RefreshCw,
} from 'lucide-react';

// Frontend utilities
import { toast } from 'sonner';

// API services
import {
  useGetDistributorOrdersQuery,
  useConfirmOrderMutation,
  useRejectOrderMutation,
  useExportOrdersMutation,
  useCreateManualOrderMutation,
  useUpdateManualOrderMutation,
  useDeleteManualOrderMutation,
} from '../services/distributorOrdersApi';

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderType, setOrderType] = useState('automatic');
  const [currentPage, setCurrentPage] = useState(1);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showManualOrderForm, setShowManualOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewOrderDialog, setViewOrderDialog] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusUpdateOrder, setStatusUpdateOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Manual order form state
  const [manualOrder, setManualOrder] = useState({
    retailer_name: '',
    retailer_phone: '',
    retailer_address: '',
    notes: '',
    items: []
  });

  const [currentProduct, setCurrentProduct] = useState({
    product_name: '',
    product_code: '',
    quantity: 1,
    unit_price: 0
  });

  const limit = 10;
  
  // API hooks
  const { data, isLoading, error, refetch } = useGetDistributorOrdersQuery({ 
    status: statusFilter, 
    page: currentPage, 
    limit,
    order_type: orderType
  });

  const [confirmOrder] = useConfirmOrderMutation();
  const [rejectOrder] = useRejectOrderMutation();
  const [exportOrders] = useExportOrdersMutation();
  const [createManualOrder] = useCreateManualOrderMutation();
  const [updateManualOrder] = useUpdateManualOrderMutation();
  const [deleteManualOrder] = useDeleteManualOrderMutation();

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination || {};
  const totalPages = pagination.total_pages || 1;

  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.Retailer?.name || order.retailer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.Retailer?.phone || order.retailer_phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = async (orderId) => {
    try {
      await confirmOrder(orderId).unwrap();
      toast.success('Order confirmed');
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to confirm order');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await rejectOrder({ orderId: rejectOrderId, reason: rejectionReason }).unwrap();
      toast.success('Order rejected');
      setRejectOrderId(null);
      setRejectionReason('');
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to reject order');
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportOrders({ status: statusFilter, order_type: orderType }).unwrap();
      
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${orderType}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Orders exported successfully');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to export orders');
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewOrderDialog(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setManualOrder({
      retailer_name: order.retailer_name || order.Retailer?.name || '',
      retailer_phone: order.retailer_phone || order.Retailer?.phone || '',
      retailer_address: order.retailer_address || order.Retailer?.address || '',
      notes: order.notes || '',
      items: order.items?.map(item => ({
        product_name: item.product_name,
        product_code: item.product_code,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price) || 0, // Ensure it's a number
        id: item.item_id || Date.now()
      })) || []
    });
    setShowManualOrderForm(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this manual order?')) {
      return;
    }

    try {
      await deleteManualOrder(orderId).unwrap();
      toast.success('Manual order deleted successfully');
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete manual order');
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await updateManualOrder({ 
        orderId: statusUpdateOrder.order_id,
        status: newStatus 
      }).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
      setStatusUpdateOrder(null);
      setNewStatus('');
      refetch();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to update order status');
    }
  };

  // Manual order functions
  const addProductToOrder = () => {
    if (!currentProduct.product_name || currentProduct.quantity <= 0) {
      toast.error('Please enter product name and valid quantity');
      return;
    }

    setManualOrder(prev => ({
      ...prev,
      items: [...prev.items, {
        ...currentProduct,
        unit_price: parseFloat(currentProduct.unit_price) || 0, // Ensure it's a number
        id: Date.now()
      }]
    }));

    setCurrentProduct({
      product_name: '',
      product_code: '',
      quantity: 1,
      unit_price: 0
    });
  };

  const removeProductFromOrder = (index) => {
    setManualOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleCreateManualOrder = async () => {
    if (!manualOrder.retailer_name.trim()) {
      toast.error('Please enter retailer name');
      return;
    }
    if (!manualOrder.retailer_phone.trim()) {
      toast.error('Please enter retailer phone number');
      return;
    }

    if (manualOrder.items.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    try {
      const payload = {
        retailer_info: {
          name: manualOrder.retailer_name,
          phone: manualOrder.retailer_phone,
          address: manualOrder.retailer_address
        },
        notes: manualOrder.notes,
        items: manualOrder.items.map(item => ({
          product_name: item.product_name,
          product_code: item.product_code,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price) || 0 // Ensure it's a number
        }))
      };

      if (editingOrder) {
        await updateManualOrder({ 
          orderId: editingOrder.order_id, 
          ...payload 
        }).unwrap();
        toast.success('Manual order updated successfully');
      } else {
        await createManualOrder(payload).unwrap();
        toast.success('Manual order created successfully');
      }
      
      resetManualOrderForm();
      setShowManualOrderForm(false);
      setEditingOrder(null);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || `Failed to ${editingOrder ? 'update' : 'create'} manual order`);
    }
  };

  const resetManualOrderForm = () => {
    setManualOrder({
      retailer_name: '',
      retailer_phone: '',
      retailer_address: '',
      notes: '',
      items: []
    });
    setCurrentProduct({
      product_name: '',
      product_code: '',
      quantity: 1,
      unit_price: 0
    });
    setEditingOrder(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { variant: 'secondary', label: 'Pending' },
      'processing': { variant: 'default', label: 'Processing' },
      'confirmed': { variant: 'success', label: 'Confirmed' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateOrderTotal = () => {
    return manualOrder.items.reduce((total, item) => {
      const unitPrice = parseFloat(item.unit_price) || 0;
      return total + (item.quantity * unitPrice);
    }, 0);
  };

  // Safe number formatting function
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `₹${num.toFixed(2)}`;
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive">Failed to load orders</h3>
              <p className="mt-2 text-muted-foreground">
                {error.data?.message || 'Server error occurred. Please check your backend.'}
              </p>
              <Button 
                onClick={refetch} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">Manage automatic and manual orders</p>
        </div>
        <Button onClick={() => setShowManualOrderForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Manual Order
        </Button>
      </div>

      {showManualOrderForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingOrder ? 'Edit Manual Order' : 'Create Manual Order'}</span>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowManualOrderForm(false);
                resetManualOrderForm();
              }}>
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <Label className="text-lg font-semibold">Retailer Information</Label>
              
              <div className="grid grid-cols-1 gap-4 mt-3 md:grid-cols-2">
                <div>
                  <Label htmlFor="retailerName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Retailer Name *
                  </Label>
                  <Input
                    placeholder="Enter retailer name"
                    value={manualOrder.retailer_name}
                    onChange={(e) => setManualOrder(prev => ({ ...prev, retailer_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="retailerPhone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    placeholder="Enter phone number"
                    value={manualOrder.retailer_phone}
                    onChange={(e) => setManualOrder(prev => ({ ...prev, retailer_phone: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="retailerAddress" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Input
                    placeholder="Enter retailer address"
                    value={manualOrder.retailer_address}
                    onChange={(e) => setManualOrder(prev => ({ ...prev, retailer_address: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                placeholder="Optional notes for this order"
                value={manualOrder.notes}
                onChange={(e) => setManualOrder(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="p-4 border rounded-lg">
              <Label className="text-lg font-semibold">Add Products</Label>
              
              <div className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    placeholder="Product name"
                    value={currentProduct.product_name}
                    onChange={(e) => setCurrentProduct(prev => ({ ...prev, product_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="productCode">Product Code</Label>
                  <Input
                    placeholder="Product code (optional)"
                    value={currentProduct.product_code}
                    onChange={(e) => setCurrentProduct(prev => ({ ...prev, product_code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={currentProduct.quantity}
                    onChange={(e) => setCurrentProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentProduct.unit_price}
                    onChange={(e) => setCurrentProduct(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-end md:col-span-4">
                  <Button onClick={addProductToOrder} className="w-full">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Product
                  </Button>
                </div>
              </div>

              {manualOrder.items.length > 0 && (
                <div className="mt-4">
                  <Label>Added Products</Label>
                  <div className="mt-2 border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="w-[80px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {manualOrder.items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product_name}</TableCell>
                            <TableCell>{item.product_code || '—'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                            <TableCell>{formatCurrency(item.quantity * (parseFloat(item.unit_price) || 0))}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProductFromOrder(index)}
                              >
                                <Minus className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 mt-4 rounded bg-muted">
                    <span className="font-semibold">Order Total:</span>
                    <span className="text-lg font-bold">{formatCurrency(calculateOrderTotal())}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowManualOrderForm(false);
                resetManualOrderForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateManualOrder}>
                {editingOrder ? 'Update Order' : 'Create Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rest of the component remains the same */}
      <Tabs value={orderType} onValueChange={setOrderType}>
        <TabsList>
          <TabsTrigger value="automatic">Automatic Orders</TabsTrigger>
          <TabsTrigger value="manual">Manual Orders</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="automatic">
          <OrdersTable
            orders={filteredOrders}
            pagination={pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            handleExport={handleExport}
            handleViewOrder={handleViewOrder}
            handleConfirm={handleConfirm}
            handleReject={handleReject}
            rejectOrderId={rejectOrderId}
            setRejectOrderId={setRejectOrderId}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            getStatusBadge={getStatusBadge}
            orderType="automatic"
          />
        </TabsContent>

        <TabsContent value="manual">
          <OrdersTable
            orders={filteredOrders}
            pagination={pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            handleExport={handleExport}
            handleViewOrder={handleViewOrder}
            handleEditOrder={handleEditOrder}
            handleDeleteOrder={handleDeleteOrder}
            getStatusBadge={getStatusBadge}
            orderType="manual"
            onStatusUpdate={(order) => {
              setStatusUpdateOrder(order);
              setNewStatus(order.status);
            }}
          />
        </TabsContent>

        <TabsContent value="all">
          <OrdersTable
            orders={filteredOrders}
            pagination={pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            handleExport={handleExport}
            handleViewOrder={handleViewOrder}
            handleConfirm={handleConfirm}
            handleReject={handleReject}
            handleEditOrder={handleEditOrder}
            handleDeleteOrder={handleDeleteOrder}
            getStatusBadge={getStatusBadge}
            orderType="all"
            onStatusUpdate={(order) => {
              if (order.is_manual) {
                setStatusUpdateOrder(order);
                setNewStatus(order.status);
              }
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!statusUpdateOrder} onOpenChange={(open) => !open && setStatusUpdateOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Select New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {statusUpdateOrder && (
              <p className="mt-2 text-sm text-muted-foreground">
                Order: {statusUpdateOrder.order_number} | Current Status: {getStatusBadge(statusUpdateOrder.status)}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateOrder(null)}>Cancel</Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOrderDialog} onOpenChange={setViewOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg md:grid-cols-3">
                <div>
                  <h4 className="font-semibold">Order Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><strong>Order Number:</strong> {selectedOrder.order_number}</div>
                    <div><strong>Invoice Number:</strong> {selectedOrder.invoice_number || 'N/A'}</div>
                    <div><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</div>
                    <div><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                    <div><strong>Type:</strong> {selectedOrder.is_manual ? 'Manual' : 'Automatic'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold">Retailer Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><strong>Name:</strong> {selectedOrder.is_manual ? selectedOrder.retailer_name : selectedOrder.Retailer?.name || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedOrder.is_manual ? selectedOrder.retailer_phone : selectedOrder.Retailer?.phone || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedOrder.is_manual ? selectedOrder.retailer_email : selectedOrder.Retailer?.email || 'N/A'}</div>
                    <div><strong>Address:</strong> {selectedOrder.is_manual ? selectedOrder.retailer_address : selectedOrder.Retailer?.address || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold">Financial Summary</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div><strong>Total Amount:</strong> {formatCurrency(selectedOrder.total_amount)}</div>
                    <div><strong>Total Items:</strong> {selectedOrder.total_items}</div>
                    <div><strong>Total Products:</strong> {selectedOrder.items?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-semibold">Order Items</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead>Batch Number</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items?.map((item, index) => (
                        <TableRow key={item.item_id || index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product_name || item.Product?.generic_name}</div>
                              {item.Product?.unit_size && (
                                <div className="text-sm text-muted-foreground">
                                  Size: {item.Product.unit_size}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.product_code || 'N/A'}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell>{formatCurrency(item.total_price || (item.quantity * (parseFloat(item.unit_price) || 0)))}</TableCell>
                          <TableCell>{item.batch_number || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// OrdersTable component remains the same as before
const OrdersTable = ({
  orders,
  pagination,
  currentPage,
  setCurrentPage,
  totalPages,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  handleExport,
  handleViewOrder,
  handleConfirm,
  handleReject,
  rejectOrderId,
  setRejectOrderId,
  rejectionReason,
  setRejectionReason,
  handleEditOrder,
  handleDeleteOrder,
  getStatusBadge,
  orderType,
  onStatusUpdate
}) => {
  const getOrderTypeLabel = () => {
    switch (orderType) {
      case 'automatic': return 'Automatic Orders from Retailers';
      case 'manual': return 'Manual Orders';
      case 'all': return 'All Orders';
      default: return 'Orders';
    }
  };

  const getOrderTypeDescription = () => {
    switch (orderType) {
      case 'automatic': return 'Orders automatically received from registered retailers';
      case 'manual': return 'Orders manually created by distributors';
      case 'all': return 'All automatic and manual orders';
      default: return '';
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `₹${num.toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getOrderTypeLabel()}</CardTitle>
        <CardDescription>{getOrderTypeDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4 md:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search by order number or retailer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-[180px] px-3 py-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Details</TableHead>
                <TableHead>Retailer</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Financials</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No {orderType !== 'all' ? orderType : ''} orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{order.order_number}</span>
                          {order.is_manual && (
                            <Badge variant="outline" className="text-xs">Manual</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">
                          {order.is_manual ? order.retailer_name : order.Retailer?.name || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.is_manual ? order.retailer_phone : order.Retailer?.phone || 'N/A'}
                        </p>
                        {order.is_manual && order.retailer_address && (
                          <p className="text-xs text-muted-foreground">
                            {order.retailer_address}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div><strong>Items:</strong> {order.items?.length || 0}</div>
                        <div><strong>Total Qty:</strong> {order.total_items}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="font-medium text-primary">
                          <strong>Net:</strong> {formatCurrency(order.total_amount)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(order.status)}
                        {order.is_manual && onStatusUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => onStatusUpdate(order)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Change
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>

                        {!order.is_manual && order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleConfirm(order.order_id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Dialog open={rejectOrderId === order.order_id} onOpenChange={(open) => !open && setRejectOrderId(null)}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Order</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <Label>Reason for rejection</Label>
                                  <Textarea
                                    placeholder="e.g., Out of stock, pricing issue..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setRejectOrderId(null)}>Cancel</Button>
                                  <Button variant="destructive" onClick={handleReject}>Reject</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}

                        {order.is_manual && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteOrder(order.order_id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Orders;
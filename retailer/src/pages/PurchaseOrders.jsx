import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Download,
  AlertTriangle,
  ShoppingCart,
  Save,
  X,
  Gift,
  Package,
  RefreshCw,
  CheckCircle,
  Eye,
  Printer,
} from "lucide-react";
// Import RTK Query hooks
import {
  useGetConnectedDistributorsQuery,
  useSearchMedicinesQuery,
  useGetDistributorStockQuery,
  useCreateOrderMutation,
  useGetRetailerOrdersQuery,
  useGetOrderDetailsQuery,
  useCancelOrderMutation,
  useGetOrderStatisticsQuery,
  useGetDCItemsQuery,
  useCreateDCItemMutation,
  useDeleteDCItemMutation,
} from "../services/retailerOrdersApi";

const PurchaseOrders = () => {
  const dispatch = useDispatch();
  // Form states
  const [orderBy, setOrderBy] = useState("product");
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showShortageDialog, setShowShortageDialog] = useState(false);
  const [showDCDialog, setShowDCDialog] = useState(false);
  const [showSchemeDialog, setShowSchemeDialog] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");

  const {
    data: dcItemsData,
    isLoading: isDCItemsLoading,
    refetch: refetchDCItems
  } = useGetDCItemsQuery();
  const [createDCItem] = useCreateDCItemMutation();
  const [deleteDCItem] = useDeleteDCItemMutation();

  // States for API data
  const [orderItems, setOrderItems] = useState([]);
  const dcItems = dcItemsData?.data || [];

  // Fetch connected distributors
  const { data: distributorsData, error: distributorsError, isLoading: isDistributorsLoading } = useGetConnectedDistributorsQuery();
  const distributors = distributorsData?.data || [];

  // Fetch distributor stock for browsing/searching
  const [stockParams, setStockParams] = useState({ distributorId: 'all', search: '', page: 1, limit: 20 });
  const { data: stockData, error: stockError, isLoading: isStockLoading } = useGetDistributorStockQuery(stockParams);

  // For searching medicines as you type (debounced)
  const { data: searchData, error: searchError, isLoading: isSearchLoading } = useSearchMedicinesQuery(
    { search: searchQuery, distributorId: selectedDistributor || '' },
    { skip: !searchQuery }
  );

  // Fetch retailer's past orders
  const { data: ordersData, error: ordersError, isLoading: isOrdersLoading, refetch: refetchOrders } = useGetRetailerOrdersQuery({ status: 'all', page: 1, limit: 100 });
  const allOrders = ordersData?.data?.orders || [];
  // Mutation for creating an order
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  const filteredProducts = searchData?.data || [];
  const filteredInvoices = allOrders.filter(order =>
    order.order_number.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
    order.Distributor?.name.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
  );

  // ✅ Updated: Validate stock usage per stock_id
  const addProductToOrder = (product, quantity = 1) => {
    const stockId = product.stock_id;
    const availableStock = product.batch_info.current_stock;

    if (availableStock <= 0) {
      toast.error(`${product.product.name} is out of stock.`);
      return;
    }

    const alreadyAdded = orderItems
      .filter(item => item.stock_id === stockId)
      .reduce((sum, item) => sum + item.qty, 0);

    const remaining = availableStock - alreadyAdded;

    if (quantity <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (quantity > remaining) {
      toast.error(`Only ${remaining} unit(s) available for ${product.product.name}.`);
      return;
    }

    const newItem = {
      productCode: product.product.code,
      name: product.product.name,
      batch: product.batch_info.batch_number,
      qty: quantity,
      rate: product.batch_info.ptr,
      mrp: product.product.mrp,
      tax: product.batch_info.tax_rate || 12,
      scheme: { free: 0, total: quantity },
      netValue: Math.round(quantity * product.batch_info.ptr * (1 + (product.batch_info.tax_rate || 12) / 100)),
      stock_id: product.stock_id,
      distributor_id: product.distributor.id,
    };
    setOrderItems(prev => [...prev, newItem]);
    toast.success(`${product.product.name} (${quantity} qty) added to order`);
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate' || field === 'tax') {
          updatedItem.netValue = Math.round(updatedItem.qty * updatedItem.rate * (1 + updatedItem.tax / 100));
          updatedItem.scheme = { ...updatedItem.scheme, total: updatedItem.qty + updatedItem.scheme.free };
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleScheme = (index, freeQty) => {
    setOrderItems(prev => prev.map((item, i) =>
      i === index
        ? {
          ...item,
          scheme: { free: freeQty, total: item.qty + freeQty },
          netValue: Math.round(item.qty * item.rate * (1 + item.tax / 100))
        }
        : item
    ));
    toast.success("Scheme applied successfully");
  };

  const handleDeleteItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
    toast.success("Item removed from order");
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Please add items to the order");
      return;
    }
    if (orderBy === "distributor" && !selectedDistributor) {
      toast.error("Please select a distributor");
      return;
    }
    const orderPayload = {
      distributorId: orderItems[0].distributor_id,
      items: orderItems.map(item => ({
        stock_id: item.stock_id,
        quantity: item.qty,
      })),
      notes: "Order sent",
    };
    setIsSubmitting(true);
    try {
      const result = await createOrder(orderPayload).unwrap();
      toast.success(`Order submitted successfully! Order ID: ${result.data.order.order_number}`);
      setOrderItems([]);
      setSelectedDistributor("");
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error(error.data?.message || "Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("No items to print");
      return;
    }
    setIsPrinting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    setIsPrinting(false);
    toast.success("Order printed successfully!");
  };

  const handleExportOrder = () => {
    if (orderItems.length === 0) {
      toast.error("No items to export");
      return;
    }
    const orderData = {
      invoiceNo: `PO-${Date.now()}`,
      distributor: selectedDistributor,
      orderBy,
      items: orderItems,
      totalValue: orderItems.reduce((sum, item) => sum + item.netValue, 0),
      exportedAt: new Date().toISOString()
    };
    const content = JSON.stringify(orderData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_order_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Order exported successfully!");
  };

  const handleClearOrder = () => {
    if (orderItems.length === 0) {
      toast.info("Order is already empty");
      return;
    }
    if (window.confirm("Are you sure you want to clear all items from the order?")) {
      setOrderItems([]);
      toast.success("Order cleared successfully");
    }
  };

  const handleViewOrderSummary = () => {
    if (orderItems.length === 0) {
      toast.error("No items in order to view");
      return;
    }
    const totalValue = orderItems.reduce((sum, item) => sum + item.netValue, 0);
    const totalItems = orderItems.reduce((sum, item) => sum + item.qty, 0);
    const totalFreeItems = orderItems.reduce((sum, item) => sum + item.scheme.free, 0);
    const summary = `
Order Summary:
==============
Invoice No: ${`PO-${Date.now()}`}
Distributor: ${selectedDistributor || 'Not Selected'}
Order By: ${orderBy}
Items Summary:
- Total Products: ${orderItems.length}
- Total Quantity: ${totalItems}
- Free Items: ${totalFreeItems}
- Total Value: ₹${totalValue.toLocaleString()}
Items:
${orderItems.map((item, index) =>
      `${index + 1}. ${item.name} (${item.productCode}) - Qty: ${item.qty}${item.scheme.free > 0 ? ` + ${item.scheme.free} free` : ''} - ₹${item.netValue}`
    ).join('')}
    `;
    alert(summary);
  };

  const generatePrintContent = () => {
    const totalValue = orderItems.reduce((sum, item) => sum + item.netValue, 0);
    const totalItems = orderItems.reduce((sum, item) => sum + item.qty, 0);
    return `
      <html>
        <head>
          <title>Purchase Order</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 10px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PURCHASE ORDER</h1>
            <h2>Invoice No: ${`PO-${Date.now()}`}</h2>
          </div>
          <div class="info">
            <p><strong>Distributor:</strong> ${selectedDistributor || 'Not Selected'}</p>
            <p><strong>Order By:</strong> ${orderBy}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Name</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>MRP</th>
                <th>Tax %</th>
                <th>Scheme</th>
                <th>Net Value</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.productCode}</td>
                  <td>${item.name}</td>
                  <td>${item.batch}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.rate.toFixed(2)}</td>
                  <td>₹${item.mrp.toFixed(2)}</td>
                  <td>${item.tax}%</td>
                  <td>${item.scheme.free > 0 ? `${item.scheme.free} Free` : 'None'}</td>
                  <td>₹${item.netValue.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total Items: ${totalItems}</p>
            <p>Total Value: ₹${totalValue.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;
  };

  useEffect(() => {
    if (distributorsError) toast.error("Failed to load distributors.");
    if (stockError) toast.error("Failed to load stock.");
    if (searchError) toast.error("Failed to search medicines.");
    if (ordersError) toast.error("Failed to load your orders.");
  }, [distributorsError, stockError, searchError, ordersError]);

  return (
    <div className="space-y-6">
      {/* Order Details Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="orderBy">Order By</Label>
              <Select value={orderBy} onValueChange={setOrderBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">By Product</SelectItem>
                  <SelectItem value="distributor">By Distributor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {orderBy === "distributor" && (
              <div>
                <Label htmlFor="distributor">Distributor</Label>
                <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select distributor" />
                  </SelectTrigger>
                  <SelectContent>
                    {distributors.map((dist) => (
                      <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search products, distributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" disabled={isSearchLoading}>
              {isSearchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>
          {/* Search Results */}
          {searchQuery && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-2 overflow-y-auto max-h-48">
                  {filteredProducts.map((product, index) => {
                    const stock = product.batch_info?.current_stock || 0;
                    const isOutOfStock = stock <= 0;

                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                          isOutOfStock ? 'bg-red-50 border border-red-200' : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className={`font-medium ${isOutOfStock ? 'text-red-600' : ''}`}>
                              {product.product.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Product Code: {product.product.code}
                            </span>
                            <span className="text-xs text-muted-foreground">MRP: ₹{product.product.mrp}</span>
                            <span className="text-xs text-muted-foreground">PTR: ₹{product.batch_info.ptr}</span>
                            <span className={`text-xs font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                              Stock: {stock}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {product.distributor.name}
                          </p>
                          {/* {isOutOfStock && (
                            <p className="mt-1 text-xs font-medium text-red-600">❌ Out of Stock – Cannot add to order</p>
                          )} */}
                        </div>

                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Qty"
                            className="w-20"
                            min="1"
                            max={stock > 0 ? stock : 0}
                            defaultValue={stock > 0 ? "1" : "0"}
                            disabled={isOutOfStock}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const qty = parseInt(e.target.value) || 0;
                                addProductToOrder(product, qty);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            disabled={isOutOfStock}
                            onClick={() => {
                              const qtyInput = document.querySelectorAll(`input[placeholder="Qty"]`)[index];
                              const qty = parseInt(qtyInput?.value) || 0;
                              addProductToOrder(product, qty);
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Order Items</TabsTrigger>
          <TabsTrigger value="dc">D/C Items ({dcItems.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({allOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="order">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products in current order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>MRP</TableHead>
                    <TableHead>Tax %</TableHead>
                    <TableHead>Scheme</TableHead>
                    <TableHead>Net Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productCode}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.batch}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateOrderItem(index, 'qty', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>₹{item.rate.toFixed(2)}</TableCell>
                      <TableCell>₹{item.mrp.toFixed(2)}</TableCell>
                      <TableCell>{item.tax}%</TableCell>
                      <TableCell>
                        {item.scheme.free > 0 ? `${item.scheme.free} Free` : 'None'}
                      </TableCell>
                      <TableCell>₹{item.netValue}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteItem(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Total Items: {orderItems.length} | Total Value: ₹{orderItems.reduce((sum, item) => sum + item.netValue, 0).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleViewOrderSummary}><Eye className="w-4 h-4 mr-2" /> Summary</Button>
                  <Button variant="outline" onClick={handleClearOrder}><X className="w-4 h-4 mr-2" /> Clear</Button>
                  <Button variant="outline" onClick={handleExportOrder}><Download className="w-4 h-4 mr-2" /> Export</Button>
                  <Button onClick={handleSubmitOrder} disabled={isSubmitting || isCreatingOrder}>
                    {isSubmitting || isCreatingOrder ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                    {isSubmitting || isCreatingOrder ? 'Submitting...' : 'Submit Order'}
                  </Button>
                  <Button variant="outline" onClick={handlePrintOrder} disabled={isPrinting}>
                    {isPrinting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                    {isPrinting ? 'Printing...' : 'Print'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* D/C Tab — unchanged from your latest version */}
        <TabsContent value="dc">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>D/C Items</CardTitle>
                  <CardDescription>Add stock without distributor bill</CardDescription>
                </div>
                <Dialog open={showDCDialog} onOpenChange={setShowDCDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Package className="w-4 h-4 mr-2" />
                      Add D/C Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add D/C Item</DialogTitle>
                      <DialogDescription>Enter product and distributor details</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label>Product Code *</Label>
                          <Input id="dcProductCode" />
                        </div>
                        <div>
                          <Label>Product Name *</Label>
                          <Input id="dcProductName" />
                        </div>
                        <div>
                          <Label>Batch Number</Label>
                          <Input id="dcBatch" />
                        </div>
                        <div>
                          <Label>Distributor Name *</Label>
                          <Input id="dcDistributor" />
                        </div>
                        <div>
                          <Label>Quantity *</Label>
                          <Input type="number" min="1" id="dcQty" defaultValue="1" />
                        </div>
                        <div>
                          <Label>Rate (PTR) *</Label>
                          <Input type="number" step="0.01" id="dcRate" />
                        </div>
                        <div>
                          <Label>MRP *</Label>
                          <Input type="number" step="0.01" id="dcMrp" />
                        </div>
                        <div>
                          <Label>Tax (%)</Label>
                          <Input type="number" id="dcTax" defaultValue="12" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setShowDCDialog(false)}>Cancel</Button>
                        <Button onClick={async () => {
                          const productCode = document.getElementById('dcProductCode')?.value.trim();
                          const productName = document.getElementById('dcProductName')?.value.trim();
                          const batch = document.getElementById('dcBatch')?.value.trim() || 'MANUAL';
                          const distributor = document.getElementById('dcDistributor')?.value.trim();
                          const qty = parseInt(document.getElementById('dcQty')?.value) || 1;
                          const rate = parseFloat(document.getElementById('dcRate')?.value) || 0;
                          const mrp = parseFloat(document.getElementById('dcMrp')?.value) || 0;
                          const tax = parseFloat(document.getElementById('dcTax')?.value) || 12;
                          if (!productCode || !productName || !distributor || rate <= 0 || mrp <= 0) {
                            toast.error("Please fill all required fields correctly.");
                            return;
                          }
                          try {
                            await createDCItem({
                              product_code: productCode,
                              product_name: productName,
                              batch_number: batch,
                              quantity: qty,
                              rate,
                              mrp,
                              tax_rate: tax,
                              distributor_name: distributor
                            }).unwrap();
                            toast.success("D/C item added successfully!");
                            setShowDCDialog(false);
                            refetchDCItems();
                          } catch (err) {
                            toast.error(err.data?.message || "Failed to add D/C item");
                          }
                        }}>
                          <Plus className="w-4 h-4 mr-2" /> Add Item
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isDCItemsLoading ? (
                <div className="py-4 text-center">Loading D/C items...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Distributor</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dcItems.map((item) => (
                      <TableRow key={item.dc_item_id}>
                        <TableCell className="font-medium">{item.product_code}</TableCell>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.batch_number}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{Number(item.rate).toFixed(2)}</TableCell>
                        <TableCell>₹{Number(item.mrp).toFixed(2)}</TableCell>
                        <TableCell>{item.distributor_name}</TableCell>
                        <TableCell>{item.added_date}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (window.confirm("Delete this D/C item?")) {
                                try {
                                  await deleteDCItem(item.dc_item_id).unwrap();
                                  toast.success("D/C item deleted");
                                  refetchDCItems();
                                } catch (err) {
                                  toast.error("Failed to delete");
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {dcItems.length === 0 && !isDCItemsLoading && (
                <div className="py-8 text-center text-muted-foreground">No D/C items added yet.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab — unchanged */}
        <TabsContent value="invoices">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>All purchase invoices with search functionality</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by invoice number or distributor..."
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" disabled={isOrdersLoading}>
                  {isOrdersLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Distributor</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{order.Distributor?.name}</TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>₹{Number(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "delivered" ? "success" : order.status === "cancelled" ? "destructive" : "warning"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => alert(`Details for ${order.order_number}`)}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const printContent = `<h1>Invoice ${order.order_number}</h1>`;
                            const w = window.open(); w.document.write(printContent); w.print();
                            toast.success("Invoice printed!");
                          }}>
                            <Printer className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredInvoices.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  {invoiceSearchQuery ? "No invoices found." : "No invoices available."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PurchaseOrders;
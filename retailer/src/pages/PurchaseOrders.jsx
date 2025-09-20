import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, FileText, Download, AlertTriangle, ShoppingCart, Save, X, Gift, Package, RefreshCw, CheckCircle, Eye, Printer } from "lucide-react";

const PurchaseOrders = () => {
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

  // Mock data
  const shortageItems = [
    {
      productCode: "MED002",
      name: "Amoxicillin 250mg",
      currentStock: 25,
      minStock: 50,
      shortageQty: 25,
      suggestedQty: 100,
      ptr: 106.68,
      mrp: 125.50,
      distributor: "PharmaCare Ltd",
      priority: "High"
    },
    {
      productCode: "MED004",
      name: "Ibuprofen 400mg",
      currentStock: 15,
      minStock: 40,
      shortageQty: 25,
      suggestedQty: 80,
      ptr: 45.50,
      mrp: 52.00,
      distributor: "MedCorp Distributors",
      priority: "Medium"
    }
  ];

  const availableProducts = [
    { code: "MED001", name: "Paracetamol 500mg", mrp: 28.50, ptr: 25.50, distributor: "MedCorp Distributors" },
    { code: "MED002", name: "Amoxicillin 250mg", mrp: 125.50, ptr: 106.68, distributor: "PharmaCare Ltd" },
    { code: "MED003", name: "Crocin 650mg", mrp: 35.00, ptr: 30.50, distributor: "Healthcare Partners" },
    { code: "MED004", name: "Ibuprofen 400mg", mrp: 52.00, ptr: 45.50, distributor: "MedCorp Distributors" }
  ];

  const distributors = [
    "MedCorp Distributors",
    "PharmaCare Ltd", 
    "MediSupply Co",
    "Healthcare Partners"
  ];

  // Mock order items
  const [orderItems, setOrderItems] = useState([
    {
      productCode: "MED001",
      name: "Paracetamol 500mg",
      batch: "PCM240115",
      qty: 100,
      rate: 25.50,
      mrp: 28.50,
      tax: 12,
      scheme: { free: 0, total: 100 },
      netValue: 2856,
    }
  ]);

  // Mock D/C items
  const [dcItems, setDcItems] = useState([
    {
      productCode: "MED005",
      name: "Aspirin 75mg",
      batch: "ASP240120",
      qty: 50,
      rate: 15.00,
      mrp: 18.50,
      tax: 12,
      addedDate: "2024-01-20",
      status: "Pending Bill"
    }
  ]);

  // Mock invoice data
  const mockInvoices = [
    {
      invoiceNo: "INV-1001",
      date: "2024-01-15",
      distributor: "MedCorp Distributors",
      items: [
        { name: "Paracetamol 500mg", qty: 100, rate: 25.50, mrp: 28.50 },
        { name: "Ibuprofen 400mg", qty: 50, rate: 45.50, mrp: 52.00 }
      ],
      totalAmount: 5125,
      status: "Paid"
    },
    {
      invoiceNo: "INV-1002",
      date: "2024-01-16",
      distributor: "PharmaCare Ltd",
      items: [
        { name: "Amoxicillin 250mg", qty: 80, rate: 106.68, mrp: 125.50 },
        { name: "Crocin 650mg", qty: 30, rate: 30.50, mrp: 35.00 }
      ],
      totalAmount: 9454.4,
      status: "Pending"
    },
    {
      invoiceNo: "INV-1003",
      date: "2024-02-01",
      distributor: "Healthcare Partners",
      items: [
        { name: "Crocin 650mg", qty: 120, rate: 30.50, mrp: 35.00 }
      ],
      totalAmount: 4098,
      status: "Paid"
    }
  ];

  // Filtered products based on search
  const filteredProducts = availableProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.distributor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered invoices based on search
  const filteredInvoices = mockInvoices.filter(invoice => 
    invoice.invoiceNo.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
    invoice.distributor.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
  );

  // Add product to order
  const addProductToOrder = (product, quantity = 1) => {
    const newItem = {
      productCode: product.code,
      name: product.name,
      batch: "TBD",
      qty: quantity,
      rate: product.ptr,
      mrp: product.mrp,
      tax: 12,
      scheme: { free: 0, total: quantity },
      netValue: Math.round(quantity * product.ptr * 1.12),
    };
    setOrderItems(prev => [...prev, newItem]);
    toast.success(`${product.name} (${quantity} qty) added to order`);
  };

  // Update order item
  const updateOrderItem = (index, field, value) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate' || field === 'tax') {
          updatedItem.netValue = Math.round(updatedItem.qty * updatedItem.rate * (1 + updatedItem.tax/100));
          updatedItem.scheme = { ...updatedItem.scheme, total: updatedItem.qty + updatedItem.scheme.free };
        }
        return updatedItem;
      }
      return item;
    }));
  };

  // Add shortage item
  const addShortageItemToOrder = (item) => {
    const newItem = {
      productCode: item.productCode,
      name: item.name,
      batch: "TBD",
      qty: item.suggestedQty,
      rate: item.ptr,
      mrp: item.mrp,
      tax: 12,
      scheme: { free: 0, total: item.suggestedQty },
      netValue: Math.round(item.suggestedQty * item.ptr * 1.12),
    };
    setOrderItems(prev => [...prev, newItem]);
    toast.success(`${item.name} added to order`);
  };

  // Handle scheme
  const handleScheme = (index, freeQty) => {
    setOrderItems(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            scheme: { free: freeQty, total: item.qty + freeQty },
            netValue: Math.round(item.qty * item.rate * (1 + item.tax/100))
          }
        : item
    ));
    toast.success("Scheme applied successfully");
  };

  // Add to DC
  const addToDC = (product, qty) => {
    const newDCItem = {
      productCode: product.code,
      name: product.name,
      batch: "Manual",
      qty: qty,
      rate: product.ptr,
      mrp: product.mrp,
      tax: 12,
      addedDate: new Date().toISOString().split('T')[0],
      status: "Pending Bill"
    };
    setDcItems(prev => [...prev, newDCItem]);
    toast.success(`${product.name} added to D/C - Manual Entry`);
  };

  // Delete order item
  const handleDeleteItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
    toast.success("Item removed from order");
  };

  // Delete DC item
  const handleDeleteDCItem = (index) => {
    setDcItems(prev => prev.filter((_, i) => i !== index));
    toast.success("D/C item removed");
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Please add items to the order");
      return;
    }

    if (!selectedDistributor && orderBy === "distributor") {
      toast.error("Please select a distributor");
      return;
    }

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderData = {
      invoiceNo: `PO-${Date.now()}`,
      distributor: selectedDistributor,
      orderBy,
      items: orderItems,
      totalValue: orderItems.reduce((sum, item) => sum + item.netValue, 0),
      submittedAt: new Date().toISOString()
    };

    setIsSubmitting(false);
    toast.success(`Order submitted successfully! Order ID: ${orderData.invoiceNo}`);
    
    setOrderItems([]);
    setSelectedDistributor("");
  };

  // Print order
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

  // Export order
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

  // Clear order
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

  // View summary
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
).join('\n')}
    `;

    alert(summary);
  };

  // Generate print content
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

            {/* Only show distributor dropdown when ordering by distributor */}
            {orderBy === "distributor" && (
              <div>
                <Label htmlFor="distributor">Distributor</Label>
                <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select distributor" />
                  </SelectTrigger>
                  <SelectContent>
                    {distributors.map((dist) => (
                      <SelectItem key={dist} value={dist}>{dist}</SelectItem>
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
            <Button 
              variant="outline"
              disabled={isSearching}
            >
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-2 overflow-y-auto max-h-48">
                  {filteredProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                      <div className="flex-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">({product.code})</span>
                        <p className="text-xs text-muted-foreground">{product.distributor} • MRP: ₹{product.mrp} • PTR: ₹{product.ptr}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="w-20"
                          min="1"
                          defaultValue="1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const qty = parseInt(e.target.value) || 1;
                              addProductToOrder(product, qty);
                            }
                          }}
                        />
                        <Button size="sm" onClick={() => {
                          const input = document.querySelector(`input[placeholder="Qty"]`);
                          const qty = parseInt(input.value) || 1;
                          addProductToOrder(product, qty);
                        }}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Order Items, D/C and Invoices */}
      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Order Items</TabsTrigger>
          <TabsTrigger value="dc">D/C Items ({dcItems.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
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
                      <TableCell>
                        <Input
                          value={item.productCode}
                          onChange={(e) => updateOrderItem(index, 'productCode', e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.name}
                          onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.batch}
                          onChange={(e) => updateOrderItem(index, 'batch', e.target.value)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateOrderItem(index, 'qty', parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateOrderItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.mrp}
                          onChange={(e) => updateOrderItem(index, 'mrp', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.tax}
                          onChange={(e) => updateOrderItem(index, 'tax', parseInt(e.target.value) || 0)}
                          className="w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Gift className="w-3 h-3 mr-1" />
                              {item.scheme.free > 0 ? `${item.scheme.free} Free` : 'Scheme'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Scheme</DialogTitle>
                              <DialogDescription>Add free quantity for {item.name}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Free Quantity</Label>
                                <Input
                                  type="number"
                                  placeholder="Enter free quantity"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const freeQty = parseInt(e.target.value) || 0;
                                      handleScheme(index, freeQty);
                                    }
                                  }}
                                />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Current: {item.qty} + {item.scheme.free} free = {item.scheme.total} total
                              </p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>₹{item.netValue}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const item = orderItems[index];
                              const newQty = prompt(`Enter new quantity for ${item.name}:`, item.qty);
                              if (newQty && !isNaN(newQty) && parseInt(newQty) > 0) {
                                updateOrderItem(index, 'qty', parseInt(newQty));
                                toast.success(`Quantity updated to ${newQty}`);
                              }
                            }}
                            title="Edit Quantity"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteItem(index)}
                            title="Remove Item"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
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
                  <Button 
                    variant="outline"
                    onClick={handleViewOrderSummary}
                    title="View Order Summary"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Summary
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleClearOrder}
                    title="Clear All Items"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleExportOrder}
                    title="Export Order Data"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    {isSubmitting ? 'Submitting...' : 'Submit Order'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handlePrintOrder}
                    disabled={isPrinting}
                  >
                    {isPrinting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Printer className="w-4 h-4 mr-2" />
                    )}
                    {isPrinting ? 'Printing...' : 'Print'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dc">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>D/C Items (Manual Entry)</CardTitle>
                  <CardDescription>Manually added stock without distributor bill</CardDescription>
                </div>
                <Dialog open={showDCDialog} onOpenChange={setShowDCDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Package className="w-4 h-4 mr-2" />
                      Add D/C Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add D/C Item</DialogTitle>
                      <DialogDescription>Manually add stock without distributor bill</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 overflow-y-auto max-h-96">
                      {availableProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">{product.code} • {product.distributor}</p>
                            <p className="text-xs text-muted-foreground">MRP: ₹{product.mrp} • PTR: ₹{product.ptr}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Qty"
                              className="w-20"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const qty = parseInt(e.target.value) || 1;
                                  addToDC(product, qty);
                                  setShowDCDialog(false);
                                }
                              }}
                            />
                            <Button size="sm" onClick={() => {
                              addToDC(product, 1);
                              setShowDCDialog(false);
                            }}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
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
                    <TableHead>Added Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dcItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productCode}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.batch}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>₹{item.rate}</TableCell>
                      <TableCell>₹{item.mrp}</TableCell>
                      <TableCell>{item.addedDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const item = dcItems[index];
                              const newStatus = prompt(`Update status for ${item.name}:`, item.status);
                              if (newStatus) {
                                setDcItems(prev => prev.map((dcItem, i) => 
                                  i === index ? { ...dcItem, status: newStatus } : dcItem
                                ));
                                toast.success(`Status updated to "${newStatus}"`);
                              }
                            }}
                            title="Update Status"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteDCItem(index)}
                            title="Remove D/C Item"
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
        </TabsContent>

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
              {/* Invoice Search Bar */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by invoice number or distributor..."
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Invoices Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Distributor</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.distributor}</TableCell>
                      <TableCell>{invoice.items.length}</TableCell>
                      <TableCell>₹{invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === "Paid" ? "success" : "warning"}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Show invoice details in alert or modal
                              const details = `
Invoice Details:
===============
Invoice No: ${invoice.invoiceNo}
Date: ${invoice.date}
Distributor: ${invoice.distributor}
Status: ${invoice.status}
Total Amount: ₹${invoice.totalAmount.toFixed(2)}

Items:
${invoice.items.map((item, i) => 
  `${i + 1}. ${item.name} - Qty: ${item.qty}, Rate: ₹${item.rate}, MRP: ₹${item.mrp}`
).join('\n')}
                              `;
                              alert(details);
                            }}
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Print functionality for invoice
                              const printContent = `
<html>
  <head>
    <title>Invoice ${invoice.invoiceNo}</title>
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
      <h1>INVOICE</h1>
      <h2>Invoice No: ${invoice.invoiceNo}</h2>
    </div>
    <div class="info">
      <p><strong>Distributor:</strong> ${invoice.distributor}</p>
      <p><strong>Date:</strong> ${invoice.date}</p>
      <p><strong>Status:</strong> ${invoice.status}</p>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>MRP</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>₹${item.rate.toFixed(2)}</td>
            <td>₹${item.mrp.toFixed(2)}</td>
            <td>₹${(item.qty * item.rate).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="total">
      <p>Total Amount: ₹${invoice.totalAmount.toFixed(2)}</p>
    </div>
  </body>
</html>
                              `;
                              const printWindow = window.open('', '_blank');
                              printWindow.document.write(printContent);
                              printWindow.document.close();
                              printWindow.print();
                              toast.success("Invoice printed successfully!");
                            }}
                            title="Print Invoice"
                          >
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
                  {invoiceSearchQuery ? "No invoices found matching your search." : "No invoices available."}
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
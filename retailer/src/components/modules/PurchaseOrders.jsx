import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, FileText, Download, AlertTriangle, ShoppingCart, Save, X, Gift, Package, RefreshCw, CheckCircle, Eye, Printer } from "lucide-react";

const PurchaseOrders = () => {
  // Form states
  const [invoiceNo, setInvoiceNo] = useState("");
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

  // Shortage items from inventory
  const [shortageItems] = useState([
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
  ]);

  // Available products for search
  const [availableProducts] = useState([
    { code: "MED001", name: "Paracetamol 500mg", mrp: 28.50, ptr: 25.50, distributor: "MedCorp Distributors" },
    { code: "MED002", name: "Amoxicillin 250mg", mrp: 125.50, ptr: 106.68, distributor: "PharmaCare Ltd" },
    { code: "MED003", name: "Crocin 650mg", mrp: 35.00, ptr: 30.50, distributor: "Healthcare Partners" },
    { code: "MED004", name: "Ibuprofen 400mg", mrp: 52.00, ptr: 45.50, distributor: "MedCorp Distributors" }
  ]);

  const distributors = [
    "MedCorp Distributors",
    "PharmaCare Ltd", 
    "MediSupply Co",
    "Healthcare Partners"
  ];

  // Order items state
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

  // D/C (Debit/Credit) items - manually added stock
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

  // Filtered products based on search
  const filteredProducts = availableProducts.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.distributor.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const updateOrderItem = (index, field, value) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate net value when qty, rate, or tax changes
        if (field === 'qty' || field === 'rate' || field === 'tax') {
          updatedItem.netValue = Math.round(updatedItem.qty * updatedItem.rate * (1 + updatedItem.tax/100));
          updatedItem.scheme = { ...updatedItem.scheme, total: updatedItem.qty + updatedItem.scheme.free };
        }
        return updatedItem;
      }
      return item;
    }));
  };

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

  const handleDeleteItem = (index) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
    toast.success("Item removed from order");
  };

  const handleDeleteDCItem = (index) => {
    setDcItems(prev => prev.filter((_, i) => i !== index));
    toast.success("D/C item removed");
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Please add items to the order");
      return;
    }

    if (!selectedDistributor) {
      toast.error("Please select a distributor");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate order submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const orderData = {
      invoiceNo: invoiceNo || `PO-${Date.now()}`,
      distributor: selectedDistributor,
      orderBy,
      items: orderItems,
      totalValue: orderItems.reduce((sum, item) => sum + item.netValue, 0),
      submittedAt: new Date().toISOString()
    };

    setIsSubmitting(false);
    toast.success(`Order submitted successfully! Order ID: ${orderData.invoiceNo}`);
    
    // Reset form
    setOrderItems([]);
    setInvoiceNo("");
    setSelectedDistributor("");
  };

  const handlePrintOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("No items to print");
      return;
    }

    setIsPrinting(true);
    
    // Simulate print process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    setIsPrinting(false);
    toast.success("Order printed successfully!");
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    
    // Simulate search process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSearching(false);
    toast.success(`Found ${filteredProducts.length} products matching "${searchQuery}"`);
  };

  const generatePrintContent = () => {
    const totalValue = orderItems.reduce((sum, item) => sum + item.netValue, 0);
    const totalItems = orderItems.reduce((sum, item) => sum + item.qty, 0);
    
    return `
      <html>
        <head>
          <title>Purchase Order - ${invoiceNo || 'Draft'}</title>
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
            <h2>Invoice No: ${invoiceNo || 'Draft'}</h2>
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

  const handleExportOrder = () => {
    if (orderItems.length === 0) {
      toast.error("No items to export");
      return;
    }

    const orderData = {
      invoiceNo: invoiceNo || 'Draft',
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
    a.download = `purchase_order_${invoiceNo || 'draft'}_${new Date().toISOString().split('T')[0]}.json`;
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

Invoice No: ${invoiceNo || 'Draft'}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
      </div>

      {/* Main Form */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="invoice">Invoice No</Label>
              <Input
                id="invoice"
                placeholder="Enter invoice number"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
              />
            </div>
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
            <div className="flex gap-2">
              <Dialog open={showShortageDialog} onOpenChange={setShowShortageDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Shortage ({shortageItems.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Stock Shortage Items</DialogTitle>
                    <DialogDescription>Items below minimum stock level</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {shortageItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Current: {item.currentStock} | Min: {item.minStock} | Short: {item.shortageQty}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            addShortageItemToOrder(item);
                            setShowShortageDialog(false);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
              onClick={handleSearch}
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
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                      <div className="flex-1">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({product.code})</span>
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

      {/* Tabs for Order Items and D/C */}
      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="order">Order Items</TabsTrigger>
          <TabsTrigger value="dc">D/C Items ({dcItems.length})</TabsTrigger>
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
              <div className="flex justify-between items-center mt-4">
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
              <div className="flex justify-between items-center">
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
                    <div className="space-y-4 max-h-96 overflow-y-auto">
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
      </Tabs>
    </div>
  );
};

export default PurchaseOrders;

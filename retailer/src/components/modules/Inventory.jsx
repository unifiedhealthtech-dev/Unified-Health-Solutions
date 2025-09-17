import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Plus, Upload, RefreshCw, Trash2, AlertTriangle, Package, Edit, Search } from "lucide-react";

const Inventory = () => {
  const [inventory, setInventory] = useState([
    {
      productCode: "MED001",
      name: "Paracetamol 500mg",
      hsn: "30049099",
      batch: "PCM240115",
      mfgDate: "2024-01-15",
      expDate: "2026-01-15",
      packSize: "10x10",
      mrp: 45.00,
      ptr: 38.25,
      tax: 12,
      qty: 850,
      minStock: 100,
      status: "In Stock"
    },
    {
      productCode: "MED002",
      name: "Amoxicillin 250mg",
      hsn: "30041000",
      batch: "AMX240110",
      mfgDate: "2024-01-10",
      expDate: "2025-06-10",
      packSize: "10x10",
      mrp: 125.50,
      ptr: 106.68,
      tax: 12,
      qty: 25,
      minStock: 50,
      status: "Low Stock"
    },
    {
      productCode: "MED003",
      name: "Cetirizine 10mg",
      hsn: "30049099",
      batch: "CET240105",
      mfgDate: "2024-01-05",
      expDate: "2024-03-15",
      packSize: "10x10",
      mrp: 28.75,
      ptr: 24.44,
      tax: 12,
      qty: 150,
      minStock: 100,
      status: "Near Expiry"
    },
  ]);

  // State for dialogs and forms
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAdjustStock, setShowAdjustStock] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form states
  const [newStock, setNewStock] = useState({
    productCode: "",
    name: "",
    hsn: "",
    batch: "",
    mfgDate: "",
    expDate: "",
    packSize: "",
    mrp: "",
    ptr: "",
    tax: "",
    qty: "",
    minStock: ""
  });

  const [adjustStock, setAdjustStock] = useState({
    productCode: "",
    adjustmentType: "add", // add, subtract, set
    quantity: "",
    reason: ""
  });

  // Filter inventory based on search
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status, qty, minStock) => {
    if (status === "Near Expiry") {
      return <Badge variant="destructive">Near Expiry</Badge>;
    }
    if (qty <= minStock) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">In Stock</Badge>;
  };

  const stockSummary = {
    totalProducts: inventory.length,
    lowStock: inventory.filter(item => item.qty <= item.minStock).length,
    nearExpiry: inventory.filter(item => item.status === "Near Expiry").length,
    totalValue: inventory.reduce((sum, item) => sum + (item.qty * item.ptr), 0)
  };

  // Handler functions
  const handleAddStock = () => {
    if (!newStock.productCode || !newStock.name || !newStock.qty) {
      toast.error("Please fill in required fields");
      return;
    }
    
    const newItem = {
      ...newStock,
      mrp: parseFloat(newStock.mrp) || 0,
      ptr: parseFloat(newStock.ptr) || 0,
      tax: parseInt(newStock.tax) || 0,
      qty: parseInt(newStock.qty) || 0,
      minStock: parseInt(newStock.minStock) || 0,
      status: "In Stock"
    };
    
    setInventory([...inventory, newItem]);
    setNewStock({
      productCode: "",
      name: "",
      hsn: "",
      batch: "",
      mfgDate: "",
      expDate: "",
      packSize: "",
      mrp: "",
      ptr: "",
      tax: "",
      qty: "",
      minStock: ""
    });
    setShowAddStock(false);
    toast.success("Stock added successfully!");
  };

  const handleAdjustStock = () => {
    if (!adjustStock.productCode || !adjustStock.quantity) {
      toast.error("Please fill in required fields");
      return;
    }
    
    const itemIndex = inventory.findIndex(item => item.productCode === adjustStock.productCode);
    if (itemIndex === -1) {
      toast.error("Product not found");
      return;
    }
    
    const updatedInventory = [...inventory];
    const currentQty = updatedInventory[itemIndex].qty;
    const adjustmentQty = parseInt(adjustStock.quantity);
    
    switch (adjustStock.adjustmentType) {
      case "add":
        updatedInventory[itemIndex].qty = currentQty + adjustmentQty;
        break;
      case "subtract":
        updatedInventory[itemIndex].qty = Math.max(0, currentQty - adjustmentQty);
        break;
      case "set":
        updatedInventory[itemIndex].qty = adjustmentQty;
        break;
    }
    
    setInventory(updatedInventory);
    setAdjustStock({ productCode: "", adjustmentType: "add", quantity: "", reason: "" });
    setShowAdjustStock(false);
    toast.success("Stock adjusted successfully!");
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditDialog(true);
  };

  const handleDelete = (productCode) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setInventory(inventory.filter(item => item.productCode !== productCode));
      toast.success("Item deleted successfully!");
    }
  };

  const handleImportCSV = () => {
    // Simulate CSV import
    toast.info("CSV import feature coming soon!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
            <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Stock</DialogTitle>
                <DialogDescription>Add a new product to your inventory</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="productCode">Product Code *</Label>
                  <Input
                    id="productCode"
                    value={newStock.productCode}
                    onChange={(e) => setNewStock({...newStock, productCode: e.target.value})}
                    placeholder="MED001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newStock.name}
                    onChange={(e) => setNewStock({...newStock, name: e.target.value})}
                    placeholder="Paracetamol 500mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsn">HSN Code</Label>
                  <Input
                    id="hsn"
                    value={newStock.hsn}
                    onChange={(e) => setNewStock({...newStock, hsn: e.target.value})}
                    placeholder="30049099"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Batch Number</Label>
                  <Input
                    id="batch"
                    value={newStock.batch}
                    onChange={(e) => setNewStock({...newStock, batch: e.target.value})}
                    placeholder="PCM240115"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mfgDate">Manufacturing Date</Label>
                  <Input
                    id="mfgDate"
                    type="date"
                    value={newStock.mfgDate}
                    onChange={(e) => setNewStock({...newStock, mfgDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expDate">Expiry Date</Label>
                  <Input
                    id="expDate"
                    type="date"
                    value={newStock.expDate}
                    onChange={(e) => setNewStock({...newStock, expDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packSize">Pack Size</Label>
                  <Input
                    id="packSize"
                    value={newStock.packSize}
                    onChange={(e) => setNewStock({...newStock, packSize: e.target.value})}
                    placeholder="10x10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (₹)</Label>
                  <Input
                    id="mrp"
                    type="number"
                    value={newStock.mrp}
                    onChange={(e) => setNewStock({...newStock, mrp: e.target.value})}
                    placeholder="45.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ptr">PTR (₹)</Label>
                  <Input
                    id="ptr"
                    type="number"
                    value={newStock.ptr}
                    onChange={(e) => setNewStock({...newStock, ptr: e.target.value})}
                    placeholder="38.25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax %</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={newStock.tax}
                    onChange={(e) => setNewStock({...newStock, tax: e.target.value})}
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    type="number"
                    value={newStock.qty}
                    onChange={(e) => setNewStock({...newStock, qty: e.target.value})}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newStock.minStock}
                    onChange={(e) => setNewStock({...newStock, minStock: e.target.value})}
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddStock(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStock}>
                  Add Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleImportCSV}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>

          <Dialog open={showAdjustStock} onOpenChange={setShowAdjustStock}>
            <DialogTrigger asChild>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Adjust Stock
          </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Stock</DialogTitle>
                <DialogDescription>Adjust quantity for existing products</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="adjustProductCode">Product Code *</Label>
                  <Select value={adjustStock.productCode} onValueChange={(value) => setAdjustStock({...adjustStock, productCode: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((item) => (
                        <SelectItem key={item.productCode} value={item.productCode}>
                          {item.productCode} - {item.name} (Current: {item.qty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adjustmentType">Adjustment Type</Label>
                  <Select value={adjustStock.adjustmentType} onValueChange={(value) => setAdjustStock({...adjustStock, adjustmentType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add to Stock</SelectItem>
                      <SelectItem value="subtract">Subtract from Stock</SelectItem>
                      <SelectItem value="set">Set Stock Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={adjustStock.quantity}
                    onChange={(e) => setAdjustStock({...adjustStock, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={adjustStock.reason}
                    onChange={(e) => setAdjustStock({...adjustStock, reason: e.target.value})}
                    placeholder="Reason for adjustment"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdjustStock(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdjustStock}>
                  Adjust Stock
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stockSummary.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-warning">{stockSummary.lowStock}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Near Expiry</p>
                <p className="text-2xl font-bold text-destructive">{stockSummary.nearExpiry}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{stockSummary.totalValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Product Inventory</CardTitle>
          <CardDescription>Complete inventory with stock levels and expiry tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search products..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>HSN</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>MFG Date</TableHead>
                <TableHead>EXP Date</TableHead>
                <TableHead>Pack Size</TableHead>
                <TableHead>MRP</TableHead>
                <TableHead>PTR</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productCode}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.hsn}</TableCell>
                  <TableCell>{item.batch}</TableCell>
                  <TableCell>{item.mfgDate}</TableCell>
                  <TableCell className={item.status === "Near Expiry" ? "text-destructive font-medium" : ""}>
                    {item.expDate}
                  </TableCell>
                  <TableCell>{item.packSize}</TableCell>
                  <TableCell>₹{item.mrp.toFixed(2)}</TableCell>
                  <TableCell>₹{item.ptr.toFixed(2)}</TableCell>
                  <TableCell>{item.tax}%</TableCell>
                  <TableCell className={item.qty <= item.minStock ? "text-warning font-medium" : ""}>
                    {item.qty}
                  </TableCell>
                  <TableCell>{item.minStock}</TableCell>
                  <TableCell>
                    {getStatusBadge(item.status, item.qty, item.minStock)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(item.productCode)}>
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product information</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editProductCode">Product Code</Label>
                <Input
                  id="editProductCode"
                  value={editingItem.productCode}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editName">Product Name</Label>
                <Input
                  id="editName"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editHsn">HSN Code</Label>
                <Input
                  id="editHsn"
                  value={editingItem.hsn}
                  onChange={(e) => setEditingItem({...editingItem, hsn: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editBatch">Batch Number</Label>
                <Input
                  id="editBatch"
                  value={editingItem.batch}
                  onChange={(e) => setEditingItem({...editingItem, batch: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMfgDate">Manufacturing Date</Label>
                <Input
                  id="editMfgDate"
                  type="date"
                  value={editingItem.mfgDate}
                  onChange={(e) => setEditingItem({...editingItem, mfgDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editExpDate">Expiry Date</Label>
                <Input
                  id="editExpDate"
                  type="date"
                  value={editingItem.expDate}
                  onChange={(e) => setEditingItem({...editingItem, expDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPackSize">Pack Size</Label>
                <Input
                  id="editPackSize"
                  value={editingItem.packSize}
                  onChange={(e) => setEditingItem({...editingItem, packSize: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMrp">MRP (₹)</Label>
                <Input
                  id="editMrp"
                  type="number"
                  value={editingItem.mrp}
                  onChange={(e) => setEditingItem({...editingItem, mrp: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPtr">PTR (₹)</Label>
                <Input
                  id="editPtr"
                  type="number"
                  value={editingItem.ptr}
                  onChange={(e) => setEditingItem({...editingItem, ptr: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTax">Tax %</Label>
                <Input
                  id="editTax"
                  type="number"
                  value={editingItem.tax}
                  onChange={(e) => setEditingItem({...editingItem, tax: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editQty">Quantity</Label>
                <Input
                  id="editQty"
                  type="number"
                  value={editingItem.qty}
                  onChange={(e) => setEditingItem({...editingItem, qty: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMinStock">Minimum Stock</Label>
                <Input
                  id="editMinStock"
                  type="number"
                  value={editingItem.minStock}
                  onChange={(e) => setEditingItem({...editingItem, minStock: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (editingItem) {
                const updatedInventory = inventory.map(item => 
                  item.productCode === editingItem.productCode ? editingItem : item
                );
                setInventory(updatedInventory);
                setShowEditDialog(false);
                toast.success("Product updated successfully!");
              }
            }}>
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;

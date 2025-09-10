import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Package,
  AlertTriangle,
  Calendar,
  Barcode,
  TrendingUp,
  TrendingDown,
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

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showAddStock, setShowAddStock] = useState(false);

  const inventory = [
    {
      productCode: 'PRD-001',
      productName: 'Paracetamol 500mg',
      hsn: '30049099',
      batch: 'PCM001',
      mfgDate: '2024-01-15',
      expDate: '2025-12-15',
      packSize: '10x10 Tablets',
      mrp: '₹25.00',
      ptr: '₹18.50',
      pts: '₹20.00',
      taxPercent: 12,
      currentQty: 450,
      minStock: 100,
      status: 'In Stock',
      category: 'Analgesics'
    },
    {
      productCode: 'PRD-002',
      productName: 'Amoxicillin 250mg',
      hsn: '30041010',
      batch: 'AMX002',
      mfgDate: '2024-02-10',
      expDate: '2025-08-10',
      packSize: '10 Capsules',
      mrp: '₹45.00',
      ptr: '₹32.50',
      pts: '₹35.00',
      taxPercent: 12,
      currentQty: 23,
      minStock: 50,
      status: 'Low Stock',
      category: 'Antibiotics'
    },
    {
      productCode: 'PRD-003',
      productName: 'Cetirizine 10mg',
      hsn: '30049099',
      batch: 'CET003',
      mfgDate: '2024-01-20',
      expDate: '2025-10-20',
      packSize: '10x10 Tablets',
      mrp: '₹30.00',
      ptr: '₹22.50',
      pts: '₹25.00',
      taxPercent: 12,
      currentQty: 12,
      minStock: 75,
      status: 'Critical',
      category: 'Antihistamines'
    },
    {
      productCode: 'PRD-004',
      productName: 'Omeprazole 20mg',
      hsn: '30049099',
      batch: 'OME004',
      mfgDate: '2024-03-01',
      expDate: '2025-02-28',
      packSize: '10x10 Capsules',
      mrp: '₹55.00',
      ptr: '₹40.00',
      pts: '₹45.00',
      taxPercent: 12,
      currentQty: 8,
      minStock: 40,
      status: 'Critical',
      category: 'Antacids'
    }
  ];

  const [stockForm, setStockForm] = useState({
    productCode: '',
    productName: '',
    hsn: '',
    batch: '',
    mfgDate: '',
    expDate: '',
    packSize: '',
    mrp: '',
    ptr: '',
    pts: '',
    taxPercent: 12,
    qty: '',
    minStock: ''
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.batch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter;

    const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'low' && item.status === 'Low Stock') ||
                          (stockFilter === 'critical' && item.status === 'Critical') ||
                          (stockFilter === 'instock' && item.status === 'In Stock');

    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStatusBadge = (status) => {
    const variants = {
      'In Stock': "default",
      'Low Stock': "secondary", 
      'Critical': "destructive",
      'Out of Stock': "outline"
    };
    return variants[status] || "secondary";
  };

  const getStockTrend = (current, min) => {
    const percentage = (current / min) * 100;
    if (percentage > 150) return { icon: TrendingUp, color: 'text-success', text: 'Good' };
    if (percentage > 100) return { icon: TrendingUp, color: 'text-primary', text: 'Normal' };
    if (percentage > 50) return { icon: TrendingDown, color: 'text-warning', text: 'Low' };
    return { icon: AlertTriangle, color: 'text-destructive', text: 'Critical' };
  };

  const handleAddStock = (e) => {
    e.preventDefault();
    console.log('Adding stock:', stockForm);
    setShowAddStock(false);
  };

  const categories = ['Analgesics', 'Antibiotics', 'Antihistamines', 'Antacids', 'Vitamins', 'Supplements'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track pharmaceutical stock levels, batches, and expiry dates
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          
          <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
            <DialogTrigger asChild>
              <Button variant="medical" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Stock</DialogTitle>
                <DialogDescription>
                  Enter product details and stock information
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddStock} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productCode">Product Code</Label>
                    <Input
                      id="productCode"
                      value={stockForm.productCode}
                      onChange={(e) => setStockForm({ ...stockForm, productCode: e.target.value })}
                      placeholder="PRD-001"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={stockForm.productName}
                      onChange={(e) => setStockForm({ ...stockForm, productName: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hsn">HSN Code</Label>
                    <Input
                      id="hsn"
                      value={stockForm.hsn}
                      onChange={(e) => setStockForm({ ...stockForm, hsn: e.target.value })}
                      placeholder="30049099"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="batch">Batch No *</Label>
                    <Input
                      id="batch"
                      value={stockForm.batch}
                      onChange={(e) => setStockForm({ ...stockForm, batch: e.target.value })}
                      placeholder="Batch number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mfgDate">Manufacturing Date</Label>
                    <Input
                      id="mfgDate"
                      type="date"
                      value={stockForm.mfgDate}
                      onChange={(e) => setStockForm({ ...stockForm, mfgDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expDate">Expiry Date *</Label>
                    <Input
                      id="expDate"
                      type="date"
                      value={stockForm.expDate}
                      onChange={(e) => setStockForm({ ...stockForm, expDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packSize">Pack Size</Label>
                  <Input
                    id="packSize"
                    value={stockForm.packSize}
                    onChange={(e) => setStockForm({ ...stockForm, packSize: e.target.value })}
                    placeholder="10x10 Tablets"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mrp">MRP</Label>
                    <Input
                      id="mrp"
                      value={stockForm.mrp}
                      onChange={(e) => setStockForm({ ...stockForm, mrp: e.target.value })}
                      placeholder="₹0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ptr">PTR</Label>
                    <Input
                      id="ptr"
                      value={stockForm.ptr}
                      onChange={(e) => setStockForm({ ...stockForm, ptr: e.target.value })}
                      placeholder="₹0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pts">PTS</Label>
                    <Input
                      id="pts"
                      value={stockForm.pts}
                      onChange={(e) => setStockForm({ ...stockForm, pts: e.target.value })}
                      placeholder="₹0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxPercent">Tax %</Label>
                    <Select onValueChange={(value) => setStockForm({ ...stockForm, taxPercent: Number(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Tax %" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qty">Quantity *</Label>
                    <Input
                      id="qty"
                      type="number"
                      value={stockForm.qty}
                      onChange={(e) => setStockForm({ ...stockForm, qty: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Minimum Stock</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={stockForm.minStock}
                      onChange={(e) => setStockForm({ ...stockForm, minStock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddStock(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="medical">
                    Add Stock
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-warning">23</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-destructive">8</p>
              </div>
              <Calendar className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹45.6L</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
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
                  placeholder="Search by product name, code, or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="instock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Items</CardTitle>
          <CardDescription>
            Total {filteredInventory.length} products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Details</TableHead>
                  <TableHead>Batch Info</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Stock Trend</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const trend = getStockTrend(item.currentQty, item.minStock);
                  const TrendIcon = trend.icon;
                  
                  return (
                    <TableRow key={item.productCode}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Barcode className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.productCode}</span>
                          </div>
                          <p className="font-medium">{item.productName}</p>
                          <div className="text-sm text-muted-foreground">
                            HSN: {item.hsn} | {item.packSize}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><strong>Batch:</strong> {item.batch}</div>
                          <div><strong>Mfg:</strong> {item.mfgDate}</div>
                          <div><strong>Exp:</strong> {item.expDate}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><strong>MRP:</strong> {item.mrp}</div>
                          <div><strong>PTR:</strong> {item.ptr}</div>
                          <div><strong>PTS:</strong> {item.pts}</div>
                          <div><strong>Tax:</strong> {item.taxPercent}%</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant={getStatusBadge(item.status)}>
                            {item.status}
                          </Badge>
                          <div className="text-sm">
                            <div><strong>Current:</strong> {item.currentQty}</div>
                            <div><strong>Min:</strong> {item.minStock}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TrendIcon className={`h-4 w-4 ${trend.color}`} />
                          <span className={`text-sm font-medium ${trend.color}`}>
                            {trend.text}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {Math.round((item.currentQty / item.minStock) * 100)}% of min
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Edit Stock">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Adjust Stock">
                            <Package className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete Item">
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

export default Inventory;

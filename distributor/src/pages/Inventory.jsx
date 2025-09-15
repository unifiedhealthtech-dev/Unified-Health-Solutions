// src/pages/Inventory.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useGetProductsQuery } from '../services/inventoryApi';
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
  Filter,
  FileText
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
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useGetStockItemsQuery,
  // useAddStockMutation,
  useAddBulkStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useImportProductsMutation,
  useGetInventorySummaryQuery
} from '../services/inventoryApi';

const Inventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showAddStock, setShowAddStock] = useState(false);
  const [showEditStock, setShowEditStock] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { data: products = [], isLoading } = useGetProductsQuery();

   
  
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  // API Queries
  const { data: stockData, isLoading: isStockLoading, refetch } = useGetStockItemsQuery({
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: stockFilter !== 'all' && stockFilter !== 'Expired' ? stockFilter : undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });
  
  // Calculate totalPages from total count from API
  const totalPages = Math.ceil((stockData?.total || 0) / itemsPerPage);
  // const [addStock] = useAddStockMutation();
  const [updateStock] = useUpdateStockMutation();
  const [deleteStock] = useDeleteStockMutation();
  const [importProducts] = useImportProductsMutation();
  
  
  
// Form state
const [stockForm, setStockForm] = useState({
  product_id: '',          // This holds product_code selected from dropdown
  batch_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity: '',
  minimum_stock: '',
  ptr: '',
  pts: '',
  tax_rate: 0,
});
  // Call refetch when currentPage changes to fetch new page data
  useEffect(() => {
    refetch();
  }, [currentPage]);
  useEffect(() => {
    // Example: ping the backend to check token
    fetch('http://localhost:5000/api/inventory/stock', {
      method: 'GET',
      credentials: 'include', // send cookies
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login'); // redirect if unauthorized
        }
      })
      .catch(err => {
        console.error('Auth check failed', err);
      });
  }, [navigate]);

  // Open Add Stock dialog if navigated from dashboard
  const location = useLocation();

useEffect(() => {
  if (location.state?.openAddStock) {
    setShowAddStock(true); // Open the Add Stock dialog
    // Clear the state so it doesn’t reopen on reload
    navigate('/inventory', { replace: true });
  }
}, [location.state, navigate]);



  // Handler for changing page
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  // Load categories from products
  const [categories, setCategories] = useState([]);

useEffect(() => {
  if (stockData?.categories) {
    setCategories(stockData.categories);
  }
}, [stockData]);


  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const getStatusBadge = (item) => {
    if (isExpired(item.expiry_date)) return "destructive";
    const variants = {
      'In Stock': "default",
      'Low Stock': "secondary",
      'Critical': "destructive",
    };
    return variants[item.status] || "secondary";
  };

  const getStockTrend = (current, min) => {
    const percentage = (current / min) * 100;
    if (percentage > 150) return { icon: TrendingUp, color: 'text-success', text: 'Good' };
    if (percentage > 100) return { icon: TrendingUp, color: 'text-primary', text: 'Normal' };
    if (percentage > 50) return { icon: TrendingDown, color: 'text-warning', text: 'Low' };
    return { icon: AlertTriangle, color: 'text-destructive', text: 'Critical' };
  };

  // Add another query just for summary (without pagination)
const { data: stockSummary } = useGetStockItemsQuery({
  search: searchTerm,
  category: categoryFilter !== 'all' ? categoryFilter : undefined,
  status: stockFilter !== 'all' && stockFilter !== 'Expired' ? stockFilter : undefined,
});



const [showBulkAddStock, setShowBulkAddStock] = useState(false);
const [bulkStockForm, setBulkStockForm] = useState(
  Array(10).fill().map(() => ({
    product_id: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity: '',
    minimum_stock: '',
    ptr: '',
    pts: '',
    tax_rate: '',
  }))
);

// Add the mutation hook
const [addBulkStock] = useAddBulkStockMutation();

// Handler for adding a new row
const addNewRow = () => {
  setBulkStockForm([...bulkStockForm, {
    product_id: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity: '',
    minimum_stock: '',
    ptr: '',
    pts: '',
    tax_rate: 0,
  }]);
};
// Helper function to check if a row is complete
const isRowComplete = (row) => {
  return row.product_id.trim() !== '' && 
         row.batch_number.trim() !== '' && 
         row.expiry_date.trim() !== '' && 
         row.quantity.trim() !== '' && 
         row.ptr.trim() !== '' && 
         row.pts.trim() !== '' &&
         row.tax_rate.trim() !== '';
};

// Helper function to check if a row is partially filled (will cause error)
const isRowPartial = (row) => {
  return row.product_id.trim() !== '' && 
         (!row.batch_number.trim() || 
          !row.expiry_date.trim() || 
          !row.quantity.trim() || 
          !row.ptr.trim() || 
          !row.pts.trim() ||
          !row.tax_rate.trim());
};


// Handler for removing a row
const removeRow = (index) => {
  if (bulkStockForm.length <= 1) return;
  const newForm = [...bulkStockForm];
  newForm.splice(index, 1);
  setBulkStockForm(newForm);
};

// Handler for updating a field in bulk form
const updateBulkField = (index, field, value) => {
  const newForm = [...bulkStockForm];
  newForm[index] = { ...newForm[index], [field]: value };
  setBulkStockForm(newForm);
};

// Handler for bulk stock submission
const handleBulkAddStock = async (e) => {
  e.preventDefault();
  try {
    // Filter out completely empty rows and rows with product_id but missing other required fields
    const itemsToProcess = bulkStockForm.filter(item => {
      // Skip completely empty rows
      if (!item.product_id.trim() && 
          !item.batch_number.trim() && 
          !item.expiry_date.trim() && 
          !item.quantity.trim() && 
          !item.ptr.trim() && 
          !item.pts.trim()) {
        return false;
      }
      
      // Check if this row has a product selected but is missing required fields
      if (item.product_id.trim() && 
          (!item.batch_number.trim() || 
           !item.expiry_date.trim() || 
           !item.quantity.trim() || 
           !item.ptr.trim() || 
           !item.pts.trim())) {
        return false;
      }
      
      // Only include rows with product_id and all required fields
      return item.product_id.trim() !== '' && 
             item.batch_number.trim() !== '' && 
             item.expiry_date.trim() !== '' && 
             item.quantity.trim() !== '' && 
             item.ptr.trim() !== '' && 
             item.pts.trim() !== '';
    });
    
    if (itemsToProcess.length === 0) {
      alert('Please fill at least one complete row with all required information');
      return;
    }

    const result = await addBulkStock(itemsToProcess).unwrap();
    
    if (result.errors && result.errors.length > 0) {
      alert(`Added ${result.success.length} items with ${result.errors.length} errors. Check console for details.`);
      console.error('Bulk add errors:', result.errors);
    } else {
      alert(`Successfully added ${result.success.length} stock items`);
    }
    
    setShowBulkAddStock(false);
    setBulkStockForm(
      Array(10).fill().map(() => ({
        product_id: '',
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        quantity: '',
        minimum_stock: '',
        ptr: '',
        pts: '',
        tax_rate: '',
      }))
    );
    refetch();
  } catch (err) {
    console.error('Failed to add bulk stock:', err);
    alert('Failed to add bulk stock. Please try again.');
  }
};
  const handleEditStock = (item) => {
    setEditingItem(item);
    setStockForm({
      product_id: item.product_id,
      batch_number: item.batch_number,
      manufacturing_date: item.manufacturing_date ? new Date(item.manufacturing_date).toISOString().split('T')[0] : '',
      expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : '',
      quantity: item.quantity.toString(),
      minimum_stock: item.minimum_stock.toString(),
      ptr: item.ptr.toString(),
      pts: item.pts.toString(),
      tax_rate: item.tax_rate.toString(),
    });
    setShowEditStock(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await updateStock({
      stockId: editingItem.stock_id,
      ...stockForm,
      quantity: parseInt(stockForm.quantity),
      minimum_stock: parseInt(stockForm.minimum_stock),
      ptr: parseFloat(stockForm.ptr),
      pts: parseFloat(stockForm.pts),
      tax_rate: parseFloat(stockForm.tax_rate)
    }).unwrap();
      setShowEditStock(false);
      setEditingItem(null);
      setStockForm({
        product_id: '',
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        quantity: '',
        minimum_stock: '',
        ptr: '',
        pts: '',
        tax_rate: 0,
      });
      refetch(); // Refresh data
    } catch (err) {
      console.error('Failed to update stock:', err);
      alert('Failed to update stock. Please try again.');
    }
  };

  const handleDeleteStock = async (stock_id) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      try {
        await deleteStock(stock_id).unwrap();
        refetch(); // Refresh data
      } catch (err) {
        console.error('Failed to delete stock:', err);
        alert('Failed to delete stock. Please try again.');
      }
    }
  };

const handleImportCSV = async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a CSV file to import');
    return;
  }

  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const products = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    });

    // Send POST request to backend
    const response = await fetch('http://localhost:5000/api/inventory/products/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // if your token is in cookie, you don't need Authorization header
        'Accept': 'application/json'
      },
      credentials: 'include', // important if token is in cookie
      body: JSON.stringify({ products }) // wrap array in object
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    alert(`${data.imported} products imported successfully!`);
    setShowImport(false);
    refetch();

  } catch (err) {
    console.error('Failed to import products:', err);
    alert(`Failed to import products: ${err.message || JSON.stringify(err)}`);
  }
};




const handleExportCSV = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/inventory/products/export', {
      method: 'GET',
      credentials: 'include', // ✅ send cookies along with request
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSV');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Failed to export products:', err);
    alert('Failed to export products. Please try again.');
  }
};



  // Apply search + category + stock + expired filter
  const filteredItems = (stockData?.data || [])
    .filter(item => {
      const term = searchTerm.toLowerCase();
      return (
        !term ||
        item.Product?.generic_name?.toLowerCase().includes(term) ||
        item.Product?.product_code?.toLowerCase().includes(term) ||
        item.batch_number?.toLowerCase().includes(term)
      );
    })
    .filter(item => {
      if (categoryFilter !== 'all') return item.Product?.category === categoryFilter;
      return true;
    })
    .filter(item => {
      if (stockFilter === 'Expired') return isExpired(item.expiry_date);
      if (['In Stock', 'Low Stock', 'Critical'].includes(stockFilter)) return item.status === stockFilter && !isExpired(item.expiry_date);
      return true;
    });

  if (isStockLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4 animate-pulse">
          <div className="w-1/4 h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

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
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

     
<Button variant="medical" size="lg" onClick={() => setShowBulkAddStock(true)}>
  <Plus className="w-4 h-4 mr-2" />
  Bulk Add Stock
</Button>


<Dialog open={showBulkAddStock} onOpenChange={setShowBulkAddStock}>
  <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Bulk Add Stock</DialogTitle>
      <DialogDescription>
        Add multiple stock items at once. Fill at least the required fields (marked with *). 
        Rows with incomplete required fields will be skipped.
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleBulkAddStock} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="w-48 p-2 text-left border">Product *</th>
              <th className="w-32 p-2 text-left border">Batch No *</th>
              <th className="w-32 p-2 text-left border">Mfg Date</th>
              <th className="w-32 p-2 text-left border">Expiry Date *</th>
              <th className="w-24 p-2 text-left border">Quantity *</th>
              <th className="w-24 p-2 text-left border">Min Stock</th>
              <th className="w-24 p-2 text-left border">PTR *</th>
              <th className="w-24 p-2 text-left border">PTS *</th>
              <th className="w-20 p-2 text-left border">Tax %</th>
              <th className="w-16 p-2 text-left border">Action</th>
            </tr>
          </thead>
          <tbody>
            {bulkStockForm.map((row, index) => (
   <tr 
  key={index} 
  className={
    isRowComplete(row) ? 'bg-green-50' : 
    isRowPartial(row) ? 'bg-yellow-50' : 
    row.product_id ? 'bg-blue-50' : ''
  }
>

                <td className="p-1 border">
                  <Select
                    value={row.product_id}
                    onValueChange={(value) => updateBulkField(index, 'product_id', value)}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent className="overflow-y-auto max-h-60">
                      {products?.map((p) => (
                        <SelectItem key={p.product_code} value={p.product_code}>
                          {p.product_code} - {p.generic_name} ({p.unit_size})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-1 border">
                  <Input
                    value={row.batch_number}
                    onChange={(e) => updateBulkField(index, 'batch_number', e.target.value)}
                    placeholder="Batch No"
                    className="text-xs"
                  />
                </td>
                <td className="p-1 border">
                  <Input
                    type="date"
                    value={row.manufacturing_date}
                    onChange={(e) => updateBulkField(index, 'manufacturing_date', e.target.value)}
                    className="text-xs"
                  />
                </td>
                <td className="p-1 border">
                  <Input
                    type="date"
                    value={row.expiry_date}
                    onChange={(e) => updateBulkField(index, 'expiry_date', e.target.value)}
                    className="text-xs"
                  />
                </td>
                <td className="p-1 border">
                  <Input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateBulkField(index, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="text-xs"
                    min="0"
                  />
                </td>
                <td className="p-1 border">
                  <Input
                    type="number"
                    value={row.minimum_stock}
                    onChange={(e) => updateBulkField(index, 'minimum_stock', e.target.value)}
                    placeholder="Min"
                    className="text-xs"
                    min="0"
                  />
                </td>
                <td className="p-1 border">
                  <Input
                    type="number"
                    step="0.01"
                    value={row.ptr}
                    onChange={(e) => updateBulkField(index, 'ptr', e.target.value)}
                    placeholder="PTR"
                    className="text-xs"
                    min="0"
                  />
                </td>
                <td className="p-1 border">
                  <Input
                    type="number"
                    step="0.01"
                    value={row.pts}
                    onChange={(e) => updateBulkField(index, 'pts', e.target.value)}
                    placeholder="PTS"
                    className="text-xs"
                    min="0"
                  />
                </td>
               <td className="p-1 border">
  <Input
    type="number"
    step="0.01"
    value={row.tax_rate}
    onChange={(e) => updateBulkField(index, 'tax_rate', e.target.value)}
    placeholder="%"
    className="text-xs"
    min="0"
    max="100"
  />
</td>

                <td className="p-1 text-center border">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeRow(index)}
                    disabled={bulkStockForm.length <= 1}
                    className="p-0 h-7 w-7"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="text-sm text-muted-foreground">
          <p>• Rows with a selected product will be highlighted</p>
          <p>• Only complete rows (all required fields filled) will be processed</p>
        </div>
        
        <div className="flex gap-2">
          <Button type="button" onClick={addNewRow} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </Button>
<div className="flex items-center justify-between p-2 bg-gray-100 rounded">
  <div className="text-sm">
    <span className="flex items-center">
      <div className="w-3 h-3 mr-1 bg-green-500 rounded-full"></div>
      <span className="mr-3">Complete: {bulkStockForm.filter(isRowComplete).length}</span>
    </span>
    <span className="flex items-center">
      <div className="w-3 h-3 mr-1 bg-yellow-500 rounded-full"></div>
      <span className="mr-3">Incomplete: {bulkStockForm.filter(isRowPartial).length}</span>
    </span>
    <span className="flex items-center">
      <div className="w-3 h-3 mr-1 bg-blue-500 rounded-full"></div>
      <span>Product Only: {bulkStockForm.filter(row => row.product_id && !isRowPartial(row) && !isRowComplete(row)).length}</span>
    </span>
  </div>
  <div className="text-sm font-medium">
    Will process: {bulkStockForm.filter(isRowComplete).length} rows
  </div>
</div>
          <Button type="button" variant="outline" size="sm" onClick={() => {
            setBulkStockForm(
              Array(10).fill().map(() => ({
                product_id: '',
                batch_number: '',
                manufacturing_date: '',
                expiry_date: '',
                quantity: '',
                minimum_stock: '',
                ptr: '',
                pts: '',
                tax_rate: '',
              }))
            );
          }}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button type="button" variant="outline" onClick={() => setShowBulkAddStock(false)}>
          Cancel
        </Button>
       <Button 
  type="submit" 
  variant="medical"
  disabled={bulkStockForm.filter(isRowComplete).length === 0}
>
  Add {bulkStockForm.filter(isRowComplete).length} Stock Items
</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stockSummary?.total || 0}</p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>

                <p className="text-2xl font-bold text-warning">
  {stockSummary?.data?.filter(item => item.status === 'Low Stock' && !isExpired(item.expiry_date)).length || 0}
</p>

              </div>
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-destructive">
  {stockSummary?.data?.filter(item => {
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return new Date(item.expiry_date) < threeMonthsFromNow && !isExpired(item.expiry_date);
  }).length || 0}
</p>
              </div>
              <Calendar className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
               <p className="text-2xl font-bold">
  ₹{(stockSummary?.data?.reduce((sum, item) => sum + (Number(item.ptr) * item.current_stock), 0) || 0).toLocaleString()}
</p>

              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
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
    <SelectItem value="all" className="cursor-pointer">All Categories</SelectItem>
    {categories.map(cat => (
      <SelectItem key={cat} value={cat} className="cursor-pointer">{cat}</SelectItem>
    ))}
  </SelectContent>
</Select>


            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"className="cursor-pointer">All Stock</SelectItem>
                <SelectItem value="In Stock"className="cursor-pointer">In Stock</SelectItem>
                <SelectItem value="Low Stock"className="cursor-pointer">Low Stock</SelectItem>
                <SelectItem value="Critical"className="cursor-pointer">Critical</SelectItem>
                <SelectItem value="Expired"className="cursor-pointer">Expired</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
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
            Total {stockData?.total || 0} products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
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
                {filteredItems.map((item) => {
                  const trend = getStockTrend(item.current_stock, item.minimum_stock);
                  const TrendIcon = trend.icon;

                  return (
                    <TableRow key={item.stock_id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Barcode className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{item.product_id}</span>
                          </div>
                          <p className="font-medium">{item.Product?.generic_name || 'N/A'}</p>
                          <div className="text-sm text-muted-foreground">
                            HSN: {item.Product?.hsn_code || 'N/A'} | {item.Product?.unit_size || 'N/A'}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.Product?.category || 'N/A'}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><strong>Batch:</strong> {item.batch_number}</div>
                          <div><strong>Mfg:</strong> {new Date(item.manufacturing_date).toLocaleDateString()}</div>
                          <div>
                            <strong>Exp:</strong>{" "}
                            <span className={isExpired(item.expiry_date) ? "text-red-600 font-semibold" : ""}>
                              {new Date(item.expiry_date).toLocaleDateString()}
                              {isExpired(item.expiry_date) && " (Expired)"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><strong>MRP:</strong> ₹{parseFloat(item.Product?.mrp || 0).toFixed(2)}</div>
                          <div><strong>PTR:</strong> ₹{parseFloat(item.ptr || 0).toFixed(2)}</div>
                          <div><strong>PTS:</strong> ₹{parseFloat(item.pts || 0).toFixed(2)}</div>
                          <div><strong>Tax:</strong> {parseFloat(item.tax_rate || 0)}%</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <Badge variant={getStatusBadge(item)}>
                            {isExpired(item.expiry_date) ? "Expired" : item.status}
                          </Badge>
                          <div className="text-sm">
                            <div><strong>Current:</strong> {item.current_stock}</div>
                            <div><strong>Min:</strong> {item.minimum_stock}</div>
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
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.minimum_stock > 0 ? Math.round((item.current_stock / item.minimum_stock) * 100) : 0}% of min
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Edit Stock" 
                            onClick={() => handleEditStock(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete Item" 
                            onClick={() => handleDeleteStock(item.stock_id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Edit Stock Dialog */}
      <Dialog open={showEditStock} onOpenChange={setShowEditStock}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Stock Item</DialogTitle>
            <DialogDescription>
              Update product details and stock information
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
<div className="space-y-2">
  <Label htmlFor="product_id">Product *</Label>
  <Select 
    onValueChange={(value) => setStockForm({ ...stockForm, product_id: value })}
    value={stockForm.product_id || ""}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select Product"/>
    </SelectTrigger>
    <SelectContent>
      {products?.map((p) => (
        <SelectItem 
          key={p.product_code} 
          value={p.product_code}
        >
          {p.product_code} - {p.generic_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
              <div className="space-y-2">
                <Label htmlFor="edit_batch_number">Batch No *</Label>
                <Input
                  id="edit_batch_number"
                  value={stockForm.batch_number}
                  onChange={(e) => setStockForm({ ...stockForm, batch_number: e.target.value })}
                  placeholder="Batch number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_manufacturing_date">Manufacturing Date</Label>
                <Input
                  id="edit_manufacturing_date"
                  type="date"
                  value={stockForm.manufacturing_date}
                  onChange={(e) => setStockForm({ ...stockForm, manufacturing_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_expiry_date">Expiry Date *</Label>
                <Input
                  id="edit_expiry_date"
                  type="date"
                  value={stockForm.expiry_date}
                  onChange={(e) => setStockForm({ ...stockForm, expiry_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_quantity">Quantity *</Label>
                <Input
                  id="edit_quantity"
                  type="number"
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_minimum_stock">Minimum Stock</Label>
                <Input
                  id="edit_minimum_stock"
                  type="number"
                  value={stockForm.minimum_stock}
                  onChange={(e) => setStockForm({ ...stockForm, minimum_stock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
  {/* PTR */}
  <div className="space-y-2">
    <Label htmlFor="edit_ptr">PTR</Label>
    <Input
      id="edit_ptr"
      type="number"
      value={stockForm.ptr}
      onChange={(e) => setStockForm({ ...stockForm, ptr: e.target.value })}
      placeholder="0.00"
    />
  </div>

  {/* PTS */}
  <div className="space-y-2">
    <Label htmlFor="edit_pts">PTS</Label>
    <Input
      id="edit_pts"
      type="number"
      value={stockForm.pts}
      onChange={(e) => setStockForm({ ...stockForm, pts: e.target.value })}
      placeholder="0.00"
    />
  </div>

  {/* Tax % */}
  <div className="space-y-2">
    <Label htmlFor="edit_tax_rate">Tax %</Label>
    <Input
      id="edit_tax_rate"
      type="decimal"
      value={stockForm.tax_rate ?? ""}
      onChange={(e) => setStockForm({ ...stockForm, tax_rate: e.target.value })}
      placeholder="0"
      min={0}
      max={100}
    />
  </div>
</div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditStock(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="medical">
                Update Stock
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import CSV Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import products into your inventory
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleImportCSV} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File *</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                required
              />
              <p className="text-sm text-muted-foreground">
                CSV should have columns: product_id, product_code, generic_name, unit_size, mrp, group_name, hsn_code, category, batch_number, manufacturing_date, expiry_date, quantity, minimum_stock, ptr, pts, tax_rate
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="medical">
                Import Products
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-center gap-3 py-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded"
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
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-3 py-1 border rounded"
        >
          Next
        </Button>
      </div>
    </div>
    
  );
};

export default Inventory;
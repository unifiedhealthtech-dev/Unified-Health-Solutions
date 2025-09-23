// Updated src/pages/Inventory.jsx for Retail Pharmacy
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useGetProductsQuery } from '../services/retailerInventoryApi';
import { List } from 'lucide-react';
import { format } from 'date-fns';
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
  FileText,
  ChevronsUpDown,
  Eye,
  EyeOff,
  Pill,
  ShoppingBag
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
  useAddBulkStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useImportProductsMutation,
  useGetInventorySummaryQuery
} from '../services/retailerInventoryApi';
import { useRef } from "react";
// Import the new ProductRow component
import ProductRow from '../components/ui/ProductRow';
// Import components for searchable dropdown
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from "../components/ui/toast";

const Inventory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');
  const [rackFilter, setRackFilter] = useState('');
  const [showAddStock, setShowAddStock] = useState(false);
  const [showEditStock, setShowEditStock] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { data: products = [], isLoading } = useGetProductsQuery();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ open: false, title: "", description: "", variant: "default" });
  const inputRefs = useRef([]);
  const [openProductDropdown, setOpenProductDropdown] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  // API Queries
  const { data: stockData, isLoading: isStockLoading, refetch } = useGetStockItemsQuery({
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: stockFilter !== 'all' && stockFilter !== 'Expired' ? stockFilter : undefined,
    schedule: scheduleFilter !== 'all' ? scheduleFilter : undefined,
    rack_no: rackFilter || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
  });
  const columns = [
    "product_code",
    "batch_number",
    "manufacturing_date",
    "expiry_date",
    "quantity",
    "minimum_stock",
    "ptr",
    "pts",
    "tax_rate",
    "schedule",
    "rack_no"
  ];

  const handleKeyDown = (e, rowIndex, column) => {
    const colIndex = columns.indexOf(column);
    const nextRowIndex = rowIndex + 1;
    const prevRowIndex = rowIndex - 1;
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (colIndex === columns.length - 1) {
          if (nextRowIndex >= bulkStockForm.length) {
            addNewRow();
          } else {
            const nextInputKey = `${nextRowIndex}-product_code`;
            setTimeout(() => inputRefs.current[nextInputKey]?.focus(), 0);
          }
        } else {
          const nextCol = columns[colIndex + 1];
          const nextInputKey = `${rowIndex}-${nextCol}`;
          setTimeout(() => inputRefs.current[nextInputKey]?.focus(), 0);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (colIndex < columns.length - 1) {
          const nextCol = columns[colIndex + 1];
          const nextInputKey = `${rowIndex}-${nextCol}`;
          inputRefs.current[nextInputKey]?.focus();
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (colIndex > 0) {
          const prevCol = columns[colIndex - 1];
          const prevInputKey = `${rowIndex}-${prevCol}`;
          inputRefs.current[prevInputKey]?.focus();
        }
        break;
      case "ArrowDown":
        e.preventDefault();
        if (nextRowIndex < bulkStockForm.length) {
          const nextInputKey = `${nextRowIndex}-${column}`;
          inputRefs.current[nextInputKey]?.focus();
        } else {
          addNewRow();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (prevRowIndex >= 0) {
          const prevInputKey = `${prevRowIndex}-${column}`;
          inputRefs.current[prevInputKey]?.focus();
        }
        break;
      default:
        break;
    }
  };

  const totalPages = Math.ceil((stockData?.total || 0) / itemsPerPage);
  const [updateStock] = useUpdateStockMutation();
  const [deleteStock] = useDeleteStockMutation();
  const [importProducts] = useImportProductsMutation();

  const [stockForm, setStockForm] = useState({
    product_code: '',
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    quantity: '',
    minimum_stock: '',
    mrp: '',
    ptr: '',
    pts: '',
    tax_rate: 0,
    schedule: 'None',
    rack_no: ''
  });

  useEffect(() => {
    refetch();
  }, [currentPage]);

  useEffect(() => {
    fetch('http://localhost:5000/api/retailer/inventory/stock', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (res.status === 401) {
          navigate('/login');
        }
      })
      .catch(err => {
        console.error('Auth check failed', err);
      });
  }, [navigate]);

  const location = useLocation();
  useEffect(() => {
    if (location.state?.showBulkAddStock) {
      setShowAddStock(true);
      navigate('/inventory', { replace: true });
    }
  }, [location.state, navigate]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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

  const getStatusBadge = (status, expiryDate) => {
    if (isExpired(expiryDate)) return "destructive";
    const variants = {
      'In Stock': "default",
      'Low Stock': "secondary",
      'Critical': "destructive",
    };
    return variants[status] || "secondary";
  };

  const getStockTrend = (current, min) => {
    const percentage = (current / min) * 100;
    if (percentage > 150) return { icon: TrendingUp, color: 'text-green-600', text: 'Good' };
    if (percentage > 100) return { icon: TrendingUp, color: 'text-blue-600', text: 'Normal' };
    if (percentage > 50) return { icon: TrendingDown, color: 'text-orange-500', text: 'Low' };
    return { icon: AlertTriangle, color: 'text-red-600', text: 'Critical' };
  };

  const {  stockSummary } = useGetStockItemsQuery({
    search: searchTerm,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: stockFilter !== 'all' && stockFilter !== 'Expired' ? stockFilter : undefined,
    schedule: scheduleFilter !== 'all' ? scheduleFilter : undefined,
    rack_no: rackFilter || undefined,
  });

  const [bulkStockForm, setBulkStockForm] = useState(
    Array(10).fill().map(() => ({
      product_code: '',
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      quantity: '',
      minimum_stock: '',
      ptr: '',
      pts: '',
      tax_rate: '',
      rack_no: '',
    }))
  );

  const [addBulkStock] = useAddBulkStockMutation();
  const [globalSchedule, setGlobalSchedule] = useState('None');

  const [lastAddedRow, setLastAddedRow] = useState(null);
  const addNewRow = () => {
    setBulkStockForm(prev => {
      const newForm = [
        ...prev,
        {
          product_code: '',
          batch_number: '',
          manufacturing_date: '',
          expiry_date: '',
          quantity: '',
          minimum_stock: '',
          ptr: '',
          pts: '',
          tax_rate: 0,
          rack_no: '',
        },
      ];
      setLastAddedRow(newForm.length - 1);
      return newForm;
    });
  };

  useEffect(() => {
    if (lastAddedRow !== null) {
      setTimeout(() => {
        const key = `${lastAddedRow}-product_code`;
        if (inputRefs.current[key]) {
          inputRefs.current[key].focus();
          setLastAddedRow(null);
        }
      }, 50);
    }
  }, [bulkStockForm, lastAddedRow]);

  const isRowComplete = (row) => {
    return row.product_code.trim() !== '' &&
      row.batch_number.trim() !== '' &&
      row.expiry_date.trim() !== '' &&
      row.quantity.trim() !== '' &&
      row.ptr.trim() !== '' &&
      row.pts.trim() !== '';
  };

  const isRowPartial = (row) => {
    return row.product_code.trim() !== '' &&
      (!row.batch_number.trim() ||
        !row.expiry_date.trim() ||
        !row.quantity.trim() ||
        !row.ptr.trim() ||
        !row.pts.trim());
  };

  const removeRow = (index) => {
    if (bulkStockForm.length <= 1) return;
    const newForm = [...bulkStockForm];
    newForm.splice(index, 1);
    setBulkStockForm(newForm);
  };

  const updateBulkField = (index, field, value) => {
    const newForm = [...bulkStockForm];
    newForm[index] = { ...newForm[index], [field]: value };
    setBulkStockForm(newForm);
  };

  const handleBulkAddStock = async (e) => {
    e.preventDefault();
    try {
      const itemsToProcess = bulkStockForm.filter(item => {
        if (!item.product_code.trim() &&
          !item.batch_number.trim() &&
          !item.expiry_date.trim() &&
          !item.quantity.trim() &&
          !item.ptr.trim() &&
          !item.pts.trim()) {
          return false;
        }
        if (item.product_code.trim() &&
          (!item.batch_number.trim() ||
            !item.expiry_date.trim() ||
            !item.quantity.trim() ||
            !item.ptr.trim() ||
            !item.pts.trim())) {
          return false;
        }
        return item.product_code.trim() !== '' &&
          item.batch_number.trim() !== '' &&
          item.expiry_date.trim() !== '' &&
          item.quantity.trim() !== '' &&
          item.ptr.trim() !== '' &&
          item.pts.trim() !== '';
      });

      if (itemsToProcess.length === 0) {
        setToast({
          open: true,
          title: "Error",
          description: "Please fill at least one complete row with all required information",
          variant: "destructive",
        });
        return;
      }

      const processedItems = itemsToProcess.map(item => ({
        ...item,
        schedule: globalSchedule
      }));

      const result = await addBulkStock(processedItems).unwrap();
      if (result.errors && result.errors.length > 0) {
        setToast({
          open: true,
          title: "Error",
          description: `Added ${result.success.length} items with ${result.errors.length} errors. Check console for details.`,
          variant: "default",
        });
        console.error('Bulk add errors:', result.errors);
      } else {
        setToast({
          open: true,
          title: "Success",
          description: `Successfully added ${result.success.length} stock items`,
          variant: "default",
        });
      }

      setBulkStockForm(
        Array(10).fill().map(() => ({
          product_code: '',
          batch_number: '',
          manufacturing_date: '',
          expiry_date: '',
          quantity: '',
          minimum_stock: '',
          ptr: '',
          pts: '',
          tax_rate: '',
          rack_no: '',
        }))
      );
      refetch();
    } catch (err) {
      console.error('Failed to add bulk stock:', err);
      setToast({
        open: true,
        title: "Error",
        description: "Failed to add stock. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditStock = (item) => {
    setEditingItem(item);
    setStockForm({
      product_code: item.product_code,
      batch_number: item.batch_number,
      manufacturing_date: item.manufacturing_date ? new Date(item.manufacturing_date).toISOString().split('T')[0] : '',
      expiry_date: item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : '',
      quantity: item.quantity.toString(),
      minimum_stock: item.minimum_stock.toString(),
      mrp: item.mrp,
      ptr: item.ptr.toString(),
      pts: item.pts.toString(),
      tax_rate: item.tax_rate.toString(),
      mrp: item.Product?.mrp?.toString() || '',
      schedule: item.schedule || 'None',
      rack_no: item.rack_no || ''
    });
    setShowEditStock(true);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      await updateStock({
        stockId: editingItem.stock_id,
        ...stockForm,
        quantity: parseFloat(stockForm.quantity),
        minimum_stock: parseFloat(stockForm.minimum_stock),
        ptr: parseFloat(stockForm.ptr),
        pts: parseFloat(stockForm.pts),
        tax_rate: parseFloat(stockForm.tax_rate),
        mrp: parseFloat(stockForm.mrp),
      }).unwrap();
      setShowEditStock(false);
      setEditingItem(null);
      setStockForm({
        product_code: '',
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        quantity: '',
        minimum_stock: '',
        mrp: '',
        ptr: '',
        pts: '',
        tax_rate: 0,
        schedule: 'None',
        rack_no: ''
      });
      refetch();
    } catch (err) {
      console.error('Failed to update stock:', err);
      setToast({ open: true, title: "Error", description: "Failed to update stock. Please try again.", variant: "destructive" });
    }
  };

  const handleDeleteStock = async (stock_id) => {
    if (window.confirm('Are you sure you want to delete this stock item? This action cannot be undone.')) {
      try {
        await deleteStock(stock_id).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete stock:', err);
        setToast({ open: true, title: "Error", description: "Failed to delete stock. Please try again.", variant: "destructive" });
      }
    }
  };

  const handleImportCSV = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
      setToast({ open: true, title: "Error", description: "Please select a CSV file to import", variant: "destructive" });
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

      const response = await fetch('http://localhost:5000/api/retailer/inventory/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ products })
      });
      const data = await response.json();
      if (!response.ok) {
        throw data;
      }
      setToast({ open: true, title: "Success", description: `${data.imported} products imported successfully!`, variant: "default" });
      setShowImport(false);
      refetch();
    } catch (err) {
      console.error('Failed to import products:', err);
      setToast({ open: true, title: "Error", description: `Failed to import products: ${err.message || JSON.stringify(err)}`, variant: "destructive" });
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/retailer/inventory/products/export', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch CSV');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pharmacy_inventory_export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export products:', err);
      setToast({ open: true, title: "Error", description: "Failed to export products. Please try again.", variant: "destructive" });
    }
  };

  const groupedItems = (stockData?.data || []).reduce((acc, item) => {
    const productCode = item.Product?.product_code;
    if (!productCode) return acc;

    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      !term ||
      item.Product?.generic_name?.toLowerCase().includes(term) ||
      item.Product?.product_code?.toLowerCase().includes(term) ||
      item.batch_number?.toLowerCase().includes(term) ||
      (item.rack_no && item.rack_no.toLowerCase().includes(term))
    );

    const matchesCategory = categoryFilter === 'all' || item.Product?.category === categoryFilter;

    const matchesStockFilter = (() => {
      if (stockFilter === 'all') return true;
      if (stockFilter === 'Expired') return isExpired(item.expiry_date);
      return item.status === stockFilter && !isExpired(item.expiry_date);
    })();

    const matchesScheduleFilter = (() => {
      if (scheduleFilter === 'all') return true;
      if (scheduleFilter === 'Schedule X') {
        return item.schedule === 'Schedule X';
      }
      return item.schedule === scheduleFilter;
    })();

    const matchesRackFilter = (() => {
      if (!rackFilter) return true;
      return item.rack_no && item.rack_no.includes(rackFilter);
    })();

    if (matchesSearch && matchesCategory && matchesStockFilter && matchesScheduleFilter && matchesRackFilter) {
      if (!acc[productCode]) {
        acc[productCode] = {
          product: item.Product,
          batches: []
        };
      }
      acc[productCode].batches.push(item);
    }
    return acc;
  }, {});

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy Inventory</h1>
          <p className="text-muted-foreground">
            Manage your pharmacy's medicine stock, track expiry dates, and monitor low stock items
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="medical" 
            onClick={() => setShowAddStock(!showAddStock)}
          >
            {showAddStock ? (
              <>
                <List className="w-4 h-4 mr-2" />
                View Inventory
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Medicines</p>
                <p className="text-2xl font-bold">{stockSummary?.total || 0}</p>
              </div>
              <Pill className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-500">
                  {stockSummary?.data?.filter(item => item.status === 'Low Stock' && !isExpired(item.expiry_date)).length || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon (3 months)</p>
                <p className="text-2xl font-bold text-red-600">
                  {stockSummary?.data?.filter(item => {
                    const threeMonthsFromNow = new Date();
                    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
                    return new Date(item.expiry_date) < threeMonthsFromNow && !isExpired(item.expiry_date);
                  }).length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{(stockSummary?.data?.reduce((sum, item) => sum + (Number(item.ptr) * item.current_stock), 0) || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Only show when viewing stock, not when adding stock */}
      {!showAddStock && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search by medicine name, code, batch, or rack..."
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
                  <SelectItem value="all" className="cursor-pointer">All Stock</SelectItem>
                  <SelectItem value="In Stock" className="cursor-pointer">In Stock</SelectItem>
                  <SelectItem value="Low Stock" className="cursor-pointer">Low Stock</SelectItem>
                  <SelectItem value="Critical" className="cursor-pointer">Critical</SelectItem>
                  <SelectItem value="Expired" className="cursor-pointer">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={scheduleFilter} onValueChange={setScheduleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">All Schedules</SelectItem>
                  <SelectItem value="None" className="cursor-pointer">None</SelectItem>
                  <SelectItem value="Schedule H" className="cursor-pointer">Schedule H</SelectItem>
                  <SelectItem value="Schedule H1" className="cursor-pointer">Schedule H1</SelectItem>
                  <SelectItem value="Schedule G" className="cursor-pointer">Schedule G</SelectItem>
                  <SelectItem value="Schedule C" className="cursor-pointer">Schedule C</SelectItem>
                  <SelectItem value="Schedule C1" className="cursor-pointer">Schedule C1</SelectItem>
                  <SelectItem value="Schedule F" className="cursor-pointer">Schedule F</SelectItem>
                  <SelectItem value="Schedule J" className="cursor-pointer">Schedule J</SelectItem>
                  <SelectItem value="Schedule K" className="cursor-pointer">Schedule K</SelectItem>
                  <SelectItem value="Schedule X" className="cursor-pointer">Schedule X</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Rack/Shelf No"
                value={rackFilter}
                onChange={(e) => setRackFilter(e.target.value)}
                className="w-full md:w-[180px]"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Toggle between Stock List and Add Stock Form */}
      {showAddStock ? (
        /* Bulk Add Stock Form */
        <Card>
          <CardHeader>
            <CardTitle>Add New Stock</CardTitle>
            <CardDescription>
              Add medicines to your pharmacy inventory. Fill required fields (*). Incomplete rows will be skipped.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBulkAddStock} className="space-y-4">
              {/* Global Schedule Dropdown */}
              <div className="mb-4">
                <Label htmlFor="global-schedule">Schedule for All Items</Label>
                <Select value={globalSchedule} onValueChange={setGlobalSchedule}>
                  <SelectTrigger id="global-schedule" className="w-full">
                    <SelectValue placeholder="Select Schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Schedule G">Schedule G</SelectItem>
                    <SelectItem value="Schedule C">Schedule C</SelectItem>
                    <SelectItem value="Schedule C1">Schedule C1</SelectItem>
                    <SelectItem value="Schedule F">Schedule F</SelectItem>
                    <SelectItem value="Schedule J">Schedule J</SelectItem>
                    <SelectItem value="Schedule K">Schedule K</SelectItem>
                    <SelectItem value="Schedule H">Schedule H</SelectItem>
                    <SelectItem value="Schedule H1">Schedule H1</SelectItem>
                    <SelectItem value="Schedule X">Schedule X</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="w-48 p-2 text-left border">Medicine *</th>
                      <th className="w-32 p-2 text-left border">Batch No *</th>
                      <th className="w-32 p-2 text-left border">Mfg Date</th>
                      <th className="w-32 p-2 text-left border">Expiry Date *</th>
                      <th className="w-24 p-2 text-left border">Quantity *</th>
                      <th className="w-24 p-2 text-left border">Min Stock</th>
                      <th className="w-24 p-2 text-left border">PTR *</th>
                      <th className="w-24 p-2 text-left border">PTS *</th>
                      <th className="w-20 p-2 text-left border">Tax %</th>
                      <th className="w-32 p-2 text-left border">Rack No</th>
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
                              row.product_code ? 'bg-blue-50' : ''
                        }
                      >
                        <td className="p-1 border">
                          <Popover 
                            open={openDropdownIndex === index} 
                            onOpenChange={(open) => {
                              if (open) {
                                setOpenDropdownIndex(index);
                              } else {
                                setOpenDropdownIndex(null);
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="justify-between w-full h-8 text-xs"
                              >
                                {row.product_code
                                  ? products.find((p) => p.product_code === row.product_code)?.generic_name
                                  : "Select medicine..."}
                                <ChevronsUpDown className="w-3 h-3 ml-2 opacity-50 shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search medicines..." />
                                <CommandList>
                                  <CommandEmpty>No medicine found.</CommandEmpty>
                                  <CommandGroup>
                                    {products.map((p) => (
                                      <CommandItem
                                        key={p.product_code}
                                        value={`${p.product_code} ${p.generic_name} ${p.brand_name || ''}`}
                                        onSelect={() => {
                                          updateBulkField(index, 'product_code', p.product_code);
                                          setOpenDropdownIndex(null);
                                        }}
                                      >
                                        {p.product_code} - {p.generic_name} ({p.unit_size})
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-batch_number`] = el)}
                            value={row.batch_number}
                            onChange={(e) => updateBulkField(index, 'batch_number', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'batch_number')}
                            placeholder="Batch No"
                            className="text-xs"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-manufacturing_date`] = el)}
                            type="date"
                            value={row.manufacturing_date}
                            onChange={(e) => updateBulkField(index, 'manufacturing_date', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'manufacturing_date')}
                            className="text-xs"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-expiry_date`] = el)}
                            type="date"
                            value={row.expiry_date}
                            onChange={(e) => updateBulkField(index, 'expiry_date', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'expiry_date')}
                            className="text-xs"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-quantity`] = el)}
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateBulkField(index, 'quantity', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'quantity')}
                            placeholder="Qty"
                            className="text-xs"
                            min="0"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-minimum_stock`] = el)}
                            type="number"
                            value={row.minimum_stock}
                            onChange={(e) => updateBulkField(index, 'minimum_stock', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'minimum_stock')}
                            placeholder="Min"
                            className="text-xs"
                            min="0"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-ptr`] = el)}
                            type="number"
                            step="0.01"
                            value={row.ptr}
                            onChange={(e) => updateBulkField(index, 'ptr', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'ptr')}
                            placeholder="Cost"
                            className="text-xs"
                            min="0"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-pts`] = el)}
                            type="number"
                            step="0.01"
                            value={row.pts}
                            onChange={(e) => updateBulkField(index, 'pts', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'pts')}
                            placeholder="Selling"
                            className="text-xs"
                            min="0"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-tax_rate`] = el)}
                            type="number" 
                            step="0.01"
                            value={row.tax_rate}
                            onChange={(e) => updateBulkField(index, 'tax_rate', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'tax_rate')}
                            placeholder="%"
                            className="text-xs"
                            min="0"
                            max="100"
                          />
                        </td>
                        <td className="p-1 border">
                          <Input
                            ref={(el) => (inputRefs.current[`${index}-rack_no`] = el)}
                            value={row.rack_no}
                            onChange={(e) => updateBulkField(index, 'rack_no', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index, 'rack_no')}
                            placeholder="Rack/Shelf"
                            className="text-xs"
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
                  <p>• Rows with selected medicines are highlighted</p>
                  <p>• Only complete rows will be processed</p>
                  <p>• Schedule applies to all items in this form</p>
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
                        <span>Medicine Only: {bulkStockForm.filter(row => row.product_code && !isRowPartial(row) && !isRowComplete(row)).length}</span>
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      Will add: {bulkStockForm.filter(isRowComplete).length} items
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => {
                    setBulkStockForm(
                      Array(10).fill().map(() => ({
                        product_code: '',
                        batch_number: '',
                        manufacturing_date: '',
                        expiry_date: '',
                        quantity: '',
                        minimum_stock: '',
                        ptr: '',
                        pts: '',
                        tax_rate: '',
                        rack_no: '',
                      }))
                    );
                  }}>
                    Clear All
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setShowAddStock(false)}>
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
          </CardContent>
        </Card>
      ) : (
        /* Inventory Table */
        <Card>
          <CardHeader>
            <CardTitle>Medicine Inventory</CardTitle>
            <CardDescription>
              Total {Object.keys(groupedItems).length || 0} medicines in stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border rounded-md">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[300px]">Medicine</TableHead>
                    <TableHead className="text-right">Batches</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedItems).map(([productCode, groupData]) => (
                    <ProductRow
                      key={productCode}
                      product={groupData.product}
                      batches={groupData.batches}
                      onEdit={handleEditStock}
                      onDelete={handleDeleteStock}
                    />
                  ))}
                  {Object.keys(groupedItems).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="py-4 text-center text-muted-foreground">
                        No medicines found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Stock Dialog */}
      <Dialog open={showEditStock} onOpenChange={setShowEditStock}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Medicine Stock</DialogTitle>
            <DialogDescription>
              Update medicine details and stock information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product_code">Medicine *</Label>
                <Popover open={openProductDropdown} onOpenChange={setOpenProductDropdown}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProductDropdown}
                      className="justify-between w-full"
                    >
                      {stockForm.product_code
                        ? products.find((p) => p.product_code === stockForm.product_code)?.generic_name
                        : "Select medicine..."}
                      <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search medicines..." />
                      <CommandList>
                        <CommandEmpty>No medicine found.</CommandEmpty>
                        <CommandGroup>
                          {products.map((p) => (
                            <CommandItem
                              key={p.product_code}
                              value={`${p.product_code} ${p.generic_name} ${p.brand_name || ''}`}
                              onSelect={() => {
                                setStockForm({ ...stockForm, product_code: p.product_code });
                                setOpenProductDropdown(false);
                              }}
                            >
                              {p.product_code} - {p.generic_name} ({p.unit_size})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              <div className="space-y-2">
                <Label htmlFor="edit_mrp">MRP</Label>
                <Input
                  id="edit_mrp"
                  type="number"
                  value={stockForm.mrp}
                  onChange={(e) => setStockForm({ ...stockForm, mrp: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit_schedule">Schedule</Label>
                <Select
                  value={stockForm.schedule}
                  onValueChange={(value) => setStockForm({ ...stockForm, schedule: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Schedule G">Schedule G</SelectItem>
                    <SelectItem value="Schedule C">Schedule C</SelectItem>
                    <SelectItem value="Schedule C1">Schedule C1</SelectItem>
                    <SelectItem value="Schedule F">Schedule F</SelectItem>
                    <SelectItem value="Schedule J">Schedule J</SelectItem>
                    <SelectItem value="Schedule K">Schedule K</SelectItem>
                    <SelectItem value="Schedule H">Schedule H</SelectItem>
                    <SelectItem value="Schedule H1">Schedule H1</SelectItem>
                    <SelectItem value="Schedule X">Schedule X</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_rack_no">Rack/Shelf No</Label>
                <Input
                  id="edit_rack_no"
                  value={stockForm.rack_no}
                  onChange={(e) => setStockForm({ ...stockForm, rack_no: e.target.value })}
                  placeholder="Rack or Shelf Number"
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
            <DialogTitle>Import Medicines from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to import medicines into your pharmacy inventory
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
                CSV should have columns: product_code, generic_name, unit_size, mrp, hsn_code, category, batch_number, manufacturing_date, expiry_date, quantity, minimum_stock, ptr, pts, tax_rate, schedule, rack_no
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowImport(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="medical">
                Import Medicines
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
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

      <ToastProvider swipeDirection="right">
        {toast.open && (
          <Toast variant={toast.variant} open={toast.open} onOpenChange={(open) => setToast({ ...toast, open })}>
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>
    </div>
  );
};

export default Inventory;
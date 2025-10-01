// src/pages/PurchaseOrders.jsx
import { useState, useEffect, useRef } from "react";
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
import { Textarea } from "../components/ui/textarea";
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
  Info,
  List,
} from "lucide-react";
import {
  useGetConnectedDistributorsQuery,
  useSearchMedicinesQuery,
  useGetDistributorStockQuery,
  useCreateOrderMutation,
  useGetRetailerOrdersQuery,
  useGetDCItemsQuery,
  useCreateDCItemsBulkMutation,
  useUpdateDCItemMutation,
  useDeleteDCItemMutation,
  useVerifyOrderMutation,
  useCreateDisputeMutation,
} from "../services/retailerOrdersApi";

// Helper function to safely format dates
const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  } catch {
    return '—';
  }
};

const PurchaseOrders = () => {
  const dispatch = useDispatch();
  const [orderBy, setOrderBy] = useState("product");
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [currentInvoiceNumber, setCurrentInvoiceNumber] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedDisputeItem, setSelectedDisputeItem] = useState("");
  const [disputeType, setDisputeType] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");

  // D/C States
  const [showAddDCStock, setShowAddDCStock] = useState(false);
  const [showEditDCDialog, setShowEditDCDialog] = useState(false);
  const [showViewDCDialog, setShowViewDCDialog] = useState(false);
  const [editingDCItem, setEditingDCItem] = useState(null);
  const [viewingDCItem, setViewingDCItem] = useState(null);
  
  // Initialize with 5 empty rows
  const [bulkDCForm, setBulkDCForm] = useState(
    Array(5).fill().map(() => ({
      product_name: '',
      batch_number: '',
      manufacturing_date: '',
      expiry_date: '',
      quantity: '',
      mrp: '',
      rate: '',
      tax_rate: '12',
    }))
  );
  
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [globalDistributor, setGlobalDistributor] = useState('');

  // API hooks
  const {
    data: dcItemsData,
    isLoading: isDCItemsLoading,
    refetch: refetchDCItems
  } = useGetDCItemsQuery();
  const [verifyOrder] = useVerifyOrderMutation();
  const [createDispute] = useCreateDisputeMutation();
  const [orderItems, setOrderItems] = useState([]);

  const dcItems = dcItemsData?.data || [];

  const { data: distributorsData } = useGetConnectedDistributorsQuery();
  const distributors = distributorsData?.data?.filter(dist => dist.name && dist.name.trim() !== '') || [];
  const [stockParams, setStockParams] = useState({ distributorId: 'all', search: '', page: 1, limit: 20 });
  const { data: stockData } = useGetDistributorStockQuery(stockParams);
  const { data: searchData } = useSearchMedicinesQuery(
    { search: searchQuery, distributorId: selectedDistributor || '' },
    { skip: !searchQuery }
  );
  const { data: ordersData, refetch: refetchOrders, isLoading: isOrdersLoading } = useGetRetailerOrdersQuery({ status: 'all', page: 1, limit: 100 });
  const allOrders = ordersData?.data?.orders || [];
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  // D/C Mutations
  const [createDCItemsBulk] = useCreateDCItemsBulkMutation();
  const [updateDCItem] = useUpdateDCItemMutation();
  const [deleteDCItem] = useDeleteDCItemMutation();

  const filteredProducts = searchData?.data || [];
  const invoicedOrders = allOrders.filter(order =>
    ['confirmed', 'processing', 'pending'].includes(order.status)
  );
  const filteredInvoices = invoicedOrders.filter(order =>
    order.order_number.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
    (order.invoice_number || '').toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
    order.Distributor?.name.toLowerCase().includes(invoiceSearchQuery.toLowerCase())
  );

  const inputRefs = useRef([]);

  // Order Functions (keep your existing order functions)
  const addProductToOrder = (product, quantity = 1) => {
    const availableStock = product.total_available_stock;
    if (availableStock <= 0) {
      toast.error(`${product.product.name} is out of stock.`);
      return;
    }
    const existingItemIndex = orderItems.findIndex(
      item => item.productCode === product.product_code && item.distributor_id === product.distributor.id
    );
    const alreadyAdded = existingItemIndex !== -1 ? orderItems[existingItemIndex].qty : 0;
    const remaining = availableStock - alreadyAdded;
    if (quantity <= 0) {
      toast.error("Quantity must be at least 1");
      return;
    }
    if (quantity > remaining) {
      toast.error(`Only ${remaining} unit(s) available for ${product.product.name}.`);
      return;
    }
    if (existingItemIndex !== -1) {
      setOrderItems(prev => prev.map((item, i) =>
        i === existingItemIndex
          ? {
            ...item,
            qty: item.qty + quantity,
            netValue: Math.round((item.qty + quantity) * item.rate * (1 + item.tax / 100))
          }
          : item
      ));
    } else {
      const newItem = {
        productCode: product.product_code,
        name: product.product.name,
        qty: quantity,
        rate: product.pricing.ptr,
        mrp: product.product.mrp,
        tax: product.pricing.tax_rate || 12,
        scheme: { free: 0, total: quantity },
        netValue: Math.round(quantity * product.pricing.ptr * (1 + (product.pricing.tax_rate || 12) / 100)),
        distributor_id: product.distributor.id,
        distributor_name: product.distributor.name,
      };
      setOrderItems(prev => [...prev, newItem]);
    }
    toast.success(`${product.product.name} (${quantity} qty) added to order`);
  };

  const updateOrderItem = (index, field, value) => {
    setOrderItems(prev => prev.map((item, i) => {
      if (i === index) {
        // Prevent negative values
        const sanitizedValue = field === 'qty' || field === 'rate' || field === 'tax'
          ? Math.max(0, value)
          : value;
        const updatedItem = { ...item, [field]: sanitizedValue };
        if (field === 'qty' || field === 'rate' || field === 'tax') {
          updatedItem.netValue = Math.round(updatedItem.qty * updatedItem.rate * (1 + updatedItem.tax / 100));
          updatedItem.scheme = { ...updatedItem.scheme, total: updatedItem.qty + updatedItem.scheme.free };
        }
        return updatedItem;
      }
      return item;
    }));
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
    const uniqueDistributors = [...new Set(orderItems.map(item => item.distributor_id))];
    if (uniqueDistributors.length > 1) {
      toast.error("All items must be from the same distributor");
      return;
    }
    const orderPayload = {
      distributorId: orderItems[0].distributor_id,
      items: orderItems.map(item => ({
        product_code: item.productCode,
        quantity: item.qty,
      })),
      notes: "Order created from Purchase Orders page",
    };
    setIsSubmitting(true);
    try {
      const result = await createOrder(orderPayload).unwrap();
      const invoiceNumber = result.data.order.order_number;
      setCurrentInvoiceNumber(invoiceNumber);
      toast.success(`Order submitted successfully! Order ID: ${invoiceNumber}`);
      setOrderItems([]);
      setSelectedDistributor("");
      refetchOrders();
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
      invoiceNo: currentInvoiceNumber || `PO-${Date.now()}`,
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
      setCurrentInvoiceNumber("");
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
Invoice No: ${currentInvoiceNumber || `PO-${Date.now()}`}
Distributor: ${orderItems[0]?.distributor_name || 'Not Selected'}
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
            <h2>Invoice No: ${currentInvoiceNumber || `PO-${Date.now()}`}</h2>
          </div>
          <div class="info">
            <p><strong>Distributor:</strong> ${orderItems[0]?.distributor_name || 'Not Selected'}</p>
            <p><strong>Order By:</strong> ${orderBy}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Name</th>
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

  const handleCreateDispute = async () => {
    if (!disputeType || !disputeDescription) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await createDispute({
        orderId: currentOrder.order_id,
        itemId: selectedDisputeItem === "order" ? null : selectedDisputeItem,
        issueType: disputeType,
        description: disputeDescription
      }).unwrap();
      toast.success("Dispute reported successfully!");
      setShowDisputeDialog(false);
      setDisputeType("");
      setDisputeDescription("");
      setSelectedDisputeItem("");
      refetchOrders();
    } catch (err) {
      toast.error(err.data?.message || "Failed to report dispute");
    }
  };

  // D/C Functions
  const columns = [
    "product_name",
    "batch_number",
    "manufacturing_date",
    "expiry_date",
    "quantity",
    "mrp",
    "rate",
    "tax_rate",
  ];

  const handleKeyDown = (e, rowIndex, column) => {
    const colIndex = columns.indexOf(column);
    const nextRowIndex = rowIndex + 1;
    const prevRowIndex = rowIndex - 1;
    
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (colIndex === columns.length - 1) {
          if (nextRowIndex >= bulkDCForm.length) {
            addNewDCRow();
          } else {
            const nextInputKey = `${nextRowIndex}-product_name`;
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
        if (nextRowIndex < bulkDCForm.length) {
          const nextInputKey = `${nextRowIndex}-${column}`;
          inputRefs.current[nextInputKey]?.focus();
        } else {
          addNewDCRow();
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

  const addNewDCRow = () => {
    setBulkDCForm(prev => [
      ...prev,
      {
        product_name: '',
        batch_number: '',
        manufacturing_date: '',
        expiry_date: '',
        quantity: '',
        mrp: '',
        rate: '',
        tax_rate: '12',
      },
    ]);
  };

  const removeDCRow = (index) => {
    if (bulkDCForm.length <= 1) return;
    const newForm = [...bulkDCForm];
    newForm.splice(index, 1);
    setBulkDCForm(newForm);
  };

  const updateBulkDCField = (index, field, value) => {
    const newForm = [...bulkDCForm];
    newForm[index] = { ...newForm[index], [field]: value };
    setBulkDCForm(newForm);
  };

  // FIXED: Handle both string and number values properly
  const isDCRowComplete = (row) => {
    const productName = String(row.product_name || '').trim();
    const quantity = String(row.quantity || '').trim();
    const rate = String(row.rate || '').trim();
    const mrp = String(row.mrp || '').trim();
    const distributor = String(globalDistributor || '').trim();
    
    return productName !== '' &&
      quantity !== '' &&
      rate !== '' &&
      mrp !== '' &&
      distributor !== '';
  };

  const isDCRowPartial = (row) => {
    const productName = String(row.product_name || '').trim();
    const quantity = String(row.quantity || '').trim();
    const rate = String(row.rate || '').trim();
    const mrp = String(row.mrp || '').trim();
    
    return productName !== '' &&
      (!quantity || !rate || !mrp);
  };

  // FIXED: Only process complete rows and ignore empty ones
  const handleBulkAddDCItems = async (e) => {
    e.preventDefault();
    try {
      // Filter only complete rows (ignore empty ones)
      const itemsToProcess = bulkDCForm.filter(item => {
        const productName = String(item.product_name || '').trim();
        const quantity = String(item.quantity || '').trim();
        const rate = String(item.rate || '').trim();
        const mrp = String(item.mrp || '').trim();
        
        return productName && quantity && rate && mrp;
      });

      if (itemsToProcess.length === 0) {
        toast.error("Please fill at least one complete row with all required information");
        return;
      }

      if (!globalDistributor.trim()) {
        toast.error("Please enter distributor name");
        return;
      }

      const payload = {
        distributor_name: globalDistributor,
        items: itemsToProcess.map(item => ({
          product_name: String(item.product_name || '').trim(),
          batch_number: String(item.batch_number || '').trim(),
          manufacturing_date: item.manufacturing_date,
          expiry_date: item.expiry_date,
          quantity: parseInt(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          mrp: parseFloat(item.mrp) || 0,
          tax_rate: parseFloat(item.tax_rate) || 12,
        }))
      };

      setIsSubmittingBulk(true);
      const result = await createDCItemsBulk(payload).unwrap();
      
      toast.success(`Successfully added ${itemsToProcess.length} D/C item(s)!`);
      // Reset to 5 empty rows after successful submission
      setBulkDCForm(
        Array(5).fill().map(() => ({
          product_name: '',
          batch_number: '',
          manufacturing_date: '',
          expiry_date: '',
          quantity: '',
          mrp: '',
          rate: '',
          tax_rate: '12',
        }))
      );
      setGlobalDistributor('');
      setShowAddDCStock(false);
      refetchDCItems();
    } catch (err) {
      console.error('Failed to add bulk D/C items:', err);
      toast.error(err.data?.message || "Failed to add D/C items. Please try again.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // FIXED: Only show existing items in edit, no extra empty row
  const handleEditDCItem = (item) => {
    // Initialize edit form with ONLY existing items (no extra empty row)
    const editForm = (item.Details || []).map(detail => ({
      product_name: detail.product_name || '',
      batch_number: detail.batch_number || '',
      manufacturing_date: detail.manufacturing_date || '',
      expiry_date: detail.expiry_date || '',
      quantity: detail.quantity || '',
      mrp: detail.mrp || '',
      rate: detail.rate || '',
      tax_rate: detail.tax_rate || '12',
    }));
    
    setEditingDCItem({
      ...item,
      editForm: editForm
    });
    setShowEditDCDialog(true);
  };

  const handleUpdateDCItem = async () => {
    if (!editingDCItem) return;
    
    try {
      // Filter out empty rows (where product_name is empty)
      const itemsToUpdate = editingDCItem.editForm.filter(item => {
        const productName = String(item.product_name || '').trim();
        const quantity = String(item.quantity || '').trim();
        const rate = String(item.rate || '').trim();
        const mrp = String(item.mrp || '').trim();
        
        return productName !== '' && quantity !== '' && rate !== '' && mrp !== '';
      });

      if (itemsToUpdate.length === 0) {
        toast.error("Please fill at least one complete item");
        return;
      }

      const payload = {
        distributor_name: editingDCItem.distributor_name,
        items: itemsToUpdate.map(item => ({
          product_name: String(item.product_name || '').trim(),
          batch_number: String(item.batch_number || '').trim(),
          manufacturing_date: item.manufacturing_date,
          expiry_date: item.expiry_date,
          quantity: parseInt(item.quantity) || 0,
          rate: parseFloat(item.rate) || 0,
          mrp: parseFloat(item.mrp) || 0,
          tax_rate: parseFloat(item.tax_rate) || 12,
        }))
      };
      
      await updateDCItem({ id: editingDCItem.dc_id, data: payload }).unwrap();
      toast.success("D/C item updated successfully!");
      setShowEditDCDialog(false);
      setEditingDCItem(null);
      refetchDCItems();
    } catch (err) {
      toast.error(err.data?.message || "Failed to update item");
    }
  };

  const handleDeleteDCItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this D/C item?')) {
      try {
        await deleteDCItem(id).unwrap();
        refetchDCItems();
        toast.success("D/C item deleted successfully.");
      } catch (err) {
        console.error('Failed to delete D/C item:', err);
        toast.error("Failed to delete D/C item. Please try again.");
      }
    }
  };

  const handleViewDCItem = (item) => {
    setViewingDCItem(item);
    setShowViewDCDialog(true);
  };

  const handlePrintDCItem = (item) => {
    const printContent = `
      <html>
        <head>
          <title>D/C Item Details</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 10px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>D/C ITEM DETAILS</h1>
            <h3>Distributor: ${item.distributor_name}</h3>
            <p>Date: ${formatDate(item.created_at)}</p>
            ${item.order_number ? `<p>Order No: ${item.order_number}</p>` : ''}
          </div>
          
          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Items:</strong> ${item.Details?.length || 0}</p>
            <p><strong>Total Quantity:</strong> ${item.Details?.reduce((sum, detail) => sum + (detail.quantity || 0), 0) || 0}</p>
            <p><strong>Total Value:</strong> ₹${item.Details?.reduce((sum, detail) => sum + (detail.quantity * detail.rate || 0), 0).toFixed(2) || '0.00'}</p>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Batch Number</th>
                <th>Manufacturing Date</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Rate (₹)</th>
                <th>MRP (₹)</th>
                <th>Tax Rate</th>
                <th>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${item.Details && item.Details.map(detail => `
                <tr>
                  <td>${detail.product_name}</td>
                  <td>${detail.batch_number || '—'}</td>
                  <td>${formatDate(detail.manufacturing_date)}</td>
                  <td>${formatDate(detail.expiry_date)}</td>
                  <td>${detail.quantity}</td>
                  <td>${Number(detail.rate).toFixed(2)}</td>
                  <td>${Number(detail.mrp).toFixed(2)}</td>
                  <td>${detail.tax_rate}%</td>
                  <td>${(detail.quantity * detail.rate).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <p><strong>Printed on:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Edit Form Functions
  const addNewEditRow = () => {
    if (!editingDCItem) return;
    
    setEditingDCItem(prev => ({
      ...prev,
      editForm: [
        ...prev.editForm,
        {
          product_name: '',
          batch_number: '',
          manufacturing_date: '',
          expiry_date: '',
          quantity: '',
          mrp: '',
          rate: '',
          tax_rate: '12',
        }
      ]
    }));
  };

  const removeEditRow = (index) => {
    if (!editingDCItem || editingDCItem.editForm.length <= 1) return;
    
    setEditingDCItem(prev => ({
      ...prev,
      editForm: prev.editForm.filter((_, i) => i !== index)
    }));
  };

  const updateEditField = (index, field, value) => {
    if (!editingDCItem) return;
    
    setEditingDCItem(prev => ({
      ...prev,
      editForm: prev.editForm.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // FIXED: Handle both string and number values properly
  const isEditRowComplete = (row) => {
    const productName = String(row.product_name || '').trim();
    const quantity = String(row.quantity || '').trim();
    const rate = String(row.rate || '').trim();
    const mrp = String(row.mrp || '').trim();
    
    return productName !== '' &&
      quantity !== '' &&
      rate !== '' &&
      mrp !== '';
  };

  return (
    <div className="space-y-6">
      {/* Order Details Section */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          {currentInvoiceNumber && (
            <CardDescription className="font-semibold text-green-600">
              Last Order Number: {currentInvoiceNumber}
            </CardDescription>
          )}
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
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search products, distributors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {searchQuery && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-2 overflow-y-auto max-h-48">
                  {filteredProducts.map((product, index) => {
                    const stock = product.total_available_stock || 0;
                    const isOutOfStock = stock <= 0;
                    const ptr = product.pricing?.ptr || 0;
                    return (
                      <div
                        key={`${product.product_code}-${product.distributor.id}`}
                        className={`flex items-center justify-between p-2 rounded ${isOutOfStock ? 'bg-red-50 border border-red-200' : 'hover:bg-accent'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className={`font-medium ${isOutOfStock ? 'text-red-600' : ''}`}>
                              {product.product.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Product Code: {product.product_code}
                            </span>
                            <span className="text-xs text-muted-foreground">MRP: ₹{product.product.mrp}</span>
                            <span className="text-xs text-muted-foreground">PTR: ₹{ptr}</span>
                            <span className={`text-xs font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                              Stock: {stock}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {product.distributor.name}
                          </p>
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
                              addProductToOrder(product, 1);
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

      <Tabs defaultValue="order" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order">Order Items</TabsTrigger>
          <TabsTrigger value="dc">D/C Items ({dcItems.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoicedOrders.length})</TabsTrigger>
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
                  <Button onClick={handleSubmitOrder} disabled={isSubmitting || isCreatingOrder || orderItems.length === 0}>
                    {isSubmitting || isCreatingOrder ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                    {isSubmitting || isCreatingOrder ? 'Submitting...' : 'Submit Order'}
                  </Button>
                  <Button variant="outline" onClick={handlePrintOrder} disabled={isPrinting || orderItems.length === 0}>
                    {isPrinting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                    {isPrinting ? 'Printing...' : 'Print'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* D/C Tab - Fixed */}
        <TabsContent value="dc">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>D/C Items</CardTitle>
                  <CardDescription>
                    Add stock without distributor bill. Fill required fields (*). Empty rows will be ignored.
                  </CardDescription>
                </div>
                <Button
                  variant="medical"
                  onClick={() => setShowAddDCStock(!showAddDCStock)}
                >
                  {showAddDCStock ? (
                    <>
                      <List className="w-4 h-4 mr-2" />
                      View D/C Items
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add D/C Items
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddDCStock ? (
                /* Bulk Add D/C Form */
                <Card>
                  <CardHeader>
                    <CardTitle>Add New D/C Items</CardTitle>
                    <CardDescription>
                      Add medicines to your D/C inventory. Fill required fields (*). Empty rows will be ignored automatically.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBulkAddDCItems} className="space-y-4">
                      {/* Manual Distributor Input */}
                      <div className="mb-4">
                        <Label htmlFor="global-distributor">Distributor Name *</Label>
                        <Input
                          id="global-distributor"
                          value={globalDistributor}
                          onChange={(e) => setGlobalDistributor(e.target.value)}
                          placeholder="Enter distributor name"
                          required
                        />
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-muted">
                              <th className="w-48 p-2 text-left border">Product Name *</th>
                              <th className="w-32 p-2 text-left border">Batch No</th>
                              <th className="w-32 p-2 text-left border">Mfg Date</th>
                              <th className="w-32 p-2 text-left border">Expiry Date</th>
                              <th className="w-24 p-2 text-left border">Qty *</th>
                              <th className="w-24 p-2 text-left border">MRP *</th>
                              <th className="w-24 p-2 text-left border">Rate *</th>
                              <th className="w-20 p-2 text-left border">Tax %</th>
                              <th className="w-16 p-2 text-left border">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkDCForm.map((row, index) => (
                              <tr
                                key={index}
                                className={
                                  isDCRowComplete(row) ? 'bg-green-50' :
                                  isDCRowPartial(row) ? 'bg-yellow-50' :
                                  row.product_name ? 'bg-blue-50' : ''
                                }
                              >
                                <td className="p-1 border">
                                  <Input
                                    ref={(el) => (inputRefs.current[`${index}-product_name`] = el)}
                                    value={row.product_name}
                                    onChange={(e) => updateBulkDCField(index, 'product_name', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'product_name')}
                                    placeholder="Medicine name"
                                    className="text-xs"
                                  />
                                </td>
                                <td className="p-1 border">
                                  <Input
                                    ref={(el) => (inputRefs.current[`${index}-batch_number`] = el)}
                                    value={row.batch_number}
                                    onChange={(e) => updateBulkDCField(index, 'batch_number', e.target.value)}
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
                                    onChange={(e) => updateBulkDCField(index, 'manufacturing_date', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'manufacturing_date')}
                                    className="text-xs"
                                  />
                                </td>
                                <td className="p-1 border">
                                  <Input
                                    ref={(el) => (inputRefs.current[`${index}-expiry_date`] = el)}
                                    type="date"
                                    value={row.expiry_date}
                                    onChange={(e) => updateBulkDCField(index, 'expiry_date', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'expiry_date')}
                                    className="text-xs"
                                  />
                                </td>
                                <td className="p-1 border">
                                  <Input
                                    ref={(el) => (inputRefs.current[`${index}-quantity`] = el)}
                                    type="number"
                                    value={row.quantity}
                                    onChange={(e) => updateBulkDCField(index, 'quantity', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'quantity')}
                                    placeholder="Qty"
                                    className="text-xs"
                                    min="1"
                                  />
                                </td>
                                <td className="p-1 border">
                                  <Input
                                    ref={(el) => (inputRefs.current[`${index}-mrp`] = el)}
                                    type="number"
                                    step="0.01"
                                    value={row.mrp}
                                    onChange={(e) => updateBulkDCField(index, 'mrp', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'mrp')}
                                    placeholder="MRP"
                                    className="text-xs"
                                    min="0"
                                  />
                                </td>
                                <td className="p-1 border">
                                  <Input
                                    ref={(el) => (inputRefs.current[`${index}-rate`] = el)}
                                    type="number"
                                    step="0.01"
                                    value={row.rate}
                                    onChange={(e) => updateBulkDCField(index, 'rate', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'rate')}
                                    placeholder="Rate"
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
                                    onChange={(e) => updateBulkDCField(index, 'tax_rate', e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'tax_rate')}
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
                                    onClick={() => removeDCRow(index)}
                                    disabled={bulkDCForm.length <= 1}
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
                          <p>• Only complete rows (green) will be processed</p>
                          <p>• Empty and incomplete rows will be ignored</p>
                          <p>• Fill at least one complete row to proceed</p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" onClick={addNewDCRow} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Add Row
                          </Button>
                          <div className="flex items-center p-2 bg-gray-100 rounded">
                            <div className="text-sm">
                              <span className="flex items-center mr-4">
                                <div className="w-3 h-3 mr-1 bg-green-500 rounded-full"></div>
                                Complete: {bulkDCForm.filter(isDCRowComplete).length}
                              </span>
                            </div>
                            <div className="ml-4 text-sm font-medium">
                              Will add: {bulkDCForm.filter(isDCRowComplete).length} items
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-2 border-t">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowAddDCStock(false);
                            // Reset to 5 empty rows when canceling
                            setBulkDCForm(
                              Array(5).fill().map(() => ({
                                product_name: '',
                                batch_number: '',
                                manufacturing_date: '',
                                expiry_date: '',
                                quantity: '',
                                mrp: '',
                                rate: '',
                                tax_rate: '12',
                              }))
                            );
                            setGlobalDistributor('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="medical"
                          disabled={bulkDCForm.filter(isDCRowComplete).length === 0 || isSubmittingBulk || !globalDistributor}
                        >
                          {isSubmittingBulk ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Add {bulkDCForm.filter(isDCRowComplete).length} D/C Items
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                /* D/C Items Table */
                <>
                  {isDCItemsLoading ? (
                    <div className="py-4 text-center">
                      <RefreshCw className="w-4 h-4 mx-auto animate-spin" />
                      Loading D/C items...
                    </div>
                  ) : dcItems.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No D/C items added yet.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Distributor</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Items Count</TableHead>
                          <TableHead>Total Quantity</TableHead>
                          <TableHead>Total Value</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dcItems.map((item) => {
                          const totalQuantity = item.Details?.reduce((sum, detail) => sum + (detail.quantity || 0), 0) || 0;
                          const totalValue = item.Details?.reduce((sum, detail) => sum + (detail.quantity * detail.rate || 0), 0) || 0;
                          
                          return (
                            <TableRow key={item.dc_id}>
                              <TableCell className="font-medium">{item.distributor_name}</TableCell>
                              <TableCell>{formatDate(item.created_at)}</TableCell>
                              <TableCell>{item.Details?.length || 0}</TableCell>
                              <TableCell>{totalQuantity}</TableCell>
                              <TableCell>₹{totalValue.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewDCItem(item)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditDCItem(item)}
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePrintDCItem(item)}
                                  >
                                    <Printer className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteDCItem(item.dc_id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="shadow-medium">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Confirmed and processing purchase invoices</CardDescription>
                </div>
                <Button variant="outline" onClick={refetchOrders}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by order/invoice number or distributor..."
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
                    <TableHead>Order ID</TableHead>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Distributor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((order) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        {order.status === 'confirmed' ? (
                          <span className="font-mono">{order.invoice_number || '—'}</span>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{order.Distributor?.name}</TableCell>
                      <TableCell>{order.items?.length || 0}</TableCell>
                      <TableCell>₹{Number(order.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'processing'
                              ? 'success'
                              : order.status === 'confirmed'
                              ? 'default'
                              : order.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          {!order.is_verified && order.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCurrentOrder(order);
                                setShowDisputeDialog(true);
                              }}
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </Button>
                          )}
                          {!order.is_verified && order.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={async () => {
                                try {
                                  await verifyOrder(order.order_id).unwrap();
                                  toast.success('Order verified successfully!');
                                  refetchOrders();
                                } catch (err) {
                                  toast.error('Failed to verify order');
                                }
                              }}
                            >
                              Verify
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const content = `
                                <h2>Invoice: ${order.invoice_number || 'N/A'}</h2>
                                <p><strong>Order ID:</strong> ${order.order_number}</p>
                                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><strong>Distributor:</strong> ${order.Distributor?.name}</p>
                                <p><strong>Total:</strong> ₹${Number(order.total_amount || 0).toFixed(2)}</p>
                              `;
                              const w = window.open();
                              w.document.write(content);
                              w.print();
                              toast.success('Invoice printed!');
                            }}
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
                  {invoiceSearchQuery ? 'No invoices match your search.' : 'No confirmed or processing invoices yet.'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View D/C Item Dialog */}
      <Dialog open={showViewDCDialog} onOpenChange={setShowViewDCDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>D/C Item Details</DialogTitle>
            <DialogDescription>Complete D/C record information</DialogDescription>
          </DialogHeader>
          {viewingDCItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Distributor Information</h3>
                  <p><span className="font-medium">Name:</span> {viewingDCItem.distributor_name}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(viewingDCItem.created_at)}</p>
                  {viewingDCItem.order_number && (
                    <p><span className="font-medium">Order No:</span> {viewingDCItem.order_number}</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Summary</h3>
                  <p><span className="font-medium">Total Items:</span> {viewingDCItem.Details?.length || 0}</p>
                  <p><span className="font-medium">Total Quantity:</span> {viewingDCItem.Details?.reduce((sum, detail) => sum + (detail.quantity || 0), 0) || 0}</p>
                  <p><span className="font-medium">Total Value:</span> ₹{viewingDCItem.Details?.reduce((sum, detail) => sum + (detail.quantity * detail.rate || 0), 0).toFixed(2) || '0.00'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 font-semibold">Item Details</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Batch No</TableHead>
                      <TableHead>Mfg Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Tax %</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingDCItem.Details?.map((detail, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{detail.product_name}</TableCell>
                        <TableCell>{detail.batch_number || '—'}</TableCell>
                        <TableCell>
                          {formatDate(detail.manufacturing_date)}
                        </TableCell>
                        <TableCell>
                          {formatDate(detail.expiry_date)}
                        </TableCell>
                        <TableCell>{detail.quantity}</TableCell>
                        <TableCell>₹{Number(detail.rate).toFixed(2)}</TableCell>
                        <TableCell>₹{Number(detail.mrp).toFixed(2)}</TableCell>
                        <TableCell>{detail.tax_rate}%</TableCell>
                        <TableCell>₹{(detail.quantity * detail.rate).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handlePrintDCItem(viewingDCItem)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => setShowViewDCDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit D/C Item Dialog - FIXED: Only show existing items, no extra empty row */}
      <Dialog open={showEditDCDialog} onOpenChange={setShowEditDCDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit D/C Items</DialogTitle>
            <DialogDescription>
              Update existing items. Use "Add New Item" button to add more items.
            </DialogDescription>
          </DialogHeader>
          {editingDCItem && (
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateDCItem(); }} className="space-y-4">
              <div className="p-4 border rounded-lg">
                <Label htmlFor="edit_distributor_name" className="text-base font-semibold">Distributor Name *</Label>
                <Input
                  id="edit_distributor_name"
                  value={editingDCItem.distributor_name}
                  onChange={(e) => setEditingDCItem({ ...editingDCItem, distributor_name: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Items ({editingDCItem.editForm?.length || 0})
                  </h3>
                  <Button type="button" onClick={addNewEditRow} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add New Item
                  </Button>
                </div>
                
                {editingDCItem.editForm?.length === 0 ? (
                  <div className="p-8 text-center border rounded-lg">
                    <p className="text-muted-foreground">No items found. Click "Add New Item" to add items.</p>
                  </div>
                ) : (
                  editingDCItem.editForm?.map((item, index) => (
                    <div key={index} className="p-4 space-y-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">
                          {item.product_name ? `Item ${index + 1}: ${item.product_name}` : `New Item ${index + 1}`}
                        </h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeEditRow(index)}
                          disabled={editingDCItem.editForm.length <= 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`edit_product_name_${index}`}>Product Name *</Label>
                          <Input
                            id={`edit_product_name_${index}`}
                            value={item.product_name}
                            onChange={(e) => updateEditField(index, 'product_name', e.target.value)}
                            placeholder="Enter product name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_batch_number_${index}`}>Batch No</Label>
                          <Input
                            id={`edit_batch_number_${index}`}
                            value={item.batch_number}
                            onChange={(e) => updateEditField(index, 'batch_number', e.target.value)}
                            placeholder="Enter batch number"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_manufacturing_date_${index}`}>Manufacturing Date</Label>
                          <Input
                            id={`edit_manufacturing_date_${index}`}
                            type="date"
                            value={item.manufacturing_date || ''}
                            onChange={(e) => updateEditField(index, 'manufacturing_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_expiry_date_${index}`}>Expiry Date</Label>
                          <Input
                            id={`edit_expiry_date_${index}`}
                            type="date"
                            value={item.expiry_date || ''}
                            onChange={(e) => updateEditField(index, 'expiry_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_quantity_${index}`}>Quantity *</Label>
                          <Input
                            id={`edit_quantity_${index}`}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateEditField(index, 'quantity', e.target.value)}
                            placeholder="Enter quantity"
                            min="1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_rate_${index}`}>Rate (₹) *</Label>
                          <Input
                            id={`edit_rate_${index}`}
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateEditField(index, 'rate', e.target.value)}
                            placeholder="Enter rate"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_mrp_${index}`}>MRP (₹) *</Label>
                          <Input
                            id={`edit_mrp_${index}`}
                            type="number"
                            step="0.01"
                            value={item.mrp}
                            onChange={(e) => updateEditField(index, 'mrp', e.target.value)}
                            placeholder="Enter MRP"
                            min="0"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit_tax_rate_${index}`}>Tax Rate (%)</Label>
                          <Input
                            id={`edit_tax_rate_${index}`}
                            type="number"
                            step="0.01"
                            value={item.tax_rate}
                            onChange={(e) => updateEditField(index, 'tax_rate', e.target.value)}
                            placeholder="Enter tax rate"
                            min="0"
                            max="100"
                          />
                        </div>
                      </div>
                      
                      {isEditRowComplete(item) && (
                        <div className="p-2 border border-green-200 rounded bg-green-50">
                          <p className="text-sm font-medium text-green-800">
                            ✓ This item is complete and will be saved
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="text-sm text-muted-foreground">
                  <p>Complete items: {editingDCItem.editForm?.filter(isEditRowComplete).length}</p>
                  <p>Total items: {editingDCItem.editForm?.length}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowEditDCDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={editingDCItem.editForm?.filter(isEditRowComplete).length === 0}
                  >
                    Update D/C Items ({editingDCItem.editForm?.filter(isEditRowComplete).length})
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete order information</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Order Information</h3>
                  <p><span className="font-medium">Order ID:</span> {selectedOrder.order_number}</p>
                  <p><span className="font-medium">Invoice No:</span> {selectedOrder.invoice_number || '—'}</p>
                  <p><span className="font-medium">Status:</span> <Badge variant={selectedOrder.status === 'confirmed' ? 'default' : 'secondary'}>{selectedOrder.status}</Badge></p>
                  <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Distributor</h3>
                  <p>{selectedOrder.Distributor?.name}</p>
                  <p>{selectedOrder.Distributor?.address}</p>
                  <p>Phone: {selectedOrder.Distributor?.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {item.Product?.generic_name} ({item.product_code})
                        </TableCell>
                        <TableCell>{item.batch_number || '—'}</TableCell>
                        <TableCell>
                          {formatDate(item.expiry_date)}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{Number(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell>₹{Number(item.total_price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="font-bold text-right">
                Total Amount: ₹{Number(selectedOrder.total_amount).toFixed(2)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
            <DialogDescription>
              Select items with issues or report order-level problem
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select onValueChange={setSelectedDisputeItem}>
              <SelectTrigger>
                <SelectValue placeholder="Select item or 'Order Level'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="order">Order Level Issue</SelectItem>
                {currentOrder?.items?.map(item => (
                  <SelectItem key={item.item_id} value={item.item_id}>
                    {item.Product?.generic_name} ({item.quantity} qty)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setDisputeType}>
              <SelectTrigger>
                <SelectValue placeholder="Issue Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shortage">Shortage</SelectItem>
                <SelectItem value="expired">Expired Product</SelectItem>
                <SelectItem value="wrong_batch">Wrong Batch</SelectItem>
                <SelectItem value="damaged">Damaged Goods</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Describe the issue..."
              value={disputeDescription}
              onChange={(e) => setDisputeDescription(e.target.value)}
            />
            <Button
              onClick={handleCreateDispute}
              disabled={!disputeType || !disputeDescription}
            >
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrders;
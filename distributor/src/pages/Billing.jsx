// src/pages/Billing.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertTriangle,
  Clock,
  Send,
  CheckCircle,
  Search,
  Printer,
  Info,
  MessageCircle,
  Circle,
  Eye,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  useGetDistributorOrdersQuery,
  useGenerateInvoiceMutation,
  useGetDisputesQuery,
} from '../services/distributorOrdersApi';

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;
const formatDate = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('en-IN');
  } catch {
    return '—';
  }
};

const Billing = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('processing');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedDisputeOrder, setSelectedDisputeOrder] = useState(null);
  const [selectedOrderForBilling, setSelectedOrderForBilling] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);

  const { data, isLoading, error, refetch } = useGetDistributorOrdersQuery({
    status: 'all',
    page: 1,
    limit: 100,
  });

  const { data: disputesData, refetch: refetchDisputes } = useGetDisputesQuery({ status: 'open' });
  console.log('Fetched disputes data:', disputesData);
  
  const [generateInvoice] = useGenerateInvoiceMutation();
  const [selectedBatches, setSelectedBatches] = useState({});
  const [invoicedOrders, setInvoicedOrders] = useState(new Set());

  // Merge disputes with orders
  const allOrders = useMemo(() => {
    const orders = data?.data?.orders || [];
    const disputes = disputesData?.data || [];
    
    console.log('Raw orders:', orders);
    console.log('Raw disputes:', disputes);

    if (disputes.length === 0) return orders;

    // Create a map of order_id to disputes
    const disputesMap = {};
    disputes.forEach(dispute => {
      if (!disputesMap[dispute.order_id]) {
        disputesMap[dispute.order_id] = [];
      }
      disputesMap[dispute.order_id].push(dispute);
    });

    // Merge disputes into orders
    const mergedOrders = orders.map(order => ({
      ...order,
      disputes: disputesMap[order.order_id] || []
    }));

    console.log('Merged orders with disputes:', mergedOrders);
    return mergedOrders;
  }, [data, disputesData]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter(
      (order) =>
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.invoice_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.Retailer?.name || order.retailer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allOrders, searchQuery]);

  const processingOrders = useMemo(() => 
    filteredOrders.filter((order) => order.status === 'processing' && !order.is_manual),
    [filteredOrders]
  );

  const confirmedOrders = useMemo(() => 
    filteredOrders.filter((order) => order.status === 'confirmed'),
    [filteredOrders]
  );

  // Debug: Check which orders have disputes
  useEffect(() => {
    console.log('=== DISPUTES DEBUG ===');
    confirmedOrders.forEach(order => {
      if (order.disputes && order.disputes.length > 0) {
        console.log(`Order ${order.order_number} has ${order.disputes.length} disputes:`, order.disputes);
      }
    });
    
    const ordersWithDisputes = confirmedOrders.filter(order => 
      order.disputes && order.disputes.some(d => d.status === 'open')
    );
    console.log('Confirmed orders with open disputes:', ordersWithDisputes.length);
    console.log('=====================');
  }, [confirmedOrders]);

  const hasDisputeInConfirmed = useMemo(() => {
    const hasDisputes = confirmedOrders.some(order => 
      Array.isArray(order.disputes) && 
      order.disputes.some(d => d.status === 'open')
    );
    console.log('hasDisputeInConfirmed:', hasDisputes);
    return hasDisputes;
  }, [confirmedOrders]);

  // Initialize batch selections
  useEffect(() => {
    const newSelections = {};
    processingOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const key = `${order.order_id}-${item.item_id}`;
        if (!selectedBatches[key] && !invoicedOrders.has(order.order_id)) {
          if (item.available_batches?.length > 0) {
            newSelections[key] = item.available_batches[0].stock_id;
          }
        }
      });
    });
    
    if (Object.keys(newSelections).length > 0) {
      setSelectedBatches(prev => ({ ...prev, ...newSelections }));
    }
  }, [processingOrders, invoicedOrders]);

  const handleBatchSelect = (orderId, itemId, stockId) => {
    const key = `${orderId}-${itemId}`;
    setSelectedBatches(prev => ({ ...prev, [key]: stockId }));
  };

  const handleSendInvoice = async (order) => {
    if (order.is_manual) {
      toast.error('Manual orders cannot be invoiced through this system');
      return;
    }

    const items = order.items || [];
    const missing = items.some((item) => {
      const key = `${order.order_id}-${item.item_id}`;
      return !selectedBatches[key];
    });
    
    if (missing) {
      toast.error('Please select a batch for every product');
      return;
    }

    const payload = {
      order_id: order.order_id,
      items: items.map((item) => ({
        retailer_order_item_id: item.item_id,
        stock_id: selectedBatches[`${order.order_id}-${item.item_id}`],
        quantity: item.quantity,
      })),
    };

    try {
      const result = await generateInvoice(payload).unwrap();
      toast.success(`Invoice sent to ${order.Retailer?.name || 'retailer'}!`);
      setInvoicedOrders(prev => new Set([...prev, order.order_id]));
      
      // Clean up selections for this order
      const newSelections = { ...selectedBatches };
      order.items?.forEach((item) => {
        const key = `${order.order_id}-${item.item_id}`;
        delete newSelections[key];
      });
      setSelectedBatches(newSelections);
      
      refetch();
    } catch (err) {
      console.error('Invoice generation error:', err);
      toast.error(err.data?.message || 'Failed to generate invoice');
    }
  };

  const getBatchDisplay = (order, item) => {
    const key = `${order.order_id}-${item.item_id}`;
    const selectedStockId = selectedBatches[key];
    
    if (selectedStockId && order.status === 'processing' && !order.is_manual) {
      const batch = item.available_batches?.find((b) => b.stock_id === selectedStockId);
      if (batch) {
        return {
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          ptr: batch.ptr,
          current_stock: batch.current_stock,
        };
      }
    }
    
    if (item.batch_number) {
      return {
        batch_number: item.batch_number,
        expiry_date: item.expiry_date,
        ptr: item.unit_price,
        current_stock: null,
      };
    }
    
    return null;
  };

  const handlePrintInvoice = (order) => {
    const printContent = `
      <html>
        <head>
          <title>Invoice ${order.invoice_number || order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 10px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>${order.invoice_number || order.order_number}</h2>
            <p>Order: ${order.order_number}</p>
          </div>
          <div class="info">
            <p><strong>Retailer:</strong> ${order.Retailer?.name || order.retailer_name || '—'}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt || order.created_at)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            ${order.is_manual ? '<p><strong>Type:</strong> Manual Order</p>' : ''}
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Qty</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map((item) => {
                const batch = getBatchDisplay(order, item);
                const rate = batch?.ptr || item.unit_price || 0;
                const total = (rate * item.quantity).toFixed(2);
                const productName = item.Product?.generic_name || item.product_name || '—';
                const productCode = item.product_code || '—';
                
                return `
                  <tr>
                    <td>${productName}</td>
                    <td>${productCode}</td>
                    <td>${item.quantity}</td>
                    <td>${batch?.batch_number || '—'}</td>
                    <td>${batch?.expiry_date ? formatDate(batch.expiry_date) : '—'}</td>
                    <td>${formatCurrency(rate)}</td>
                    <td>${formatCurrency(total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const w = window.open();
    w.document.write(printContent);
    w.document.close();
    w.print();
  };

  const handleViewDispute = (order) => {
    console.log('Viewing dispute for order:', order);
    setSelectedDisputeOrder(order);
    setShowDisputeModal(true);
  };

  const handleViewBilling = (order) => {
    if (order.is_manual) {
      toast.info('Manual orders do not have detailed billing view');
      return;
    }
    setSelectedOrderForBilling(order);
    setShowBillingModal(true);
  };

  if (isLoading)
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="text-lg text-muted-foreground">Loading billing orders...</div>
      </div>
    );

  if (error)
    return (
      <div className="p-8">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-destructive" />
            <p className="font-medium text-destructive">Failed to load orders</p>
            <Button 
              onClick={refetch} 
              variant="outline" 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="p-4 mx-auto space-y-6 sm:p-6 max-w-7xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Billing Dashboard</h1>
        <p className="text-muted-foreground">Manage orders and invoices</p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by order/invoice number or retailer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={refetch} disabled={isLoading}>
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="processing">Processing ({processingOrders.length})</TabsTrigger>
          <TabsTrigger value="confirmed" className="relative">
            Confirmed ({confirmedOrders.length})
            {hasDisputeInConfirmed && (
              <Circle className="absolute w-2 h-2 text-red-500 fill-red-500 -top-1 -right-1" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Orders Ready for Billing</CardTitle>
              <CardDescription>Assign batches and send invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {processingOrders.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  No orders in processing
                </div>
              ) : (
                <div className="space-y-6">
                  {processingOrders.map((order) => {
                    const hasOpenDispute = Array.isArray(order.disputes) && 
                      order.disputes.some(d => d.status === 'open');
                    const items = order.items || [];
                    const allSelected = items.every(item => 
                      selectedBatches[`${order.order_id}-${item.item_id}`] || 
                      order.is_manual
                    );
                    const isSent = invoicedOrders.has(order.order_id);
                    const retailerName = order.Retailer?.name || order.retailer_name;

                    return (
                      <Card key={order.order_id} className="border rounded-lg">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">Order #{order.order_number}</span>
                                {order.invoice_number && (
                                  <Badge variant="outline" className="text-xs">
                                    Invoice: {order.invoice_number}
                                  </Badge>
                                )}
                                {order.is_manual && (
                                  <Badge variant="secondary" className="text-xs">
                                    Manual
                                  </Badge>
                                )}
                                {hasOpenDispute && (
                                  <Badge variant="destructive" className="flex items-center gap-1 px-2 py-0.5 text-xs">
                                    <MessageCircle className="w-3 h-3" />
                                    Dispute
                                  </Badge>
                                )}
                                {allSelected && !isSent && !order.is_manual && (
                                  <Badge variant="success" className="flex items-center gap-1 px-2 py-0.5 text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    Ready
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {retailerName} • <Clock className="inline w-3 h-3 mx-1" />
                                {formatDate(order.createdAt || order.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2 mt-1 sm:mt-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewBilling(order)}
                                disabled={order.is_manual}
                              >
                                <FileText className="w-4 h-4 mr-1" /> View Billing
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintInvoice(order)}
                              >
                                <Printer className="w-4 h-4 mr-1" /> Print
                              </Button>
                              {hasOpenDispute && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDispute(order)}
                                >
                                  <Eye className="w-4 h-4 mr-1" /> View Dispute
                                </Button>
                              )}
                              {!order.is_manual && (
                                <Button
                                  size="sm"
                                  onClick={() => handleSendInvoice(order)}
                                  disabled={!allSelected || isSent}
                                >
                                  <Send className="w-4 h-4 mr-1.5" /> Send Invoice
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {hasOpenDispute && (
                            <div className="flex items-start gap-2 p-3 mb-4 border border-yellow-200 rounded-md bg-yellow-50">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-800">
                                <strong>Dispute reported:</strong> Retailer has raised an issue with this order. 
                                Please review before billing.
                              </p>
                            </div>
                          )}
                          
                          {order.is_manual ? (
                            <div className="p-4 text-center border rounded-md bg-muted/20">
                              <Info className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Manual orders are processed separately and cannot be invoiced through this system.
                              </p>
                            </div>
                          ) : (
                            <div className="border rounded-md">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/40">
                                    <TableHead className="w-1/2">Product</TableHead>
                                    <TableHead className="w-12 text-center">Qty</TableHead>
                                    <TableHead className="w-1/2">Assign Batch</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {items.map((item) => {
                                    const batches = item.available_batches || [];
                                    const batchDisplay = getBatchDisplay(order, item);
                                    const productName = item.Product?.generic_name || item.product_name;
                                    const unitSize = item.Product?.unit_size;
                                    
                                    return (
                                      <TableRow key={item.item_id} className="hover:bg-muted/20">
                                        <TableCell>
                                          <div className="text-sm font-medium">{productName || '—'}</div>
                                          {unitSize && (
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                              {unitSize} • {item.product_code}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-center">
                                          {item.quantity}
                                        </TableCell>
                                        <TableCell>
                                          {batches.length === 0 ? (
                                            <div className="flex items-center gap-1.5 py-2 text-sm text-destructive">
                                              <AlertTriangle className="flex-shrink-0 w-4 h-4" />
                                              <span>No active batches</span>
                                            </div>
                                          ) : (
                                            <Select
                                              value={selectedBatches[`${order.order_id}-${item.item_id}`] || ''}
                                              onValueChange={(value) => handleBatchSelect(order.order_id, item.item_id, value)}
                                            >
                                              <SelectTrigger className="w-full h-10">
                                                {batchDisplay ? (
                                                  <div className="flex items-center gap-2 text-sm">
                                                    <Badge variant="outline" className="px-2 py-0.5 h-6 text-xs font-normal">
                                                      {batchDisplay.batch_number}
                                                    </Badge>
                                                    <span className="text-muted-foreground">
                                                      Exp: {batchDisplay.expiry_date ? formatDate(batchDisplay.expiry_date) : '—'} • 
                                                      Stock: {batchDisplay.current_stock}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <SelectValue placeholder="Select batch" />
                                                )}
                                              </SelectTrigger>
                                              <SelectContent className="max-h-60">
                                                {batches.map((batch) => {
                                                  const isInsufficient = batch.current_stock < item.quantity;
                                                  return (
                                                    <SelectItem 
                                                      key={batch.stock_id} 
                                                      value={batch.stock_id}
                                                      disabled={isInsufficient}
                                                      className={isInsufficient ? "text-destructive" : ""}
                                                    >
                                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-sm">
                                                        <Badge variant="secondary" className="px-2 py-0.5 h-6 text-xs">
                                                          {batch.batch_number}
                                                        </Badge>
                                                        <span className="text-muted-foreground">Exp: {formatDate(batch.expiry_date)}</span>
                                                        <span className="text-muted-foreground">PTR: {formatCurrency(batch.ptr)}</span>
                                                        <span className="text-muted-foreground">Stock: {batch.current_stock}</span>
                                                        {isInsufficient && (
                                                          <Badge variant="destructive" className="px-1.5 py-0.5 h-6 text-xs flex items-center gap-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Low stock
                                                          </Badge>
                                                        )}
                                                      </div>
                                                    </SelectItem>
                                                  );
                                                })}
                                              </SelectContent>
                                            </Select>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confirmed">
          <Card>
            <CardHeader>
              <CardTitle>Confirmed Invoices</CardTitle>
              <CardDescription>Finalized invoices sent to retailers</CardDescription>
            </CardHeader>
            <CardContent>
              {confirmedOrders.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">No confirmed invoices yet</div>
              ) : (
                <div className="space-y-6">
                  {confirmedOrders.map((order) => {
                    const hasOpenDispute = Array.isArray(order.disputes) && 
                      order.disputes.some(d => d.status === 'open');
                    const retailerName = order.Retailer?.name || order.retailer_name;

                    return (
                      <Card key={order.order_id} className="border rounded-lg">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium">Order #{order.order_number}</span>
                                {order.invoice_number && (
                                  <Badge variant="outline" className="text-xs">
                                    Invoice: {order.invoice_number}
                                  </Badge>
                                )}
                                {order.is_manual && (
                                  <Badge variant="secondary" className="text-xs">
                                    Manual
                                  </Badge>
                                )}
                                {hasOpenDispute && (
                                  <Badge variant="destructive" className="flex items-center gap-1 px-2 py-0.5 text-xs">
                                    <MessageCircle className="w-3 h-3" />
                                    Dispute
                                  </Badge>
                                )}
                                <Badge
                                  variant="default"
                                  className="flex items-center gap-1 px-2 py-0.5 text-xs"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Confirmed
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {retailerName} • <Clock className="inline w-3 h-3 mx-1" />
                                {formatDate(order.createdAt || order.created_at)}
                              </p>
                            </div>
                            <div className="flex gap-2 mt-1 sm:mt-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintInvoice(order)}
                              >
                                <Printer className="w-4 h-4 mr-1" /> Print
                              </Button>
                              {hasOpenDispute && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDispute(order)}
                                >
                                  <Eye className="w-4 h-4 mr-1" /> View Dispute
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {hasOpenDispute && (
                            <div className="flex items-start gap-2 p-3 mb-4 border border-yellow-200 rounded-md bg-yellow-50">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-800">
                                <strong>Dispute reported:</strong> Retailer has raised an issue with this order.
                              </p>
                            </div>
                          )}
                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/40">
                                  <TableHead className="w-1/2">Product</TableHead>
                                  <TableHead className="w-12 text-center">Qty</TableHead>
                                  <TableHead className="w-1/2">Batch Details</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(order.items || []).map((item) => {
                                  const batch = getBatchDisplay(order, item);
                                  const productName = item.Product?.generic_name || item.product_name;
                                  const unitSize = item.Product?.unit_size;
                                  
                                  return (
                                    <TableRow key={item.item_id} className="hover:bg-muted/20">
                                      <TableCell>
                                        <div className="text-sm font-medium">{productName || '—'}</div>
                                        {unitSize && (
                                          <div className="text-xs text-muted-foreground mt-0.5">
                                            {unitSize} • {item.product_code}
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-sm font-medium text-center">
                                        {item.quantity}
                                      </TableCell>
                                      <TableCell>
                                        {batch ? (
                                          <div className="text-sm">
                                            <Badge variant="outline" className="px-2 py-0.5 h-6 text-xs font-normal">
                                              {batch.batch_number}
                                            </Badge>
                                            {batch.expiry_date && (
                                              <span className="ml-2 text-xs text-muted-foreground">
                                                Exp: {formatDate(batch.expiry_date)}
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-sm text-muted-foreground">—</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispute View Modal - Read Only */}
      <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details - Order #{selectedDisputeOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedDisputeOrder && (
            <div className="space-y-6">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDisputeOrder.items?.map((item, idx) => {
                      const batch = getBatchDisplay(selectedDisputeOrder, item);
                      const productName = item.Product?.generic_name || item.product_name;
                      
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            {productName} ({item.product_code})
                          </TableCell>
                          <TableCell>{batch?.batch_number || '—'}</TableCell>
                          <TableCell>
                            {batch?.expiry_date ? formatDate(batch.expiry_date) : '—'}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell>{formatCurrency(item.total_price)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {selectedDisputeOrder.disputes?.length > 0 && (
                <div className="p-4 border border-red-200 rounded-md bg-red-50">
                  <h3 className="mb-3 font-semibold text-red-800">Dispute Information</h3>
                  {selectedDisputeOrder.disputes
                    .filter(d => d.status === 'open')
                    .map((dispute) => (
                      <div key={dispute.dispute_id} className="space-y-2 text-sm text-red-700">
                        <p><span className="font-medium">Issue Type:</span> {dispute.issue_type}</p>
                        <p><span className="font-medium">Description:</span> {dispute.description}</p>
                        <p><span className="font-medium">Reported On:</span> {formatDate(dispute.createdAt)}</p>
                        <p><span className="font-medium">Status:</span> <Badge variant="destructive" className="ml-1">Open</Badge></p>
                      </div>
                    ))}
                  <div className="p-3 mt-4 border border-blue-200 rounded bg-blue-50">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Disputes are managed by retailers. Please contact the retailer for resolution.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Billing Details Modal */}
      <Dialog open={showBillingModal} onOpenChange={setShowBillingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Billing Details</DialogTitle>
          </DialogHeader>
          {selectedOrderForBilling && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order Number:</span> {selectedOrderForBilling.order_number}
                </div>
                <div>
                  <span className="font-medium">Retailer:</span> {selectedOrderForBilling.Retailer?.name || selectedOrderForBilling.retailer_name}
                </div>
                <div>
                  <span className="font-medium">Order Date:</span> {formatDate(selectedOrderForBilling.createdAt || selectedOrderForBilling.created_at)}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedOrderForBilling.status}
                </div>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrderForBilling.items?.map((item, idx) => {
                      const batch = getBatchDisplay(selectedOrderForBilling, item);
                      const productName = item.Product?.generic_name || item.product_name;
                      const rate = batch?.ptr || item.unit_price || 0;
                      const total = (rate * item.quantity).toFixed(2);
                      
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            {productName} ({item.product_code})
                          </TableCell>
                          <TableCell>{batch?.batch_number || '—'}</TableCell>
                          <TableCell>
                            {batch?.expiry_date ? formatDate(batch.expiry_date) : '—'}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(rate)}</TableCell>
                          <TableCell>{formatCurrency(total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end p-4 border-t">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total: {formatCurrency(selectedOrderForBilling.total_amount)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
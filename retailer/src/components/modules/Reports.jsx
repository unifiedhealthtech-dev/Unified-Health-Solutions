import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { FileText, Download, Filter, Calendar, TrendingUp, AlertTriangle, Package, Receipt, Printer, RefreshCw } from "lucide-react";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: new Date().toISOString().split('T')[0],
  });
  const [groupBy, setGroupBy] = useState("daily");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const reportTypes = [
    { id: "sales", name: "Sales Report", icon: TrendingUp, description: "Daily/Monthly sales analysis" },
    { id: "purchase", name: "Purchase Report", icon: Package, description: "Purchase orders and costs" },
    { id: "stock", name: "Stock Report", icon: Package, description: "Current inventory levels" },
    { id: "expiry", name: "Expiry Report", icon: AlertTriangle, description: "Products nearing expiry" },
    { id: "near-expiry", name: "Near Expiry", icon: AlertTriangle, description: "Products expiring in 30 days" },
    { id: "outstanding", name: "Outstanding Report", icon: Receipt, description: "Pending payments" },
    { id: "gst", name: "GST Report", icon: FileText, description: "GST compliance report" },
  ];

  const salesData = [
    { date: "2024-01-15", billNo: "BILL-2024-001", customer: "John Doe", amount: 2450.00, tax: 294.00, total: 2744.00 },
    { date: "2024-01-14", billNo: "BILL-2024-002", customer: "Jane Smith", amount: 1850.00, tax: 222.00, total: 2072.00 },
    { date: "2024-01-13", billNo: "BILL-2024-003", customer: "Robert Wilson", amount: 3200.00, tax: 384.00, total: 3584.00 },
  ];

  const expiryData = [
    { productCode: "MED003", name: "Cetirizine 10mg", batch: "CET240105", expiry: "2024-03-15", qty: 150, status: "Near Expiry" },
    { productCode: "MED005", name: "Ibuprofen 400mg", batch: "IBU240101", expiry: "2024-02-28", qty: 75, status: "Expiring Soon" },
  ];

  const stockData = [
    { productCode: "MED001", name: "Paracetamol 500mg", qty: 850, minStock: 100, value: 32487.50, status: "In Stock" },
    { productCode: "MED002", name: "Amoxicillin 250mg", qty: 25, minStock: 50, value: 2667.00, status: "Low Stock" },
  ];

  // Button functionality functions
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setReportGenerated(true);
    setIsGenerating(false);
    alert(`${reportTypes.find(r => r.id === selectedReport)?.name} generated successfully for ${dateRange.startDate} to ${dateRange.endDate}`);
  };

  const handleApplyFilters = () => {
    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      alert('Start date cannot be after end date. Please correct the date range.');
      return;
    }
    
    setReportGenerated(false);
    alert(`Filters applied: ${dateRange.startDate} to ${dateRange.endDate}, Grouped by: ${groupBy}`);
  };

  const handleExportPDF = () => {
    if (!reportGenerated) {
      alert('Please generate a report first before exporting.');
      return;
    }

    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
    const fileName = `${reportName}_${dateRange.startDate}_to_${dateRange.endDate}.pdf`;
    
    // Create PDF content
    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    alert(`PDF export initiated for ${fileName}`);
  };

  const handleExportExcel = () => {
    if (!reportGenerated) {
      alert('Please generate a report first before exporting.');
      return;
    }

    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
    const fileName = `${reportName}_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`;
    
    // Create CSV content (simplified Excel export)
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.xlsx', '.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert(`Excel export completed: ${fileName}`);
  };

  const handlePrintReport = () => {
    if (!reportGenerated) {
      alert('Please generate a report first before printing.');
      return;
    }

    const printContent = generatePrintContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintContent = () => {
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name || 'Report';
    const currentData = getCurrentReportData();
    
    return `
      <html>
        <head>
          <title>${reportName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin: 10px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; padding: 10px; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportName}</h1>
            <h2>Pharmacy Management System</h2>
          </div>
          <div class="info">
            <p><strong>Report Period:</strong> ${dateRange.startDate} to ${dateRange.endDate}</p>
            <p><strong>Grouped By:</strong> ${groupBy}</p>
            <p><strong>Generated On:</strong> ${new Date().toLocaleString()}</p>
          </div>
          ${currentData}
          <div class="summary">
            <p><strong>Report Summary:</strong> This report contains ${getDataCount()} records for the selected period.</p>
          </div>
        </body>
      </html>
    `;
  };

  const generateCSVContent = () => {
    const headers = getTableHeaders();
    const rows = getTableData();
    
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  const getCurrentReportData = () => {
    switch (selectedReport) {
      case "sales":
        return `
          <table class="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill No</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Tax</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${salesData.map(sale => `
                <tr>
                  <td>${sale.date}</td>
                  <td>${sale.billNo}</td>
                  <td>${sale.customer}</td>
                  <td>₹${sale.amount.toFixed(2)}</td>
                  <td>₹${sale.tax.toFixed(2)}</td>
                  <td>₹${sale.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      case "expiry":
      case "near-expiry":
        return `
          <table class="table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Name</th>
                <th>Batch</th>
                <th>Expiry Date</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${expiryData.map(item => `
                <tr>
                  <td>${item.productCode}</td>
                  <td>${item.name}</td>
                  <td>${item.batch}</td>
                  <td>${item.expiry}</td>
                  <td>${item.qty}</td>
                  <td>${item.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      case "stock":
        return `
          <table class="table">
            <thead>
              <tr>
                <th>Product Code</th>
                <th>Name</th>
                <th>Current Qty</th>
                <th>Min Stock</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${stockData.map(item => `
                <tr>
                  <td>${item.productCode}</td>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>${item.minStock}</td>
                  <td>₹${item.value.toFixed(2)}</td>
                  <td>${item.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      default:
        return '<p>No data available for this report type.</p>';
    }
  };

  const getTableHeaders = () => {
    switch (selectedReport) {
      case "sales":
        return ["Date", "Bill No", "Customer", "Amount", "Tax", "Total"];
      case "expiry":
      case "near-expiry":
        return ["Product Code", "Name", "Batch", "Expiry Date", "Qty", "Status"];
      case "stock":
        return ["Product Code", "Name", "Current Qty", "Min Stock", "Value", "Status"];
      default:
        return [];
    }
  };

  const getTableData = () => {
    switch (selectedReport) {
      case "sales":
        return salesData.map(sale => [
          sale.date, sale.billNo, sale.customer, 
          sale.amount.toFixed(2), sale.tax.toFixed(2), sale.total.toFixed(2)
        ]);
      case "expiry":
      case "near-expiry":
        return expiryData.map(item => [
          item.productCode, item.name, item.batch, 
          item.expiry, item.qty.toString(), item.status
        ]);
      case "stock":
        return stockData.map(item => [
          item.productCode, item.name, item.qty.toString(), 
          item.minStock.toString(), item.value.toFixed(2), item.status
        ]);
      default:
        return [];
    }
  };

  const getDataCount = () => {
    switch (selectedReport) {
      case "sales":
        return salesData.length;
      case "expiry":
      case "near-expiry":
        return expiryData.length;
      case "stock":
        return stockData.length;
      default:
        return 0;
    }
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case "sales":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell className="font-medium">{sale.billNo}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>₹{sale.amount.toFixed(2)}</TableCell>
                  <TableCell>₹{sale.tax.toFixed(2)}</TableCell>
                  <TableCell className="font-medium">₹{sale.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "expiry":
      case "near-expiry":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiryData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productCode}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.batch}</TableCell>
                  <TableCell className="text-destructive">{item.expiry}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      case "stock":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Current Qty</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{item.productCode}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.minStock}</TableCell>
                  <TableCell>₹{item.value.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Low Stock" ? "destructive" : "default"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Report Preview</h3>
            <p className="text-muted-foreground">Select filters and generate report to view data</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={!reportGenerated}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            disabled={!reportGenerated}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Report Type Selection */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>Report Types</CardTitle>
          <CardDescription>Select the type of report you want to generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-all shadow-soft ${
                    selectedReport === report.id ? "ring-2 ring-primary bg-primary-muted" : "hover:shadow-medium"
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>Configure date range and other parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="groupBy">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleApplyFilters}>
                <Calendar className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle>
            {reportTypes.find(r => r.id === selectedReport)?.name || "Report"}
          </CardTitle>
          <CardDescription>
            Generated report for {dateRange.startDate} to {dateRange.endDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderReportContent()}
        </CardContent>
      </Card>

      {/* Report Actions */}
      <Card className="shadow-medium">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="text-sm text-muted-foreground">
              Report generated on {new Date().toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handlePrintReport}
                disabled={!reportGenerated}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportPDF}
                disabled={!reportGenerated}
              >
                <Download className="w-4 h-4 mr-2" />
                Save as PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportExcel}
                disabled={!reportGenerated}
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;

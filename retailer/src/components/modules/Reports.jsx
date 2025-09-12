import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { FileText, Download, Filter, Calendar, TrendingUp, AlertTriangle, Package, Receipt } from "lucide-react";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: new Date().toISOString().split('T')[0],
  });

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
          <h2 className="text-3xl font-bold">Reports & Analytics</h2>
          <p className="text-muted-foreground">Generate comprehensive business reports</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
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
              <Select defaultValue="daily">
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
              <Button className="w-full">
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
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Print Report
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Save as PDF
              </Button>
              <Button variant="outline">
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

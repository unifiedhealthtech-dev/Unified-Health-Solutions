import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { FileText, Download, Printer, Search, Calendar, Filter } from "lucide-react";
import React from 'react';
// Mock data for different reports
const allSales = [
  { billNo: "INV001", date: "2024-01-15", party: "Apollo Pharmacy", amount: 45000, gst: 8100, total: 53100 },
  { billNo: "INV002", date: "2024-01-16", party: "MedPlus", amount: 32000, gst: 5760, total: 37760 },
  { billNo: "INV003", date: "2024-01-17", party: "Wellness Forever", amount: 28500, gst: 5130, total: 33630 },
  { billNo: "INV004", date: "2024-01-20", party: "Apollo Pharmacy", amount: 15000, gst: 2700, total: 17700 },
  { billNo: "INV005", date: "2024-02-01", party: "MedPlus", amount: 50000, gst: 9000, total: 59000 },
  { billNo: "INV006", date: "2024-02-05", party: "Wellness Forever", amount: 12000, gst: 2160, total: 14160 },
];

const allPurchases = [
  { billNo: "PUR001", date: "2024-01-14", party: "Cipla Ltd", amount: 25000, gst: 4500, total: 29500 },
  { billNo: "PUR002", date: "2024-01-15", party: "Sun Pharma", amount: 18000, gst: 3240, total: 21240 },
  { billNo: "PUR003", date: "2024-01-18", party: "Dr. Reddy's Lab", amount: 35000, gst: 6300, total: 41300 },
  { billNo: "PUR004", date: "2024-02-02", party: "Cipla Ltd", amount: 10000, gst: 1800, total: 11800 },
];

const stockReport = [
  { code: "MED001", name: "Paracetamol 500mg", batch: "PCM2024", expiry: "Dec 2025", qty: 500, value: 25000 },
  { code: "MED002", name: "Amoxicillin 250mg", batch: "AMX2024", expiry: "Nov 2025", qty: 200, value: 18000 },
  { code: "MED003", name: "Crocin Advance", batch: "CRC2024", expiry: "Jan 2026", qty: 150, value: 12500 },
];

const expiryReport = [
  { code: "MED004", name: "Aspirin 75mg", batch: "ASP2023", expiry: "Mar 2024", qty: 50, daysLeft: 45, status: "Near Expiry" },
  { code: "MED005", name: "Vitamin D3", batch: "VIT2023", expiry: "Feb 2024", qty: 25, daysLeft: 15, status: "Critical" },
  { code: "MED006", name: "Calcium Tablets", batch: "CAL2023", expiry: "Jan 2024", qty: 30, daysLeft: -5, status: "Expired" },
];

const outstandingReport = [
  { party: "Apollo Pharmacy", billNo: "INV001", amount: 53100, dueDate: "2024-02-15", days: 5, status: "Due" },
  { party: "MedPlus", billNo: "INV002", amount: 37760, dueDate: "2024-02-10", days: 10, status: "Overdue" },
  { party: "Wellness Forever", billNo: "INV003", amount: 33630, dueDate: "2024-02-20", days: -5, status: "Not Due" },
];

const gstReport = [
  { period: "Jan 2024", sales: 450000, purchases: 320000, igst: 22500, cgst: 16000, sgst: 16000, totalTax: 54500 },
  { period: "Dec 2023", sales: 420000, purchases: 300000, igst: 21000, cgst: 15000, sgst: 15000, totalTax: 51000 },
  { period: "Nov 2023", sales: 380000, purchases: 280000, igst: 19000, cgst: 14000, sgst: 14000, totalTax: 47000 },
];

const partyLedgerData = {
  "Apollo Pharmacy": [
    { type: "Sales", date: "2024-01-15", billNo: "INV001", debit: 53100, credit: 0, balance: 53100 },
    { type: "Payment", date: "2024-01-30", billNo: null, debit: 0, credit: 20000, balance: 33100 },
    { type: "Sales", date: "2024-01-20", billNo: "INV004", debit: 17700, credit: 0, balance: 50800 },
  ],
  "MedPlus": [
    { type: "Sales", date: "2024-01-16", billNo: "INV002", debit: 37760, credit: 0, balance: 37760 },
    { type: "Payment", date: "2024-02-05", billNo: null, debit: 0, credit: 37760, balance: 0 },
    { type: "Sales", date: "2024-02-01", billNo: "INV005", debit: 59000, credit: 0, balance: 59000 },
  ],
  "Wellness Forever": [
    { type: "Sales", date: "2024-01-17", billNo: "INV003", debit: 33630, credit: 0, balance: 33630 },
    { type: "Sales", date: "2024-02-05", billNo: "INV006", debit: 14160, credit: 0, balance: 47790 },
  ],
};

const partyNames = Object.keys(partyLedgerData);

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedParty, setSelectedParty] = useState("all");
  const [filteredSales, setFilteredSales] = useState(allSales);
  const [filteredPurchases, setFilteredPurchases] = useState(allPurchases);

  // Filter data based on date range
  useEffect(() => {
    const filterData = (data) => {
      return data.filter(item => {
        const itemDate = new Date(item.date);
        const from = dateFrom ? new Date(dateFrom) : new Date('2000-01-01');
        const to = dateTo ? new Date(dateTo) : new Date();
        return itemDate >= from && itemDate <= to;
      });
    };
    setFilteredSales(filterData(allSales));
    setFilteredPurchases(filterData(allPurchases));
  }, [dateFrom, dateTo]);

  const handleExport = (format) => {
    console.log(`Exporting ${activeTab} report in ${format} format`);
    if (activeTab === 'sales') {
      console.log('Data to export:', filteredSales);
    } else if (activeTab === 'purchase') {
      console.log('Data to export:', filteredPurchases);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentLedger = selectedParty === "all" ? [] : partyLedgerData[selectedParty] || [];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and view business reports</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
          <Button onClick={() => handleExport('excel')} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => handleExport('pdf')} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-primary">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md"
              />
            </div>
            <div>
              <Label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md"
              />
            </div>
            {(activeTab === "sales" || activeTab === "ledger" || activeTab === "outstanding") && (
              <div>
                <Label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-1">Party</Label>
                <Select value={selectedParty} onValueChange={setSelectedParty}>
                  <SelectTrigger className="w-full rounded-md">
                    <SelectValue placeholder="Select party" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parties</SelectItem>
                    {partyNames.map(party => (
                      <SelectItem key={party} value={party}>{party}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-end">
              <Button className="w-full rounded-md">
                <Search className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7 rounded-xl shadow-sm">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="purchase">Purchase Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Report</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="ledger">Party Ledger</TabsTrigger>
          <TabsTrigger value="gst">GST Report</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales">
          <Card className="rounded-xl shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{sale.billNo}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.party}</TableCell>
                      <TableCell>₹{sale.amount.toLocaleString()}</TableCell>
                      <TableCell>₹{sale.gst.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₹{sale.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchase Report */}
        <TabsContent value="purchase">
          <Card className="rounded-xl shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Purchase Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.map((purchase, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{purchase.billNo}</TableCell>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell>{purchase.party}</TableCell>
                      <TableCell>₹{purchase.amount.toLocaleString()}</TableCell>
                      <TableCell>₹{purchase.gst.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₹{purchase.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Report */}
        <TabsContent value="stock">
          <Card className="rounded-xl shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Stock Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockReport.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.batch}</TableCell>
                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>₹{item.value.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Report */}
        <TabsContent value="expiry">
          <Card className="rounded-xl shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Expiry Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiryReport.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.batch}</TableCell>
                      <TableCell>{item.expiry}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell>{item.daysLeft}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "Expired" || item.status === "Critical" ? "destructive" : 
                            item.status === "Near Expiry" ? "secondary" : "default"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outstanding Report */}
        <TabsContent value="outstanding">
          <Card className="rounded-xl shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Outstanding Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Party Name</TableHead>
                    <TableHead>Bill No</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingReport.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.party}</TableCell>
                      <TableCell>{item.billNo}</TableCell>
                      <TableCell>₹{item.amount.toLocaleString()}</TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell>{item.days}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "Overdue" ? "destructive" : 
                            item.status === "Due" ? "secondary" : "default"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Party Ledger */}
        <TabsContent value="ledger">
          <Card className="rounded-xl shadow-lg mt-4">
            <CardHeader>
              <CardTitle>Party Ledger: {selectedParty === "all" ? "Select a Party" : selectedParty}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedParty === "all" ? (
                <div className="text-center py-8 text-muted-foreground">
                  Select a party from the filters above to view their ledger details.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Particulars</TableHead>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Debit (₹)</TableHead>
                      <TableHead>Credit (₹)</TableHead>
                      <TableHead>Balance (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentLedger.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell className="font-medium">{transaction.type}</TableCell>
                        <TableCell>{transaction.billNo || 'N/A'}</TableCell>
                        <TableCell className="text-red-500">{transaction.debit.toLocaleString()}</TableCell>
                        <TableCell className="text-green-500">{transaction.credit.toLocaleString()}</TableCell>
                        <TableCell className="font-bold">{transaction.balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GST Report */}
        <TabsContent value="gst">
          <Card className="rounded-xl shadow-lg mt-4">
            <CardHeader>
              <CardTitle>GST Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>IGST</TableHead>
                    <TableHead>CGST</TableHead>
                    <TableHead>SGST</TableHead>
                    <TableHead>Total Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gstReport.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.period}</TableCell>
                      <TableCell>₹{item.sales.toLocaleString()}</TableCell>
                      <TableCell>₹{item.purchases.toLocaleString()}</TableCell>
                      <TableCell>₹{item.igst.toLocaleString()}</TableCell>
                      <TableCell>₹{item.cgst.toLocaleString()}</TableCell>
                      <TableCell>₹{item.sgst.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₹{item.totalTax.toLocaleString()}</TableCell>
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

export default Reports;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import React from 'react';
import { Badge } from "../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Shield, Upload, CheckCircle, AlertTriangle, FileText, Calendar, Send, Eye } from "lucide-react";

const Compliance = () => {
  const [activeTab, setActiveTab] = useState("dl");

  // Mock compliance data
  const dlValidations = [
    { dlNo: "DL20B-TS-2024-001234", party: "Apollo Pharmacy", status: "Valid", expiry: "2025-03-15", lastChecked: "2024-01-15" },
    { dlNo: "DL21B-TS-2024-005678", party: "MedPlus", status: "Expired", expiry: "2023-12-31", lastChecked: "2024-01-14" },
    { dlNo: "DL20B-TS-2024-009012", party: "Wellness Forever", status: "Valid", expiry: "2025-06-20", lastChecked: "2024-01-13" },
  ];

  const gstFilings = [
    { period: "Jan 2024", gstr1: "Filed", gstr3b: "Pending", dueDate: "2024-02-11", filedDate: "2024-02-10", status: "Partial" },
    { period: "Dec 2023", gstr1: "Filed", gstr3b: "Filed", dueDate: "2024-01-11", filedDate: "2024-01-09", status: "Complete" },
    { period: "Nov 2023", gstr1: "Filed", gstr3b: "Filed", dueDate: "2023-12-11", filedDate: "2023-12-08", status: "Complete" },
  ];

  const tpassReports = [
    { billNo: "INV001", party: "Apollo Pharmacy", amount: 53100, reportDate: "2024-01-15", status: "Submitted", reference: "TPASS2024001" },
    { billNo: "INV002", party: "MedPlus", amount: 37760, reportDate: "2024-01-16", status: "Pending", reference: "" },
  ];

  const handleFileUpload = (type) => {
    console.log(`Uploading ${type} file`);
  };

  const handleValidation = (dlNo) => {
    console.log(`Validating DL: ${dlNo}`);
  };

  const handleSubmitReport = (billNo) => {
    console.log(`Submitting T-PASS report for: ${billNo}`);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance</h1>
          <p className="text-muted-foreground">Manage regulatory compliance and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">Telangana State Compliance</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dl">DL Validation</TabsTrigger>
          <TabsTrigger value="gst">GST Filing Report</TabsTrigger>
          <TabsTrigger value="tpass">T-PASS Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="dl">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Drug License Upload & Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dlNumber">Drug License Number</Label>
                    <Input id="dlNumber" placeholder="DL20B/21B-TS-YYYY-XXXXXX" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="partyName">Party Name</Label>
                    <Input id="partyName" placeholder="Enter party name" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dlFile">Upload DL Copy</Label>
                  <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload('dl')}>
                      Choose File
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleValidation('sample')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Validate DL
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View All DL Records
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DL Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DL Number</TableHead>
                      <TableHead>Party Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Last Checked</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dlValidations.map((dl, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{dl.dlNo}</TableCell>
                        <TableCell>{dl.party}</TableCell>
                        <TableCell>
                          <Badge variant={dl.status === "Valid" ? "default" : "destructive"}>
                            {dl.status === "Valid" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 mr-1" />
                            )}
                            {dl.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{dl.expiry}</TableCell>
                        <TableCell>{dl.lastChecked}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleValidation(dl.dlNo)}>
                            Re-validate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gst">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  GST Filing Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>GSTR-1</TableHead>
                      <TableHead>GSTR-3B</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Filed Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gstFilings.map((filing, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{filing.period}</TableCell>
                        <TableCell>
                          <Badge variant={filing.gstr1 === "Filed" ? "default" : "secondary"}>
                            {filing.gstr1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={filing.gstr3b === "Filed" ? "default" : "secondary"}>
                            {filing.gstr3b}
                          </Badge>
                        </TableCell>
                        <TableCell>{filing.dueDate}</TableCell>
                        <TableCell>{filing.filedDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              filing.status === "Complete"
                                ? "default"
                                : filing.status === "Partial"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {filing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload GST Returns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gstPeriod">Period</Label>
                    <Input id="gstPeriod" placeholder="MM/YYYY" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="returnType">Return Type</Label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="gstr1">GSTR-1</option>
                      <option value="gstr3b">GSTR-3B</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>Upload Return File</Label>
                  <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload("gst")}>
                      Upload GST Return
                    </Button>
                  </div>
                </div>
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Return
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tpass">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  T-PASS Reporting (Telangana)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportDate">Report Date</Label>
                    <Input id="reportDate" type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="reportType">Report Type</Label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option value="daily">Daily Sales</option>
                      <option value="monthly">Monthly Summary</option>
                      <option value="quarterly">Quarterly Report</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" placeholder="Enter any additional remarks..." className="mt-1" />
                </div>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate T-PASS Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>T-PASS Submission Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No</TableHead>
                      <TableHead>Party Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Report Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference No</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tpassReports.map((report, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{report.billNo}</TableCell>
                        <TableCell>{report.party}</TableCell>
                        <TableCell>₹{report.amount.toLocaleString()}</TableCell>
                        <TableCell>{report.reportDate}</TableCell>
                        <TableCell>
                          <Badge variant={report.status === "Submitted" ? "default" : "secondary"}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.reference || "—"}</TableCell>
                        <TableCell>
                          {report.status === "Pending" ? (
                            <Button size="sm" onClick={() => handleSubmitReport(report.billNo)}>
                              <Send className="w-3 h-3 mr-1" />
                              Submit
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Telangana T-PASS Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500" />
                    <p>All pharmaceutical sales must be reported within 24 hours of transaction</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                    <p>Ensure all party drug licenses are valid before making sales</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500" />
                    <p>Monthly summary reports must be submitted by the 5th of following month</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                    <p>Keep digital copies of all compliance certificates for audit purposes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Compliance;

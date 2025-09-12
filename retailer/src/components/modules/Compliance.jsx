import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Upload, Shield, CheckCircle, AlertTriangle, FileText, Calendar } from "lucide-react";

const Compliance = () => {
  const [dlValidation] = useState([
    {
      licenseNo: "DL-TS-2024-001",
      issueDate: "2024-01-01",
      expiryDate: "2025-12-31",
      authority: "Telangana Drug Control",
      status: "Valid",
      daysToExpiry: 365
    },
    {
      licenseNo: "DL-TS-2024-002",
      issueDate: "2023-06-01",
      expiryDate: "2024-05-31",
      authority: "Telangana Drug Control",
      status: "Expiring Soon",
      daysToExpiry: 45
    },
  ]);

  const [gstReports] = useState([
    {
      period: "January 2024",
      gstr1Status: "Filed",
      gstr3bStatus: "Filed",
      filingDate: "2024-02-15",
      totalSales: 145680.00,
      totalTax: 17481.60
    },
    {
      period: "December 2023",
      gstr1Status: "Filed",
      gstr3bStatus: "Pending",
      filingDate: "2024-01-18",
      totalSales: 132450.00,
      totalTax: 15894.00
    },
  ]);

  const [tpassReports] = useState([
    {
      reportId: "TPASS-2024-001",
      period: "Q4 2023",
      submissionDate: "2024-01-15",
      status: "Submitted",
      reportType: "Quarterly Sales"
    },
    {
      reportId: "TPASS-2024-002",
      period: "Q1 2024",
      submissionDate: "",
      status: "Due",
      reportType: "Quarterly Sales"
    },
  ]);

  const complianceScore = 85; // Overall compliance percentage

  const getStatusBadge = (status) => {
    switch (status) {
      case "Valid":
      case "Filed":
      case "Submitted":
        return <Badge variant="default">{status}</Badge>;
      case "Expiring Soon":
      case "Pending":
      case "Due":
        return <Badge variant="secondary">{status}</Badge>;
      case "Expired":
      case "Overdue":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold">Compliance Management</h2>
          <p className="text-muted-foreground">Track regulatory compliance and submissions</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Overview
          </CardTitle>
          <CardDescription>Overall compliance status and score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary">{complianceScore}%</div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
              </div>
              <Progress value={complianceScore} className="h-2" />
            </div>
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">Valid Licenses</p>
            </div>
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">1</div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
            <div className="text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">2</div>
              <p className="text-sm text-muted-foreground">Due Reports</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Tabs */}
      <Tabs defaultValue="dl-validation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dl-validation">DL Validation</TabsTrigger>
          <TabsTrigger value="gst-filing">GST Filing Report</TabsTrigger>
          <TabsTrigger value="tpass-reporting">T-PASS Reporting</TabsTrigger>
        </TabsList>

        {/* DL Validation Tab */}
        <TabsContent value="dl-validation">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Drug License Validation</CardTitle>
              <CardDescription>Monitor drug license status and expiry dates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License No</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Authority</TableHead>
                    <TableHead>Days to Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dlValidation.map((license, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{license.licenseNo}</TableCell>
                      <TableCell>{license.issueDate}</TableCell>
                      <TableCell className={license.daysToExpiry <= 90 ? "text-warning font-medium" : ""}>
                        {license.expiryDate}
                      </TableCell>
                      <TableCell>{license.authority}</TableCell>
                      <TableCell className={license.daysToExpiry <= 90 ? "text-warning font-medium" : ""}>
                        {license.daysToExpiry} days
                      </TableCell>
                      <TableCell>{getStatusBadge(license.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Validate
                          </Button>
                          <Button size="sm" variant="outline">
                            Renew
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GST Filing Tab */}
        <TabsContent value="gst-filing">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>GST Filing Reports</CardTitle>
              <CardDescription>Track GST return filings and compliance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>GSTR-1 Status</TableHead>
                    <TableHead>GSTR-3B Status</TableHead>
                    <TableHead>Filing Date</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Total Tax</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gstReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.period}</TableCell>
                      <TableCell>{getStatusBadge(report.gstr1Status)}</TableCell>
                      <TableCell>{getStatusBadge(report.gstr3bStatus)}</TableCell>
                      <TableCell>{report.filingDate}</TableCell>
                      <TableCell>₹{report.totalSales.toLocaleString()}</TableCell>
                      <TableCell>₹{report.totalTax.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* T-PASS Reporting Tab */}
        <TabsContent value="tpass-reporting">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>T-PASS Reporting</CardTitle>
              <CardDescription>Telangana Pharma and Supply System reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                          <p className="text-xl font-bold">Q1 2024</p>
                        </div>
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                          <p className="text-xl font-bold text-warning">Apr 15, 2024</p>
                        </div>
                        <AlertTriangle className="h-6 w-6 text-warning" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="shadow-soft">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Status</p>
                          <p className="text-xl font-bold text-destructive">Pending</p>
                        </div>
                        <FileText className="h-6 w-6 text-destructive" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tpassReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.reportId}</TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>{report.reportType}</TableCell>
                      <TableCell>{report.submissionDate || "-"}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            {report.status === "Due" ? "Submit" : "View"}
                          </Button>
                          {report.status === "Submitted" && (
                            <Button size="sm" variant="outline">
                              Download
                            </Button>
                          )}
                        </div>
                      </TableCell>
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

export default Compliance;
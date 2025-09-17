import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Upload, Shield, CheckCircle, AlertTriangle, FileText, Calendar, Download, Eye, RefreshCw, ExternalLink, Clock } from "lucide-react";

const Compliance = () => {
  const [dlValidation, setDlValidation] = useState([
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

  const [gstReports, setGstReports] = useState([
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

  const [tpassReports, setTpassReports] = useState([
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

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const complianceScore = 85; // Overall compliance percentage

  // Button functionality functions
  const handleUploadDocument = async () => {
    setIsUploading(true);
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Simulate upload process
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert(`Document "${file.name}" uploaded successfully!`);
      }
      setIsUploading(false);
    };
    input.click();
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
    alert('Compliance report generated successfully!');
  };

  const handleValidateLicense = (licenseNo) => {
    const license = dlValidation.find(l => l.licenseNo === licenseNo);
    if (license) {
      // Simulate validation process
      const isValid = license.status === 'Valid';
      const message = isValid 
        ? `License ${licenseNo} is valid and active.`
        : `License ${licenseNo} requires attention - ${license.status.toLowerCase()}.`;
      
      alert(`Validation Result:\n\n${message}\n\nAuthority: ${license.authority}\nExpiry: ${license.expiryDate}`);
    }
  };

  const handleRenewLicense = (licenseNo) => {
    if (window.confirm(`Are you sure you want to initiate renewal process for license ${licenseNo}?`)) {
      // Simulate renewal process
      alert(`Renewal process initiated for ${licenseNo}.\n\nYou will be redirected to the licensing authority portal.`);
      
      // Update license status
      setDlValidation(prev => prev.map(license => 
        license.licenseNo === licenseNo 
          ? { ...license, status: 'Renewal In Progress' }
          : license
      ));
    }
  };

  const handleViewGSTReport = (period) => {
    const report = gstReports.find(r => r.period === period);
    if (report) {
      const reportDetails = `
GST Report Details:

Period: ${report.period}
GSTR-1 Status: ${report.gstr1Status}
GSTR-3B Status: ${report.gstr3bStatus}
Filing Date: ${report.filingDate}
Total Sales: ₹${report.totalSales.toLocaleString()}
Total Tax: ₹${report.totalTax.toLocaleString()}

${report.gstr3bStatus === 'Pending' ? '⚠️ GSTR-3B filing is pending. Please file before the due date.' : '✅ All GST returns filed successfully.'}
      `;
      alert(reportDetails);
    }
  };

  const handleDownloadGSTReport = (period) => {
    const report = gstReports.find(r => r.period === period);
    if (report) {
      // Create downloadable content
      const content = `
GST Report - ${period}
=====================================

GSTR-1 Status: ${report.gstr1Status}
GSTR-3B Status: ${report.gstr3bStatus}
Filing Date: ${report.filingDate}
Total Sales: ₹${report.totalSales.toLocaleString()}
Total Tax: ₹${report.totalTax.toLocaleString()}

Generated on: ${new Date().toLocaleString()}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GST_Report_${period.replace(' ', '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`GST report for ${period} downloaded successfully!`);
    }
  };

  const handleSubmitTPASSReport = (reportId) => {
    if (window.confirm(`Are you sure you want to submit T-PASS report ${reportId}?`)) {
      // Simulate submission process
      setTpassReports(prev => prev.map(report => 
        report.reportId === reportId 
          ? { 
              ...report, 
              status: 'Submitted', 
              submissionDate: new Date().toISOString().split('T')[0] 
            }
          : report
      ));
      
      alert(`T-PASS report ${reportId} submitted successfully!\n\nSubmission Date: ${new Date().toLocaleDateString()}`);
    }
  };

  const handleViewTPASSReport = (reportId) => {
    const report = tpassReports.find(r => r.reportId === reportId);
    if (report) {
      const reportDetails = `
T-PASS Report Details:

Report ID: ${report.reportId}
Period: ${report.period}
Report Type: ${report.reportType}
Status: ${report.status}
${report.submissionDate ? `Submission Date: ${report.submissionDate}` : 'Not yet submitted'}

${report.status === 'Due' ? '⚠️ This report is due for submission.' : '✅ Report submitted successfully.'}
      `;
      alert(reportDetails);
    }
  };

  const handleDownloadTPASSReport = (reportId) => {
    const report = tpassReports.find(r => r.reportId === reportId);
    if (report) {
      const content = `
T-PASS Report - ${reportId}
============================

Period: ${report.period}
Report Type: ${report.reportType}
Status: ${report.status}
Submission Date: ${report.submissionDate || 'Not submitted'}

Generated on: ${new Date().toLocaleString()}
      `;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TPASS_Report_${reportId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(`T-PASS report ${reportId} downloaded successfully!`);
    }
  };

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
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleUploadDocument}
            disabled={isUploading}
          >
            {isUploading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          <Button 
            variant="outline"
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleValidateLicense(license.licenseNo)}
                            title="Validate License"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRenewLicense(license.licenseNo)}
                            title="Renew License"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewGSTReport(report.period)}
                            title="View GST Report Details"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadGSTReport(report.period)}
                            title="Download GST Report"
                          >
                            <Download className="w-3 h-3 mr-1" />
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
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => report.status === "Due" 
                              ? handleSubmitTPASSReport(report.reportId)
                              : handleViewTPASSReport(report.reportId)
                            }
                            title={report.status === "Due" ? "Submit T-PASS Report" : "View T-PASS Report"}
                          >
                            {report.status === "Due" ? (
                              <>
                                <Upload className="w-3 h-3 mr-1" />
                                Submit
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </>
                            )}
                          </Button>
                          {report.status === "Submitted" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDownloadTPASSReport(report.reportId)}
                              title="Download T-PASS Report"
                            >
                              <Download className="w-3 h-3 mr-1" />
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
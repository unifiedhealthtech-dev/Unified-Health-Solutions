import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Building2, Upload, Save, X, CheckCircle } from "lucide-react";

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pharmacyName: "",
    drugLicense: "",
    gstin: "",
    pan: "",
    aadhaar: "",
    addressLine1: "",
    area: "",
    city: "",
    district: "",
    state: "Telangana",
    pincode: "",
    mobile: "",
    email: "",
    bankAccount: "",
    ifscCode: "",
    bankName: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For demo purposes, redirect to dashboard
    navigate("/dashboard");
  };

  const handleSaveDraft = () => {
    alert("Draft saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-card p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-medium mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Retailer Registration</h1>
          <p className="text-muted-foreground">Complete your pharmacy profile to get started</p>
          <Badge variant="outline" className="mt-2">Step 2 of 2</Badge>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter your pharmacy's basic details
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="pharmacyName">Pharmacy Name *</Label>
                  <Input
                    id="pharmacyName"
                    value={formData.pharmacyName}
                    onChange={(e) => handleInputChange("pharmacyName", e.target.value)}
                    placeholder="Enter pharmacy name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="drugLicense">Drug License No (DL 20B/21B) *</Label>
                  <Input
                    id="drugLicense"
                    value={formData.drugLicense}
                    onChange={(e) => handleInputChange("drugLicense", e.target.value)}
                    placeholder="DL-XXXX-XXXX"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN *</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => handleInputChange("gstin", e.target.value)}
                    placeholder="Enter GSTIN"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pan">PAN *</Label>
                  <Input
                    id="pan"
                    value={formData.pan}
                    onChange={(e) => handleInputChange("pan", e.target.value)}
                    placeholder="Enter PAN"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaar">Aadhaar *</Label>
                  <Input
                    id="aadhaar"
                    value={formData.aadhaar}
                    onChange={(e) => handleInputChange("aadhaar", e.target.value)}
                    placeholder="Enter Aadhaar number"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>
                  Enter your pharmacy's address details
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange("addressLine1", e.target.value)}
                    placeholder="Enter complete address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area *</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="Enter area"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange("district", e.target.value)}
                    placeholder="Enter district"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    placeholder="Telangana"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange("pincode", e.target.value)}
                    placeholder="Enter pincode"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact & Banking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mobile">Mobile *</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange("mobile", e.target.value)}
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle>Banking Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bankAccount">Bank Account No *</Label>
                    <Input
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                      placeholder="Enter account number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input
                      id="ifscCode"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                      placeholder="Enter IFSC code"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange("bankName", e.target.value)}
                      placeholder="Enter bank name"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Uploads */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Document Uploads</CardTitle>
                <CardDescription>
                  Upload required documents for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Upload Drug License (DL)</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Upload GST Certificate</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="shadow-medium">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/login")}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSaveDraft}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button type="submit">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Submit Registration
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;

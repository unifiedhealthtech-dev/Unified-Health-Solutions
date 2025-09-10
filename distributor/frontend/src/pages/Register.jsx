import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Building2, Upload, ArrowLeft } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import React from 'react';
const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Business Information
    distributorName: '',
    drugLicense: '',
    gstin: '',
    pan: '',
    aadhaar: '',
    
    // Address Information  
    addressLine1: '',
    area: '',
    city: '',
    district: '',
    state: 'Telangana',
    pincode: '',
    
    // Contact Information
    mobile: '',
    email: '',
    
    // Banking Information
    bankAccount: '',
    ifscCode: '',
    bankName: '',
    
    // Documents
    dlUpload: null,
    gstUpload: null
  });

  const telanganaDistricts = [
    'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally',
    'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad',
    'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda',
    'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy',
    'Siddipet', 'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Registration Submitted",
      description: "Your distributor registration has been submitted for verification.",
    });
    navigate('/login');
  };

  const handleFileUpload = (field) => (e) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, [field]: file });
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Distributor Registration</h1>
            <p className="text-white/80">Telangana State Drug License Registration</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-white text-primary' : 'bg-white/20 text-white/60'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 mx-2 ${
                    step < currentStep ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/80">
            <span>Business</span>
            <span>Address</span>
            <span>Banking</span>
            <span>Documents</span>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="backdrop-blur-md bg-white/95">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Business Information"}
              {currentStep === 2 && "Address & Contact"}
              {currentStep === 3 && "Banking Details"}
              {currentStep === 4 && "Document Upload"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your distributor business details and licenses"}
              {currentStep === 2 && "Provide your business address and contact information"}
              {currentStep === 3 && "Add your banking details for payments"}
              {currentStep === 4 && "Upload required documents for verification"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="distributorName">Distributor Name *</Label>
                    <Input
                      id="distributorName"
                      value={formData.distributorName}
                      onChange={(e) => setFormData({ ...formData, distributorName: e.target.value })}
                      placeholder="Enter distributor company name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="drugLicense">Drug License No (DL 20B/21B) *</Label>
                      <Input
                        id="drugLicense"
                        value={formData.drugLicense}
                        onChange={(e) => setFormData({ ...formData, drugLicense: e.target.value })}
                        placeholder="TS-DL-20B-2024-XXXXX"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN *</Label>
                      <Input
                        id="gstin"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                        placeholder="36XXXXXXXXXXXXX"
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pan">PAN *</Label>
                      <Input
                        id="pan"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                      <Input
                        id="aadhaar"
                        value={formData.aadhaar}
                        onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                        placeholder="XXXX XXXX XXXX"
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address & Contact */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">Address Line 1 *</Label>
                    <Textarea
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="Building number, street name, landmark"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area *</Label>
                      <Input
                        id="area"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="Area/Locality"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>District *</Label>
                      <Select onValueChange={(value) => setFormData({ ...formData, district: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {telanganaDistricts.map((district) => (
                            <SelectItem key={district} value={district}>{district}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        placeholder="500001"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="+91 9876543210"
                        maxLength={10}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="distributor@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Banking Details */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Bank Account Number *</Label>
                    <Input
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      placeholder="Account number for payments"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code *</Label>
                      <Input
                        id="ifscCode"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="SBIN0001234"
                        maxLength={11}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name *</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="State Bank of India"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Document Upload */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Drug License (DL) *</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload('dlUpload')}
                        className="hidden"
                        id="dl-upload"
                      />
                      <label htmlFor="dl-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>Choose DL Document</span>
                        </Button>
                      </label>
                      {formData.dlUpload && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Selected: {formData.dlUpload.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload GST Certificate *</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload('gstUpload')}
                        className="hidden"
                        id="gst-upload"
                      />
                      <label htmlFor="gst-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>Choose GST Document</span>
                        </Button>
                      </label>
                      {formData.gstUpload && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Selected: {formData.gstUpload.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <div>
                  {currentStep > 1 ? (
                    <Button type="button" variant="outline" onClick={handlePrev}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  ) : (
                    <Link to="/login">
                      <Button type="button" variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="space-x-2">
                  {currentStep < 4 ? (
                    <Button type="button" onClick={handleNext} variant="medical">
                      Next Step
                    </Button>
                  ) : (
                    <>
                      <Button type="button" variant="subtle">Save Draft</Button>
                      <Button type="submit" variant="success">Submit Registration</Button>
                    </>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;

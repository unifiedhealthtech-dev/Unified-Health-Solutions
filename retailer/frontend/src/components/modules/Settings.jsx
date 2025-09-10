import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Building2, 
  FileText, 
  Mail, 
  HardDrive, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Save,
  Download
} from "lucide-react";

const SettingsModule = () => {
  const [users] = useState([
    { id: 1, name: "Admin User", email: "admin@pharmacy.com", role: "Administrator", status: "Active" },
    { id: 2, name: "Cashier 1", email: "cashier1@pharmacy.com", role: "Cashier", status: "Active" },
    { id: 3, name: "Inventory Manager", email: "inventory@pharmacy.com", role: "Manager", status: "Active" },
  ]);

  const [pharmacyProfile, setPharmacyProfile] = useState({
    name: "MediCare Pharmacy",
    address: "123 Health Street, Medical District",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
    phone: "+91 9876543210",
    email: "info@medicare.com",
    gst: "36ABCDE1234F1Z5",
    drugLicense: "DL-TS-2024-001"
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",
    username: "pharmacy@example.com",
    password: "",
    enableSMS: true,
    enableEmail: true
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage system settings and configurations</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pharmacy">Pharmacy Profile</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Template</TabsTrigger>
          <TabsTrigger value="integration">SMS/Email</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add User Form */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New User
                </CardTitle>
                <CardDescription>Create a new user account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="userName">Full Name</Label>
                  <Input
                    id="userName"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Enter email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrator">Administrator</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Inventory">Inventory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    placeholder="Enter password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className="lg:col-span-2 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{user.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pharmacy Profile Tab */}
        <TabsContent value="pharmacy">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Pharmacy Profile
              </CardTitle>
              <CardDescription>Update your pharmacy information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                    <Input
                      id="pharmacyName"
                      value={pharmacyProfile.name}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={pharmacyProfile.address}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={pharmacyProfile.city}
                        onChange={(e) => setPharmacyProfile({...pharmacyProfile, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={pharmacyProfile.pincode}
                        onChange={(e) => setPharmacyProfile({...pharmacyProfile, pincode: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={pharmacyProfile.phone}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={pharmacyProfile.email}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gst">GST Number</Label>
                    <Input
                      id="gst"
                      value={pharmacyProfile.gst}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, gst: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="drugLicense">Drug License</Label>
                    <Input
                      id="drugLicense"
                      value={pharmacyProfile.drugLicense}
                      onChange={(e) => setPharmacyProfile({...pharmacyProfile, drugLicense: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="space-y-2">
                  <Label>Logo Upload</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your pharmacy logo (PNG, JPG)
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Template Tab */}
        <TabsContent value="invoice">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Template
              </CardTitle>
              <CardDescription>Customize your invoice template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                    <Input
                      id="invoicePrefix"
                      placeholder="BILL-"
                      defaultValue="BILL-"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
                    <Textarea
                      id="invoiceFooter"
                      placeholder="Enter footer text for invoices"
                      defaultValue="Thank you for your business!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="termsConditions">Terms & Conditions</Label>
                    <Textarea
                      id="termsConditions"
                      placeholder="Enter terms and conditions"
                      defaultValue="All sales are final. No refunds without proper documentation."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-6 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-4">Invoice Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Invoice No:</span>
                        <span>BILL-2024-001</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="text-xs text-muted-foreground">
                        Preview shows how your invoice will appear
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Preview Template
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Reset to Default
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS/Email Integration Tab */}
        <TabsContent value="integration">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMS/Email Integration
              </CardTitle>
              <CardDescription>Configure communication settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Settings</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={emailSettings.enableEmail}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableEmail: checked})}
                    />
                    <Label>Enable Email Notifications</Label>
                  </div>
                  <div>
                    <Label htmlFor="smtpServer">SMTP Server</Label>
                    <Input
                      id="smtpServer"
                      value={emailSettings.smtpServer}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailUsername">Username</Label>
                    <Input
                      id="emailUsername"
                      value={emailSettings.username}
                      onChange={(e) => setEmailSettings({...emailSettings, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailPassword">Password</Label>
                    <Input
                      id="emailPassword"
                      type="password"
                      value={emailSettings.password}
                      onChange={(e) => setEmailSettings({...emailSettings, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">SMS Settings</h4>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={emailSettings.enableSMS}
                      onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableSMS: checked})}
                    />
                    <Label>Enable SMS Notifications</Label>
                  </div>
                  <div>
                    <Label htmlFor="smsProvider">SMS Provider</Label>
                    <Select defaultValue="twilio">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="aws">AWS SNS</SelectItem>
                        <SelectItem value="textlocal">TextLocal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="smsApiKey">API Key</Label>
                    <Input
                      id="smsApiKey"
                      type="password"
                      placeholder="Enter SMS API key"
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1">
                      Test Email
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Test SMS
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup">
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Backup & Data Management
              </CardTitle>
              <CardDescription>Manage data backups and exports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Automatic Backup</h4>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Enable Automatic Daily Backup</Label>
                  </div>
                  <div>
                    <Label htmlFor="backupTime">Backup Time</Label>
                    <Input
                      id="backupTime"
                      type="time"
                      defaultValue="02:00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retentionDays">Retention Period (Days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      defaultValue="30"
                    />
                  </div>
                  <Button className="w-full">
                    <HardDrive className="w-4 h-4 mr-2" />
                    Create Backup Now
                  </Button>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Data Export</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Sales Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Inventory Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Customer Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Purchase Orders
                    </Button>
                  </div>
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Last backup: January 15, 2024 at 2:00 AM
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Backup size: 156 MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsModule;
// import { useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { 
//   Users, 
//   Building2, 
//   FileText, 
//   Mail, 
//   HardDrive, 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Upload, 
//   Save,
//   Download,
//   RefreshCw,
//   Eye,
//   CheckCircle,
//   AlertTriangle,
//   Clock
// } from "lucide-react";

// const SettingsModule = () => {
//   const [users, setUsers] = useState([
//     { id: 1, name: "Admin User", email: "admin@pharmacy.com", role: "Administrator", status: "Active" },
//     { id: 2, name: "Cashier 1", email: "cashier1@pharmacy.com", role: "Cashier", status: "Active" },
//     { id: 3, name: "Inventory Manager", email: "inventory@pharmacy.com", role: "Manager", status: "Active" },
//   ]);

//   const [pharmacyProfile, setPharmacyProfile] = useState({
//     name: "MediCare Pharmacy",
//     address: "123 Health Street, Medical District",
//     city: "Hyderabad",
//     state: "Telangana",
//     pincode: "500001",
//     phone: "+91 9876543210",
//     email: "info@medicare.com",
//     gst: "36ABCDE1234F1Z5",
//     drugLicense: "DL-TS-2024-001"
//   });

//   const [newUser, setNewUser] = useState({
//     name: "",
//     email: "",
//     role: "",
//     password: ""
//   });

//   const [emailSettings, setEmailSettings] = useState({
//     smtpServer: "smtp.gmail.com",
//     smtpPort: "587",
//     username: "pharmacy@example.com",
//     password: "",
//     enableSMS: true,
//     enableEmail: true
//   });

//   const [isSaving, setIsSaving] = useState(false);
//   const [isExporting, setIsExporting] = useState(false);
//   const [isCreatingBackup, setIsCreatingBackup] = useState(false);
//   const [isTestingEmail, setIsTestingEmail] = useState(false);
//   const [isTestingSMS, setIsTestingSMS] = useState(false);

//   // Button functionality functions
//   const handleSaveChanges = async () => {
//     setIsSaving(true);
    
//     // Simulate save process
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     setIsSaving(false);
//     alert('All settings have been saved successfully!');
//   };

//   const handleExportSettings = async () => {
//     setIsExporting(true);
    
//     // Create settings export
//     const settingsData = {
//       pharmacyProfile,
//       emailSettings,
//       users: users.map(user => ({ ...user, password: '***' })), // Hide passwords
//       exportDate: new Date().toISOString(),
//       version: '1.0'
//     };
    
//     const content = JSON.stringify(settingsData, null, 2);
//     const blob = new Blob([content], { type: 'application/json' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `pharmacy_settings_${new Date().toISOString().split('T')[0]}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
    
//     setIsExporting(false);
//     alert('Settings exported successfully!');
//   };

//   const handleAddUser = () => {
//     if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
//       alert('Please fill in all required fields.');
//       return;
//     }

//     if (!newUser.email.includes('@')) {
//       alert('Please enter a valid email address.');
//       return;
//     }

//     if (newUser.password.length < 6) {
//       alert('Password must be at least 6 characters long.');
//       return;
//     }

//     const newUserData = {
//       id: users.length + 1,
//       ...newUser,
//       status: 'Active'
//     };

//     setUsers([...users, newUserData]);
//     setNewUser({ name: '', email: '', role: '', password: '' });
//     alert(`User "${newUser.name}" has been added successfully!`);
//   };

//   const handleEditUser = (userId) => {
//     const user = users.find(u => u.id === userId);
//     if (user) {
//       const newName = prompt('Enter new name:', user.name);
//       const newEmail = prompt('Enter new email:', user.email);
//       const newRole = prompt('Enter new role (Administrator/Manager/Cashier/Inventory):', user.role);
      
//       if (newName && newEmail && newRole) {
//         setUsers(users.map(u => 
//           u.id === userId 
//             ? { ...u, name: newName, email: newEmail, role: newRole }
//             : u
//         ));
//         alert('User updated successfully!');
//       }
//     }
//   };

//   const handleDeleteUser = (userId) => {
//     const user = users.find(u => u.id === userId);
//     if (user) {
//       if (window.confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
//         setUsers(users.filter(u => u.id !== userId));
//         alert(`User "${user.name}" has been deleted.`);
//       }
//     }
//   };

//   const handleUploadLogo = () => {
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = 'image/png,image/jpeg,image/jpg';
//     input.onchange = (e) => {
//       const file = e.target.files[0];
//       if (file) {
//         if (file.size > 5 * 1024 * 1024) { // 5MB limit
//           alert('File size must be less than 5MB.');
//           return;
//         }
//         alert(`Logo "${file.name}" uploaded successfully!`);
//       }
//     };
//     input.click();
//   };

//   const handlePreviewTemplate = () => {
//     const previewContent = `
// Invoice Preview:
// ================

// Invoice No: BILL-2024-001
// Date: ${new Date().toLocaleDateString()}
// Pharmacy: ${pharmacyProfile.name}
// Address: ${pharmacyProfile.address}

// Items:
// ------
// [Product details would appear here]

// Total: ₹0.00

// Footer: Thank you for your business!
// Terms: All sales are final. No refunds without proper documentation.
//     `;
//     alert(previewContent);
//   };

//   const handleResetTemplate = () => {
//     if (window.confirm('Are you sure you want to reset the invoice template to default settings?')) {
//       alert('Invoice template has been reset to default settings.');
//     }
//   };

//   const handleTestEmail = async () => {
//     if (!emailSettings.enableEmail) {
//       alert('Please enable email notifications first.');
//       return;
//     }

//     setIsTestingEmail(true);
    
//     // Simulate email test
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     setIsTestingEmail(false);
//     alert(`Test email sent successfully to ${emailSettings.username}!`);
//   };

//   const handleTestSMS = async () => {
//     if (!emailSettings.enableSMS) {
//       alert('Please enable SMS notifications first.');
//       return;
//     }

//     setIsTestingSMS(true);
    
//     // Simulate SMS test
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     setIsTestingSMS(false);
//     alert('Test SMS sent successfully!');
//   };

//   const handleCreateBackup = async () => {
//     setIsCreatingBackup(true);
    
//     // Simulate backup creation
//     await new Promise(resolve => setTimeout(resolve, 3000));
    
//     setIsCreatingBackup(false);
//     alert('Backup created successfully! Backup file: pharmacy_backup_' + new Date().toISOString().split('T')[0] + '.zip');
//   };

//   const handleExportData = (dataType) => {
//     const exportData = {
//       type: dataType,
//       timestamp: new Date().toISOString(),
//       data: `Sample ${dataType} data would be exported here...`
//     };

//     const content = JSON.stringify(exportData, null, 2);
//     const blob = new Blob([content], { type: 'application/json' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${dataType.toLowerCase().replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.json`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
    
//     alert(`${dataType} exported successfully!`);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col justify-between gap-4 lg:flex-row">
//         <div>
//         </div>
//         <div className="flex gap-2">
//           <Button 
//             onClick={handleSaveChanges}
//             disabled={isSaving}
//           >
//             {isSaving ? (
//               <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//             ) : (
//               <Save className="w-4 h-4 mr-2" />
//             )}
//             {isSaving ? 'Saving...' : 'Save Changes'}
//           </Button>
//           <Button 
//             variant="outline"
//             onClick={handleExportSettings}
//             disabled={isExporting}
//           >
//             {isExporting ? (
//               <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//             ) : (
//               <Download className="w-4 h-4 mr-2" />
//             )}
//             {isExporting ? 'Exporting...' : 'Export Settings'}
//           </Button>
//         </div>
//       </div>

//       {/* Settings Tabs */}
//       <Tabs defaultValue="users" className="w-full">
//         <TabsList className="grid w-full grid-cols-5">
//           <TabsTrigger value="users">Users</TabsTrigger>
//           <TabsTrigger value="pharmacy">Pharmacy Profile</TabsTrigger>
//           <TabsTrigger value="invoice">Invoice Template</TabsTrigger>
//           <TabsTrigger value="integration">SMS/Email</TabsTrigger>
//           <TabsTrigger value="backup">Backup</TabsTrigger>
//         </TabsList>

//         {/* Users Tab */}
//         <TabsContent value="users">
//           <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//             {/* Add User Form */}
//             <Card className="shadow-medium">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Plus className="w-5 h-5" />
//                   Add New User
//                 </CardTitle>
//                 <CardDescription>Create a new user account</CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="userName">Full Name</Label>
//                   <Input
//                     id="userName"
//                     placeholder="Enter full name"
//                     value={newUser.name}
//                     onChange={(e) => setNewUser({...newUser, name: e.target.value})}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="userEmail">Email</Label>
//                   <Input
//                     id="userEmail"
//                     type="email"
//                     placeholder="Enter email"
//                     value={newUser.email}
//                     onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//                   />
//                 </div>
//                 <div>
//                   <Label htmlFor="userRole">Role</Label>
//                   <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select role" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Administrator">Administrator</SelectItem>
//                       <SelectItem value="Manager">Manager</SelectItem>
//                       <SelectItem value="Cashier">Cashier</SelectItem>
//                       <SelectItem value="Inventory">Inventory</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label htmlFor="userPassword">Password</Label>
//                   <Input
//                     id="userPassword"
//                     type="password"
//                     placeholder="Enter password"
//                     value={newUser.password}
//                     onChange={(e) => setNewUser({...newUser, password: e.target.value})}
//                   />
//                 </div>
//                 <Button 
//                   className="w-full"
//                   onClick={handleAddUser}
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Add User
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Users List */}
//             <Card className="lg:col-span-2 shadow-medium">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   User Management
//                 </CardTitle>
//                 <CardDescription>Manage user accounts and permissions</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Name</TableHead>
//                       <TableHead>Email</TableHead>
//                       <TableHead>Role</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {users.map((user) => (
//                       <TableRow key={user.id}>
//                         <TableCell className="font-medium">{user.name}</TableCell>
//                         <TableCell>{user.email}</TableCell>
//                         <TableCell>
//                           <Badge variant="outline">{user.role}</Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant="default">{user.status}</Badge>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex gap-2">
//                             <Button 
//                               size="sm" 
//                               variant="outline"
//                               onClick={() => handleEditUser(user.id)}
//                               title="Edit User"
//                             >
//                               <Edit className="w-3 h-3" />
//                             </Button>
//                             <Button 
//                               size="sm" 
//                               variant="destructive"
//                               onClick={() => handleDeleteUser(user.id)}
//                               title="Delete User"
//                             >
//                               <Trash2 className="w-3 h-3" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         {/* Pharmacy Profile Tab */}
//         <TabsContent value="pharmacy">
//           <Card className="shadow-medium">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Building2 className="w-5 h-5" />
//                 Pharmacy Profile
//               </CardTitle>
//               <CardDescription>Update your pharmacy information</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="pharmacyName">Pharmacy Name</Label>
//                     <Input
//                       id="pharmacyName"
//                       value={pharmacyProfile.name}
//                       onChange={(e) => setPharmacyProfile({...pharmacyProfile, name: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="address">Address</Label>
//                     <Textarea
//                       id="address"
//                       value={pharmacyProfile.address}
//                       onChange={(e) => setPharmacyProfile({...pharmacyProfile, address: e.target.value})}
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="city">City</Label>
//                       <Input
//                         id="city"
//                         value={pharmacyProfile.city}
//                         onChange={(e) => setPharmacyProfile({...pharmacyProfile, city: e.target.value})}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="pincode">Pincode</Label>
//                       <Input
//                         id="pincode"
//                         value={pharmacyProfile.pincode}
//                         onChange={(e) => setPharmacyProfile({...pharmacyProfile, pincode: e.target.value})}
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="phone">Phone</Label>
//                     <Input
//                       id="phone"
//                       value={pharmacyProfile.phone}
//                       onChange={(e) => setPharmacyProfile({...pharmacyProfile, phone: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="email">Email</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={pharmacyProfile.email}
//                       onChange={(e) => setPharmacyProfile({...pharmacyProfile, email: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="gst">GST Number</Label>
//                     <Input
//                       id="gst"
//                       value={pharmacyProfile.gst}
//                       onChange={(e) => setPharmacyProfile({...pharmacyProfile, gst: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="drugLicense">Drug License</Label>
//                     <Input
//                       id="drugLicense"
//                       value={pharmacyProfile.drugLicense}
//                       onChange={(e) => setPharmacyProfile({...pharmacyProfile, drugLicense: e.target.value})}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-6">
//                 <div className="space-y-2">
//                   <Label>Logo Upload</Label>
//                   <div className="p-6 text-center border-2 border-dashed rounded-lg border-border">
//                     <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
//                     <p className="mb-2 text-sm text-muted-foreground">
//                       Upload your pharmacy logo (PNG, JPG)
//                     </p>
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={handleUploadLogo}
//                     >
//                       Choose File
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Invoice Template Tab */}
//         <TabsContent value="invoice">
//           <Card className="shadow-medium">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileText className="w-5 h-5" />
//                 Invoice Template
//               </CardTitle>
//               <CardDescription>Customize your invoice template</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
//                     <Input
//                       id="invoicePrefix"
//                       placeholder="BILL-"
//                       defaultValue="BILL-"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
//                     <Textarea
//                       id="invoiceFooter"
//                       placeholder="Enter footer text for invoices"
//                       defaultValue="Thank you for your business!"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="termsConditions">Terms & Conditions</Label>
//                     <Textarea
//                       id="termsConditions"
//                       placeholder="Enter terms and conditions"
//                       defaultValue="All sales are final. No refunds without proper documentation."
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div className="p-6 border rounded-lg bg-muted/50">
//                     <h4 className="mb-4 font-medium">Invoice Preview</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span>Invoice No:</span>
//                         <span>BILL-2024-001</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span>Date:</span>
//                         <span>{new Date().toLocaleDateString()}</span>
//                       </div>
//                       <hr className="my-2" />
//                       <div className="text-xs text-muted-foreground">
//                         Preview shows how your invoice will appear
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button 
//                       variant="outline" 
//                       className="flex-1"
//                       onClick={handlePreviewTemplate}
//                     >
//                       <Eye className="w-4 h-4 mr-2" />
//                       Preview Template
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       className="flex-1"
//                       onClick={handleResetTemplate}
//                     >
//                       <RefreshCw className="w-4 h-4 mr-2" />
//                       Reset to Default
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* SMS/Email Integration Tab */}
//         <TabsContent value="integration">
//           <Card className="shadow-medium">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Mail className="w-5 h-5" />
//                 SMS/Email Integration
//               </CardTitle>
//               <CardDescription>Configure communication settings</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                 <div className="space-y-4">
//                   <h4 className="font-medium">Email Settings</h4>
//                   <div className="flex items-center space-x-2">
//                     <Switch
//                       checked={emailSettings.enableEmail}
//                       onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableEmail: checked})}
//                     />
//                     <Label>Enable Email Notifications</Label>
//                   </div>
//                   <div>
//                     <Label htmlFor="smtpServer">SMTP Server</Label>
//                     <Input
//                       id="smtpServer"
//                       value={emailSettings.smtpServer}
//                       onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="smtpPort">SMTP Port</Label>
//                     <Input
//                       id="smtpPort"
//                       value={emailSettings.smtpPort}
//                       onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="emailUsername">Username</Label>
//                     <Input
//                       id="emailUsername"
//                       value={emailSettings.username}
//                       onChange={(e) => setEmailSettings({...emailSettings, username: e.target.value})}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="emailPassword">Password</Label>
//                     <Input
//                       id="emailPassword"
//                       type="password"
//                       value={emailSettings.password}
//                       onChange={(e) => setEmailSettings({...emailSettings, password: e.target.value})}
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <h4 className="font-medium">SMS Settings</h4>
//                   <div className="flex items-center space-x-2">
//                     <Switch
//                       checked={emailSettings.enableSMS}
//                       onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableSMS: checked})}
//                     />
//                     <Label>Enable SMS Notifications</Label>
//                   </div>
//                   <div>
//                     <Label htmlFor="smsProvider">SMS Provider</Label>
//                     <Select defaultValue="twilio">
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="twilio">Twilio</SelectItem>
//                         <SelectItem value="aws">AWS SNS</SelectItem>
//                         <SelectItem value="textlocal">TextLocal</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label htmlFor="smsApiKey">API Key</Label>
//                     <Input
//                       id="smsApiKey"
//                       type="password"
//                       placeholder="Enter SMS API key"
//                     />
//                   </div>
//                   <div className="flex gap-2 mt-4">
//                     <Button 
//                       variant="outline" 
//                       className="flex-1"
//                       onClick={handleTestEmail}
//                       disabled={isTestingEmail}
//                     >
//                       {isTestingEmail ? (
//                         <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                       ) : (
//                         <Mail className="w-4 h-4 mr-2" />
//                       )}
//                       {isTestingEmail ? 'Testing...' : 'Test Email'}
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       className="flex-1"
//                       onClick={handleTestSMS}
//                       disabled={isTestingSMS}
//                     >
//                       {isTestingSMS ? (
//                         <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                       ) : (
//                         <Mail className="w-4 h-4 mr-2" />
//                       )}
//                       {isTestingSMS ? 'Testing...' : 'Test SMS'}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Backup Tab */}
//         <TabsContent value="backup">
//           <Card className="shadow-medium">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <HardDrive className="w-5 h-5" />
//                 Backup & Data Management
//               </CardTitle>
//               <CardDescription>Manage data backups and exports</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//                 <div className="space-y-4">
//                   <h4 className="font-medium">Automatic Backup</h4>
//                   <div className="flex items-center space-x-2">
//                     <Switch defaultChecked />
//                     <Label>Enable Automatic Daily Backup</Label>
//                   </div>
//                   <div>
//                     <Label htmlFor="backupTime">Backup Time</Label>
//                     <Input
//                       id="backupTime"
//                       type="time"
//                       defaultValue="02:00"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="retentionDays">Retention Period (Days)</Label>
//                     <Input
//                       id="retentionDays"
//                       type="number"
//                       defaultValue="30"
//                     />
//                   </div>
//                   <Button 
//                     className="w-full"
//                     onClick={handleCreateBackup}
//                     disabled={isCreatingBackup}
//                   >
//                     {isCreatingBackup ? (
//                       <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                     ) : (
//                       <HardDrive className="w-4 h-4 mr-2" />
//                     )}
//                     {isCreatingBackup ? 'Creating Backup...' : 'Create Backup Now'}
//                   </Button>
//                 </div>
//                 <div className="space-y-4">
//                   <h4 className="font-medium">Data Export</h4>
//                   <div className="space-y-2">
//                     <Button 
//                       variant="outline" 
//                       className="justify-start w-full"
//                       onClick={() => handleExportData('All Sales Data')}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Export All Sales Data
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       className="justify-start w-full"
//                       onClick={() => handleExportData('Inventory Data')}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Export Inventory Data
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       className="justify-start w-full"
//                       onClick={() => handleExportData('Customer Data')}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Export Customer Data
//                     </Button>
//                     <Button 
//                       variant="outline" 
//                       className="justify-start w-full"
//                       onClick={() => handleExportData('Purchase Orders')}
//                     >
//                       <Download className="w-4 h-4 mr-2" />
//                       Export Purchase Orders
//                     </Button>
//                   </div>
//                   <div className="p-4 mt-4 rounded-lg bg-muted">
//                     <p className="text-sm text-muted-foreground">
//                       Last backup: January 15, 2024 at 2:00 AM
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       Backup size: 156 MB
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default SettingsModule;

import React from 'react'

function Settings() {
  return (
    <div>Settings</div>
  )
}

export default Settings
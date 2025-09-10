import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import React from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  IndianRupee
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

const Parties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddParty, setShowAddParty] = useState(false);

  // Mock party data
  const parties = [
    {
      code: 'PRT-001',
      name: 'Apollo Pharmacy - Banjara Hills',
      type: 'Customer',
      dlNo: 'TS-DL-20B-2024-001',
      gstin: '36AAAAA0000A1Z5',
      contact: 'Ramesh Kumar',
      mobile: '+91 9876543210',
      email: 'ramesh@apollo.com',
      area: 'Banjara Hills',
      city: 'Hyderabad',
      district: 'Hyderabad',
      creditLimit: '₹5,00,000',
      outstanding: '₹1,23,456',
      status: 'Active'
    },
    {
      code: 'PRT-002',
      name: 'MedPlus Health Services',
      type: 'Customer',
      dlNo: 'TS-DL-21B-2024-002',
      gstin: '36BBBBB1111B2Z6',
      contact: 'Suresh Reddy',
      mobile: '+91 9876543211',
      email: 'suresh@medplus.com',
      area: 'Kukatpally',
      city: 'Hyderabad',
      district: 'Hyderabad',
      creditLimit: '₹3,00,000',
      outstanding: '₹87,654',
      status: 'Active'
    },
    {
      code: 'SUP-001',
      name: 'Sun Pharmaceutical Industries',
      type: 'Supplier',
      dlNo: 'MH-DL-20B-2023-789',
      gstin: '27CCCCC2222C3Z7',
      contact: 'Vijay Sharma',
      mobile: '+91 9876543212',
      email: 'vijay@sunpharma.com',
      area: 'Andheri East',
      city: 'Mumbai',
      district: 'Mumbai',
      creditLimit: '₹10,00,000',
      outstanding: '₹2,34,567',
      status: 'Active'
    }
  ];

  const [formData, setFormData] = useState({
    partyCode: '',
    partyName: '',
    dlNo: '',
    gstin: '',
    contactPerson: '',
    mobile: '',
    email: '',
    area: '',
    city: '',
    district: '',
    pincode: '',
    creditLimit: ''
  });

  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || party.type.toLowerCase() === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddParty = (e) => {
    e.preventDefault();
    console.log('Adding party:', formData);
    setShowAddParty(false);
    // Reset form
    setFormData({
      partyCode: '',
      partyName: '',
      dlNo: '',
      gstin: '',
      contactPerson: '',
      mobile: '',
      email: '',
      area: '',
      city: '',
      district: '',
      pincode: '',
      creditLimit: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Party Management</h1>
          <p className="text-muted-foreground">
            Manage customers and suppliers for your distribution network
          </p>
        </div>

        <Dialog open={showAddParty} onOpenChange={setShowAddParty}>
          <DialogTrigger asChild>
            <Button variant="medical" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Party
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>
                Enter the details for the new customer or supplier
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddParty} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partyCode">Party Code</Label>
                  <Input
                    id="partyCode"
                    value={formData.partyCode}
                    onChange={(e) => setFormData({ ...formData, partyCode: e.target.value })}
                    placeholder="Auto-generated"
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partyName">Party Name *</Label>
                  <Input
                    id="partyName"
                    value={formData.partyName}
                    onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                    placeholder="Enter party name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dlNo">Drug License No</Label>
                  <Input
                    id="dlNo"
                    value={formData.dlNo}
                    onChange={(e) => setFormData({ ...formData, dlNo: e.target.value })}
                    placeholder="TS-DL-20B-2024-XXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="36XXXXXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="party@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="Area/Locality"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="District"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="₹0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddParty(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="medical">
                  Add Party
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by party name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Party Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="supplier">Suppliers</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parties List</CardTitle>
          <CardDescription>
            Total {filteredParties.length} parties found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party Details</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Licenses</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Credit Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParties.map((party) => (
                  <TableRow key={party.code}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{party.code}</span>
                          <Badge variant={party.type === 'Customer' ? 'secondary' : 'outline'}>
                            {party.type}
                          </Badge>
                        </div>
                        <p className="font-medium">{party.name}</p>
                        <p className="text-sm text-muted-foreground">{party.contact}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {party.mobile}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {party.email}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div><strong>DL:</strong> {party.dlNo}</div>
                        <div><strong>GST:</strong> {party.gstin}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {party.area}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {party.city}, {party.district}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div><strong>Limit:</strong> {party.creditLimit}</div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span className="text-warning">{party.outstanding}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={party.status === 'Active' ? 'default' : 'secondary'}>
                        {party.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Party">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="View Ledger">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Party">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Parties;
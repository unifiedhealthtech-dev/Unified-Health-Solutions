// components/Parties.js
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  IndianRupee,
  Clock,
  Check,
  X,
  UserPlus
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
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from "../components/ui/toast";

// Parties-related hooks
import { 
  useGetPartiesQuery, 
  useAddPartyMutation 
} from "../services/partiesApi";

// Connection-related hooks
import { 
  useGetConnectionRequestsQuery,
  useAcceptConnectionRequestMutation,
  useRejectConnectionRequestMutation,
  useGetConnectedRetailersQuery
} from "../services/distributorConnectionsApi";

const Parties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddParty, setShowAddParty] = useState(false);
  const [activeTab, setActiveTab] = useState('parties');
  const [toast, setToast] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'default'
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      code: '',
      name: '',
      type: 'Customer',
      contact_person: '',
      mobile: '',
      email: '',
      dl_no: '',
      gstin: '',
      area: '',
      city: '',
      district: '',
      pincode: '',
      credit_limit: ''
    }
  });

  // Watch the type field for Select component
  const partyType = watch('type');

  // RTK Query hooks for parties
  const { data: partiesData, isLoading: partiesLoading, refetch: refetchParties } = useGetPartiesQuery();
  const [addParty] = useAddPartyMutation();

  // RTK Query hooks for connection management
  const { data: requestsData, isLoading: requestsLoading, refetch: refetchRequests } = useGetConnectionRequestsQuery();
  const { data: connectedRetailersData, isLoading: connectedRetailersLoading, refetch: refetchConnectedRetailers } = useGetConnectedRetailersQuery();
  const [acceptConnectionRequest] = useAcceptConnectionRequestMutation();
  const [rejectConnectionRequest] = useRejectConnectionRequestMutation();

  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const parties = partiesData?.data || partiesData || [];
  const connectionRequests = requestsData?.data || requestsData || [];
  console.log('Connection Requests Data:', connectionRequests);
  const connectedRetailers = connectedRetailersData?.data || connectedRetailersData || [];
useEffect(() => {
  if (activeTab === "parties") {
    refetchParties();
  } else if (activeTab === "requests") {
    refetchRequests();
  } else if (activeTab === "connected") {
    refetchConnectedRetailers();
  }
}, [activeTab, refetchParties, refetchRequests, refetchConnectedRetailers]);
  const filteredParties = parties.filter(party => {
    const matchesSearch = party.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || party.type?.toLowerCase() === selectedType;
    return matchesSearch && matchesType;
  });

  const showToast = (title, description, variant = 'default') => {
    setToast({
      open: true,
      title,
      description,
      variant
    });
    
    setTimeout(() => {
      setToast(prev => ({ ...prev, open: false }));
    }, 5000);
  };

  const onSubmit = async (data) => {
    try {
      // Transform data to match backend expectations
      const partyData = {
        partyCode: data.code,
        partyName: data.name,
        dlNo: data.dl_no,
        gstin: data.gstin,
        contactPerson: data.contact_person,
        mobile: data.mobile,
        email: data.email,
        area: data.area,
        city: data.city,
        district: data.district,
        pincode: data.pincode,
        creditLimit: data.credit_limit,
        type: data.type
      };

      const result = await addParty(partyData).unwrap();
      showToast('Success', 'Party added successfully!', 'success');
      setShowAddParty(false);
      reset();
      refetchParties();
    } catch (error) {
      console.error('Failed to add party:', error);
      let errorMessage = 'Failed to add party. Please try again.';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      showToast('Error', errorMessage, 'destructive');
    }
  };

  const handleAcceptRequest = async (requestId, retailerName) => {
    setIsAccepting(true);
    try {
      await acceptConnectionRequest({ requestId }).unwrap();
      showToast('Success', `Connection request from ${retailerName} accepted!`, 'success');
      refetchRequests();
      refetchConnectedRetailers();
    } catch (error) {
      console.error('Failed to accept connection request:', error);
      let errorMessage = 'Failed to accept connection request. Please try again.';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      showToast('Error', errorMessage, 'destructive');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleRejectRequest = async (requestId, retailerName) => {
    if (window.confirm(`Are you sure you want to reject the connection request from ${retailerName}?`)) {
      setIsRejecting(true);
      try {
        await rejectConnectionRequest({ requestId }).unwrap();
        showToast('Success', `Connection request from ${retailerName} rejected.`, 'success');
        refetchRequests();
      } catch (error) {
        console.error('Failed to reject connection request:', error);
        let errorMessage = 'Failed to reject connection request. Please try again.';
        if (error?.data?.message) {
          errorMessage = error.data.message;
        }
        showToast('Error', errorMessage, 'destructive');
      } finally {
        setIsRejecting(false);
      }
    }
  };

  const handleAssignSalesRep = async (retailerId, retailerName) => {
    showToast('Info', `Feature to assign sales representative to ${retailerName} will be available soon!`, 'default');
  };

  const handleDisconnect = async (retailerId, retailerName) => {
    if (window.confirm(`Are you sure you want to disconnect from ${retailerName}?`)) {
      showToast('Success', `Disconnected from ${retailerName}`, 'success');
      refetchConnectedRetailers();
    }
  };

  if (partiesLoading && activeTab === 'parties') {
    return (
      <div className="p-6">
        <div className="text-center">Loading parties...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ToastProvider swipeDirection="right">
        {toast.open && (
          <Toast variant={toast.variant} open={toast.open} onOpenChange={(open) => setToast({ ...toast, open })}>
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Party Management</h1>
          <p className="text-muted-foreground">
            Manage customers, suppliers, and connection requests
          </p>
        </div>

        <Dialog open={showAddParty} onOpenChange={setShowAddParty}>
          <DialogTrigger asChild>
            <Button variant="medical" size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Party
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>
                Enter the details for the new customer or supplier
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Party Code *</Label>
                  <Input
                    id="code"
                    {...register('code', { required: 'Party code is required' })}
                    placeholder="Enter party code"
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Party Name *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'Party name is required' })}
                    placeholder="Enter party name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Party Type *</Label>
                <Select 
                  value={partyType}
                  onValueChange={(value) => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer">Customer</SelectItem>
                    <SelectItem value="Supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    {...register('contact_person')}
                    placeholder="Contact person name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    {...register('mobile', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Please enter a valid 10-digit mobile number'
                      }
                    })}
                    placeholder="9876543210"
                  />
                  {errors.mobile && (
                    <p className="text-sm text-red-500">{errors.mobile.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="party@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dl_no">Drug License No</Label>
                  <Input
                    id="dl_no"
                    {...register('dl_no')}
                    placeholder="TS-DL-20B-2024-XXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    {...register('gstin', {
                      pattern: {
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                        message: 'Invalid GSTIN format'
                      }
                    })}
                    placeholder="36XXXXXXXXXXXXX"
                  />
                  {errors.gstin && (
                    <p className="text-sm text-red-500">{errors.gstin.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input
                    id="area"
                    {...register('area')}
                    placeholder="Area/Locality"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register('city')}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    {...register('district')}
                    placeholder="District"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    {...register('pincode', {
                      pattern: {
                        value: /^[1-9][0-9]{5}$/,
                        message: 'Invalid pincode format'
                      }
                    })}
                    placeholder="500001"
                  />
                  {errors.pincode && (
                    <p className="text-sm text-red-500">{errors.pincode.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    {...register('credit_limit', {
                      min: {
                        value: 0,
                        message: 'Credit limit cannot be negative'
                      }
                    })}
                    placeholder="0"
                  />
                  {errors.credit_limit && (
                    <p className="text-sm text-red-500">{errors.credit_limit.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAddParty(false);
                    reset();
                  }}
                >
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parties">My Parties</TabsTrigger>
          <TabsTrigger value="requests">Connection Requests</TabsTrigger>
          <TabsTrigger value="connected">Connected Retailers</TabsTrigger>
        </TabsList>

        {/* My Parties Tab */}
        <TabsContent value="parties">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 mb-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
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
                    <Search className="w-4 h-4" />
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Parties List</CardTitle>
              <CardDescription>
                Total {filteredParties.length} parties found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
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
                      <TableRow key={party.id || party.party_id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{party.code}</span>
                              <Badge variant={party.type === 'Customer' ? 'secondary' : 'outline'}>
                                {party.type}
                              </Badge>
                            </div>
                            <p className="font-medium">{party.name}</p>
                            <p className="text-sm text-muted-foreground">{party.contact_person}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3" />
                              {party.mobile || party.phone}
                            </div>
                            {party.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {party.email}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div><strong>DL:</strong> {party.dl_no || 'N/A'}</div>
                            <div><strong>GST:</strong> {party.gstin || 'N/A'}</div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="w-3 h-3" />
                              {party.area || party.address || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {party.city || 'N/A'}, {party.district || party.state || 'N/A'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div><strong>Limit:</strong> ₹{party.credit_limit || '0'}</div>
                            <div className="flex items-center gap-1">
                              <IndianRupee className="w-3 h-3" />
                              <span className="text-warning">₹{party.outstanding || '0'}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={party.status === 'Active' || party.is_active ? 'default' : 'secondary'}>
                            {party.status || (party.is_active ? 'Active' : 'Inactive')}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Edit Party">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="View Ledger">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete Party">
                              <Trash2 className="w-4 h-4 text-destructive" />
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
        </TabsContent>

        {/* Connection Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Connection Requests</CardTitle>
              <CardDescription>
                Review and manage connection requests from retailers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading connection requests...</p>
                </div>
              ) : connectionRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground">No Connection Requests</h3>
                  <p className="text-muted-foreground">You don't have any pending connection requests.</p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Retailer Details</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connectionRequests.map((request, index) => {
                        const retailer = request.Retailer || request.retailer || {};
                        return (
                          <TableRow key={request.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium">{retailer.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">
                                DL: {retailer.license_number || retailer.dl_no || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                GST: {retailer.gst_number || retailer.gstin || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <UserPlus className="w-3 h-3" />
                                {retailer.contact_person || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {retailer.phone || retailer.mobile || 'N/A'}
                              </div>
                              {retailer.email && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {retailer.email}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{retailer.address || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">
                                {retailer.city || 'N/A'}, {retailer.state || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {request.created_at ? new Date(request.created_at).toLocaleString() : 'N/A'}
                              </div>
                              <Badge variant="warning" className="mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-green-500 border-green-500 hover:bg-green-50"
                                  onClick={() => handleAcceptRequest(request.id, retailer.name || 'Retailer')}
                                  disabled={isAccepting}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-500 border-red-500 hover:bg-red-50"
                                  onClick={() => handleRejectRequest(request.id, retailer.name || 'Retailer')}
                                  disabled={isRejecting}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connected Retailers Tab */}
        <TabsContent value="connected">
          <Card>
            <CardHeader>
              <CardTitle>Connected Retailers</CardTitle>
              <CardDescription>
                Manage your connected retailers and assign sales representatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedRetailersLoading ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  <p className="mt-4 text-muted-foreground">Loading connected retailers...</p>
                </div>
              ) : connectedRetailers.length === 0 ? (
                <div className="py-8 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-muted-foreground">No Connected Retailers</h3>
                  <p className="text-muted-foreground">You don't have any connected retailers yet.</p>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Retailer Details</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Connected Since</TableHead>
                        <TableHead>Sales Rep</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {connectedRetailers.map((connection, index) => {
                        const retailer = connection.Retailer || connection.retailer || {};
                        return (
                          <TableRow key={connection.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium">{retailer.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">
                                DL: {retailer.license_number || retailer.dl_no || 'N/A'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                GST: {retailer.gst_number || retailer.gstin || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <UserPlus className="w-3 h-3" />
                                {retailer.contact_person || 'N/A'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {retailer.phone || retailer.mobile || 'N/A'}
                              </div>
                              {retailer.email && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {retailer.email}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{retailer.address || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">
                                {retailer.city || 'N/A'}, {retailer.state || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="success">
                                {connection.updated_at ? new Date(connection.updated_at).toLocaleDateString() : 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {connection.sales_rep ? (
                                <div className="text-sm">
                                  <div className="font-medium">{connection.sales_rep.name}</div>
                                  <div className="text-xs text-muted-foreground">{connection.sales_rep.phone}</div>
                                  <div className="text-xs text-muted-foreground">{connection.sales_rep.email}</div>
                                </div>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                  onClick={() => handleAssignSalesRep(retailer.retailer_id || retailer.id, retailer.name || 'Retailer')}
                                >
                                  Assign Rep
                                </Button>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {connection.sales_rep && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                    onClick={() => handleAssignSalesRep(retailer.retailer_id || retailer.id, retailer.name || 'Retailer')}
                                  >
                                    Edit Rep
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-500 border-red-500 hover:bg-red-50"
                                  onClick={() => handleDisconnect(retailer.retailer_id || retailer.id, retailer.name || 'Retailer')}
                                >
                                  Disconnect
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Parties;
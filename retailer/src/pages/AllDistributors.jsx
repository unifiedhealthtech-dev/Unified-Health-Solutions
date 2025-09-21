import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Clock, Check, X, Search } from "lucide-react";
import { 
  useGetAllDistributorsQuery,
  useSendConnectionRequestMutation
} from "../services/retailerConnectionsApi";   // ✅ changed to retailer service
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from "../components/ui/toast";
import { UserPlus } from "lucide-react";
import { useSelector } from "react-redux";

const AllDistributors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState({
    open: false,
    title: "",
    description: "",
    variant: "default",
  });


  // ✅ Correct RTK Query hooks
  const { data: response, isLoading, error, refetch } = useGetAllDistributorsQuery();

  const [sendConnectionRequest, { isLoading: isSending }] =
    useSendConnectionRequestMutation();

  const distributors = response?.data || [];

  // -----------------------------
  // Filtering logic
  // -----------------------------
  const filteredDistributors = distributors.filter((distributor) => {
    const matchesSearch =
      distributor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      distributor.license_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      distributor.gst_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation =
      !locationFilter ||
      distributor.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
      distributor.state?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "connected" &&
        distributor.connection_status === "connected") ||
      (statusFilter === "pending" &&
        distributor.connection_status === "pending") ||
      (statusFilter === "rejected" &&
        distributor.connection_status === "rejected") ||
      (statusFilter === "none" && !distributor.connection_status);

    return matchesSearch && matchesLocation && matchesStatus;
  });

  // -----------------------------
  // Toast handler
  // -----------------------------
  const showToast = (title, description, variant = "default") => {
    setToast({
      open: true,
      title,
      description,
      variant,
    });

    setTimeout(() => setToast((prev) => ({ ...prev, open: false })), 5000);
  };

  // -----------------------------
  // Connect handler
  // -----------------------------
  const handleConnect = async (distributorId) => {
    try {
      await sendConnectionRequest({ distributorId }).unwrap();
      showToast("Success", "Connection request sent successfully!", "success");
      refetch();
    } catch (error) {
      console.error("Failed to send connection request:", error);
      const errorMessage =
        error?.data?.message ||
        "Failed to send connection request. Please try again.";
      showToast("Error", errorMessage, "destructive");
    }
  };
useEffect(() => {
  refetch();
}, [searchTerm, locationFilter, statusFilter, refetch]);
  // -----------------------------
  // Status Badge
  // -----------------------------
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      case "connected":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <Check className="w-3 h-3" /> Connected
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <X className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Not Connected</Badge>;
    }
  };

  // -----------------------------
  // Action Button
  // -----------------------------
  const getConnectionButton = (status, distributorId) => {
    if (status === "pending") {
      return <Button size="sm" variant="outline" disabled>Pending</Button>;
    } else if (status === "connected") {
      return <Button size="sm" variant="outline" disabled>Connected</Button>;
    } else if (status === "rejected") {
      return <Button size="sm" variant="outline" disabled>Rejected</Button>;
    } else {
      return (
        <Button
          size="sm"
          onClick={() => handleConnect(distributorId)}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Connect"}
        </Button>
      );
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">Loading distributors...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-destructive">
          Error loading distributors:{" "}
          {error?.data?.message || "Please try again later"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastProvider>
        {toast.open && (
          <Toast variant={toast.variant} open={toast.open}>
            <ToastTitle>{toast.title}</ToastTitle>
            <ToastDescription>{toast.description}</ToastDescription>
            <ToastClose
              onClick={() => setToast((prev) => ({ ...prev, open: false }))}
            />
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>

      <Card>
        <CardHeader>
          <CardTitle>All Distributors</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search by name, DL, or GST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Filter by city or state..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="md:w-48"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Connection Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="none">Not Connected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distributors Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>DISTRIBUTOR DETAILS</TableHead>
                  <TableHead>CONTACT</TableHead>
                  <TableHead>LOCATION</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributors.map((distributor, index) => (
                  <TableRow key={distributor.distributor_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{distributor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        DL: {distributor.license_number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        GST: {distributor.gst_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      
                      <div className="flex items-center gap-1 text-sm">
                                <UserPlus className="w-3 h-3" />
                                {distributor.contact_person || 'N/A'}
                              </div>
                      <div className="text-sm">{distributor.phone}</div>
                      <div className="text-xs text-muted-foreground">
                        {distributor.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {distributor.city}, {distributor.state}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {distributor.pincode}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(distributor.connection_status)}
                    </TableCell>
                    <TableCell>
                      {getConnectionButton(
                        distributor.connection_status,
                        distributor.distributor_id
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDistributors.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No distributors found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllDistributors;

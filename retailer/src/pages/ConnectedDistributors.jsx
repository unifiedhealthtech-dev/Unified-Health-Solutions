// components/ConnectedDistributors.js
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Phone, Mail, MapPin, User, Building2, Trash2 } from "lucide-react";
import { 
  useGetConnectedDistributorsQuery,
  useDisconnectDistributorMutation
} from "../services/retailerConnectionsApi";
import {
  ToastProvider,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastViewport,
} from "../components/ui/toast";
import { useSelector } from "react-redux";
const ConnectedDistributors = () => {
  const { data: response, isLoading, error, refetch } = useGetConnectedDistributorsQuery();
  const [disconnectDistributor, { isLoading: isDisconnecting }] = useDisconnectDistributorMutation();

  const [toast, setToast] = useState({
    open: false,
    title: '',
    description: '',
    variant: 'default'
  });

  // Extract data from response - this will be an array of connection objects
  const connectedDistributors = response?.data || [];

  // Toast helper function
  const showToast = (title, description, variant = 'default') => {
    setToast({
      open: true,
      title,
      description,
      variant
    });
    
    setTimeout(() => setToast(prev => ({ ...prev, open: false })), 5000);
  };

  const handleDisconnect = async (distributorId, distributorName) => {
  if (window.confirm(`Are you sure you want to disconnect from ${distributorName}?`)) {
    try {
      await disconnectDistributor(distributorId).unwrap();  // ✅ pass only distributorId
      showToast("Success", `Disconnected from ${distributorName}`, "success");
      refetch();
    } catch (error) {
      console.error("Failed to disconnect:", error);
      const errorMessage = error?.data?.message || "Failed to disconnect. Please try again.";
      showToast("Error", errorMessage, "destructive");
    }
  }
};
  if (isLoading) {
    return (
      <Card className="shadow-medium">
        <CardContent className="p-6">
          <div className="text-center">Loading connected distributors...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-medium">
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading connected distributors: {error?.data?.message || 'Please try again later'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-medium">
      <ToastProvider swipeDirection="right">
        {toast.open && (
          <Toast variant={toast.variant} open={toast.open}>
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose onClick={() => setToast(prev => ({ ...prev, open: false }))} />
          </Toast>
        )}
        <ToastViewport />
      </ToastProvider>

      <CardHeader>
        <CardTitle>Connected Distributors</CardTitle>
      </CardHeader>
      <CardContent>
        {connectedDistributors.length === 0 ? (
          <div className="py-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-muted-foreground">No Connected Distributors</h3>
            <p className="text-muted-foreground">You don't have any connected distributors yet.</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>DISTRIBUTOR</TableHead>
                  <TableHead>CONTACT PERSON</TableHead>
                  <TableHead>CONTACT INFO</TableHead>
                  <TableHead>LOCATION</TableHead>
                  <TableHead>CONNECTED SINCE</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectedDistributors.map((connection, index) => {
                  const distributor = connection.Distributor;
                  return (
                    <TableRow key={connection.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          <Building2 className="w-4 h-4" />
                          {distributor.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          DL: {distributor.license_number}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          GST: {distributor.gst_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <User className="w-3 h-3" />
                          {distributor.contact_person || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {distributor.phone}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {distributor.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {distributor.city}, {distributor.state}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {distributor.pincode}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {new Date(connection.created_at).toLocaleDateString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 border-red-500 hover:bg-red-50"
                          onClick={() => handleDisconnect(distributor.distributor_id, distributor.name)}
                          disabled={isDisconnecting}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
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
  );
};

export default ConnectedDistributors;
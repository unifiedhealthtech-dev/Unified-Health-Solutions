// src/layouts/AppLayout.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import { useLogoutMutation } from '../../services/loginApi';
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { Button } from "../../components/ui/button";
import { User, Bell, LogOut, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showProfile, setShowProfile] = useState(false);

  const distributor = useSelector((state) => state.auth?.distributor);
  const user = useSelector((state) => state.auth?.user);

  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap(); // clear server-side session/cookie
      dispatch(logoutAction());    // ✅ dispatch plain object
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="flex items-center justify-between h-16 px-6 border-b bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h2 className="text-lg font-semibold">Distributor Dashboard</h2>
                <p className="text-sm text-muted-foreground">
                  {distributor?.name} ({user?.distributor_id})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowProfile(true)} className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>

          {/* Profile Modal */}
          {showProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <div className="relative w-full max-w-md p-6 bg-white border shadow-2xl rounded-2xl">
                <button
                  className="absolute text-gray-400 top-4 right-4 hover:text-gray-700 "
                  onClick={() => setShowProfile(false)}
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center mb-6">
                  <div className="flex items-center justify-center w-20 h-20 text-2xl font-bold text-white rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500">
                    { distributor?.contact_person?.[0].toUpperCase() || 'R'}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-gray-800">Profile Details</h3>
                  <p className="text-sm text-gray-500">{distributor?.name}</p>
                  <p className="text-sm text-gray-400">DISTRIBUTOR ID {user?.distributor_id}</p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                  {user && (
                    <>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">DISTRIBUTOR ID:</span>
                        <span>{user.distributor_id}</span>
                      </div>
                    </>
                  )}
                  {distributor && (
                    <>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Distributor Name:</span>
                        <span>{distributor.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Email:</span>
                        <span>{distributor.email}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Contact Person:</span>
                        <span>{distributor.contact_person}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Phone:</span>
                        <span>{distributor.phone}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Address:</span>
                        <span className="text-right">{distributor.address}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">License:</span>
                        <span>{distributor.license_number}</span>
                      </div>
                    </>
                  )}
                  
                </div>

                <div className="flex justify-end mt-6">
                  <Button variant="secondary" onClick={() => setShowProfile(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;

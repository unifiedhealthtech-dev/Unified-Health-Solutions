// src/layouts/AppLayout.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import { useLogoutMutation } from '../../services/loginApi';
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/layout/AppSidebar";
import { Button } from "../../components/ui/button";
import { User, Bell, LogOut, X, Check, Eye } from "lucide-react"; // ✅ Added Eye, Check
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge"; // ✅ Import Badge for unread count
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
} from "../../services/notificationsApi"; // ✅ Import RTK Query hooks

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showProfile, setShowProfile] = useState(false);

  const user = useSelector((state) => state.auth?.user);
  const distributor = useSelector((state) => state.auth?.distributor);

  const [logoutApi] = useLogoutMutation();

  // ✅ Get notifications for bell dropdown
  const { data: notificationsData, isLoading: notificationsLoading } = useGetNotificationsQuery(
    { role: user?.role },
    { skip: !user?.role }
  );
  const notifications = notificationsData?.data || [];

  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logoutAction());
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // ✅ Handle marking notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ role: user.role, notificationId }).unwrap();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // ✅ Get last 5 notifications for dropdown
  const recentNotifications = notifications.slice(0, 5);

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
              {/* ✅ Notification Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute flex items-center justify-center w-4 h-4 p-0 text-xs -top-1 -right-1"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-0 w-80" align="end">
                  <div className="p-3 font-semibold border-b">Notifications</div>
                  {notificationsLoading ? (
                    <div className="p-4 text-sm text-center">Loading...</div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      No new notifications
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-96">
                      {recentNotifications.map((n) => (
                        <DropdownMenuItem
                          key={n.notification_id}
                          className="flex flex-col items-start gap-1 px-3 py-2 cursor-pointer hover:bg-accent"
                          onClick={() => {
                            if (!n.is_read) {
                              handleMarkAsRead(n.notification_id);
                            }
                            navigate('/notifications'); // Go to full page
                          }}
                        >
                          <div className="flex items-center w-full gap-2">
                            <span className="text-sm font-medium">{n.title}</span>
                            {!n.is_read && (
                              <Badge variant="secondary" className="text-xs">New</Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{n.message}</span>
                          <span className="mt-1 text-xs text-muted-foreground">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                  {notifications.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="justify-center cursor-pointer"
                        onClick={() => navigate('/notifications')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View All Notifications
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
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
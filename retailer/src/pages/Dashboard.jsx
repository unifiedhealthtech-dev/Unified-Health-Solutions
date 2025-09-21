import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingCart,
  Package,
  Receipt,
  CreditCard,
  RotateCcw,
  FileText,
  Shield,
  Settings,
  Plus, 
  Bell,
  Search,
  TrendingUp,
  Users,
  Calendar,
  LogOut,
  User,
  Truck,
  Store,
  Folder,
  Briefcase,
  DollarSign,
  Home,
  Mail,
  Lock,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { logout as logoutAction } from "../redux/slices/authSlice";
import { useLogoutMutation } from '../services/loginApi';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '../services/notificationsApi'; // ✅ Import notification hooks
import { Badge } from "../components/ui/badge"; // ✅ Import Badge component

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentPath = location.pathname.split('/').pop() || 'overview';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // ✅ Added for notifications dropdown
  const [logoutApi] = useLogoutMutation();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null); // ✅ Added for notifications dropdown

  // Get data from Redux store
  const retailer = useSelector((state) => state.auth?.retailer);
  const user = useSelector((state) => state.auth?.user);

  // ✅ Get notifications data
  const { data: notificationsData, isLoading: notificationsLoading } = useGetNotificationsQuery(
    { role: user?.role },
    { skip: !user?.role }
  );
  const notifications = notificationsData?.notifications || [];
  
  const [markAsRead] = useMarkAsReadMutation();

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const recentNotifications = notifications.slice(0, 5); // ✅ Get last 5 notifications

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logoutAction());
      navigate("/login");
    } catch (err) {
      console.error('Logout failed:', err);
      sessionStorage.clear();
      localStorage.clear();
      navigate("/login");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  // ✅ Toggle notifications dropdown
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  // ✅ Close notifications dropdown
  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  // ✅ Handle marking notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ role: user.role, notificationId }).unwrap();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  // ✅ Navigate to notifications page
  const goToNotificationsPage = () => {
    closeNotifications();
    navigate("/dashboard/notifications");
  };

  // Open Profile Modal
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    closeProfileMenu();
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Grouped navigation items
  const navigationItems = [
    {
      section: "Main Navigation",
      items: [
        { id: "overview", label: "Dashboard", icon: Home, path: "/dashboard/overview" },
        { id: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart, path: "/dashboard/purchase-orders" },
        { id: "inventory", label: "Inventory", icon: Package, path: "/dashboard/inventory" },
        { id: "sales", label: "Billing", icon: Receipt, path: "/dashboard/sales" },
        { id: "payments", label: "Payments", icon: CreditCard, path: "/dashboard/payments" },
        { id: "returns", label: "Returns", icon: CreditCard, path: "/dashboard/returns" },
        { id: "all-distributors", label: "All Distributors", icon: Users, path: "/dashboard/all-distributors" },
        { id: "connected-distributors", label: "Connected Distributors", icon: Users, path: "/dashboard/connected-distributors" },
      ],
    },
    {
      section: "Reports & Compliance",
      items: [
        { id: "reports", label: "Reports", icon: FileText, path: "/dashboard/reports" },
        { id: "compliance", label: "Compliance", icon: Shield, path: "/dashboard/compliance" },
      ],
    },
    {
      section: "System",
      items: [
        { id: "settings", label: "Settings", icon: Settings, path: "/dashboard/settings" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-card">
      {/* Sidebar */}
      <aside
        className={`${isSidebarCollapsed ? 'w-16' : 'w-64'
          } bg-gray-900 text-white border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out z-10 overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg">
              <Store className="w-5 h-5 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <p className="font-semibold text-md">{retailer?.name || 'MediCare Distribution Pvt Ltd'}</p>
                <p className="text-xs text-gray-400">{retailer?.state || 'Telangana'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        {navigationItems.map((section) => (
          <div key={section.section}>
            <h3 className={`px-5 py-3 text-xs uppercase text-gray-400 tracking-wider font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>
              {section.section}
            </h3>
            <nav className="px-2 space-y-1">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentPath === item.id;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 text-sm h-10 hover:bg-gray-800 mt-2 transition-colors ${isActive ? "bg-blue-600 text-white" : "text-gray-300"
                      }`}
                    asChild
                  >
                    <Link to={item.path}>
                      <IconComponent className="w-5 h-5" />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Top Header */}
        <header className="px-4 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Toggle Button in Header - Left of Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="text-gray-700 hover:text-gray-900"
                aria-label="Toggle sidebar"
              >
                <CreditCard className="w-5 h-5 -rotate-90" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigationItems.flatMap(s => s.items).find(item => item.id === currentPath)?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-500">
                  {retailer?.name || 'Retail Store'} ({user?.retailer_id || 'N/A'})
                </p>
              </div>
            </div>

            {/* Right Side - Notifications + Profile */}
            <div className="flex items-center gap-2">
              {/* ✅ Bell Icon with Badge and Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={toggleNotifications}
                  className="relative p-2 text-gray-700 rounded-full hover:bg-gray-100"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute flex items-center justify-center w-4 h-4 p-0 text-xs -top-1 -right-1"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </button>

                {/* ✅ Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 z-50 mt-2 bg-white rounded-md shadow-lg w-80 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-3 font-semibold border-b">Notifications</div>
                    {notificationsLoading ? (
                      <div className="p-4 text-sm text-center">Loading...</div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="p-4 text-sm text-center text-gray-500">
                        No new notifications
                      </div>
                    ) : (
                      <div className="overflow-y-auto max-h-96">
                        {recentNotifications.map((n) => (
                          <div
                            key={n.notification_id}
                            className="flex flex-col px-4 py-3 border-b cursor-pointer hover:bg-gray-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!n.is_read) {
                                handleMarkAsRead(n.notification_id);
                              }
                              goToNotificationsPage();
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{n.title}</span>
                              {!n.is_read && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-600">{n.message}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {notifications.length > 0 && (
                      <div className="p-2 border-t">
                        <button
                          onClick={goToNotificationsPage}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-blue-50"
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          View All Notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Icon with Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="p-2 text-gray-700 rounded-full hover:bg-gray-100"
                  aria-label="Profile menu"
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 z-50 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <button
                        onClick={openProfileModal}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          closeProfileMenu();
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Profile Modal */}
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
              {/* Close Button */}
              <button
                onClick={closeProfileModal}
                className="absolute text-gray-500 top-4 right-4 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Profile Header */}
              <div className="mb-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto text-2xl font-bold text-white bg-purple-500 rounded-full">
                  {user?.retailer_id?.[0] || retailer?.contact_person?.[0].toUpperCase() || 'R'}
                </div>
                <h2 className="mt-3 text-xl font-bold">Profile Details</h2>
                <p className="text-gray-600">{retailer?.store_name || 'Retail Store'}</p>
                <p className="text-sm text-gray-500 uppercase">
                  RETAILER ID {user?.retailer_id || 'N/A'}
                </p>
              </div>

              {/* Profile Info */}
              <div className="space-y-3">
                {user?.retailer_id && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">RETAILER ID:</span>
                    <span>{user.retailer_id}</span>
                  </div>
                )}
                {retailer?.name && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Store Name:</span>
                    <span>{retailer.name}</span>
                  </div>
                )}
                {retailer?.email && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Email:</span>
                    <span>{retailer.email}</span>
                  </div>
                )}
                {retailer?.contact_person && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Contact Person:</span>
                    <span>{retailer.contact_person}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span>{user.phone}</span>
                  </div>
                )}
                {retailer?.address && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">Address:</span>
                    <span className="text-right">{retailer.address}</span>
                  </div>
                )}
                {retailer?.license_number && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">License:</span>
                    <span>{retailer.license_number}</span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <Button
                variant="outline"
                className="w-full mt-6 text-white bg-teal-500 hover:bg-teal-600"
                onClick={closeProfileModal}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
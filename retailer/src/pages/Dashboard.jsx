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

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const currentPath = location.pathname.split('/').pop() || 'overview';

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // 👈 Added for modal
  const [logoutApi] = useLogoutMutation();
  const profileRef = useRef(null);

  // Get data from Redux store
  const retailer = useSelector((state) => state.auth?.retailer);
  const user = useSelector((state) => state.auth?.user);

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

  // Open Profile Modal
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    closeProfileMenu(); // Close dropdown after click
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
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
  {/* Bell Icon with Badge */}
  <button
    className="relative p-2 text-gray-700 rounded-full hover:bg-gray-100"
    aria-label="Notifications"
  >
    <Bell className="w-5 h-5" />
    {/* Optional: Red dot badge */}
    {/* <span className="absolute flex w-2 h-2 top-1 right-1">
      <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full opacity-75 animate-ping"></span>
      <span className="relative inline-flex w-2 h-2 bg-red-500 rounded-full"></span>
    </span> */}
  </button>

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
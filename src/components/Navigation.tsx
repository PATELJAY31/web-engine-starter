import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Receipt,
  Calculator,
  Database
} from "lucide-react";
import { toast } from "sonner";

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  roles: string[];
  badge?: string;
}

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>("employee");
  const [userName, setUserName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["admin", "accountant", "sales", "viewer"]
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      path: "/customers",
      roles: ["admin", "accountant", "sales", "viewer"]
    },
    {
      id: "products",
      label: "Products & Services",
      icon: Package,
      path: "/products",
      roles: ["admin", "accountant", "sales"]
    },
    {
      id: "invoices",
      label: "Invoices",
      icon: FileText,
      path: "/invoices",
      roles: ["admin", "accountant", "sales", "viewer"]
    },
    {
      id: "estimates",
      label: "Estimates",
      icon: Calculator,
      path: "/estimates",
      roles: ["admin", "accountant", "sales", "viewer"]
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
      path: "/payments",
      roles: ["admin", "accountant", "sales", "viewer"]
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      path: "/reports",
      roles: ["admin", "accountant", "viewer"]
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
      roles: ["admin", "accountant", "sales", "viewer"]
    },
    {
      id: "admin-users",
      label: "User Management",
      icon: Users,
      path: "/admin/users",
      roles: ["admin"],
      badge: "Admin"
    },
    {
      id: "database",
      label: "Database Viewer",
      icon: Database,
      path: "/database",
      roles: ["admin"],
      badge: "Admin"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/settings",
      roles: ["admin"]
    }
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(`${profile.first_name} ${profile.last_name}`);
      }

      // Fetch user role
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserRole(profileData.role);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast.success("Signed out successfully");
  };

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const NavItem = ({ item }: { item: NavigationItem }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start h-12 px-4 transition-all duration-200 ${
          isActive 
            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg" 
            : "hover:bg-primary/5 hover:text-primary"
        }`}
        onClick={() => {
          navigate(item.path);
          setIsMobileMenuOpen(false);
        }}
      >
        <Icon className="h-5 w-5 mr-3" />
        <span className="font-medium">{item.label}</span>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
            {item.badge}
          </Badge>
        )}
      </Button>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <Card className={`fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:relative lg:w-80 lg:h-screen lg:rounded-none lg:border-r lg:border-b-0`}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  InvoiceFlow
                </h1>
                <p className="text-xs text-muted-foreground">Business Management</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Welcome back, {userName}
              </p>
              <Badge variant="outline" className="text-xs">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-2">
            {filteredItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Sign Out Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Navigation;

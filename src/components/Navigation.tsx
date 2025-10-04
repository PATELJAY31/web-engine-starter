import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  Users, 
  Settings, 
  BarChart3,
  CheckCircle,
  UserCheck,
  LogOut,
  Menu,
  X
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
      roles: ["employee", "engineer", "approver", "admin"]
    },
    {
      id: "claims",
      label: "Claims",
      icon: FileText,
      path: "/claims",
      roles: ["employee", "engineer", "approver", "admin"]
    },
    {
      id: "allocations",
      label: "Allocations",
      icon: Wallet,
      path: "/allocations",
      roles: ["employee"]
    },
    {
      id: "admin-allocations",
      label: "Manage Allocations",
      icon: Wallet,
      path: "/admin-allocations",
      roles: ["admin"],
      badge: "Admin"
    },
    {
      id: "verification",
      label: "Verification",
      icon: CheckCircle,
      path: "/verification",
      roles: ["engineer", "admin"],
      badge: "Engineer"
    },
    {
      id: "approval",
      label: "Approval",
      icon: UserCheck,
      path: "/approval",
      roles: ["approver", "admin"],
      badge: "HO Approver"
    },
    {
      id: "employees",
      label: "Employees",
      icon: Users,
      path: "/employees",
      roles: ["admin"]
    },
    {
      id: "expense-types",
      label: "Expense Types",
      icon: Settings,
      path: "/expense-types",
      roles: ["admin"]
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      path: "/reports",
      roles: ["admin", "approver"]
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
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData) {
        setUserRole(roleData.role);
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
        className={`w-full justify-start ${isActive ? "bg-primary text-primary-foreground" : ""}`}
        onClick={() => {
          navigate(item.path);
          setIsMobileMenuOpen(false);
        }}
      >
        <Icon className="h-4 w-4 mr-3" />
        {item.label}
        {item.badge && (
          <Badge variant="secondary" className="ml-auto text-xs">
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
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Bill Blister
            </h1>
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

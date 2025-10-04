import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { 
  Receipt, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock,
  Wallet,
  FileText
} from "lucide-react";

interface DashboardStats {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  totalAllocations: number;
  allocatedAmount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    totalAllocations: 0,
    allocatedAmount: 0,
  });
  const [userRole, setUserRole] = useState<string>("employee");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
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

      // Fetch claims statistics
      const { data: claims } = await supabase
        .from('claims')
        .select('status')
        .eq('employee_id', user.id);

      if (claims) {
        setStats(prev => ({
          ...prev,
          totalClaims: claims.length,
          pendingClaims: claims.filter(c => c.status === 'pending').length,
          approvedClaims: claims.filter(c => c.status === 'approved').length,
          rejectedClaims: claims.filter(c => c.status === 'rejected').length,
        }));
      }

      // Fetch allocations
      const { data: allocations } = await supabase
        .from('allocations')
        .select('amount')
        .eq('employee_id', user.id);

      if (allocations) {
        const total = allocations.reduce((sum, a) => sum + Number(a.amount), 0);
        setStats(prev => ({
          ...prev,
          totalAllocations: allocations.length,
          allocatedAmount: total,
        }));
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Claims",
      value: stats.totalClaims,
      icon: Receipt,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending",
      value: stats.pendingClaims,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Approved",
      value: stats.approvedClaims,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Rejected",
      value: stats.rejectedClaims,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title} className="shadow-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.title === "Total Claims" && "All time"}
                  {stat.title === "Pending" && "Awaiting approval"}
                  {stat.title === "Approved" && "Successfully processed"}
                  {stat.title === "Rejected" && "Declined"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Allocation Summary */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget Allocation</CardTitle>
                  <CardDescription>Your total allocated budget</CardDescription>
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Wallet className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{stats.allocatedAmount.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Across {stats.totalAllocations} allocations
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks</CardDescription>
                </div>
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/claims')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Submit New Claim
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/allocations')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                View Allocations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Role Badge */}
        <Card className="shadow-card bg-gradient-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Role</p>
                <p className="text-2xl font-semibold capitalize">{userRole}</p>
              </div>
              <div className="px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-medium text-primary capitalize">
                  {userRole}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

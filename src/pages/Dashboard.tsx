import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { 
  FileText, 
  Users, 
  Package,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  BarChart3
} from "lucide-react";

interface DashboardStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  monthlyRevenue: number;
  totalPayments: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
    totalCustomers: 0,
    totalProducts: 0,
    monthlyRevenue: 0,
    totalPayments: 0,
  });
  const [userRole, setUserRole] = useState<string>("user");

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
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setUserRole(profileData.role);
      }

      // Fetch company ID
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) {
        toast.error("Company not found");
        return;
      }

      // Fetch invoices statistics
      const { data: invoices } = await supabase
        .from('invoices')
        .select('status, total_amount, paid_amount, due_date')
        .eq('company_id', userProfile.company_id);

      if (invoices) {
        const now = new Date();
        const overdueInvoices = invoices.filter(inv => 
          inv.status !== 'paid' && inv.status !== 'cancelled' && 
          new Date(inv.due_date) < now
        ).length;

        setStats(prev => ({
          ...prev,
          totalInvoices: invoices.length,
          paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
          unpaidInvoices: invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length,
          overdueInvoices,
          monthlyRevenue: invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + Number(inv.paid_amount), 0),
        }));
      }

      // Fetch customers count
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('company_id', userProfile.company_id);

      if (customers) {
        setStats(prev => ({
          ...prev,
          totalCustomers: customers.length,
        }));
      }

      // Fetch products count
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('company_id', userProfile.company_id);

      if (products) {
        setStats(prev => ({
          ...prev,
          totalProducts: products.length,
        }));
      }

      // Fetch payments total
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('company_id', userProfile.company_id);

      if (payments) {
        const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        setStats(prev => ({
          ...prev,
          totalPayments,
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
      title: "Total Invoices",
      value: stats.totalInvoices,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Paid Invoices",
      value: stats.paidInvoices,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Unpaid Invoices",
      value: stats.unpaidInvoices,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Overdue Invoices",
      value: stats.overdueInvoices,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const quickActionCards = [
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      action: () => navigate('/customers'),
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      action: () => navigate('/products'),
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      action: () => navigate('/reports'),
    },
    {
      title: "Total Payments",
      value: `₹${stats.totalPayments.toLocaleString()}`,
      icon: CreditCard,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      action: () => navigate('/payments'),
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your invoice management system
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/invoices')}>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  {stat.title === "Total Invoices" && "All invoices"}
                  {stat.title === "Paid Invoices" && "Successfully paid"}
                  {stat.title === "Unpaid Invoices" && "Awaiting payment"}
                  {stat.title === "Overdue Invoices" && "Past due date"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActionCards.map((card) => (
            <Card key={card.title} className="shadow-card hover:shadow-lg transition-shadow cursor-pointer" onClick={card.action}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to view details
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Panel */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/customers')}
            >
              <Users className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/products')}
            >
              <Package className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/payments')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate('/reports')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;

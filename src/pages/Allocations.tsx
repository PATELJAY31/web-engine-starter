import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { Wallet } from "lucide-react";

interface Allocation {
  id: string;
  amount: number;
  allocation_date: string;
  remarks: string | null;
  status: string;
  expense_types: {
    id: string;
    name: string;
    head1: string | null;
    head2: string | null;
  };
}

const Allocations = () => {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('allocations')
      .select(`
        *,
        expense_types (id, name, head1, head2)
      `)
      .eq('employee_id', user.id)
      .order('allocation_date', { ascending: false });
    
    if (data) {
      setAllocations(data as any);
    }
    setLoading(false);
  };

  const getTotalAmount = () => {
    return allocations.reduce((sum, allocation) => sum + Number(allocation.amount), 0);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Budget Allocations</h1>
          <p className="text-muted-foreground">
            View your allocated budgets by expense type
          </p>
        </div>
        <Card className="mb-8 shadow-lg bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Total Allocated Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              ₹{getTotalAmount().toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Across {allocations.length} allocations
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Allocations</h2>
          
          {allocations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No allocations yet</p>
                <p className="text-sm text-muted-foreground">
                  Your budget allocations will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allocations.map((allocation) => (
                <Card key={allocation.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{allocation.expense_types.name}</h3>
                          <Badge variant={allocation.status === 'active' ? 'default' : 'secondary'}>
                            {allocation.status}
                          </Badge>
                        </div>
                        {allocation.expense_types.head1 && (
                          <p className="text-sm text-muted-foreground">
                            Category: {allocation.expense_types.head1}
                            {allocation.expense_types.head2 && ` / ${allocation.expense_types.head2}`}
                          </p>
                        )}
                        {allocation.remarks && (
                          <p className="text-sm text-muted-foreground">
                            Remarks: {allocation.remarks}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Allocated on: {new Date(allocation.allocation_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ₹{Number(allocation.amount).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Allocations;

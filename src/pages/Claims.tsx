import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Plus, Receipt, Clock, CheckCircle, XCircle } from "lucide-react";

interface ExpenseType {
  id: string;
  name: string;
  head1: string | null;
  head2: string | null;
}

interface Claim {
  id: string;
  amount: number;
  description: string;
  status: string;
  bill_number: string | null;
  bill_date: string | null;
  created_at: string;
  expense_types: ExpenseType;
}

const Claims = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  
  const [formData, setFormData] = useState({
    expenseTypeId: "",
    amount: "",
    description: "",
    billNumber: "",
    billDate: "",
    notes: "",
  });

  useEffect(() => {
    fetchExpenseTypes();
    fetchClaims();
  }, []);

  const fetchExpenseTypes = async () => {
    const { data } = await supabase
      .from('expense_types')
      .select('*')
      .eq('status', 'active');
    if (data) setExpenseTypes(data);
  };

  const fetchClaims = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('claims')
      .select(`
        *,
        expense_types (id, name, head1, head2)
      `)
      .eq('employee_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setClaims(data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expenseTypeId || !formData.amount || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('claims').insert({
      employee_id: user.id,
      expense_type_id: formData.expenseTypeId,
      amount: parseFloat(formData.amount),
      description: formData.description,
      bill_number: formData.billNumber || null,
      bill_date: formData.billDate || null,
      notes: formData.notes || null,
    });

    if (error) {
      toast.error("Failed to submit claim");
    } else {
      toast.success("Claim submitted successfully!");
      setShowForm(false);
      setFormData({
        expenseTypeId: "",
        amount: "",
        description: "",
        billNumber: "",
        billDate: "",
        notes: "",
      });
      fetchClaims();
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      approved: { variant: "default", icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expense Claims</h1>
            <p className="text-muted-foreground">
              Submit and track your expense claims
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Claim
          </Button>
        </div>
        {showForm && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Submit New Claim</CardTitle>
              <CardDescription>Fill in the details of your expense</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expenseType">Expense Type *</Label>
                    <Select
                      value={formData.expenseTypeId}
                      onValueChange={(value) => setFormData({ ...formData, expenseTypeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select expense type" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} {type.head1 && `- ${type.head1}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the expense..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billNumber">Bill Number</Label>
                    <Input
                      id="billNumber"
                      placeholder="INV-001"
                      value={formData.billNumber}
                      onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="billDate">Bill Date</Label>
                    <Input
                      id="billDate"
                      type="date"
                      value={formData.billDate}
                      onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Claim"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Claims</h2>
          
          {claims.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No claims yet</p>
                <p className="text-sm text-muted-foreground">
                  Submit your first expense claim to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {claims.map((claim) => (
                <Card key={claim.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{claim.expense_types.name}</h3>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{claim.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {claim.bill_number && <span>Bill: {claim.bill_number}</span>}
                          {claim.bill_date && (
                            <span>Date: {new Date(claim.bill_date).toLocaleDateString()}</span>
                          )}
                          <span>
                            Submitted: {new Date(claim.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ₹{claim.amount.toLocaleString()}
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

export default Claims;

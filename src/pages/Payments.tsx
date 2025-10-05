import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  Users,
  Filter,
  RefreshCw,
  Receipt,
  Banknote,
  Smartphone,
  Building2
} from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  invoice_id: string;
  customer_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  invoice?: {
    invoice_number: string;
    total_amount: number;
    customer?: {
      name: string;
    };
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  completedPayments: number;
  averagePayment: number;
}

interface PaymentFormData {
  invoice_id: string;
  amount: string;
  payment_method: string;
  payment_date: string;
  reference_number: string;
  notes: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    pendingPayments: 0,
    completedPayments: 0,
    averagePayment: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const [formData, setFormData] = useState<PaymentFormData>({
    invoice_id: "",
    amount: "",
    payment_method: "",
    payment_date: new Date().toISOString().split('T')[0],
    reference_number: "",
    notes: ""
  });

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
    { value: "cheque", label: "Cheque", icon: FileText },
    { value: "stripe", label: "Stripe", icon: CreditCard },
    { value: "paypal", label: "PayPal", icon: Smartphone },
    { value: "razorpay", label: "Razorpay", icon: CreditCard }
  ];

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
    fetchCustomers();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const { data, error } = await (supabase as any)
        .from('payments')
        .select(`
          *,
          invoice:invoices(
            invoice_number,
            total_amount,
            customer:customers(name)
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to fetch payments");
        return;
      }

      setPayments(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error in fetchPayments:", error);
      toast.error("Error fetching payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      // Fetch invoices that can receive payments (not already fully paid)
      const { data, error } = await (supabase as any)
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          paid_amount,
          status,
          customer_id,
          customer:customers(name)
        `)
        .in('status', ['draft', 'sent', 'partial'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Failed to fetch invoices:", error);
        toast.error("Failed to fetch invoices");
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Error fetching invoices");
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from('customers')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) {
        console.error("Failed to fetch customers:", error);
        return;
      }

      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const calculateStats = (paymentsData: Payment[]) => {
    const totalPayments = paymentsData.length;
    const totalAmount = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
    // Since payments don't have status field, treat all as completed
    const completedPayments = totalPayments;
    const pendingPayments = 0; // No pending payments without status field
    const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

    setStats({
      totalPayments,
      totalAmount,
      pendingPayments,
      completedPayments,
      averagePayment
    });
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoice_id || !formData.amount || !formData.payment_method) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get invoice details
      const selectedInvoice = invoices.find(inv => inv.id === formData.invoice_id);
      if (!selectedInvoice) {
        toast.error("Selected invoice not found");
        return;
      }

      const paymentData = {
        invoice_id: formData.invoice_id,
        customer_id: selectedInvoice.customer_id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        payment_date: formData.payment_date,
        reference_number: formData.reference_number || null,
        notes: formData.notes || null
        // Removed status field as it doesn't exist in the database schema
      };

      const { data: paymentResult, error: paymentError } = await (supabase as any)
        .from('payments')
        .insert(paymentData)
        .select()
        .single();

      if (paymentError) {
        console.error("Payment creation error:", paymentError);
        toast.error("Failed to create payment: " + paymentError.message);
        return;
      }

      // Update invoice paid amount
      const newPaidAmount = (selectedInvoice.paid_amount || 0) + parseFloat(formData.amount);
      const invoiceStatus = newPaidAmount >= selectedInvoice.total_amount ? 'paid' : 'partial';

      const { error: updateError } = await (supabase as any)
        .from('invoices')
        .update({
          paid_amount: newPaidAmount,
          status: invoiceStatus
        })
        .eq('id', formData.invoice_id);

      if (updateError) {
        console.error("Failed to update invoice:", updateError);
        toast.warning("Payment created but failed to update invoice status");
      }

      toast.success("Payment recorded successfully!");
      setShowCreateDialog(false);
      resetForm();
      fetchPayments();
      fetchInvoices();
    } catch (error: any) {
      console.error("Error creating payment:", error);
      toast.error("Error creating payment: " + error.message);
    }
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPayment) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase as any)
        .from('payments')
        .update({
          amount: parseFloat(formData.amount),
          payment_method: formData.payment_method,
          payment_date: formData.payment_date,
          reference_number: formData.reference_number || null,
          notes: formData.notes || null
          // Removed status field as it doesn't exist in the database schema
        })
        .eq('id', editingPayment.id);

      if (error) {
        console.error("Payment update error:", error);
        toast.error("Failed to update payment: " + error.message);
        return;
      }

      toast.success("Payment updated successfully!");
      setEditingPayment(null);
      resetForm();
      fetchPayments();
    } catch (error: any) {
      console.error("Error updating payment:", error);
      toast.error("Error updating payment: " + error.message);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const { error } = await (supabase as any)
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        console.error("Payment deletion error:", error);
        toast.error("Failed to delete payment");
        return;
      }

      toast.success("Payment deleted successfully!");
      fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Error deleting payment");
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_id: "",
      amount: "",
      payment_method: "",
      payment_date: new Date().toISOString().split('T')[0],
      reference_number: "",
      notes: ""
    });
    setEditingPayment(null);
  };

  const handleEditClick = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      invoice_id: payment.invoice_id,
      amount: payment.amount.toString(),
      payment_method: payment.payment_method,
      payment_date: payment.payment_date.split('T')[0],
      reference_number: payment.reference_number || "",
      notes: payment.notes || ""
    });
    setShowCreateDialog(true);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.invoice?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.invoice?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Since payments don't have status field, only filter by method
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter;
    
    return matchesSearch && matchesMethod;
  });

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Invoice', 'Customer', 'Amount', 'Method', 'Reference'].join(','),
      ...filteredPayments.map(payment => [
        payment.payment_date.split('T')[0],
        payment.invoice?.invoice_number || '',
        payment.invoice?.customer?.name || '',
        payment.amount,
        payment.payment_method,
        payment.reference_number || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Payments exported successfully!");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Payments
            </h1>
            <p className="text-muted-foreground text-lg">
              Track and manage all payment transactions and records.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => fetchPayments()} size="lg" className="hover:bg-primary/5 transition-colors">
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportPayments} size="lg" className="hover:bg-primary/5 transition-colors">
              <Download className="h-5 w-5 mr-2" />
              Export
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} size="lg" className="shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-5 w-5 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPayment ? "Edit Payment" : "Record New Payment"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPayment ? "Update payment details" : "Record a new payment for an invoice"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingPayment ? handleUpdatePayment : handleCreatePayment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="invoice_id">Invoice *</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fetchInvoices()}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Refresh
                        </Button>
                      </div>
                      <Select
                        value={formData.invoice_id}
                        onValueChange={(value) => {
                          const selectedInvoice = invoices.find(inv => inv.id === value);
                          if (selectedInvoice) {
                            const remainingAmount = selectedInvoice.total_amount - (selectedInvoice.paid_amount || 0);
                            setFormData({
                              ...formData, 
                              invoice_id: value,
                              amount: remainingAmount.toString()
                            });
                          } else {
                            setFormData({...formData, invoice_id: value});
                          }
                        }}
                        disabled={!!editingPayment}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select invoice (${invoices.length} available)`} />
                        </SelectTrigger>
                        <SelectContent>
                          {invoices.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No invoices available for payment
                              <br />
                              <span className="text-xs">Create invoices first to record payments</span>
                            </div>
                          ) : (
                            invoices.map((invoice) => {
                              const remainingAmount = invoice.total_amount - (invoice.paid_amount || 0);
                              const statusText = invoice.status === 'partial' ? ` ($${remainingAmount} remaining)` : '';
                              
                              return (
                                <SelectItem key={invoice.id} value={invoice.id}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {invoice.invoice_number} - {invoice.customer?.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      Total: ${invoice.total_amount} | Paid: ${invoice.paid_amount || 0}{statusText}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Payment Method *</Label>
                      <Select
                        value={formData.payment_method}
                        onValueChange={(value) => setFormData({...formData, payment_method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <method.icon className="h-4 w-4" />
                                {method.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_date">Payment Date *</Label>
                      <Input
                        id="payment_date"
                        type="date"
                        value={formData.payment_date}
                        onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                      placeholder="Transaction ID, Check number, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional payment notes"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingPayment ? "Update Payment" : "Record Payment"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Receipt className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold">{stats.totalPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Average</p>
                  <p className="text-2xl font-bold">${stats.averagePayment.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Search & Filter Payments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice number, customer, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Status filter removed since payments table doesn't have status column */}
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    {/* Status column removed since payments table doesn't have status field */}
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => {
                    const method = paymentMethods.find(m => m.value === payment.payment_method);
                    const MethodIcon = method?.icon || CreditCard;
                    
                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {payment.invoice?.invoice_number || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${payment.invoice?.total_amount || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.invoice?.customer?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            ${payment.amount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MethodIcon className="h-4 w-4" />
                            <span className="capitalize">
                              {method?.label || payment.payment_method}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.reference_number || '-'}
                        </TableCell>
                        {/* Status cell removed since payments table doesn't have status field */}
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(payment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Payments;
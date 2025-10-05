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
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Mail, 
  CreditCard, 
  Calendar,
  DollarSign,
  Filter,
  MoreHorizontal,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Calculator,
  Receipt,
  FilePlus,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name?: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  unit_price: number;
  tax_rate: number;
  unit: string;
}

interface InvoiceItem {
  id?: string;
  product_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount_percent: number;
  line_total: number;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice>>({
    customer_id: "",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    terms: "Payment due within 30 days of invoice date.",
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total_amount: 0,
    paid_amount: 0
  });

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Temporarily skip profile check to avoid 406 errors
      // const { data: userProfile } = await (supabase as any)
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single();

      // if (!userProfile) return;

      const { data, error } = await (supabase as any)
        .from('invoices')
        .select(`
          *,
          customers!invoices_customer_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch invoices");
        return;
      }

      setInvoices(data?.map(invoice => ({
        ...invoice,
        customer_name: invoice.customers?.name
      })) || []);
    } catch (error) {
      toast.error("Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Temporarily skip profile check to avoid 406 errors
      // const { data: userProfile } = await (supabase as any)
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single();

      // if (!userProfile) return;

      const { data, error } = await (supabase as any)
        .from('customers')
        .select('id, name, email, phone')
        .eq('status', 'active');

      if (error) {
        console.error("Failed to fetch customers:", error);
        return;
      }

      setCustomers(data || []);
      console.log("Fetched customers:", data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Temporarily skip profile check to avoid 406 errors
      // const { data: userProfile } = await (supabase as any)
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single();

      // if (!userProfile) return;

      const { data, error } = await (supabase as any)
        .from('products')
        .select('id, name, sku, unit_price, tax_rate, unit')
        .eq('status', 'active');

      if (error) {
        console.error("Failed to fetch products:", error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, {
      product_id: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 0,
      discount_percent: 0,
      line_total: 0
    }]);
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If product is selected, populate product details
    if (field === 'product_id' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].description = selectedProduct.name;
        updatedItems[index].unit_price = selectedProduct.unit_price;
        updatedItems[index].tax_rate = selectedProduct.tax_rate;
        console.log("Product selected:", selectedProduct);
      }
    }
    
    // Recalculate line total
    if (field === 'quantity' || field === 'unit_price' || field === 'discount_percent' || field === 'product_id') {
      const item = updatedItems[index];
      const subtotal = item.quantity * item.unit_price;
      const discount = subtotal * (item.discount_percent / 100);
      const afterDiscount = subtotal - discount;
      const tax = afterDiscount * (item.tax_rate / 100);
      updatedItems[index].line_total = afterDiscount + tax;
    }
    
    setInvoiceItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const removeInvoiceItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discount = itemSubtotal * (item.discount_percent / 100);
      return sum + (itemSubtotal - discount);
    }, 0);

    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const discount = itemSubtotal * (item.discount_percent / 100);
      const afterDiscount = itemSubtotal - discount;
      return sum + (afterDiscount * (item.tax_rate / 100));
    }, 0);

    const total = subtotal + taxAmount;

    setCurrentInvoice(prev => ({
      ...prev,
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: Number(taxAmount.toFixed(2)),
      total_amount: Number(total.toFixed(2))
    }));
  };

  const handleCreateInvoice = async () => {
    console.log("Creating invoice with data:", {
      customer_id: currentInvoice.customer_id,
      invoiceItems: invoiceItems,
      currentInvoice: currentInvoice
    });

    if (!currentInvoice.customer_id || invoiceItems.length === 0) {
      toast.error("Please select a customer and add at least one item");
      return;
    }

    // Validate that all invoice items have required fields
    const invalidItems = invoiceItems.filter(item => 
      !item.description || !item.quantity || !item.unit_price
    );
    
    if (invalidItems.length > 0) {
      toast.error("Please fill in all required fields for invoice items");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // TEMPORARY: Skip profile creation due to RLS issues
      // Just use the user ID directly and handle the constraint differently
      console.log("Using user ID for created_by:", user.id);

      // Create invoice
      const invoiceData = {
        customer_id: currentInvoice.customer_id,
        invoice_number: generateInvoiceNumber(),
        status: 'draft',
        issue_date: currentInvoice.issue_date,
        due_date: currentInvoice.due_date,
        subtotal: currentInvoice.subtotal,
        tax_amount: currentInvoice.tax_amount,
        discount_amount: currentInvoice.discount_amount || 0,
        total_amount: currentInvoice.total_amount,
        paid_amount: 0,
        notes: currentInvoice.notes,
        terms: currentInvoice.terms,
        created_by: null // Temporarily set to null until constraint is fixed
      };

      console.log("Creating invoice with data:", invoiceData);

      const { data: invoiceResult, error: invoiceError } = await (supabase as any)
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) {
        console.error("Invoice creation error:", invoiceError);
        
        // If it's a foreign key constraint error, try without created_by
        if (invoiceError.code === '23503' && invoiceError.message.includes('created_by_fkey')) {
          console.log("Retrying invoice creation without created_by field...");
          
          const { data: retryResult, error: retryError } = await (supabase as any)
            .from('invoices')
            .insert({
              customer_id: currentInvoice.customer_id,
              invoice_number: generateInvoiceNumber(),
              status: 'draft',
              issue_date: currentInvoice.issue_date,
              due_date: currentInvoice.due_date,
              subtotal: currentInvoice.subtotal,
              tax_amount: currentInvoice.tax_amount,
              discount_amount: currentInvoice.discount_amount || 0,
              total_amount: currentInvoice.total_amount,
              paid_amount: 0,
              notes: currentInvoice.notes,
              terms: currentInvoice.terms
              // created_by omitted
            })
            .select()
            .single();

          if (retryError) {
            console.error("Retry invoice creation error:", retryError);
            toast.error("Failed to create invoice: " + retryError.message);
            return;
          }
          
          console.log("Invoice created successfully (without created_by):", retryResult);
          // Use retryResult for invoice items
          const itemsToInsert = invoiceItems.map(item => ({
            invoice_id: retryResult.id,
            product_id: item.product_id || null,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate,
            discount_percent: item.discount_percent,
            line_total: item.line_total
          }));

          console.log("Creating invoice items:", itemsToInsert);

          const { error: itemsError } = await (supabase as any)
            .from('invoice_items')
            .insert(itemsToInsert);

          if (itemsError) {
            console.error("Invoice items creation error:", itemsError);
            toast.error("Failed to create invoice items: " + itemsError.message);
            return;
          }

          console.log("Invoice items created successfully");
          toast.success("Invoice created successfully!");
          setShowCreateDialog(false);
          resetForm();
          fetchInvoices();
          return;
        }
        
        toast.error("Failed to create invoice: " + invoiceError.message);
        return;
      }

      console.log("Invoice created successfully:", invoiceResult);

      // Create invoice items
      const itemsToInsert = invoiceItems.map(item => ({
        invoice_id: invoiceResult.id,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: item.tax_rate,
        discount_percent: item.discount_percent,
        line_total: item.line_total
      }));

      console.log("Creating invoice items:", itemsToInsert);

      const { error: itemsError } = await (supabase as any)
        .from('invoice_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Invoice items creation error:", itemsError);
        toast.error("Failed to create invoice items: " + itemsError.message);
        return;
      }

      console.log("Invoice items created successfully");

      toast.success("Invoice created successfully!");
      setShowCreateDialog(false);
      resetForm();
      fetchInvoices();
    } catch (error) {
      toast.error("Error creating invoice");
    }
  };

  const resetForm = () => {
    setCurrentInvoice({
      customer_id: "",
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: "",
      terms: "Payment due within 30 days of invoice date.",
      subtotal: 0,
      tax_amount: 0,
      discount_amount: 0,
      total_amount: 0,
      paid_amount: 0
    });
    setInvoiceItems([]);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'paid':
        return 'default';
      case 'partially_paid':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'sent':
        return <Mail className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'partially_paid':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
              Create, manage, and track your invoices ({filteredInvoices.length})
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Create a new invoice with customer and product selection
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Invoice Details</TabsTrigger>
                    <TabsTrigger value="items">Line Items</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="customer">Customer *</Label>
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => fetchCustomers()}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh
                            </Button>
                            {customers.length === 0 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Navigate to customers page or open customer creation dialog
                                  window.open('/customers', '_blank');
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Customer
                              </Button>
                            )}
                          </div>
                        </div>
                        <Select 
                          value={currentInvoice.customer_id} 
                          onValueChange={(value) => setCurrentInvoice({...currentInvoice, customer_id: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select customer (${customers.length} available)`} />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.length === 0 ? (
                              <SelectItem value="no-customers" disabled>
                                No customers found. Please add customers first.
                              </SelectItem>
                            ) : (
                              customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.name} ({customer.email})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issue_date">Issue Date *</Label>
                        <Input
                          id="issue_date"
                          type="date"
                          value={currentInvoice.issue_date}
                          onChange={(e) => setCurrentInvoice({...currentInvoice, issue_date: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="due_date">Due Date *</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={currentInvoice.due_date}
                          onChange={(e) => setCurrentInvoice({...currentInvoice, due_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount">Discount Amount</Label>
                        <Input
                          id="discount"
                          type="number"
                          step="0.01"
                          value={currentInvoice.discount_amount || 0}
                          onChange={(e) => setCurrentInvoice({...currentInvoice, discount_amount: Number(e.target.value)})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={currentInvoice.notes || ""}
                        onChange={(e) => setCurrentInvoice({...currentInvoice, notes: e.target.value})}
                        placeholder="Additional notes for the invoice"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea
                        id="terms"
                        value={currentInvoice.terms || ""}
                        onChange={(e) => setCurrentInvoice({...currentInvoice, terms: e.target.value})}
                        placeholder="Payment terms and conditions"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="items" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Invoice Items</h3>
                      <Button onClick={addInvoiceItem} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {invoiceItems.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-12 gap-2 items-end">
                              <div className="col-span-4">
                                <Label>Product</Label>
                                <Select 
                                  value={item.product_id} 
                                  onValueChange={(value) => {
                                    console.log("Product selected:", value);
                                    updateInvoiceItem(index, 'product_id', value);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name} - ${product.unit_price}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="col-span-3">
                                <Label>Description</Label>
                                <Input
                                  value={item.description}
                                  onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                                  placeholder="Item description"
                                />
                              </div>
                              <div className="col-span-1">
                                <Label>Qty</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.quantity}
                                  onChange={(e) => updateInvoiceItem(index, 'quantity', Number(e.target.value))}
                                />
                              </div>
                              <div className="col-span-1">
                                <Label>Price</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unit_price}
                                  onChange={(e) => updateInvoiceItem(index, 'unit_price', Number(e.target.value))}
                                />
                              </div>
                              <div className="col-span-1">
                                <Label>Tax %</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.tax_rate}
                                  onChange={(e) => updateInvoiceItem(index, 'tax_rate', Number(e.target.value))}
                                />
                              </div>
                              <div className="col-span-1">
                                <Label>Disc %</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.discount_percent}
                                  onChange={(e) => updateInvoiceItem(index, 'discount_percent', Number(e.target.value))}
                                />
                              </div>
                              <div className="col-span-1">
                                <Label>Total</Label>
                                <Input
                                  value={`$${item.line_total.toFixed(2)}`}
                                  disabled
                                  className="bg-muted"
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeInvoiceItem(index)}
                              className="mt-2"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold">INVOICE</h2>
                          <p className="text-muted-foreground">Invoice #: {generateInvoiceNumber()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Issue Date: {currentInvoice.issue_date}</p>
                          <p className="font-medium">Due Date: {currentInvoice.due_date}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="font-medium mb-2">Bill To:</h3>
                          <p className="text-sm text-muted-foreground">
                            {customers.find(c => c.id === currentInvoice.customer_id)?.name || "Select customer"}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2">From:</h3>
                          <p className="text-sm text-muted-foreground">Your Company Name</p>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Tax</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                              <TableCell>{item.tax_rate}%</TableCell>
                              <TableCell>${item.line_total.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="mt-6 flex justify-end">
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${currentInvoice.subtotal?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>${currentInvoice.tax_amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>-${(currentInvoice.discount_amount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${currentInvoice.total_amount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateInvoice}>
                    Create Invoice
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <CardTitle>Search & Filter Invoices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Invoice List
            </CardTitle>
            <CardDescription>
              Complete list of all invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No invoices found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" ? "Try adjusting your search terms" : "Create your first invoice to get started"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(invoice.status)}
                          {invoice.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${invoice.total_amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        ${invoice.paid_amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Invoices;

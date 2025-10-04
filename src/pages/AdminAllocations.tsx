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
import { Wallet, Plus, Search, Edit, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Allocation {
  id: string;
  amount: number;
  allocation_date: string;
  remarks: string | null;
  status: string | null;
  employee_id: string;
  expense_type_id: string;
  created_at: string | null;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
  expense_types: {
    name: string;
    head1: string | null;
    head2: string | null;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ExpenseType {
  id: string;
  name: string;
  head1: string | null;
  head2: string | null;
}

interface AllocationFormData {
  employee_id: string;
  expense_type_id: string;
  amount: string;
  allocation_date: string;
  remarks: string;
  status: string;
}

const AdminAllocations = () => {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  const [formData, setFormData] = useState<AllocationFormData>({
    employee_id: "",
    expense_type_id: "",
    amount: "",
    allocation_date: new Date().toISOString().split('T')[0],
    remarks: "",
    status: "active"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch allocations with related data
      const { data: allocationsData, error: allocationsError } = await supabase
        .from('allocations')
        .select(`
          *,
          profiles (first_name, last_name, email),
          expense_types (name, head1, head2)
        `)
        .order('allocation_date', { ascending: false });

      if (allocationsError) {
        toast.error("Failed to fetch allocations");
        return;
      }

      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('status', 'active')
        .order('first_name');

      if (employeesError) {
        toast.error("Failed to fetch employees");
        return;
      }

      // Fetch expense types
      const { data: expenseTypesData, error: expenseTypesError } = await supabase
        .from('expense_types')
        .select('id, name, head1, head2')
        .eq('status', 'active')
        .order('name');

      if (expenseTypesError) {
        toast.error("Failed to fetch expense types");
        return;
      }

      setAllocations(allocationsData || []);
      setEmployees(employeesData || []);
      setExpenseTypes(expenseTypesData || []);
    } catch (error) {
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.expense_type_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('allocations')
        .insert({
          employee_id: formData.employee_id,
          expense_type_id: formData.expense_type_id,
          amount: parseFloat(formData.amount),
          allocation_date: formData.allocation_date,
          remarks: formData.remarks || null,
          status: formData.status
        });

      if (error) {
        toast.error("Failed to create allocation");
        return;
      }

      toast.success("Allocation created successfully!");
      setShowAddDialog(false);
      setFormData({
        employee_id: "",
        expense_type_id: "",
        amount: "",
        allocation_date: new Date().toISOString().split('T')[0],
        remarks: "",
        status: "active"
      });
      fetchData();
    } catch (error) {
      toast.error("Error creating allocation");
    }
  };

  const handleUpdateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAllocation || !formData.employee_id || !formData.expense_type_id || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('allocations')
        .update({
          employee_id: formData.employee_id,
          expense_type_id: formData.expense_type_id,
          amount: parseFloat(formData.amount),
          allocation_date: formData.allocation_date,
          remarks: formData.remarks || null,
          status: formData.status
        })
        .eq('id', editingAllocation.id);

      if (error) {
        toast.error("Failed to update allocation");
        return;
      }

      toast.success("Allocation updated successfully!");
      setEditingAllocation(null);
      setFormData({
        employee_id: "",
        expense_type_id: "",
        amount: "",
        allocation_date: new Date().toISOString().split('T')[0],
        remarks: "",
        status: "active"
      });
      fetchData();
    } catch (error) {
      toast.error("Error updating allocation");
    }
  };

  const handleDeleteAllocation = async (allocationId: string) => {
    if (!confirm("Are you sure you want to delete this allocation?")) return;

    try {
      const { error } = await supabase
        .from('allocations')
        .delete()
        .eq('id', allocationId);

      if (error) {
        toast.error("Failed to delete allocation");
        return;
      }

      toast.success("Allocation deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error("Error deleting allocation");
    }
  };

  const handleEditClick = (allocation: Allocation) => {
    setEditingAllocation(allocation);
    setFormData({
      employee_id: allocation.employee_id,
      expense_type_id: allocation.expense_type_id,
      amount: allocation.amount.toString(),
      allocation_date: allocation.allocation_date.split('T')[0],
      remarks: allocation.remarks || "",
      status: allocation.status || "active"
    });
  };

  const filteredAllocations = allocations.filter(allocation =>
    allocation.profiles.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.profiles.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allocation.expense_types.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalAllocations = () => {
    return allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

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
            <h1 className="text-3xl font-bold">Allocation Management</h1>
            <p className="text-muted-foreground">
              Manage budget allocations for employees
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <DollarSign className="h-4 w-4 mr-2" />
                Create Allocation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Allocation</DialogTitle>
                <DialogDescription>
                  Assign budget allocation to an employee for a specific expense type
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAllocation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee *</Label>
                  <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name} ({employee.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_type">Expense Type *</Label>
                  <Select value={formData.expense_type_id} onValueChange={(value) => setFormData({ ...formData, expense_type_id: value })}>
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
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="allocation_date">Allocation Date *</Label>
                    <Input
                      id="allocation_date"
                      type="date"
                      value={formData.allocation_date}
                      onChange={(e) => setFormData({ ...formData, allocation_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Allocation</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{getTotalAllocations().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allocations.filter(a => a.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
              <p className="text-xs text-muted-foreground">With allocations</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <CardTitle>Search Allocations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by employee name, email, or expense type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Allocations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary" />
              Allocations ({filteredAllocations.length})
            </CardTitle>
            <CardDescription>
              Complete list of all budget allocations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAllocations.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No allocations found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first allocation to get started"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Expense Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {allocation.profiles.first_name} {allocation.profiles.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {allocation.profiles.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{allocation.expense_types.name}</div>
                          {allocation.expense_types.head1 && (
                            <div className="text-sm text-muted-foreground">
                              {allocation.expense_types.head1}
                              {allocation.expense_types.head2 && ` / ${allocation.expense_types.head2}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{allocation.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(allocation.allocation_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(allocation.status || 'active')}>
                          {allocation.status?.charAt(0).toUpperCase() + allocation.status?.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {allocation.remarks || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(allocation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteAllocation(allocation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Edit Dialog */}
        <Dialog open={!!editingAllocation} onOpenChange={() => setEditingAllocation(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Allocation</DialogTitle>
              <DialogDescription>
                Update the allocation details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateAllocation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-employee">Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(value) => setFormData({ ...formData, employee_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name} ({employee.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense_type">Expense Type *</Label>
                <Select value={formData.expense_type_id} onValueChange={(value) => setFormData({ ...formData, expense_type_id: value })}>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Amount (₹) *</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-allocation_date">Allocation Date *</Label>
                  <Input
                    id="edit-allocation_date"
                    type="date"
                    value={formData.allocation_date}
                    onChange={(e) => setFormData({ ...formData, allocation_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-remarks">Remarks</Label>
                <Input
                  id="edit-remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingAllocation(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Allocation</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminAllocations;

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
import { Settings, Plus, Search, Edit, Trash2, FolderPlus } from "lucide-react";
import { toast } from "sonner";

interface ExpenseType {
  id: string;
  name: string;
  head1: string | null;
  head2: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ExpenseTypeFormData {
  name: string;
  head1: string;
  head2: string;
  status: string;
}

const ExpenseTypes = () => {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingType, setEditingType] = useState<ExpenseType | null>(null);
  const [formData, setFormData] = useState<ExpenseTypeFormData>({
    name: "",
    head1: "",
    head2: "",
    status: "active"
  });

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const fetchExpenseTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch expense types");
        return;
      }

      setExpenseTypes(data || []);
    } catch (error) {
      toast.error("Error fetching expense types");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenseType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Please enter expense type name");
      return;
    }

    try {
      const { error } = await supabase
        .from('expense_types')
        .insert({
          name: formData.name,
          head1: formData.head1 || null,
          head2: formData.head2 || null,
          status: formData.status
        });

      if (error) {
        toast.error("Failed to create expense type");
        return;
      }

      toast.success("Expense type added successfully!");
      setShowAddDialog(false);
      setFormData({
        name: "",
        head1: "",
        head2: "",
        status: "active"
      });
      fetchExpenseTypes();
    } catch (error) {
      toast.error("Error adding expense type");
    }
  };

  const handleUpdateExpenseType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingType || !formData.name) {
      toast.error("Please enter expense type name");
      return;
    }

    try {
      const { error } = await supabase
        .from('expense_types')
        .update({
          name: formData.name,
          head1: formData.head1 || null,
          head2: formData.head2 || null,
          status: formData.status
        })
        .eq('id', editingType.id);

      if (error) {
        toast.error("Failed to update expense type");
        return;
      }

      toast.success("Expense type updated successfully!");
      setEditingType(null);
      setFormData({
        name: "",
        head1: "",
        head2: "",
        status: "active"
      });
      fetchExpenseTypes();
    } catch (error) {
      toast.error("Error updating expense type");
    }
  };

  const handleDeleteExpenseType = async (expenseTypeId: string) => {
    if (!confirm("Are you sure you want to delete this expense type?")) return;

    try {
      const { error } = await supabase
        .from('expense_types')
        .delete()
        .eq('id', expenseTypeId);

      if (error) {
        toast.error("Failed to delete expense type");
        return;
      }

      toast.success("Expense type deleted successfully!");
      fetchExpenseTypes();
    } catch (error) {
      toast.error("Error deleting expense type");
    }
  };

  const handleEditClick = (expenseType: ExpenseType) => {
    setEditingType(expenseType);
    setFormData({
      name: expenseType.name,
      head1: expenseType.head1 || "",
      head2: expenseType.head2 || "",
      status: expenseType.status || "active"
    });
  };

  const filteredExpenseTypes = expenseTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.head1 && type.head1.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (type.head2 && type.head2.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className="text-3xl font-bold">Expense Types Management</h1>
            <p className="text-muted-foreground">
              Configure expense categories and classifications
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="h-4 w-4 mr-2" />
                Add Expense Type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Expense Type</DialogTitle>
                <DialogDescription>
                  Create a new expense category with hierarchical structure
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddExpenseType} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Expense Type Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Travel & Transportation"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head1">Head 1 Category</Label>
                  <Input
                    id="head1"
                    value={formData.head1}
                    onChange={(e) => setFormData({ ...formData, head1: e.target.value })}
                    placeholder="e.g., Travel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="head2">Head 2 Subcategory</Label>
                  <Input
                    id="head2"
                    value={formData.head2}
                    onChange={(e) => setFormData({ ...formData, head2: e.target.value })}
                    placeholder="e.g., Transportation"
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
                  <Button type="submit">Add Expense Type</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <CardTitle>Search Expense Types</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Expense Types Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Expense Types ({filteredExpenseTypes.length})
            </CardTitle>
            <CardDescription>
              Complete list of all expense categories in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredExpenseTypes.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No expense types found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "Add your first expense type to get started"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Head 1</TableHead>
                    <TableHead>Head 2</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenseTypes.map((expenseType) => (
                    <TableRow key={expenseType.id}>
                      <TableCell className="font-medium">
                        {expenseType.name}
                      </TableCell>
                      <TableCell>{expenseType.head1 || "—"}</TableCell>
                      <TableCell>{expenseType.head2 || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(expenseType.status || 'active')}>
                          {expenseType.status?.charAt(0).toUpperCase() + expenseType.status?.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {expenseType.created_at ? new Date(expenseType.created_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(expenseType)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteExpenseType(expenseType.id)}
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
        <Dialog open={!!editingType} onOpenChange={() => setEditingType(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Expense Type</DialogTitle>
              <DialogDescription>
                Update the expense type details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateExpenseType} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Expense Type Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-head1">Head 1 Category</Label>
                <Input
                  id="edit-head1"
                  value={formData.head1}
                  onChange={(e) => setFormData({ ...formData, head1: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-head2">Head 2 Subcategory</Label>
                <Input
                  id="edit-head2"
                  value={formData.head2}
                  onChange={(e) => setFormData({ ...formData, head2: e.target.value })}
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
                <Button type="button" variant="outline" onClick={() => setEditingType(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Expense Type</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ExpenseTypes;

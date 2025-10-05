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
import { Switch } from "@/components/ui/switch";
import { Package, Plus, Search, Edit, Trash2, PackagePlus, Eye, DollarSign, Hash } from "lucide-react";
import { toast } from "sonner";

interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  unit_price: number;
  tax_rate: number;
  unit: string;
  inventory_tracking: boolean;
  stock_quantity: number;
  status: string;
  category_id: string | null;
  category?: ProductCategory;
  created_at: string | null;
  updated_at: string | null;
}

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  unit_price: string;
  tax_rate: string;
  unit: string;
  inventory_tracking: boolean;
  stock_quantity: string;
  status: string;
  category_id: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    description: "",
    unit_price: "",
    tax_rate: "0",
    unit: "piece",
    inventory_tracking: false,
    stock_quantity: "0",
    status: "active",
    category_id: ""
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    console.log("Products page mounted - starting data fetch");
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log("Fetching products...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found, returning");
        return;
      }

      console.log("User authenticated:", user.email);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
        return;
      }

      console.log("Products fetched successfully:", data?.length || 0, "products");
      setProducts(data || []);
    } catch (error) {
      console.error("Error in fetchProducts:", error);
      toast.error("Error fetching products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error("Failed to fetch categories:", error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryFormData.name) {
      toast.error("Please enter category name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('product_categories')
        .insert({
          name: categoryFormData.name,
          description: categoryFormData.description || null
        });

      if (error) {
        toast.error("Failed to create category");
        return;
      }

      toast.success("Category added successfully!");
      setShowCategoryDialog(false);
      setCategoryFormData({ name: "", description: "" });
      fetchCategories();
    } catch (error) {
      toast.error("Error adding category");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Please enter product name");
      return;
    }

    if (!formData.unit_price || isNaN(Number(formData.unit_price))) {
      toast.error("Please enter a valid unit price");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          sku: formData.sku || null,
          description: formData.description || null,
          unit_price: Number(formData.unit_price),
          tax_rate: Number(formData.tax_rate),
          unit: formData.unit,
          inventory_tracking: formData.inventory_tracking,
          stock_quantity: formData.inventory_tracking ? Number(formData.stock_quantity) : 0,
          status: formData.status,
          category_id: formData.category_id || null
        });

      if (error) {
        toast.error("Failed to create product");
        return;
      }

      toast.success("Product added successfully!");
      setShowAddDialog(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error("Error adding product");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct || !formData.name) {
      toast.error("Please enter product name");
      return;
    }

    if (!formData.unit_price || isNaN(Number(formData.unit_price))) {
      toast.error("Please enter a valid unit price");
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          sku: formData.sku || null,
          description: formData.description || null,
          unit_price: Number(formData.unit_price),
          tax_rate: Number(formData.tax_rate),
          unit: formData.unit,
          inventory_tracking: formData.inventory_tracking,
          stock_quantity: formData.inventory_tracking ? Number(formData.stock_quantity) : 0,
          status: formData.status,
          category_id: formData.category_id || null
        })
        .eq('id', editingProduct.id);

      if (error) {
        toast.error("Failed to update product");
        return;
      }

      toast.success("Product updated successfully!");
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error("Error updating product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        toast.error("Failed to delete product");
        return;
      }

      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || "",
      description: product.description || "",
      unit_price: product.unit_price.toString(),
      tax_rate: product.tax_rate.toString(),
      unit: product.unit,
      inventory_tracking: product.inventory_tracking,
      stock_quantity: product.stock_quantity.toString(),
      status: product.status,
      category_id: product.category_id || ""
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      description: "",
      unit_price: "",
      tax_rate: "0",
      unit: "piece",
      inventory_tracking: false,
      stock_quantity: "0",
      status: "active",
      category_id: ""
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const getStockBadgeVariant = (quantity: number) => {
    if (quantity === 0) return 'destructive';
    if (quantity < 10) return 'secondary';
    return 'default';
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
            <h1 className="text-3xl font-bold">Products & Services</h1>
            <p className="text-muted-foreground">
              Manage your product catalog ({filteredProducts.length})
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new product category
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">Category Name *</Label>
                    <Input
                      id="category-name"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      placeholder="e.g., Software, Hardware, Services"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea
                      id="category-description"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      placeholder="Brief description of this category..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCategoryDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Category</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Create a new product or service
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Product or Service Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU/Code</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Product Code"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Product description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit_price">Unit Price *</Label>
                      <Input
                        id="unit_price"
                        type="number"
                        step="0.01"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        value={formData.tax_rate}
                        onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="hour">Hour</SelectItem>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="liter">Liter</SelectItem>
                          <SelectItem value="meter">Meter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="inventory_tracking"
                        checked={formData.inventory_tracking}
                        onCheckedChange={(checked) => setFormData({ ...formData, inventory_tracking: checked })}
                      />
                      <Label htmlFor="inventory_tracking">Enable inventory tracking</Label>
                    </div>
                    
                    {formData.inventory_tracking && (
                      <div className="space-y-2">
                        <Label htmlFor="stock_quantity">Stock Quantity</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    )}
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
                    <Button type="submit">Add Product</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <CardTitle>Search & Filter Products</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search by name, SKU, or description..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-6 w-6 text-primary" />
              Product Catalog
            </CardTitle>
            <CardDescription>
              Complete list of all products and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || categoryFilter !== "all" ? "Try adjusting your search terms" : "Add your first product to get started"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground">{product.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.sku || "—"}
                      </TableCell>
                      <TableCell>
                        {product.category?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {product.unit_price.toFixed(2)} / {product.unit}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.tax_rate}%
                      </TableCell>
                      <TableCell>
                        {product.inventory_tracking ? (
                          <Badge variant={getStockBadgeVariant(product.stock_quantity)}>
                            {product.stock_quantity}
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(product.status)}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteProduct(product.id)}
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
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the product information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU/Code</Label>
                  <Input
                    id="edit-sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-unit_price">Unit Price *</Label>
                  <Input
                    id="edit-unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="edit-tax_rate"
                    type="number"
                    step="0.01"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category_id">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-inventory_tracking"
                    checked={formData.inventory_tracking}
                    onCheckedChange={(checked) => setFormData({ ...formData, inventory_tracking: checked })}
                  />
                  <Label htmlFor="edit-inventory_tracking">Enable inventory tracking</Label>
                </div>
                
                {formData.inventory_tracking && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-stock_quantity">Stock Quantity</Label>
                    <Input
                      id="edit-stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    />
                  </div>
                )}
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
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Product</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Products;

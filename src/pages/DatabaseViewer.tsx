import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";

const DatabaseViewer = () => {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableColumns, setTableColumns] = useState<string[]>([]);

  const tables = [
    { name: "user_profiles", label: "User Profiles" },
    { name: "companies", label: "Companies" },
    { name: "customers", label: "Customers" },
    { name: "products", label: "Products" },
    { name: "product_categories", label: "Product Categories" },
    { name: "invoices", label: "Invoices" },
    { name: "invoice_items", label: "Invoice Items" },
    { name: "payments", label: "Payments" },
    { name: "expense_types", label: "Expense Types" },
    { name: "allocations", label: "Allocations" },
    { name: "claims", label: "Claims" }
  ];

  const fetchTableData = async (tableName: string) => {
    if (!tableName) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(100); // Limit to 100 records for performance

      if (error) {
        toast.error(`Error fetching ${tableName}: ${error.message}`);
        return;
      }

      setTableData(data || []);
      
      // Get column names from the first record
      if (data && data.length > 0) {
        setTableColumns(Object.keys(data[0]));
      } else {
        setTableColumns([]);
      }
      
      toast.success(`Fetched ${data?.length || 0} records from ${tableName}`);
    } catch (error) {
      toast.error(`Error fetching data: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    fetchTableData(tableName);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'default' : 'secondary'}>{value.toString()}</Badge>;
    }
    
    if (typeof value === 'object') {
      return <span className="font-mono text-xs">{JSON.stringify(value)}</span>;
    }
    
    if (typeof value === 'string' && value.length > 50) {
      return <span title={value}>{value.substring(0, 50)}...</span>;
    }
    
    return value.toString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Database className="h-8 w-8 text-primary" />
              Database Viewer
            </h1>
            <p className="text-muted-foreground">
              View and inspect data in your Supabase database tables
            </p>
          </div>
          <Button 
            onClick={() => fetchTableData(selectedTable)}
            disabled={!selectedTable || loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Table Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Select Table to View
            </CardTitle>
            <CardDescription>
              Choose a table from your database to view its contents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={handleTableSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a table to view..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name}>
                    {table.label} ({table.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Data Display */}
        {selectedTable && (
          <Card>
            <CardHeader>
              <CardTitle>
                {tables.find(t => t.name === selectedTable)?.label} Data
                {tableData.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {tableData.length} records
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Showing data from the <code className="bg-muted px-1 rounded">{selectedTable}</code> table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : tableData.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No data found</p>
                  <p className="text-sm text-muted-foreground">
                    This table appears to be empty or you don't have access to it
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {tableColumns.map((column) => (
                          <TableHead key={column} className="font-mono text-xs">
                            {column}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          {tableColumns.map((column) => (
                            <TableCell key={column} className="font-mono text-xs">
                              {formatValue(row[column])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Select a table from the dropdown above to view its data</p>
            <p>• Data is limited to 100 records for performance</p>
            <p>• Use the refresh button to reload the current table</p>
            <p>• For more advanced queries, use the Supabase dashboard SQL editor</p>
            <p>• Project ID: <code className="bg-muted px-1 rounded">fotsyuqbufjgytdvtdlq</code></p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DatabaseViewer;

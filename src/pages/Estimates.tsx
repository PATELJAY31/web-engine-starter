import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

const Estimates = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Estimates</h1>
          <p className="text-muted-foreground">
            Create and manage project estimates and quotes
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Estimate Management
            </CardTitle>
            <CardDescription>
              Complete estimate creation and management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain comprehensive estimate management features:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Create detailed project estimates and quotes</li>
              <li>• Add line items with descriptions and pricing</li>
              <li>• Apply taxes and discounts to estimates</li>
              <li>• Set expiry dates for estimates</li>
              <li>• Status tracking (Draft, Sent, Accepted, Rejected, Expired)</li>
              <li>• Send estimates via email to customers</li>
              <li>• Convert accepted estimates to invoices</li>
              <li>• PDF generation with professional templates</li>
              <li>• Estimate comparison and version tracking</li>
              <li>• Customer approval workflow</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Estimates;

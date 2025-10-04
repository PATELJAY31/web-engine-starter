import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Invoices = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Create, manage, and track your invoices
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Invoice Management
            </CardTitle>
            <CardDescription>
              Complete invoice creation and management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain comprehensive invoice management features:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Create new invoices with customer and product selection</li>
              <li>• Add line items with quantities, prices, and taxes</li>
              <li>• Apply discounts and calculate totals automatically</li>
              <li>• Save as draft, send via email, or download PDF</li>
              <li>• Invoice status tracking (Draft, Sent, Paid, Overdue)</li>
              <li>• Payment links integration for online payments</li>
              <li>• Recurring invoices for subscriptions</li>
              <li>• Convert estimates to invoices</li>
              <li>• Credit notes for refunds and adjustments</li>
              <li>• Custom PDF templates with company branding</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Invoices;

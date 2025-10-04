import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting and analytics dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>
              Detailed reports and insights for invoice management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain comprehensive reporting features:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Sales reports by date, customer, and product</li>
              <li>• Tax reports (GST/VAT collected and paid)</li>
              <li>• Accounts receivable aging report</li>
              <li>• Payment reports (paid vs unpaid)</li>
              <li>• Customer analytics and insights</li>
              <li>• Revenue trends and growth charts</li>
              <li>• Invoice performance metrics</li>
              <li>• Export reports to PDF/Excel</li>
              <li>• Custom date range filtering</li>
              <li>• Interactive charts and visualizations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

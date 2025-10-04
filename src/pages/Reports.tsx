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
              Detailed reports and insights for expense management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain comprehensive reporting features:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Interactive charts for expense trends and patterns</li>
              <li>• Department-wise expense breakdowns</li>
              <li>• Monthly and yearly expense reports</li>
              <li>• Approval workflow statistics</li>
              <li>• Budget utilization reports</li>
              <li>• Export capabilities for all reports</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;

import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your system settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              System Configuration
            </CardTitle>
            <CardDescription>
              Complete system settings and configuration management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain comprehensive system configuration features:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• Company settings: Name, Logo, Address, Tax ID</li>
              <li>• Default currency and tax settings</li>
              <li>• Invoice template customization</li>
              <li>• Email template management</li>
              <li>• User roles and permissions management</li>
              <li>• Payment gateway integration settings</li>
              <li>• Multi-currency and exchange rates</li>
              <li>• API integrations (QuickBooks, Tally, Xero)</li>
              <li>• Backup and data export options</li>
              <li>• System preferences and notifications</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;

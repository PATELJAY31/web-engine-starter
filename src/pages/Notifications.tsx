import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

const Notifications = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and alerts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notification Center
            </CardTitle>
            <CardDescription>
              Complete notification and alert management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain comprehensive notification features:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• View all system notifications and alerts</li>
              <li>• Mark notifications as read/unread</li>
              <li>• Automated email reminders for overdue invoices</li>
              <li>• Payment received notifications</li>
              <li>• Invoice due date alerts</li>
              <li>• Customer activity notifications</li>
              <li>• System updates and announcements</li>
              <li>• Customizable notification preferences</li>
              <li>• Email template management</li>
              <li>• Notification history and archive</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;

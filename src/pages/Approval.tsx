import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

const Approval = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Claim Approval</h1>
          <p className="text-muted-foreground">
            HO Approver approval workflow for verified claims
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-primary" />
              Approval Dashboard
            </CardTitle>
            <CardDescription>
              Final approval workflow for expense claims
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will contain the HO Approver workflow where approvers can:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• View claims verified by engineers</li>
              <li>• Review verification details and engineer comments</li>
              <li>• Give final approval or rejection</li>
              <li>• Track approval history and statistics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Approval;

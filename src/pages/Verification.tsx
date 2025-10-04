import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, XCircle, Eye, Check, X, Search } from "lucide-react";
import { toast } from "sonner";

interface Claim {
  id: string;
  amount: number;
  description: string;
  status: string;
  bill_number: string | null;
  bill_date: string | null;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  employee_id: string;
  expense_type_id: string;
  verified_by: string | null;
  verified_at: string | null;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
  expense_types: {
    name: string;
    head1: string | null;
    head2: string | null;
  };
}

const Verification = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationAction, setVerificationAction] = useState<"approve" | "reject">("approve");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select(`
          *,
          profiles (first_name, last_name, email),
          expense_types (name, head1, head2)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch claims");
        return;
      }

      setClaims(data || []);
    } catch (error) {
      toast.error("Error fetching claims");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClaim = async () => {
    if (!selectedClaim) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('claims')
        .update({
          status: verificationAction === 'approve' ? 'approved' : 'rejected',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          rejection_reason: verificationAction === 'reject' ? verificationNotes : null,
          notes: verificationNotes || null
        })
        .eq('id', selectedClaim.id);

      if (error) {
        toast.error("Failed to verify claim");
        return;
      }

      toast.success(`Claim ${verificationAction === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setShowVerifyDialog(false);
      setSelectedClaim(null);
      setVerificationNotes("");
      setVerificationAction("approve");
      fetchClaims();
    } catch (error) {
      toast.error("Error verifying claim");
    }
  };

  const handleVerifyClick = (claim: Claim, action: "approve" | "reject") => {
    setSelectedClaim(claim);
    setVerificationAction(action);
    setVerificationNotes("");
    setShowVerifyDialog(true);
  };

  const filteredClaims = claims.filter(claim =>
    claim.profiles.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.profiles.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.expense_types.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: "secondary", icon: Clock, label: "Pending" },
      approved: { variant: "default", icon: CheckCircle, label: "Approved" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected" },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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
        <div>
          <h1 className="text-3xl font-bold">Claim Verification</h1>
          <p className="text-muted-foreground">
            Engineer verification workflow for expense claims
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{claims.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{claims.reduce((sum, claim) => sum + claim.amount, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Pending verification</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Claim</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{claims.length > 0 ? Math.round(claims.reduce((sum, claim) => sum + claim.amount, 0) / claims.length).toLocaleString() : 0}
              </div>
              <p className="text-xs text-muted-foreground">Per claim</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <CardTitle>Search Claims</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by employee name, email, expense type, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Pending Claims ({filteredClaims.length})
            </CardTitle>
            <CardDescription>
              Claims awaiting engineer verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClaims.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No pending claims</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "All claims have been processed"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Expense Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bill Details</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {claim.profiles.first_name} {claim.profiles.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {claim.profiles.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{claim.expense_types.name}</div>
                          {claim.expense_types.head1 && (
                            <div className="text-sm text-muted-foreground">
                              {claim.expense_types.head1}
                              {claim.expense_types.head2 && ` / ${claim.expense_types.head2}`}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={claim.description}>
                          {claim.description}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{claim.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {claim.bill_number && <div>Bill: {claim.bill_number}</div>}
                          {claim.bill_date && (
                            <div className="text-muted-foreground">
                              Date: {new Date(claim.bill_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(claim.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerifyClick(claim, "approve")}
                            className="text-green-600 hover:text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerifyClick(claim, "reject")}
                            className="text-red-600 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
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

        {/* Verification Dialog */}
        <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {verificationAction === 'approve' ? 'Approve Claim' : 'Reject Claim'}
              </DialogTitle>
              <DialogDescription>
                {verificationAction === 'approve' 
                  ? 'Approve this expense claim for further processing'
                  : 'Reject this expense claim with a reason'
                }
              </DialogDescription>
            </DialogHeader>
            {selectedClaim && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Employee:</span>
                      <span className="text-sm">{selectedClaim.profiles.first_name} {selectedClaim.profiles.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Expense Type:</span>
                      <span className="text-sm">{selectedClaim.expense_types.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Amount:</span>
                      <span className="text-sm font-medium">₹{selectedClaim.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Description:</span>
                      <span className="text-sm">{selectedClaim.description}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verification-notes">
                    {verificationAction === 'approve' ? 'Verification Notes' : 'Rejection Reason'} *
                  </Label>
                  <Textarea
                    id="verification-notes"
                    placeholder={verificationAction === 'approve' 
                      ? "Add any verification notes..." 
                      : "Please provide a reason for rejection..."
                    }
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowVerifyDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleVerifyClaim}
                    variant={verificationAction === 'approve' ? 'default' : 'destructive'}
                    disabled={!verificationNotes.trim()}
                  >
                    {verificationAction === 'approve' ? 'Approve Claim' : 'Reject Claim'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Verification;

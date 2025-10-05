import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, User, Mail, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { checkAdminExists } from "@/utils/checkAdminExists";

const AdminSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "admin@billblister.com",
    password: "qwerty",
    confirmPassword: "qwerty",
    firstName: "Admin",
    lastName: "User",
    phone: "+1 (555) 123-4567"
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Check if admin already exists
    const adminCheck = await checkAdminExists(formData.email);
    if (adminCheck.exists && adminCheck.isAdmin) {
      toast.info("Admin account already exists! Redirecting to sign in...");
      navigate('/auth');
      return;
    }

    // Validation
    const newErrors: string[] = [];
    if (!formData.email) newErrors.push("Email is required");
    if (!formData.password) newErrors.push("Password is required");
    if (formData.password !== formData.confirmPassword) newErrors.push("Passwords do not match");
    if (formData.password.length < 6) newErrors.push("Password must be at least 6 characters");
    if (!formData.firstName) newErrors.push("First name is required");
    if (!formData.lastName) newErrors.push("Last name is required");

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          // User already exists, try to sign in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          });

          if (signInError) {
            toast.error("Sign in failed: " + signInError.message);
            setLoading(false);
            return;
          }

          // Check if user profile exists
          const { data: existingProfile } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', signInData.user.id)
            .single();

          if (existingProfile) {
            // Update existing profile to admin if needed
            if (existingProfile.status !== 'admin') {
              const { error: updateError } = await (supabase as any)
                .from('profiles')
                .update({
                  first_name: formData.firstName,
                  last_name: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                  status: 'admin'
                })
                .eq('id', signInData.user.id);

              if (updateError) {
                toast.error("Failed to update profile: " + updateError.message);
                setLoading(false);
                return;
              }
            }
            toast.success("Welcome back! Redirecting to dashboard...");
            navigate('/dashboard');
            return;
          }

          // Create user profile for existing user
          const { error: profileError } = await (supabase as any)
            .from('profiles')
            .insert({
              id: signInData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              status: 'admin'
            });

          if (profileError) {
            if (profileError.code === '42501') {
              toast.error("Permission denied. Please run the RLS fix SQL in Supabase Dashboard first.");
              toast.error("Go to SQL Editor and run the disable-rls-temporarily.sql file");
              toast.error("This will temporarily disable RLS to allow admin creation");
              setLoading(false);
              return;
            }
            toast.error("Failed to create user profile: " + profileError.message);
            setLoading(false);
            return;
          }

          toast.success("Admin profile created successfully! Redirecting to dashboard...");
          navigate('/dashboard');
          return;
        }

        toast.error("Sign up failed: " + authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create user account");
        setLoading(false);
        return;
      }

      // Check if profile already exists
      const { data: existingProfile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (existingProfile) {
        // Update existing profile to admin
        const { error: updateError } = await (supabase as any)
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            status: 'admin'
          })
          .eq('email', formData.email);

        if (updateError) {
          toast.error("Failed to update existing profile: " + updateError.message);
          setLoading(false);
          return;
        }

        toast.success("Existing profile updated to admin! Redirecting to dashboard...");
        navigate('/dashboard');
        return;
      }

      // Create new user profile
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          status: 'admin'
        });

      if (profileError) {
        if (profileError.code === '42501') {
          toast.error("Permission denied. Please run the RLS fix SQL in Supabase Dashboard first.");
          toast.error("Go to SQL Editor and run the disable-rls-temporarily.sql file");
          toast.error("This will temporarily disable RLS to allow admin creation");
          setLoading(false);
          return;
        }
        toast.error("Failed to create user profile: " + profileError.message);
        setLoading(false);
        return;
      }

      toast.success("Admin account created successfully! Please check your email to confirm your account.");
      toast.success("You can now sign in with your credentials.");
      navigate('/auth');
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Signup</CardTitle>
          <CardDescription>
            Create your admin account to access all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="pl-10"
                    placeholder="Admin"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="pl-10"
                    placeholder="User"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="admin@billblister.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Admin Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate('/auth')}
              >
                Sign in here
              </Button>
            </p>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Admin Features:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Full access to all pages</li>
              <li>• Create and manage invoices</li>
              <li>• Manage customers and products</li>
              <li>• View reports and analytics</li>
              <li>• User management (when implemented)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignup;

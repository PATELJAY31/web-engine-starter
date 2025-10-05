import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import PasswordChange from "./PasswordChange";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [checkingPassword, setCheckingPassword] = useState(false);
  const navigate = useNavigate();

  const checkTempPassword = async (user: User) => {
    try {
      setCheckingPassword(true);
      
      // Check if user has temp password flag in metadata
      const hasTempPasswordInMetadata = user.user_metadata?.temp_password === true;
      
      if (hasTempPasswordInMetadata) {
        setNeedsPasswordChange(true);
        return;
      }

      // Also check the profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_temp_password')
        .eq('id', user.id)
        .single();

      if (profile?.is_temp_password) {
        setNeedsPasswordChange(true);
        return;
      }

      setNeedsPasswordChange(false);
    } catch (error) {
      console.error("Error checking temp password:", error);
      // If we can't check, assume no temp password
      setNeedsPasswordChange(false);
    } finally {
      setCheckingPassword(false);
    }
  };

  useEffect(() => {
    console.log("AuthGuard: Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthGuard: Auth state changed", { event, user: session?.user?.email });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session && event === 'SIGNED_OUT') {
          console.log("AuthGuard: User signed out, redirecting to auth");
          navigate('/auth');
        } else if (session?.user) {
          // Check if user needs to change password
          await checkTempPassword(session.user);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("AuthGuard: Initial session check", { user: session?.user?.email });
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check if user needs to change password
        await checkTempPassword(session.user);
      }
      
      setLoading(false);
      
      if (!session) {
        console.log("AuthGuard: No session found, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePasswordChanged = () => {
    setNeedsPasswordChange(false);
    // Refresh the user session to get updated metadata
    supabase.auth.refreshSession().then(() => {
      window.location.reload(); // Simple way to refresh the app state
    });
  };

  if (loading || checkingPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  if (needsPasswordChange) {
    return <PasswordChange onPasswordChanged={handlePasswordChanged} />;
  }

  return <>{children}</>;
};
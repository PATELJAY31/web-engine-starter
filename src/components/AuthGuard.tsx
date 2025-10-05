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

      // Skip profile table check to avoid RLS errors
      // This prevents the dashboard from not loading due to profile check errors
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (!session && event === 'SIGNED_OUT') {
            navigate('/auth');
          } else if (session?.user) {
            // Check if user needs to change password (with error handling)
            try {
              await checkTempPassword(session.user);
            } catch (passwordError) {
              console.error("Password check error:", passwordError);
              // Continue without password change requirement
              setNeedsPasswordChange(false);
            }
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Auth state change error:", error);
          // If there's an error, redirect to auth
          navigate('/auth');
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check if user needs to change password (with error handling)
        try {
          await checkTempPassword(session.user);
        } catch (passwordError) {
          console.error("Initial password check error:", passwordError);
          // Continue without password change requirement
          setNeedsPasswordChange(false);
        }
      }
      
      setLoading(false);
      
      if (!session) {
        navigate('/auth');
      }
    }).catch((error) => {
      console.error("Session check error:", error);
      // If session check fails, redirect to auth
      navigate('/auth');
      setLoading(false);
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
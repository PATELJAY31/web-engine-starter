import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AuthGuard: Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthGuard: Auth state changed", { event, user: session?.user?.email });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session && event === 'SIGNED_OUT') {
          console.log("AuthGuard: User signed out, redirecting to auth");
          navigate('/auth');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthGuard: Initial session check", { user: session?.user?.email });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        console.log("AuthGuard: No session found, redirecting to auth");
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return <>{children}</>;
};

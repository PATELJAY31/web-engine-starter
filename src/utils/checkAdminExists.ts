import { supabase } from "@/integrations/supabase/client";

export const checkAdminExists = async (email: string) => {
  try {
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    return {
      exists: !!profile,
      isAdmin: profile?.status === 'admin',
      profile: profile
    };
  } catch (error) {
    console.log("Error checking admin:", error);
    return {
      exists: false,
      isAdmin: false,
      profile: null
    };
  }
};

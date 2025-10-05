import { supabase } from "@/integrations/supabase/client";

export const testAdminProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("No authenticated user");
      return;
    }

    console.log("Current user ID:", user.id);
    console.log("Current user email:", user.email);

    // Check profile
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log("Profile error:", profileError);
      return;
    }

    console.log("Profile data:", profile);
    console.log("Profile status:", profile?.status);
    console.log("Profile role:", profile?.role);
    console.log("Profile role_type:", profile?.role_type);

    return {
      user,
      profile,
      detectedRole: profile?.status || profile?.role || profile?.role_type || 'user'
    };
  } catch (error) {
    console.error("Error testing admin profile:", error);
    return null;
  }
};

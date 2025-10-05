import { supabase } from "@/integrations/supabase/client";

export const debugProfilesTable = async () => {
  try {
    console.log("🔍 Debugging profiles table...");
    
    // Test 1: Check if we can access the table at all
    const { data: allProfiles, error: allError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .limit(5);
    
    console.log("All profiles query:", allError ? "ERROR" : "SUCCESS", allError?.message || "");
    console.log("Profiles data:", allProfiles);
    
    // Test 2: Check specific user ID
    const userId = "2897f9c5-5528-427c-bc53-bfb9341bec82";
    const { data: userProfile, error: userError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    console.log("Specific user query:", userError ? "ERROR" : "SUCCESS", userError?.message || "");
    console.log("User profile data:", userProfile);
    
    // Test 3: Check what columns exist
    const { data: columns, error: columnsError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (columns && columns.length > 0) {
      console.log("Available columns:", Object.keys(columns[0]));
    }
    
    // Test 4: Check RLS status
    const { data: rlsData, error: rlsError } = await (supabase as any)
      .rpc('get_table_info', { table_name: 'profiles' });
    
    console.log("RLS info:", rlsError ? "ERROR" : "SUCCESS", rlsError?.message || "");
    console.log("RLS data:", rlsData);
    
    return {
      allProfiles: !allError,
      userProfile: !userError,
      columns: columns && columns.length > 0 ? Object.keys(columns[0]) : [],
      rlsInfo: !rlsError
    };
  } catch (error) {
    console.error("Debug error:", error);
    return {
      allProfiles: false,
      userProfile: false,
      columns: [],
      rlsInfo: false
    };
  }
};

import { supabase } from "@/integrations/supabase/client";

export const testDatabaseConnection = async () => {
  try {
    console.log("Testing database connection...");
    
    // Test profiles table
    const { data: profiles, error: profilesError } = await (supabase as any)
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log("Profiles table:", profilesError ? "ERROR" : "OK", profilesError?.message || "");
    
    // Test customers table
    const { data: customers, error: customersError } = await (supabase as any)
      .from('customers')
      .select('*')
      .limit(1);
    
    console.log("Customers table:", customersError ? "ERROR" : "OK", customersError?.message || "");
    
    // Test products table
    const { data: products, error: productsError } = await (supabase as any)
      .from('products')
      .select('*')
      .limit(1);
    
    console.log("Products table:", productsError ? "ERROR" : "OK", productsError?.message || "");
    
    // Test invoices table
    const { data: invoices, error: invoicesError } = await (supabase as any)
      .from('invoices')
      .select('*')
      .limit(1);
    
    console.log("Invoices table:", invoicesError ? "ERROR" : "OK", invoicesError?.message || "");
    
    return {
      profiles: !profilesError,
      customers: !customersError,
      products: !productsError,
      invoices: !invoicesError
    };
  } catch (error) {
    console.error("Database test error:", error);
    return {
      profiles: false,
      customers: false,
      products: false,
      invoices: false
    };
  }
};

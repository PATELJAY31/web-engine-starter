import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const setupAdminUser = async () => {
  try {
    // Check if admin user already exists
    const { data: existingUsers } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      toast.error("Admin user already exists");
      return false;
    }

    // Create company first
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'InvoiceFlow Company',
        email: 'admin@billblister.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business Street',
        city: 'Business City',
        state: 'Business State',
        country: 'United States',
        postal_code: '12345',
        tax_id: 'TAX123456789',
        currency: 'USD'
      })
      .select()
      .single();

    if (companyError) {
      toast.error("Failed to create company");
      return false;
    }

    // Create admin user account
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@billblister.com',
      password: 'qwerty',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User'
      }
    });

    if (authError) {
      toast.error("Failed to create admin user account");
      return false;
    }

    if (!authData.user) {
      toast.error("Failed to create admin user account");
      return false;
    }

    // Create admin user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        company_id: companyData.id,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@billblister.com',
        phone: '+1 (555) 123-4567',
        role: 'admin'
      });

    if (profileError) {
      toast.error("Failed to create admin user profile");
      return false;
    }

    toast.success("Admin user created successfully!");
    toast.success("Login credentials: admin@billblister.com / qwerty");
    return true;
  } catch (error) {
    console.error("Error setting up admin user:", error);
    toast.error("Error setting up admin user");
    return false;
  }
};

export const fixAdminRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    // Check if user exists in user_profiles
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      // Create user profile if it doesn't exist
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      if (companyError || !companyData) {
        // Create a default company if none exists
        const { data: newCompany, error: createCompanyError } = await supabase
          .from('companies')
          .insert({
            name: 'Default Company',
            email: 'admin@company.com',
            phone: '+1 (555) 123-4567',
            address: '123 Business Street',
            city: 'Business City',
            state: 'Business State',
            country: 'United States',
            postal_code: '12345',
            tax_id: 'TAX123456789',
            currency: 'USD'
          })
          .select()
          .single();

        if (createCompanyError || !newCompany) {
          toast.error("Failed to create company");
          return false;
        }

        // Create user profile with the new company
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            company_id: newCompany.id,
            first_name: 'Admin',
            last_name: 'User',
            email: user.email || 'admin@billblister.com',
            phone: '+1 (555) 123-4567',
            role: 'admin'
          });

        if (profileError) {
          toast.error("Failed to create user profile");
          return false;
        }
      } else {
        // Create user profile with existing company
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            company_id: companyData.id,
            first_name: 'Admin',
            last_name: 'User',
            email: user.email || 'admin@billblister.com',
            phone: '+1 (555) 123-4567',
            role: 'admin'
          });

        if (profileError) {
          toast.error("Failed to create user profile");
          return false;
        }
      }
    } else {
      // Update existing profile to admin role
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (error) {
        toast.error("Failed to update user role");
        return false;
      }
    }

    toast.success("Admin role updated successfully!");
    return true;
  } catch (error) {
    console.error("Error fixing admin role:", error);
    toast.error("Error fixing admin role");
    return false;
  }
};

export const createCompleteAdminSetup = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      toast.info("Admin profile already exists");
      return true;
    }

    // Create company first
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'InvoiceFlow Company',
        email: 'admin@invoiceflow.com',
        phone: '+1 (555) 123-4567',
        address: '123 Business Street',
        city: 'Business City',
        state: 'Business State',
        country: 'United States',
        postal_code: '12345',
        tax_id: 'TAX123456789',
        currency: 'USD'
      })
      .select()
      .single();

    if (companyError) {
      toast.error("Failed to create company");
      return false;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        company_id: companyData.id,
        first_name: 'Admin',
        last_name: 'User',
        email: user.email || 'admin@billblister.com',
        phone: '+1 (555) 123-4567',
        role: 'admin'
      });

    if (profileError) {
      toast.error("Failed to create user profile");
      return false;
    }

    toast.success("Complete admin setup created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating complete admin setup:", error);
    toast.error("Error creating admin setup");
    return false;
  }
};

export const fixSpecificAdminUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    console.log("Current user ID:", user.id);

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      toast.info("User profile already exists");
      return true;
    }

    // Check if any company exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
      .single();

    let companyId;

    if (existingCompany) {
      companyId = existingCompany.id;
      console.log("Using existing company:", companyId);
    } else {
      // Try to create company using RPC function or direct SQL
      toast.info("Creating company... This might require database permissions.");
      
      // First, let's try to create a company with a simple approach
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: 'InvoiceFlow Company',
          email: 'admin@billblister.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Street',
          city: 'Business City',
          state: 'Business State',
          country: 'United States',
          postal_code: '12345',
          tax_id: 'TAX123456789',
          currency: 'USD'
        })
        .select()
        .single();

      if (companyError) {
        if (companyError.code === '42501') {
          toast.error("Permission denied. Please run this SQL in Supabase Dashboard:");
          toast.error("INSERT INTO companies (name, email, phone, address, city, state, country, postal_code, tax_id, currency) VALUES ('InvoiceFlow Company', 'admin@billblister.com', '+1 (555) 123-4567', '123 Business Street', 'Business City', 'Business State', 'United States', '12345', 'TAX123456789', 'USD');");
          return false;
        }
        toast.error("Failed to create company: " + JSON.stringify(companyError));
        return false;
      }

      companyId = newCompany.id;
      console.log("Created new company:", companyId);
    }

    // Create user profile for the existing auth user
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        company_id: companyId,
        first_name: 'Admin',
        last_name: 'User',
        email: user.email || 'admin@billblister.com',
        phone: '+1 (555) 123-4567',
        role: 'admin'
      });

    if (profileError) {
      toast.error("Failed to create user profile: " + JSON.stringify(profileError));
      return false;
    }

    console.log("Created user profile for:", user.id);
    toast.success("Admin user profile created successfully!");
    return true;
  } catch (error) {
    console.error("Error fixing specific admin user:", error);
    toast.error("Error creating admin profile: " + error);
    return false;
  }
};

export const createDatabaseSchema = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    console.log("Creating database schema...");

    // Check if companies table exists by trying to select from it
    const { error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .limit(1);

    if (companiesError && companiesError.code === 'PGRST205') {
      toast.error("Database schema not set up. Please run the SQL migration first.");
      toast.error("Go to Supabase Dashboard > SQL Editor and run the invoice-schema.sql file");
      return false;
    }

    // If we get here, the table exists
    toast.success("Database schema is already set up!");
    return true;
  } catch (error) {
    console.error("Error checking database schema:", error);
    toast.error("Error checking database schema: " + error);
    return false;
  }
};

export const createSampleData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    // Get user's company ID
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.company_id) {
      toast.error("Company not found");
      return false;
    }

    // Create sample customers
    const { error: customersError } = await supabase.from('customers').insert([
      {
        company_id: userProfile.company_id,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1 (555) 100-0001',
        address: '100 Corporate Blvd',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        postal_code: '10001',
        tax_id: 'TAX001',
        notes: 'Large enterprise client',
        tags: ['VIP', 'Enterprise'],
        status: 'active'
      },
      {
        company_id: userProfile.company_id,
        name: 'TechStart Inc',
        email: 'hello@techstart.com',
        phone: '+1 (555) 200-0002',
        address: '200 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        postal_code: '94105',
        tax_id: 'TAX002',
        notes: 'Growing startup',
        tags: ['Startup', 'Tech'],
        status: 'active'
      },
      {
        company_id: userProfile.company_id,
        name: 'Global Solutions Ltd',
        email: 'info@globalsolutions.com',
        phone: '+1 (555) 300-0003',
        address: '300 International Way',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        postal_code: '60601',
        tax_id: 'TAX003',
        notes: 'International business',
        tags: ['International', 'Corporate'],
        status: 'active'
      }
    ]);

    if (customersError) {
      toast.error("Failed to create sample customers");
      return false;
    }

    // Create sample product categories
    const { data: categoriesData, error: categoriesError } = await supabase.from('product_categories').insert([
      {
        company_id: userProfile.company_id,
        name: 'Software Development',
        description: 'Custom software development services'
      },
      {
        company_id: userProfile.company_id,
        name: 'Consulting',
        description: 'Business and technical consulting services'
      },
      {
        company_id: userProfile.company_id,
        name: 'Support & Maintenance',
        description: 'Ongoing support and maintenance services'
      }
    ]).select();

    if (categoriesError) {
      toast.error("Failed to create sample categories");
      return false;
    }

    // Create sample products
    const { error: productsError } = await supabase.from('products').insert([
      {
        company_id: userProfile.company_id,
        category_id: categoriesData[0].id,
        name: 'Web Application Development',
        sku: 'WEB-DEV-001',
        description: 'Custom web application development',
        unit_price: 150.00,
        tax_rate: 10.00,
        unit: 'hour',
        inventory_tracking: false,
        status: 'active'
      },
      {
        company_id: userProfile.company_id,
        category_id: categoriesData[0].id,
        name: 'Mobile App Development',
        sku: 'MOBILE-DEV-001',
        description: 'iOS and Android mobile application development',
        unit_price: 200.00,
        tax_rate: 10.00,
        unit: 'hour',
        inventory_tracking: false,
        status: 'active'
      },
      {
        company_id: userProfile.company_id,
        category_id: categoriesData[1].id,
        name: 'Business Strategy Consulting',
        sku: 'CONSULT-001',
        description: 'Strategic business planning and consulting',
        unit_price: 300.00,
        tax_rate: 10.00,
        unit: 'hour',
        inventory_tracking: false,
        status: 'active'
      },
      {
        company_id: userProfile.company_id,
        category_id: categoriesData[2].id,
        name: 'Monthly Support Package',
        sku: 'SUPPORT-001',
        description: 'Monthly technical support and maintenance',
        unit_price: 500.00,
        tax_rate: 10.00,
        unit: 'month',
        inventory_tracking: false,
        status: 'active'
      }
    ]);

    if (productsError) {
      toast.error("Failed to create sample products");
      return false;
    }

    toast.success("Sample data created successfully!");
    return true;
  } catch (error) {
    console.error("Error creating sample data:", error);
    toast.error("Error creating sample data");
    return false;
  }
};

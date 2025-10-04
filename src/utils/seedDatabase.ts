import { supabase } from "@/integrations/supabase/client";

export const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // 1. Create expense types
    const expenseTypes = [
      { name: "Travel & Transportation", head1: "Travel", head2: "Transportation", status: "active" },
      { name: "Meals & Entertainment", head1: "Food", head2: "Entertainment", status: "active" },
      { name: "Office Supplies", head1: "Office", head2: "Supplies", status: "active" },
      { name: "Communication", head1: "Communication", head2: "Internet/Phone", status: "active" },
      { name: "Training & Development", head1: "Training", head2: "Professional Development", status: "active" },
      { name: "Miscellaneous", head1: "Other", head2: "Miscellaneous", status: "active" }
    ];

    console.log("📝 Creating expense types...");
    const { data: expenseTypesData, error: expenseTypesError } = await supabase
      .from('expense_types')
      .upsert(expenseTypes, { onConflict: 'name' })
      .select();

    if (expenseTypesError) {
      console.error("Error creating expense types:", expenseTypesError);
    } else {
      console.log(`✅ Created ${expenseTypesData?.length || 0} expense types`);
    }

    // 2. Create sample users (profiles)
    const sampleProfiles = [
      {
        id: "admin-user-id",
        email: "admin@billblister.com",
        first_name: "Admin",
        last_name: "User",
        phone: "+1234567890",
        status: "active"
      },
      {
        id: "engineer-user-id", 
        email: "engineer@billblister.com",
        first_name: "John",
        last_name: "Engineer",
        phone: "+1234567891",
        status: "active"
      },
      {
        id: "approver-user-id",
        email: "approver@billblister.com", 
        first_name: "Jane",
        last_name: "Approver",
        phone: "+1234567892",
        status: "active"
      },
      {
        id: "employee-user-id",
        email: "employee@billblister.com",
        first_name: "Bob",
        last_name: "Employee", 
        phone: "+1234567893",
        status: "active"
      }
    ];

    console.log("👥 Creating sample profiles...");
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .upsert(sampleProfiles, { onConflict: 'email' })
      .select();

    if (profilesError) {
      console.error("Error creating profiles:", profilesError);
    } else {
      console.log(`✅ Created ${profilesData?.length || 0} profiles`);
    }

    // 3. Create user roles
    const userRoles = [
      { user_id: "admin-user-id", role: "admin" },
      { user_id: "engineer-user-id", role: "engineer" },
      { user_id: "approver-user-id", role: "approver" },
      { user_id: "employee-user-id", role: "employee" }
    ];

    console.log("🔐 Creating user roles...");
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .upsert(userRoles, { onConflict: 'user_id' })
      .select();

    if (rolesError) {
      console.error("Error creating user roles:", rolesError);
    } else {
      console.log(`✅ Created ${rolesData?.length || 0} user roles`);
    }

    // 4. Create sample allocations
    const sampleAllocations = [
      {
        employee_id: "employee-user-id",
        expense_type_id: expenseTypesData?.[0]?.id || "1",
        amount: 5000,
        allocation_date: new Date().toISOString(),
        remarks: "Monthly travel allowance",
        status: "active"
      },
      {
        employee_id: "employee-user-id", 
        expense_type_id: expenseTypesData?.[1]?.id || "2",
        amount: 2000,
        allocation_date: new Date().toISOString(),
        remarks: "Meals and entertainment budget",
        status: "active"
      }
    ];

    console.log("💰 Creating sample allocations...");
    const { data: allocationsData, error: allocationsError } = await supabase
      .from('allocations')
      .upsert(sampleAllocations, { onConflict: 'id' })
      .select();

    if (allocationsError) {
      console.error("Error creating allocations:", allocationsError);
    } else {
      console.log(`✅ Created ${allocationsData?.length || 0} allocations`);
    }

    // 5. Create sample claims
    const sampleClaims = [
      {
        employee_id: "employee-user-id",
        expense_type_id: expenseTypesData?.[0]?.id || "1",
        amount: 1500,
        description: "Business trip to client meeting",
        bill_number: "INV-001",
        bill_date: new Date().toISOString(),
        status: "pending"
      },
      {
        employee_id: "employee-user-id",
        expense_type_id: expenseTypesData?.[1]?.id || "2", 
        amount: 500,
        description: "Client dinner meeting",
        bill_number: "INV-002",
        bill_date: new Date().toISOString(),
        status: "approved"
      }
    ];

    console.log("📋 Creating sample claims...");
    const { data: claimsData, error: claimsError } = await supabase
      .from('claims')
      .upsert(sampleClaims, { onConflict: 'id' })
      .select();

    if (claimsError) {
      console.error("Error creating claims:", claimsError);
    } else {
      console.log(`✅ Created ${claimsData?.length || 0} claims`);
    }

    console.log("🎉 Database seeding completed successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return false;
  }
};

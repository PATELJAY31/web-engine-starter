-- Fix RLS policies for the actual database schema
-- This handles the existing policies and works with the current table structure

-- First, let's check what tables actually exist and fix them accordingly

-- Fix profiles table (this is what we're actually using)
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage all profiles" ON public.profiles;

-- Create permissive policy for profiles table
CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fix other tables that might exist
-- Customers
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Users can manage all customers" ON public.customers;
CREATE POLICY "Allow all operations on customers" ON public.customers FOR ALL USING (true);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Products
DROP POLICY IF EXISTS "Allow all operations on products" ON public.products;
DROP POLICY IF EXISTS "Users can view all products" ON public.products;
DROP POLICY IF EXISTS "Users can manage all products" ON public.products;
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Invoices
DROP POLICY IF EXISTS "Allow all operations on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage all invoices" ON public.invoices;
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoice items
DROP POLICY IF EXISTS "Allow all operations on invoice_items" ON public.invoice_items;
CREATE POLICY "Allow all operations on invoice_items" ON public.invoice_items FOR ALL USING (true);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Product categories
DROP POLICY IF EXISTS "Allow all operations on product_categories" ON public.product_categories;
CREATE POLICY "Allow all operations on product_categories" ON public.product_categories FOR ALL USING (true);
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- If other tables exist, fix them too
-- Payments
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Allow all operations on payments" ON public.payments;
        CREATE POLICY "Allow all operations on payments" ON public.payments FOR ALL USING (true);
        ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Estimates
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'estimates' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Allow all operations on estimates" ON public.estimates;
        CREATE POLICY "Allow all operations on estimates" ON public.estimates FOR ALL USING (true);
        ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Companies
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Allow all operations on companies" ON public.companies;
        CREATE POLICY "Allow all operations on companies" ON public.companies FOR ALL USING (true);
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Notifications
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Allow all operations on notifications" ON public.notifications;
        CREATE POLICY "Allow all operations on notifications" ON public.notifications FOR ALL USING (true);
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

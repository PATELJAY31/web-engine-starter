-- Simplified Invoice Management System Database Schema (No Company Dependencies)

-- Make company_id optional in all tables
ALTER TABLE user_profiles ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE products ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE invoices ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE payments ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE estimates ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE credit_notes ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE notifications ALTER COLUMN company_id DROP NOT NULL;

-- Update RLS policies to work without company restrictions
DROP POLICY IF EXISTS "Users can view their company data" ON companies;
DROP POLICY IF EXISTS "Users can view their company customers" ON customers;
DROP POLICY IF EXISTS "Users can manage their company customers" ON customers;
DROP POLICY IF EXISTS "Users can view their company products" ON products;
DROP POLICY IF EXISTS "Users can manage their company products" ON products;
DROP POLICY IF EXISTS "Users can view their company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can manage their company invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their company payments" ON payments;
DROP POLICY IF EXISTS "Users can manage their company payments" ON payments;
DROP POLICY IF EXISTS "Users can view their company estimates" ON estimates;
DROP POLICY IF EXISTS "Users can manage their company estimates" ON estimates;

-- Create simplified RLS policies
CREATE POLICY "Users can view all customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Users can manage all customers" ON customers FOR ALL USING (true);

CREATE POLICY "Users can view all products" ON products FOR SELECT USING (true);
CREATE POLICY "Users can manage all products" ON products FOR ALL USING (true);

CREATE POLICY "Users can view all invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Users can manage all invoices" ON invoices FOR ALL USING (true);

CREATE POLICY "Users can view all payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Users can manage all payments" ON payments FOR ALL USING (true);

CREATE POLICY "Users can view all estimates" ON estimates FOR SELECT USING (true);
CREATE POLICY "Users can manage all estimates" ON estimates FOR ALL USING (true);

-- Keep user_profiles policies as they are
-- Users can view all profiles, update own profile, admins can manage all

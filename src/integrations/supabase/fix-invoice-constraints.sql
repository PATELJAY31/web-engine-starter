-- Fix invoice foreign key constraints to allow invoice creation
-- This script makes the created_by field nullable temporarily

-- Option 1: Make created_by nullable (recommended)
ALTER TABLE invoices ALTER COLUMN created_by DROP NOT NULL;

-- Option 2: Drop the foreign key constraint temporarily (if Option 1 doesn't work)
-- ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_created_by_fkey;

-- Option 3: Create a default admin user profile (if the above don't work)
-- INSERT INTO profiles (id, first_name, last_name, email, status)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'System',
--   'Admin',
--   'system@admin.com',
--   'admin'
-- ) ON CONFLICT (id) DO NOTHING;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoices' AND column_name = 'created_by';

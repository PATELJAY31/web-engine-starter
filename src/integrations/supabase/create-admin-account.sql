-- =============================================
-- ADMIN ACCOUNT CREATION QUERIES
-- =============================================
-- Run these queries in your Supabase SQL Editor to create an admin account

-- =============================================
-- OPTION 1: Create Admin User in Auth (Recommended)
-- =============================================
-- This creates a user in the auth.users table with admin privileges

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@billblister.com',
  crypt('qwerty', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User", "temp_password": false}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- =============================================
-- OPTION 2: Create Admin Profile Only
-- =============================================
-- This creates a profile record for an existing user

INSERT INTO profiles (
  id,
  first_name,
  last_name,
  email,
  phone,
  status,
  is_temp_password,
  created_at,
  updated_at
) VALUES (
  '2897f9c5-5528-427c-bc53-bfb9341bec82', -- Replace with actual user ID
  'Admin',
  'User',
  'admin@billblister.com',
  NULL,
  'admin',
  false,
  NOW(),
  NOW()
);

-- =============================================
-- OPTION 3: Complete Admin Setup (Auth + Profile)
-- =============================================
-- This creates both auth user and profile in one transaction

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@billblister.com',
    crypt('qwerty', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Admin", "last_name": "User", "temp_password": false}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Insert into profiles
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    status,
    is_temp_password,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Admin',
    'User',
    'admin@billblister.com',
    NULL,
    'admin',
    false,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Admin user created successfully with ID: %', new_user_id;
END $$;

-- =============================================
-- OPTION 4: Update Existing User to Admin
-- =============================================
-- If you already have a user, update their profile to admin

UPDATE profiles 
SET 
  status = 'admin',
  is_temp_password = false,
  updated_at = NOW()
WHERE email = 'admin@billblister.com';

-- =============================================
-- OPTION 5: Create Admin with Custom Password
-- =============================================
-- Replace 'your_password' with your desired password

DO $$
DECLARE
  new_user_id UUID;
  custom_password TEXT := 'your_password'; -- Change this to your desired password
BEGIN
  new_user_id := gen_random_uuid();
  
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'admin@billblister.com',
    crypt(custom_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Admin", "last_name": "User", "temp_password": false}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  INSERT INTO profiles (
    id,
    first_name,
    last_name,
    email,
    phone,
    status,
    is_temp_password,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'Admin',
    'User',
    'admin@billblister.com',
    NULL,
    'admin',
    false,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Admin user created with custom password. ID: %', new_user_id;
END $$;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify the admin account was created

-- Check if user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'admin@billblister.com';

-- Check if profile exists
SELECT id, first_name, last_name, email, status, is_temp_password 
FROM profiles 
WHERE email = 'admin@billblister.com';

-- Check all admin users
SELECT p.first_name, p.last_name, p.email, p.status, p.created_at
FROM profiles p
WHERE p.status = 'admin';

-- =============================================
-- CLEANUP QUERIES (if needed)
-- =============================================
-- Use these if you need to remove the admin account

-- Delete from profiles first
DELETE FROM profiles WHERE email = 'admin@billblister.com';

-- Delete from auth.users
DELETE FROM auth.users WHERE email = 'admin@billblister.com';

-- =============================================
-- INSTRUCTIONS
-- =============================================
/*
HOW TO USE:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste ONE of the options above
4. Click "Run" to execute the query
5. Use the verification queries to check if it worked

RECOMMENDED APPROACH:
- Use OPTION 3 (Complete Admin Setup) for a new admin account
- Use OPTION 4 (Update Existing User) if you already have a user
- Use OPTION 5 (Custom Password) if you want a different password

DEFAULT CREDENTIALS:
- Email: admin@billblister.com
- Password: qwerty

After running the query, you should be able to log in with these credentials.
*/

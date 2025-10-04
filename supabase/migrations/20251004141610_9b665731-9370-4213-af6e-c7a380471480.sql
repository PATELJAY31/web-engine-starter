-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('employee', 'engineer', 'approver', 'admin');

-- Create enum for approval status
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  dob DATE,
  status TEXT DEFAULT 'active',
  reporting_manager_id UUID REFERENCES public.profiles(id),
  head1 TEXT,
  head2 TEXT,
  joining_date DATE,
  leaving_date DATE,
  country TEXT,
  state TEXT,
  city TEXT,
  full_address1 TEXT,
  full_address2 TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create expense_types table
CREATE TABLE public.expense_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  head1 TEXT,
  head2 TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create allocations table
CREATE TABLE public.allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  allocation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expense_type_id UUID REFERENCES public.expense_types(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  remarks TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create claims table
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  expense_type_id UUID REFERENCES public.expense_types(id) NOT NULL,
  allocation_id UUID REFERENCES public.allocations(id),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  bill_number TEXT,
  bill_date DATE,
  file_url TEXT,
  notes TEXT,
  status approval_status DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for expense_types
CREATE POLICY "Everyone can view expense types" ON public.expense_types FOR SELECT USING (true);
CREATE POLICY "Admins can manage expense types" ON public.expense_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for allocations
CREATE POLICY "Employees can view own allocations" ON public.allocations FOR SELECT USING (auth.uid() = employee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage allocations" ON public.allocations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for claims
CREATE POLICY "Employees can view own claims" ON public.claims FOR SELECT USING (
  auth.uid() = employee_id 
  OR public.has_role(auth.uid(), 'engineer')
  OR public.has_role(auth.uid(), 'approver')
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Employees can create claims" ON public.claims FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Engineers can update claims" ON public.claims FOR UPDATE USING (
  public.has_role(auth.uid(), 'engineer')
  OR public.has_role(auth.uid(), 'approver')
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admins can delete claims" ON public.claims FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for receipts bucket
CREATE POLICY "Users can upload own receipts" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can view receipts" ON storage.objects FOR SELECT USING (
  bucket_id = 'receipts'
);
CREATE POLICY "Users can delete own receipts" ON storage.objects FOR DELETE USING (
  bucket_id = 'receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.expense_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.allocations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  -- Assign default employee role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample expense types
INSERT INTO public.expense_types (name, head1, head2, status) VALUES
  ('Travel', 'Transportation', 'Flight', 'active'),
  ('Travel', 'Transportation', 'Train', 'active'),
  ('Travel', 'Transportation', 'Taxi', 'active'),
  ('Meals', 'Food & Beverage', 'Client Meeting', 'active'),
  ('Meals', 'Food & Beverage', 'Team Lunch', 'active'),
  ('Office Supplies', 'Equipment', 'Stationery', 'active'),
  ('Communication', 'Telecom', 'Mobile', 'active'),
  ('Training', 'Development', 'Course Fee', 'active');
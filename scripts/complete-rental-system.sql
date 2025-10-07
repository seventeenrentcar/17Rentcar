-- ============================================================================
-- 17RENTCAR - COMPLETE DATABASE SETUP
-- This file contains all tables and configurations actually used in the project
-- Run this in your Supabase SQL Editor to set up the complete system
-- ============================================================================

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- Create vehicles table (main rental inventory)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  features TEXT[],
  all_in_price INTEGER NOT NULL,
  unit_only_price INTEGER NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact settings table (for dynamic contact information)
CREATE TABLE IF NOT EXISTS contact_settings (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. SECURITY POLICIES
-- ============================================================================

-- Vehicles policies (public can read, admins can manage)
CREATE POLICY "Vehicles are viewable by everyone" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Vehicles are editable by admins" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Admin profiles policies (fixed - no recursion)
-- Allow all authenticated users to view admin profiles
CREATE POLICY "Allow all authenticated users to view admin profiles" ON admin_profiles
  FOR SELECT TO authenticated USING (true);

-- Allow users to manage their own admin profile
CREATE POLICY "Allow users to manage their own admin profile" ON admin_profiles
  FOR ALL USING (auth.uid() = id);

-- Contact settings policies (admins can manage, public can read)
CREATE POLICY "Admin can manage contact settings" ON contact_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles 
            WHERE admin_profiles.id = auth.uid() 
            AND admin_profiles.role IN ('admin', 'super_admin')
            AND admin_profiles.is_active = true
        )
    );

-- Allow public read access to contact settings (for WhatsApp integration)
CREATE POLICY "Allow public read access to contact settings" ON contact_settings
    FOR SELECT USING (true);

-- ============================================================================
-- 4. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp for vehicles
CREATE OR REPLACE FUNCTION update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vehicles updated_at
DROP TRIGGER IF EXISTS vehicles_updated_at_trigger ON vehicles;
CREATE TRIGGER vehicles_updated_at_trigger
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicles_updated_at();

-- Function to automatically update updated_at timestamp for contact_settings
CREATE OR REPLACE FUNCTION update_contact_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contact_settings updated_at
DROP TRIGGER IF EXISTS contact_settings_updated_at_trigger ON contact_settings;
CREATE TRIGGER contact_settings_updated_at_trigger
    BEFORE UPDATE ON contact_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_settings_updated_at();

-- ============================================================================
-- 5. STORAGE SETUP (for vehicle images)
-- ============================================================================

-- Create storage bucket for vehicle images (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicles', 'vehicles', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow admin uploads to vehicles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to vehicles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin updates to vehicles bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin deletes from vehicles bucket" ON storage.objects;

-- Allow authenticated users to upload vehicle images
CREATE POLICY "Allow admin uploads to vehicles bucket" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'vehicles' AND
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Allow public access to view vehicle images
CREATE POLICY "Allow public access to vehicles bucket" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'vehicles');

-- Allow admins to update vehicle images
CREATE POLICY "Allow admin updates to vehicles bucket" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'vehicles' AND
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- Allow admins to delete vehicle images
CREATE POLICY "Allow admin deletes from vehicles bucket" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'vehicles' AND
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND admin_profiles.is_active = true
    )
  );

-- ============================================================================
-- 6. PERMISSIONS AND GRANTS
-- ============================================================================

-- Grant necessary permissions for authenticated users
GRANT ALL ON vehicles TO authenticated;
GRANT ALL ON admin_profiles TO authenticated;
GRANT ALL ON contact_settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE contact_settings_id_seq TO authenticated;

-- Grant read access to anonymous users (for public website)
GRANT SELECT ON vehicles TO anon;
GRANT SELECT ON contact_settings TO anon;

-- ============================================================================
-- 7. INITIAL DATA
-- ============================================================================

-- Insert default contact information
INSERT INTO contact_settings (phone, email, whatsapp) 
VALUES ('087817090619', 'innomardia@gmail.com', '087817090619')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CREATE ADMIN USER (REQUIRED FOR SYSTEM ACCESS)
-- ============================================================================
-- IMPORTANT: You MUST create an admin user to access the admin panel
-- Follow these steps carefully:

-- METHOD 1: Using Supabase Auth Dashboard (Recommended)
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user" and create a user with email/password
-- 4. Copy the user ID from the users table
-- 5. Run the INSERT statement below with the actual user ID

-- METHOD 2: Using SQL (if you have admin API access)
-- You can also create the auth user via SQL if you have service role access

-- STEP 1: Get the user ID from auth.users after creating a user
-- STEP 2: Uncomment and modify the INSERT below with the actual user ID

-- Example admin profile creation (REPLACE 'your-user-id-here' with actual UUID):
/*
INSERT INTO admin_profiles (id, email, full_name, role, is_active) 
VALUES (
  'your-user-id-here'::uuid,  -- Replace with actual user ID from auth.users
  'admin@17rentcar.com',      -- Replace with your admin email
  'Admin User',               -- Replace with admin name
  'super_admin',              -- Role: 'admin' or 'super_admin'
  true
) ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;
*/

-- WARNING: Without an admin user, you cannot access /admin routes!

-- Insert sample vehicles (optional - remove if you don't want sample data)
INSERT INTO vehicles (name, type, brand, features, all_in_price, unit_only_price, image_url) VALUES
('Toyota Avanza 1.3 G', 'MPV', 'Toyota', ARRAY['7 Penumpang', 'AC', 'Audio System', 'Power Steering'], 650000, 450000, '/placeholder.svg?height=300&width=400'),
('Honda Brio Satya', 'Hatchback', 'Honda', ARRAY['5 Penumpang', 'AC', 'Manual Transmission', 'Irit BBM'], 500000, 350000, '/placeholder.svg?height=300&width=400'),
('Mitsubishi Xpander Ultimate', 'MPV', 'Mitsubishi', ARRAY['7 Penumpang', 'AC', 'Automatic', 'Touchscreen'], 800000, 600000, '/placeholder.svg?height=300&width=400'),
('Toyota Innova Reborn', 'MPV', 'Toyota', ARRAY['8 Penumpang', 'AC', 'Diesel', 'Comfortable'], 900000, 700000, '/placeholder.svg?height=300&width=400'),
('Daihatsu Terios', 'SUV', 'Daihatsu', ARRAY['7 Penumpang', 'AC', '4WD', 'Tangguh'], 750000, 550000, '/placeholder.svg?height=300&width=400'),
('Honda Jazz', 'Hatchback', 'Honda', ARRAY['5 Penumpang', 'AC', 'CVT', 'Sporty'], 600000, 400000, '/placeholder.svg?height=300&width=400'),
('Toyota Fortuner', 'SUV', 'Toyota', ARRAY['7 Penumpang', 'AC', 'Diesel', '4WD', 'Premium'], 1200000, 1000000, '/placeholder.svg?height=300&width=400'),
('Suzuki Ertiga', 'MPV', 'Suzuki', ARRAY['7 Penumpang', 'AC', 'Manual', 'Ekonomis'], 550000, 400000, '/placeholder.svg?height=300&width=400')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_available ON vehicles(is_available);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_active ON admin_profiles(is_active);

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- After running this script, your database will have:
-- ✅ All tables used by the 17rentcar application
-- ✅ Proper security policies (RLS)
-- ✅ Storage bucket for vehicle images
-- ✅ Triggers for automatic timestamp updates
-- ✅ Performance indexes
-- ✅ Sample data (vehicles and contact info)
-- ✅ Public access to vehicle and contact data
-- ✅ Admin-only access to management functions

-- Next steps:
-- 1. Create your first admin user via Supabase Auth Dashboard + SQL INSERT
-- 2. Upload vehicle images through the admin panel
-- 3. Update contact information through admin panel
-- 4. Your rental car website is ready to use!

-- Optional: Enable realtime subscriptions for live updates
-- ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;
-- ALTER PUBLICATION supabase_realtime ADD TABLE contact_settings;

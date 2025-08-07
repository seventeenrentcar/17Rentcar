-- Create vehicles table
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

-- Create admin users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table for tracking (optional, for future use)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  booking_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Vehicles: Public read, admin write
CREATE POLICY "Vehicles are viewable by everyone" ON vehicles
  FOR SELECT USING (true);

CREATE POLICY "Vehicles are editable by admins" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Admin profiles: Only viewable/editable by the user themselves
CREATE POLICY "Admin profiles are viewable by owner" ON admin_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin profiles are editable by owner" ON admin_profiles
  FOR ALL USING (auth.uid() = id);

-- Bookings: Admin access only
CREATE POLICY "Bookings are viewable by admins" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Bookings are editable by admins" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

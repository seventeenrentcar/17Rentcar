-- Complete admin system setup with all required tables and policies

-- First ensure we have all necessary tables from existing scripts
-- This script builds upon the existing ones

-- Create users table for customer management
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  date_of_birth DATE,
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_role VARCHAR(255),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create FAQ table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('info', 'success', 'warning', 'error')),
  target_audience VARCHAR(20) CHECK (target_audience IN ('all', 'admins', 'users')),
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  category VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES admin_profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES admin_profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content pages table
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES admin_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users viewable by admins" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Users manageable by admins" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create policies for testimonials
CREATE POLICY "Testimonials viewable by everyone" ON testimonials
  FOR SELECT USING (is_approved = true AND is_featured = true);

CREATE POLICY "All testimonials viewable by admins" ON testimonials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Testimonials manageable by admins" ON testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create policies for FAQs
CREATE POLICY "Published FAQs viewable by everyone" ON faqs
  FOR SELECT USING (is_published = true);

CREATE POLICY "All FAQs viewable by admins" ON faqs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "FAQs manageable by admins" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create policies for notifications
CREATE POLICY "Notifications viewable by admins" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Notifications manageable by admins" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create policies for system settings
CREATE POLICY "Public settings viewable by everyone" ON system_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "All settings viewable by admins" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Settings manageable by admins" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create policies for audit trail
CREATE POLICY "Audit trail viewable by admins" ON audit_trail
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create policies for content pages
CREATE POLICY "Published pages viewable by everyone" ON content_pages
  FOR SELECT USING (is_published = true);

CREATE POLICY "All pages viewable by admins" ON content_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Pages manageable by admins" ON content_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that need them
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at 
  BEFORE UPDATE ON testimonials 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_faqs_updated_at ON faqs;
CREATE TRIGGER update_faqs_updated_at 
  BEFORE UPDATE ON faqs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
  BEFORE UPDATE ON system_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_pages_updated_at ON content_pages;
CREATE TRIGGER update_content_pages_updated_at 
  BEFORE UPDATE ON content_pages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_trail (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_trail (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_trail (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to important tables
CREATE TRIGGER vehicles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER testimonials_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER bookings_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Insert some default system settings
INSERT INTO system_settings (setting_key, setting_value, description, category, is_public) VALUES
('site_name', '"17 Rent Car"', 'Website name', 'general', true),
('site_description', '"Layanan rental mobil terpercaya di Indonesia"', 'Website description', 'general', true),
('contact_email', '"info@17rentcar.com"', 'Contact email', 'contact', true),
('contact_phone', '"+62-XXX-XXXX-XXXX"', 'Contact phone', 'contact', true),
('contact_address', '"Jakarta, Indonesia"', 'Contact address', 'contact', true),
('booking_fee', '50000', 'Booking fee in IDR', 'pricing', false),
('cancellation_policy', '"Pembatalan gratis hingga 24 jam sebelum tanggal rental"', 'Cancellation policy', 'policy', true)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample FAQ data
INSERT INTO faqs (question, answer, category, sort_order) VALUES
('Bagaimana cara memesan mobil?', 'Anda dapat memesan mobil melalui website kami dengan memilih kendaraan yang diinginkan dan mengisi formulir pemesanan.', 'pemesanan', 1),
('Apa saja dokumen yang diperlukan?', 'Dokumen yang diperlukan: KTP, SIM A yang masih berlaku, dan kartu kredit atau deposit.', 'persyaratan', 2),
('Apakah bisa rental tanpa sopir?', 'Ya, kami menyediakan layanan rental mobil dengan atau tanpa sopir sesuai kebutuhan Anda.', 'layanan', 3),
('Bagaimana kebijakan pembatalan?', 'Pembatalan gratis hingga 24 jam sebelum tanggal rental. Setelah itu akan dikenakan biaya administrasi.', 'kebijakan', 4),
('Apakah tersedia asuransi?', 'Ya, semua kendaraan kami sudah dilengkapi dengan asuransi komprehensif untuk keamanan berkendara.', 'asuransi', 5)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_content_pages_published ON content_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_name ON audit_trail(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_trail_changed_at ON audit_trail(changed_at);
CREATE INDEX IF NOT EXISTS idx_notifications_target_audience ON notifications(target_audience);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

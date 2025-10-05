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

-- Create content management tables
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

-- Create notifications system
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
  target_audience VARCHAR(50) DEFAULT 'all', -- all, admins, users
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

-- Create audit trail for better tracking
CREATE TABLE IF NOT EXISTS audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(255) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES admin_profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
-- Users policies
CREATE POLICY "Users viewable by admins" ON users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.id = auth.uid())
  );

CREATE POLICY "Users manageable by admins with permission" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid() 
      AND (role = 'super_admin' OR permissions->'users'->>'read' = 'true')
    )
  );

-- Content pages policies
CREATE POLICY "Content pages manageable by admins" ON content_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND (role = 'super_admin' OR permissions->'content'->>'read' = 'true')
    )
  );

-- Testimonials policies
CREATE POLICY "Testimonials manageable by admins" ON testimonials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- FAQs policies
CREATE POLICY "FAQs manageable by admins" ON faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Notifications manageable by admins" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- System settings policies
CREATE POLICY "System settings manageable by super admins" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Audit trail policies
CREATE POLICY "Audit trail viewable by admins" ON audit_trail
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, category, is_public) VALUES
('site_name', '"17rentcar"', 'Website name', 'general', true),
('site_description', '"Layanan sewa mobil terpercaya di Bandung"', 'Website description', 'general', true),
('contact_phone', '"+62 895-0479-6894"', 'Contact phone number', 'contact', true),
('contact_email', '"innomardia@gmail.com"', 'Contact email address', 'contact', true),
('whatsapp_number', '"6289504796894"', 'WhatsApp number for bookings', 'contact', true),
('booking_enabled', 'true', 'Enable/disable booking system', 'booking', false),
('maintenance_mode', 'false', 'Enable/disable maintenance mode', 'system', false),
('max_booking_days', '30', 'Maximum days in advance for booking', 'booking', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, sort_order) VALUES
('Bagaimana cara memesan mobil?', 'Anda dapat memesan mobil melalui WhatsApp atau langsung menghubungi kami. Pilih mobil yang diinginkan dari katalog, lalu klik tombol "Pesan Sekarang".', 'booking', 1),
('Apakah ada deposit yang harus dibayar?', 'Ya, kami memerlukan deposit sesuai dengan jenis kendaraan yang disewa. Deposit akan dikembalikan setelah kendaraan dikembalikan dalam kondisi baik.', 'payment', 2),
('Berapa lama minimal sewa mobil?', 'Minimal sewa mobil adalah 12 jam. Untuk sewa harian, dihitung per 24 jam.', 'booking', 3),
('Apakah driver sudah termasuk?', 'Untuk paket "All In", driver sudah termasuk. Untuk paket "Unit Only", Anda perlu menyediakan driver sendiri.', 'service', 4),
('Area mana saja yang dilayani?', 'Kami melayani area Bandung Raya, Cimahi, dan sekitarnya. Untuk area di luar itu, silakan konsultasi terlebih dahulu.', 'service', 5)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_content_pages_slug ON content_pages(slug);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_notifications_target_audience ON notifications(target_audience);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_record ON audit_trail(table_name, record_id);

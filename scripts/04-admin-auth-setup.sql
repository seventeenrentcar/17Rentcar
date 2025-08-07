-- Create admin authentication and role management system

-- First, ensure we have the admin_profiles table with proper structure
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Create admin sessions table for better session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin activity log for security monitoring
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for admin sessions
CREATE POLICY "Admin sessions are viewable by owner" ON admin_sessions
  FOR SELECT USING (
    admin_id IN (
      SELECT id FROM admin_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admin sessions are manageable by owner" ON admin_sessions
  FOR ALL USING (
    admin_id IN (
      SELECT id FROM admin_profiles WHERE id = auth.uid()
    )
  );

-- Create policies for admin activity log
CREATE POLICY "Admin activity log viewable by admins" ON admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

CREATE POLICY "Admin activity log insertable by admins" ON admin_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
      AND is_active = true
    )
  );

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION check_admin_permission(user_id UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  admin_permissions JSONB;
  is_super_admin BOOLEAN;
BEGIN
  SELECT permissions, (role = 'super_admin') INTO admin_permissions, is_super_admin
  FROM admin_profiles 
  WHERE id = user_id AND is_active = true;
  
  -- Super admin has all permissions
  IF is_super_admin THEN
    RETURN TRUE;
  END IF;
  
  -- Check specific permission
  IF admin_permissions ? required_permission THEN
    RETURN (admin_permissions ->> required_permission)::BOOLEAN;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_id UUID,
  action_name TEXT,
  resource_type TEXT DEFAULT NULL,
  resource_id UUID DEFAULT NULL,
  details JSONB DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  user_agent_str TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_activity_log (
    admin_id, action, resource_type, resource_id, details, ip_address, user_agent
  ) VALUES (
    admin_id, action_name, resource_type, resource_id, details, ip_addr, user_agent_str
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(admin_email TEXT)
RETURNS VOID AS $$
DECLARE
  current_attempts INTEGER;
  admin_id UUID;
BEGIN
  SELECT id, login_attempts INTO admin_id, current_attempts
  FROM admin_profiles 
  WHERE email = admin_email;
  
  IF admin_id IS NOT NULL THEN
    UPDATE admin_profiles 
    SET 
      login_attempts = current_attempts + 1,
      locked_until = CASE 
        WHEN current_attempts + 1 >= 5 THEN NOW() + INTERVAL '30 minutes'
        ELSE locked_until
      END
    WHERE id = admin_id;
    
    -- Log the failed attempt
    PERFORM log_admin_activity(
      admin_id, 
      'failed_login', 
      'auth', 
      admin_id, 
      jsonb_build_object('attempts', current_attempts + 1)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle successful login
CREATE OR REPLACE FUNCTION handle_successful_login(admin_email TEXT)
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id
  FROM admin_profiles 
  WHERE email = admin_email AND is_active = true;
  
  IF admin_id IS NOT NULL THEN
    UPDATE admin_profiles 
    SET 
      login_attempts = 0,
      locked_until = NULL,
      last_login = NOW()
    WHERE id = admin_id;
    
    -- Log the successful login
    PERFORM log_admin_activity(
      admin_id, 
      'successful_login', 
      'auth', 
      admin_id
    );
  END IF;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default super admin (you should change these credentials)
INSERT INTO admin_profiles (id, email, full_name, role, permissions, is_active)
VALUES (
  gen_random_uuid(),
  'admin@17rentcar.com',
  'Super Admin',
  'super_admin',
  '{
    "vehicles": {"create": true, "read": true, "update": true, "delete": true},
    "bookings": {"create": true, "read": true, "update": true, "delete": true},
    "analytics": {"read": true},
    "users": {"create": true, "read": true, "update": true, "delete": true},
    "settings": {"read": true, "update": true}
  }'::jsonb,
  true
)
ON CONFLICT (email) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);

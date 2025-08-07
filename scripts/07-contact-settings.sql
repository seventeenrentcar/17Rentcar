-- SQL script for Contact Settings management in Supabase
-- Run this in your Supabase SQL Editor

-- Create contact_settings table
CREATE TABLE IF NOT EXISTS contact_settings (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security)
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (adjust based on your admin auth setup)
CREATE POLICY "Admin can manage contact settings" ON contact_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_profiles 
            WHERE admin_profiles.id = auth.uid() 
            AND admin_profiles.role IN ('admin', 'super_admin')
        )
    );

-- Insert default contact information (optional)
INSERT INTO contact_settings (phone, email, whatsapp) 
VALUES ('087817090619', 'innomardia@gmail.com', '087817090619')
ON CONFLICT (id) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS contact_settings_updated_at_trigger ON contact_settings;
CREATE TRIGGER contact_settings_updated_at_trigger
    BEFORE UPDATE ON contact_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_settings_updated_at();

-- Grant necessary permissions
GRANT ALL ON contact_settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE contact_settings_id_seq TO authenticated;

-- SQL script to allow public access to contact_settings table
-- This allows anonymous/guest users to read contact information for WhatsApp integration
-- Run this in your Supabase SQL Editor

-- Add public read policy for contact_settings
CREATE POLICY "Allow public read access to contact settings" ON contact_settings
    FOR SELECT USING (true);

-- Grant read access to anonymous users
GRANT SELECT ON contact_settings TO anon;

-- Optional: If you want to be more specific, you can replace the above policy with:
-- CREATE POLICY "Allow public read access to contact settings" ON contact_settings
--     FOR SELECT USING (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Note: This policy allows anyone to read contact information
-- but only admins can still create, update, or delete contact settings
-- due to the existing "Admin can manage contact settings" policy

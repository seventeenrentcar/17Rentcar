-- Storage bucket setup for vehicle images
-- This script sets up the storage bucket and policies for uploading vehicle images

-- Ensure the vehicles bucket exists and is public (should already exist according to user)
-- If not already created, create it:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vehicles', 'vehicles', true);

-- Make sure the bucket is public (allows public URL access)
UPDATE storage.buckets SET public = true WHERE id = 'vehicles';

-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vehicles');

-- Allow public access to view images
CREATE POLICY IF NOT EXISTS "Allow public access" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'vehicles');

-- Allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Allow authenticated updates" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'vehicles')
  WITH CHECK (bucket_id = 'vehicles');

-- Allow authenticated users to delete their uploads
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'vehicles');

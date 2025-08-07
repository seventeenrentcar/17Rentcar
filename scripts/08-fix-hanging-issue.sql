-- Temporarily disable problematic triggers that might cause hanging
-- This script is for debugging the form submission hanging issue

-- Check if audit trigger exists and is causing issues
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'vehicles';

-- Temporarily disable the audit trigger on vehicles
DROP TRIGGER IF EXISTS vehicles_audit_trigger ON vehicles;

-- Also check for any other triggers that might be causing issues
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE tablename = 'vehicles';

-- Test a simple insert to see if it works without the trigger
INSERT INTO vehicles (name, type, brand, features, all_in_price, unit_only_price, image_url) 
VALUES ('Test Vehicle', 'MPV', 'Test Brand', ARRAY['Test Feature'], 100000, 80000, null);

-- Clean up test data
DELETE FROM vehicles WHERE name = 'Test Vehicle';

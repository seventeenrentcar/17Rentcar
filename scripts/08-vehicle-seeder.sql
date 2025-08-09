-- Vehicle Seeder for Rental17 Bandung
-- This script populates the vehicles table with actual rental data
-- Based on the actual database structure from complete-rental-system.sql

-- Clear existing demo data (optional - remove if you want to keep existing data)
-- DELETE FROM public.vehicles WHERE name LIKE '%Demo%' OR name LIKE '%Sample%';

-- Insert vehicles based on actual schema: vehicles (id, name, type, brand, features, all_in_price, unit_only_price, image_url, is_available)
INSERT INTO public.vehicles (
    name, 
    type, 
    brand, 
    features, 
    all_in_price, 
    unit_only_price, 
    image_url, 
    is_available
) VALUES 

-- MPV Category - With Driver Service
(
    'Toyota Hiace Commuter 14 Seat',
    'MPV',
    'Toyota',
    ARRAY['14 Penumpang', 'AC', 'Spacious Luggage', 'Group Transport'],
    1500000,  -- all_in_price (with driver)
    0,        -- unit_only_price (not available for self-drive)
    '/placeholder.jpg',
    true
),
(
    'Toyota Hiace Premio New 2024',
    'MPV',
    'Toyota',
    ARRAY['14 Penumpang', 'Premium Interior', '2024 Model', 'AC', 'Automatic'],
    1900000,  -- all_in_price (with driver)
    0,        -- unit_only_price (not available for self-drive)
    '/placeholder.jpg',
    true
),
(
    'Isuzu ELF Long 20 Seat',
    'Bus',
    'Isuzu',
    ARRAY['20 Penumpang', 'Long Wheelbase', 'High Capacity', 'AC'],
    2200000,  -- all_in_price (with driver)
    0,        -- unit_only_price (not available for self-drive)
    '/placeholder.jpg',
    true
),

-- Luxury Category - With Driver Service
(
    'Toyota Alphard Transformers Gen 3',
    'Luxury',
    'Toyota',
    ARRAY['7 Penumpang', 'Captain Seats', 'Premium Interior', 'Transformers Edition', 'Luxury Comfort'],
    3500000,  -- all_in_price (with driver)
    3000000,  -- unit_only_price (self-drive available)
    '/placeholder.jpg',
    true
),
(
    'Toyota Alphard All New 2025',
    'Luxury',
    'Toyota',
    ARRAY['7 Penumpang', '2025 Model', 'Latest Technology', 'Premium Luxury', 'Captain Seats'],
    6500000,  -- all_in_price (with driver)
    5500000,  -- unit_only_price (self-drive available)
    '/placeholder.jpg',
    true
),

-- SUV Category - With Driver Service
(
    'Toyota Innova Reborn',
    'SUV',
    'Toyota',
    ARRAY['7 Penumpang', 'Family Friendly', 'Comfortable', 'Reliable', 'Diesel Engine'],
    1300000,  -- all_in_price (with driver)
    750000,   -- unit_only_price (self-drive available)
    '/placeholder.jpg',
    true
),
(
    'Toyota Fortuner GR',
    'SUV',
    'Toyota',
    ARRAY['7 Penumpang', 'GR Sport', '4WD Capable', 'Premium SUV', 'Diesel Engine'],
    1600000,  -- all_in_price (with driver)
    1300000,  -- unit_only_price (self-drive available)
    '/placeholder.jpg',
    true
),
(
    'Mitsubishi Pajero Sport',
    'SUV',
    'Mitsubishi',
    ARRAY['7 Penumpang', '4WD', 'Adventure Ready', 'Reliable', 'Diesel Engine'],
    1600000,  -- all_in_price (with driver)
    1300000,  -- unit_only_price (self-drive available)
    '/placeholder.jpg',
    true
),

-- Compact/MPV Category - With Driver Service
(
    'Toyota Avanza TSS New',
    'MPV',
    'Toyota',
    ARRAY['7 Penumpang', 'Toyota Safety Sense', 'Fuel Efficient', 'Family Car', 'Automatic'],
    1200000,  -- all_in_price (with driver)
    550000,   -- unit_only_price (self-drive available)
    '/placeholder.jpg',
    true
),

-- Self-Drive Only Vehicles (unit_only_price as main price)
(
    'Toyota Avanza Grand',
    'MPV',
    'Toyota',
    ARRAY['7 Penumpang', 'Fuel Efficient', 'Manual Transmission', 'Easy Drive'],
    0,        -- all_in_price (not available with driver)
    350000,   -- unit_only_price (self-drive only)
    '/placeholder.jpg',
    true
),
(
    'Honda Brio AT',
    'Hatchback',
    'Honda',
    ARRAY['5 Penumpang', 'Automatic Transmission', 'City Car', 'Compact'],
    0,        -- all_in_price (not available with driver)
    400000,   -- unit_only_price (self-drive only)
    '/placeholder.jpg',
    true
),
(
    'Honda Mobilio',
    'MPV',
    'Honda',
    ARRAY['7 Penumpang', 'Family Friendly', 'Manual Transmission', 'Versatile'],
    0,        -- all_in_price (not available with driver)
    450000,   -- unit_only_price (self-drive only)
    '/placeholder.jpg',
    true
),
(
    'Honda BR-V',
    'SUV',
    'Honda',
    ARRAY['7 Penumpang', 'Compact SUV', 'High Ground Clearance', 'Automatic Transmission'],
    0,        -- all_in_price (not available with driver)
    525000,   -- unit_only_price (self-drive only)
    '/placeholder.jpg',
    true
);

-- Update contact settings with Rental17 Bandung information
UPDATE public.contact_settings SET 
    phone = '087817090619',
    email = 'innomardia@gmail.com',
    whatsapp = '087817090619'
WHERE id = 1;

-- If no contact settings exist, insert them
INSERT INTO public.contact_settings (phone, email, whatsapp) 
SELECT '087817090619', 'innomardia@gmail.com', '087817090619'
WHERE NOT EXISTS (SELECT 1 FROM public.contact_settings);

-- Display summary of inserted vehicles
SELECT 
    'Vehicles added successfully!' as message,
    COUNT(*) as total_vehicles
FROM public.vehicles;

-- Display vehicles by type and pricing
SELECT 
    type,
    COUNT(*) as vehicle_count,
    MIN(CASE WHEN all_in_price > 0 THEN all_in_price END) as min_all_in_price,
    MAX(CASE WHEN all_in_price > 0 THEN all_in_price END) as max_all_in_price,
    MIN(CASE WHEN unit_only_price > 0 THEN unit_only_price END) as min_unit_only_price,
    MAX(CASE WHEN unit_only_price > 0 THEN unit_only_price END) as max_unit_only_price
FROM public.vehicles
GROUP BY type
ORDER BY type;

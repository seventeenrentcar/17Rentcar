-- Enhanced Vehicle Schema for Car Rental Business
-- Run this after your current complete-rental-system.sql

-- Simplified Vehicle Schema for Showcase Website
-- Focus on customer-facing information only

-- Add essential showcase columns
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50);
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS transmission VARCHAR(20);
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS seats INTEGER;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine_capacity VARCHAR(20);

-- Multiple images for better showcase
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Customer experience columns
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 4.5;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS popular BOOLEAN DEFAULT false;

-- Service inclusions (what's included in rental)
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS includes TEXT[];
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS excludes TEXT[];

-- Pricing details
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS security_deposit INTEGER DEFAULT 500000;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS minimum_rental_days INTEGER DEFAULT 1;

-- Create indexes for showcase performance
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON vehicles(fuel_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_transmission ON vehicles(transmission);
CREATE INDEX IF NOT EXISTS idx_vehicles_seats ON vehicles(seats);
CREATE INDEX IF NOT EXISTS idx_vehicles_rating ON vehicles(average_rating);
CREATE INDEX IF NOT EXISTS idx_vehicles_popular ON vehicles(popular);

-- Add check constraints
ALTER TABLE public.vehicles ADD CONSTRAINT check_year CHECK (year >= 2000 AND year <= 2030);
ALTER TABLE public.vehicles ADD CONSTRAINT check_seats CHECK (seats >= 2 AND seats <= 50);
ALTER TABLE public.vehicles ADD CONSTRAINT check_rating CHECK (average_rating >= 0 AND average_rating <= 5);

-- Update existing vehicles with showcase data
UPDATE public.vehicles SET 
    year = 2023,
    fuel_type = 'Gasoline',
    transmission = 'Manual',
    seats = 7,
    security_deposit = 500000,
    average_rating = 4.5,
    description = 'Mobil keluarga yang nyaman dan irit bahan bakar',
    includes = ARRAY['BBM', 'Driver', 'Tol', 'Air Mineral'],
    excludes = ARRAY['Parkir', 'Tips Driver', 'Makan Driver'],
    popular = false
WHERE year IS NULL;

-- Update specific vehicles with realistic showcase data
UPDATE public.vehicles SET 
    year = 2024,
    transmission = 'Automatic',
    seats = 14,
    engine_capacity = '2800cc',
    fuel_type = 'Diesel',
    security_deposit = 1000000,
    description = 'Van premium untuk grup besar dengan kenyamanan maksimal',
    popular = true
WHERE name LIKE '%Premio%' OR name LIKE '%Hiace%';

UPDATE public.vehicles SET 
    year = 2025,
    transmission = 'Automatic',
    seats = 7,
    engine_capacity = '2500cc',
    fuel_type = 'Hybrid',
    security_deposit = 2000000,
    average_rating = 4.9,
    description = 'Mobil mewah dengan teknologi hybrid terdepan',
    popular = true
WHERE name LIKE '%Alphard%';

UPDATE public.vehicles SET 
    year = 2022,
    transmission = 'Automatic',
    seats = 7,
    engine_capacity = '2000cc',
    fuel_type = 'Diesel',
    security_deposit = 800000,
    description = 'SUV tangguh untuk petualangan dan perjalanan keluarga',
    average_rating = 4.7
WHERE name LIKE '%Innova%' OR name LIKE '%Fortuner%' OR name LIKE '%Pajero%';

UPDATE public.vehicles SET 
    year = 2023,
    transmission = 'Automatic',
    seats = 5,
    engine_capacity = '1200cc',
    fuel_type = 'Gasoline',
    security_deposit = 300000,
    description = 'Mobil city car yang praktis untuk perjalanan dalam kota'
WHERE name LIKE '%Brio%';

UPDATE public.vehicles SET 
    seats = 20,
    description = 'Bus kapasitas besar untuk acara grup dan tour'
WHERE name LIKE '%ELF%';

-- Display enhanced vehicle information for showcase
SELECT 
    name,
    category,
    year,
    fuel_type,
    transmission,
    seats,
    engine_capacity,
    average_rating,
    all_in_price,
    unit_only_price,
    security_deposit,
    description,
    popular
FROM public.vehicles
ORDER BY popular DESC, category, name;

-- Create indexes for better performance on showcase queries
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON public.vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON public.vehicles(fuel_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_transmission ON public.vehicles(transmission);
CREATE INDEX IF NOT EXISTS idx_vehicles_seats ON public.vehicles(seats);
CREATE INDEX IF NOT EXISTS idx_vehicles_average_rating ON public.vehicles(average_rating);
CREATE INDEX IF NOT EXISTS idx_vehicles_popular ON public.vehicles(popular);
CREATE INDEX IF NOT EXISTS idx_vehicles_price_range ON public.vehicles(all_in_price, unit_only_price);

-- Enable RLS for enhanced security
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (vehicles can be viewed by everyone)
CREATE POLICY "Enable read access for all users" ON public.vehicles
    FOR SELECT USING (true);

-- Policy for admin write access (only authenticated admins can modify)
CREATE POLICY "Enable full access for authenticated admin users" ON public.vehicles
    FOR ALL USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM public.admin_profiles 
            WHERE user_id = auth.uid()
        )
    );

COMMIT;

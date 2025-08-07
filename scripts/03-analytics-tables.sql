-- Create analytics tracking tables
CREATE TABLE IF NOT EXISTS vehicle_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS daily_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_date DATE DEFAULT CURRENT_DATE,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_date)
);

CREATE TABLE IF NOT EXISTS popular_price_ranges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  price_range VARCHAR(50) NOT NULL,
  selection_count INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial price range data
INSERT INTO popular_price_ranges (price_range, selection_count) VALUES
('under-500k', 0),
('500k-1m', 0),
('over-1m', 0)
ON CONFLICT DO NOTHING;

-- Insert initial daily booking data for today
INSERT INTO daily_bookings (booking_date, total_bookings) VALUES
(CURRENT_DATE, 12)
ON CONFLICT (booking_date) DO NOTHING;

-- Enable RLS for new tables
ALTER TABLE vehicle_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE popular_price_ranges ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables
CREATE POLICY "Vehicle views are viewable by admins" ON vehicle_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Vehicle views are insertable by everyone" ON vehicle_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Daily bookings are manageable by admins" ON daily_bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Price ranges are manageable by admins" ON popular_price_ranges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_profiles 
      WHERE admin_profiles.id = auth.uid()
    )
  );

-- Create functions for analytics
CREATE OR REPLACE FUNCTION get_vehicle_analytics()
RETURNS TABLE (
  total_vehicles BIGINT,
  active_vehicles BIGINT,
  most_viewed_vehicle_id UUID,
  most_viewed_vehicle_name TEXT,
  brand_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH vehicle_stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_available = true) as active
    FROM vehicles
  ),
  most_viewed AS (
    SELECT 
      v.id,
      v.name,
      COUNT(vv.id) as view_count
    FROM vehicles v
    LEFT JOIN vehicle_views vv ON v.id = vv.vehicle_id
    WHERE vv.viewed_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY v.id, v.name
    ORDER BY view_count DESC
    LIMIT 1
  ),
  brand_stats AS (
    SELECT 
      jsonb_object_agg(brand, count) as distribution
    FROM (
      SELECT brand, COUNT(*) as count
      FROM vehicles
      WHERE is_available = true
      GROUP BY brand
    ) brand_counts
  )
  SELECT 
    vs.total,
    vs.active,
    mv.id,
    mv.name,
    bs.distribution
  FROM vehicle_stats vs
  CROSS JOIN most_viewed mv
  CROSS JOIN brand_stats bs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

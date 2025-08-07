import { supabase } from "./supabase"

export interface AnalyticsData {
  totalVehicles: number
  activeVehicles: number
  mostViewedVehicle: {
    id: string
    name: string
  } | null
  brandDistribution: Record<string, number>
  dailyBookings: number
  popularPriceRanges: Array<{
    range: string
    count: number
  }>
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    // Get vehicle analytics
    const { data: vehicleAnalytics, error: vehicleError } = await supabase.rpc("get_vehicle_analytics").single()

    if (vehicleError) throw vehicleError

    // Get daily bookings
    const { data: dailyBookingsData, error: bookingsError } = await supabase
      .from("daily_bookings")
      .select("total_bookings")
      .eq("booking_date", new Date().toISOString().split("T")[0])
      .single()

    // Get popular price ranges
    const { data: priceRangesData, error: priceError } = await supabase
      .from("popular_price_ranges")
      .select("*")
      .order("selection_count", { ascending: false })

    return {
      totalVehicles: vehicleAnalytics?.total_vehicles || 0,
      activeVehicles: vehicleAnalytics?.active_vehicles || 0,
      mostViewedVehicle: vehicleAnalytics?.most_viewed_vehicle_id
        ? {
            id: vehicleAnalytics.most_viewed_vehicle_id,
            name: vehicleAnalytics.most_viewed_vehicle_name,
          }
        : null,
      brandDistribution: vehicleAnalytics?.brand_distribution || {},
      dailyBookings: dailyBookingsData?.total_bookings || 0,
      popularPriceRanges:
        priceRangesData?.map((item) => ({
          range: item.price_range,
          count: item.selection_count,
        })) || [],
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      totalVehicles: 0,
      activeVehicles: 0,
      mostViewedVehicle: null,
      brandDistribution: {},
      dailyBookings: 0,
      popularPriceRanges: [],
    }
  }
}

export async function trackVehicleView(vehicleId: string, ipAddress?: string, userAgent?: string) {
  try {
    const { error } = await supabase.from("vehicle_views").insert({
      vehicle_id: vehicleId,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (error) throw error
  } catch (error) {
    console.error("Error tracking vehicle view:", error)
  }
}

export async function updateDailyBookings(date: string, count: number) {
  try {
    const { error } = await supabase.from("daily_bookings").upsert({
      booking_date: date,
      total_bookings: count,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  } catch (error) {
    console.error("Error updating daily bookings:", error)
  }
}

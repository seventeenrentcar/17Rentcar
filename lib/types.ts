export interface Vehicle {
  id: string
  name: string  
  type: string
  brand: string
  features: string[]
  all_in_price: number
  unit_only_price: number
  image_url: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface AdminProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  permissions: Record<string, any>
  is_active: boolean
  last_login: string | null
  login_attempts: number
  locked_until: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  address: string | null
  date_of_birth: string | null
  profile_image_url: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  vehicle_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  customer_address: string | null
  start_date: string
  end_date: string
  pickup_location: string | null
  dropoff_location: string | null
  total_days: number
  price_per_day: number
  total_amount: number
  booking_status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled"
  payment_status: "unpaid" | "partial" | "paid" | "refunded"
  notes: string | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
}

export interface ContentPage {
  id: string
  slug: string
  title: string
  content: string | null
  meta_description: string | null
  is_published: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  admin_profiles?: {
    full_name: string | null
    email: string
  }
}

export interface Testimonial {
  id: string
  customer_name: string
  customer_role: string | null
  content: string
  rating: number
  avatar_url: string | null
  is_featured: boolean
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  target_audience: "all" | "admins" | "users"
  is_read: boolean
  expires_at: string | null
  created_by: string | null
  created_at: string
}

export interface SystemSetting {
  id: string
  setting_key: string
  setting_value: any
  description: string | null
  category: string | null
  is_public: boolean
  updated_by: string | null
  updated_at: string
}

export interface AuditTrail {
  id: string
  table_name: string
  record_id: string
  action: "INSERT" | "UPDATE" | "DELETE"
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  changed_by: string | null
  changed_at: string
  admin_profiles?: {
    full_name: string | null
    email: string
  }
}

export interface AdminSession {
  id: string
  admin_id: string
  session_token: string
  expires_at: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  last_activity: string
}

export interface AdminActivityLog {
  id: string
  admin_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin_profiles: {
    email: string
    full_name: string | null
  }
}

import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServerClient()

    // Check if default admin already exists
    const { data: existingAdmin } = await supabase
      .from("admin_profiles")
      .select("id")
      .eq("email", "admin@17rentcar.com")
      .single()

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: "Default admin already exists",
        email: "admin@17rentcar.com",
      })
    }

    // Create default admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@17rentcar.com",
      password: "admin123456", // You should change this immediately
      email_confirm: true,
      user_metadata: {
        full_name: "Super Admin",
      },
    })

    if (authError) {
      return NextResponse.json({ error: "Failed to create default admin", details: authError.message }, { status: 400 })
    }

    // Create admin profile with full permissions
    const { error: profileError } = await supabase.from("admin_profiles").insert({
      id: authData.user.id,
      email: authData.user.email,
      full_name: "Super Admin",
      role: "super_admin",
      permissions: {
        vehicles: { create: true, read: true, update: true, delete: true },
        bookings: { create: true, read: true, update: true, delete: true },
        analytics: { read: true },
        users: { create: true, read: true, update: true, delete: true },
        settings: { read: true, update: true },
      },
      is_active: true,
    })

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: "Failed to create admin profile", details: profileError.message },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Default admin created successfully",
      email: "admin@17rentcar.com",
      password: "admin123456",
      note: "Please change the password immediately after first login",
    })
  } catch (error) {
    console.error("Error creating default admin:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

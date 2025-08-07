import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // Add security check - only allow this in development or with proper authentication
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 })
  }

  try {
    const { email, password, fullName } = await request.json()

    const supabase = createServerClient()
    
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 503 })
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) throw authError

    // Create admin profile
    const { error: profileError } = await supabase.from("admin_profiles").insert({
      id: authData.user.id,
      email: authData.user.email,
      full_name: fullName,
      role: "admin",
    })

    if (profileError) throw profileError

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      userId: authData.user.id,
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        error: "Failed to create admin user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

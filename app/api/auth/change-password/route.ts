import { NextRequest, NextResponse } from "next/server"
import { supabase, createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json()

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Password saat ini dan password baru diperlukan" },
        { status: 400 }
      )
    }

    // Get the current session
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Token akses tidak valid" },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)

    // Get user from the access token
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Sesi tidak valid. Silakan login ulang." },
        { status: 401 }
      )
    }

    // Verify current password by trying to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (signInError) {
      return NextResponse.json(
        { error: "Password saat ini tidak benar" },
        { status: 400 }
      )
    }

    // Create server client for admin operations
    const serverClient = createServerClient()
    if (!serverClient) {
      return NextResponse.json(
        { error: "Konfigurasi server tidak tersedia" },
        { status: 500 }
      )
    }

    // Update password using the server client
    const { error: updateError } = await serverClient.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error("Password update error:", updateError)
      return NextResponse.json(
        { error: "Gagal mengubah password. Silakan coba lagi." },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: "Password berhasil diubah!" 
    })

  } catch (error) {
    console.error("Change password API error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti." },
      { status: 500 }
    )
  }
}

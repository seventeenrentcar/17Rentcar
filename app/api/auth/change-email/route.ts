import { NextRequest, NextResponse } from "next/server"

export async function POST(_request: NextRequest) {
  // This endpoint is deprecated. Use client-side supabase.auth.updateUser with emailRedirectTo.
  return NextResponse.json(
    {
      error: "Metode ini tidak lagi digunakan. Gunakan supabase.auth.updateUser di klien dengan emailRedirectTo ke /auth/callback.",
    },
    { status: 405 }
  )
}

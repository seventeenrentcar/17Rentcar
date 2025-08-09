import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Simple in-memory rate limiting for forgot password
// In production, you should use Redis or a proper rate limiting service
const attempts = new Map<string, { count: number; lastAttempt: number }>()

const RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

function getRateLimitKey(ip: string, email: string): string {
  return `${ip}:${email.toLowerCase()}`
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const attempt = attempts.get(key)

  if (!attempt) {
    return false
  }

  // Reset if window has passed
  if (now - attempt.lastAttempt > RATE_LIMIT.windowMs) {
    attempts.delete(key)
    return false
  }

  return attempt.count >= RATE_LIMIT.maxAttempts
}

function recordAttempt(key: string): void {
  const now = Date.now()
  const attempt = attempts.get(key)

  if (!attempt || now - attempt.lastAttempt > RATE_LIMIT.windowMs) {
    attempts.set(key, { count: 1, lastAttempt: now })
  } else {
    attempts.set(key, { count: attempt.count + 1, lastAttempt: now })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Silakan berikan alamat email yang valid" },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown"
    
    const rateLimitKey = getRateLimitKey(ip, email)

    // Check rate limiting
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan reset password. Silakan tunggu 15 menit sebelum mencoba lagi." },
        { status: 429 }
      )
    }

    // Record the attempt
    recordAttempt(rateLimitKey)

    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin")}/reset-password`
    })

    if (error) {
      console.error("Password reset error:", error)
      
      // Don't reveal if email exists - return success message regardless
      return NextResponse.json({ 
        message: "Jika email ini terdaftar, Anda akan menerima link reset password dalam waktu singkat." 
      })
    }

    // Success response (same message for security)
    return NextResponse.json({ 
      message: "Jika email ini terdaftar, Anda akan menerima link reset password dalam waktu singkat." 
    })

  } catch (error) {
    console.error("Forgot password API error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti." },
      { status: 500 }
    )
  }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, attempt] of attempts.entries()) {
    if (now - attempt.lastAttempt > RATE_LIMIT.windowMs) {
      attempts.delete(key)
    }
  }
}, RATE_LIMIT.windowMs) // Clean up every 15 minutes

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [attemptCount, setAttemptCount] = useState(0)

  // Rate limiting: max 3 attempts per 15 minutes
  const MAX_ATTEMPTS = 3
  const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate email format
    if (!email.trim()) {
      setError("Silakan masukkan alamat email Anda")
      return
    }

    if (!validateEmail(email)) {
      setError("Silakan masukkan alamat email yang valid")
      return
    }

    setIsLoading(true)

    try {
      // Send request to our API route for better rate limiting
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error || "Terlalu banyak percobaan. Silakan tunggu sebelum mencoba lagi.")
          setAttemptCount(MAX_ATTEMPTS) // Set to max to show rate limit
        } else {
          setError(data.error || "Terjadi kesalahan. Silakan coba lagi.")
        }
        return
      }

      // Success - show confirmation regardless of whether email exists
      setIsSubmitted(true)
      setAttemptCount(prev => prev + 1)

    } catch (err) {
      setError("Kesalahan jaringan. Silakan periksa koneksi Anda dan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  // Reset rate limiting after window expires
  React.useEffect(() => {
    if (attemptCount > 0) {
      const timer = setTimeout(() => {
        setAttemptCount(0)
      }, RATE_LIMIT_WINDOW)

      return () => clearTimeout(timer)
    }
  }, [attemptCount])

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Periksa Email Anda
          </h3>
          <p className="text-gray-600 text-sm">
            Jika akun dengan email <strong>{email}</strong> terdaftar, 
            Anda akan menerima link reset password dalam waktu singkat.
          </p>
        </div>

        <Alert className="bg-red-50 border-red-200">
          <Mail className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Tidak menerima email?</strong>
            <br />
            • Periksa folder spam/junk
            <br />
            • Tunggu beberapa menit untuk pengiriman
            <br />
            • Link akan kedaluwarsa dalam 60 menit
          </AlertDescription>
        </Alert>

        <Button
          onClick={() => {
            setIsSubmitted(false)
            setEmail("")
            setError("")
          }}
          variant="outline"
          className="w-full border-red-200 text-red-700 hover:bg-red-50"
        >
          Kirim Link Reset Lainnya
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Alamat Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email admin Anda"
            className="pl-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
            required
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-gray-500">
          Masukkan alamat email yang terkait dengan akun admin Anda
        </p>
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        disabled={isLoading || !email.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Mengirim Link Reset...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Kirim Link Reset
          </>
        )}
      </Button>

      {attemptCount > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Percobaan: {attemptCount}/{MAX_ATTEMPTS}
          {attemptCount >= MAX_ATTEMPTS && " (Dibatasi)"}
        </p>
      )}
    </motion.form>
  )
}

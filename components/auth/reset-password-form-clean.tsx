"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract access token from URL or session
  useEffect(() => {
    const extractTokens = async () => {
      try {
        // First, let Supabase handle the session automatically
        const { data: session } = await supabase.auth.getSession()
        if (session?.session?.access_token) {
          setAccessToken(session.session.access_token)
          return
        }

        // Check URL parameters for tokens (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && type === 'recovery') {
          setAccessToken(accessToken)
          
          // Set the session with the tokens from URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (sessionError) {
            setError("Link reset tidak valid atau telah kedaluwarsa. Silakan minta link reset baru.")
          }
          return
        }

        // Check for verification code in search params (fallback for PKCE flow)
        const code = searchParams.get('code')
        if (code) {
          const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'recovery'
          })
          
          if (otpError || !otpData?.session?.access_token) {
            setError("Link reset tidak valid atau telah kedaluwarsa. Silakan minta link reset baru.")
            return
          }
          
          setAccessToken(otpData.session.access_token)
          return
        }

        // If no tokens found, this might not be a valid reset link
        setError("Link reset tidak valid atau telah kedaluwarsa. Silakan minta link reset baru.")
      } catch (error) {
        setError("Link reset tidak valid atau telah kedaluwarsa. Silakan minta link reset baru.")
      }
    }

    extractTokens()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session?.access_token) {
        setAccessToken(session.access_token)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("Minimal 8 karakter")
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Satu huruf besar")
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Satu huruf kecil")
    }
    if (!/\d/.test(password)) {
      errors.push("Satu angka")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Satu karakter khusus")
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (!password || !confirmPassword) {
      setError("Silakan isi semua field yang diperlukan")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(`Password harus memiliki: ${passwordErrors.join(", ")}`)
      setIsLoading(false)
      return
    }

    if (!accessToken) {
      setError("Token reset tidak valid. Silakan minta link reset baru.")
      setIsLoading(false)
      return
    }

    try {
      // Update password with the access token
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError("Gagal mengupdate password. Silakan coba lagi.")
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
      
      // Redirect to login after success
      setTimeout(() => {
        router.push("/admin/login?message=Password berhasil diubah. Silakan login dengan password baru.")
      }, 2000)

    } catch (error) {
      setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
      setIsLoading(false)
    }
  }

  const passwordErrors = password ? validatePassword(password) : []

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Password Berhasil Diubah!</h2>
            <p className="text-gray-600 mt-2">
              Password Anda telah berhasil diperbarui. Anda akan diarahkan ke halaman login.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password Baru
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password baru"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="text-xs space-y-1">
              {passwordErrors.length > 0 ? (
                <p className="text-red-600">Password harus memiliki: {passwordErrors.join(", ")}</p>
              ) : (
                <p className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Password memenuhi semua persyaratan
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
            Konfirmasi Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Konfirmasi password baru"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && (
            <div className="text-xs">
              {password === confirmPassword ? (
                <p className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Password cocok
                </p>
              ) : (
                <p className="text-red-600">Password tidak cocok</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading || !accessToken || passwordErrors.length > 0 || password !== confirmPassword}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengubah Password...
          </>
        ) : (
          "Ubah Password"
        )}
      </Button>
    </motion.form>
  )
}

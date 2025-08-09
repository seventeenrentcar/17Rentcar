"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2, Info } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export function ChangeEmailForm() {
  const { admin } = useAdminAuth()
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (!newEmail || !password) {
      setError("Silakan isi semua field yang diperlukan")
      setIsLoading(false)
      return
    }

    if (!validateEmail(newEmail)) {
      setError("Format email tidak valid")
      setIsLoading(false)
      return
    }

    if (newEmail === admin?.email) {
      setError("Email baru harus berbeda dari email saat ini")
      setIsLoading(false)
      return
    }

    try {
      // 1) Re-authenticate with current password (defense-in-depth)
      const currentEmail = admin?.email
      if (!currentEmail) {
        setError("Tidak dapat memuat email saat ini. Coba lagi.")
        setIsLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password,
      })
      if (signInError) {
        setError("Password tidak benar")
        setIsLoading(false)
        return
      }

      // 2) Initiate secure email change with Supabase (double confirm handled by Supabase)
      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error: updateError } = await supabase.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: redirectUrl }
      )

      if (updateError) {
        console.error("Email update error:", updateError)
        const msg = updateError.message || "Gagal mengubah email. Silakan coba lagi."
        if (msg.toLowerCase().includes("already registered")) {
          setError("Email ini sudah terdaftar. Gunakan email lain.")
        } else if (msg.toLowerCase().includes("rate limit")) {
          setError("Terlalu banyak percobaan. Silakan coba beberapa menit lagi.")
        } else if (msg.toLowerCase().includes("reauth") || msg.toLowerCase().includes("recent")) {
          setError("Kami memerlukan verifikasi ulang. Silakan login kembali lalu coba lagi.")
        } else {
          setError(msg)
        }
        setIsLoading(false)
        return
      }

      // Success – Supabase has sent confirmation emails
      setSuccess(
        "Kami telah mengirimkan tautan konfirmasi ke email lama dan email baru Anda. Silakan ikuti instruksi di email untuk menyelesaikan perubahan."
      )
      setNewEmail("")
      setPassword("")
    } catch (err) {
      setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Ubah Email</h3>
        <p className="text-sm text-gray-600">
          Ubah alamat email yang digunakan untuk login ke sistem admin.
        </p>
      </div>

      {/* Current Email Info */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Email Saat Ini</span>
        </div>
        <p className="text-sm text-gray-900">{admin?.email || 'Loading...'}</p>
      </div>

      {/* Important Notice */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Penting:</strong> Perubahan email memerlukan konfirmasi melalui link yang akan dikirim ke email baru.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newEmail" className="text-sm font-medium text-gray-700">
            Email Baru
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="pl-10"
              placeholder="masukkan@email-baru.com"
              disabled={isLoading}
            />
          </div>
          {newEmail && (
            <div className="text-xs">
              {validateEmail(newEmail) ? (
                <p className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Format email valid
                </p>
              ) : (
                <p className="text-red-600">Format email tidak valid</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Password Saat Ini
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password untuk konfirmasi"
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
          <p className="text-xs text-gray-500">
            Konfirmasi dengan password Anda untuk mengubah email
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !validateEmail(newEmail) || !password || newEmail === admin?.email}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengubah Email...
            </>
          ) : (
            "Ubah Email"
          )}
        </Button>
      </form>
    </motion.div>
  )
}

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
    setSuccess("")

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Silakan isi semua field yang diperlukan")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru tidak cocok")
      setIsLoading(false)
      return
    }

    if (currentPassword === newPassword) {
      setError("Password baru harus berbeda dari password saat ini")
      setIsLoading(false)
      return
    }

    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      setError(`Password baru harus memiliki: ${passwordErrors.join(", ")}`)
      setIsLoading(false)
      return
    }

    try {
      // Get current session for access token
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        setError("Sesi tidak valid. Silakan login ulang.")
        setIsLoading(false)
        return
      }

      // Call our change password API
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Gagal mengubah password. Silakan coba lagi.")
        setIsLoading(false)
        return
      }

      setSuccess(data.message || "Password berhasil diubah!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

    } catch (error) {
      setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
      setIsLoading(false)
    } finally {
      setIsLoading(false)
    }
  }

  const newPasswordErrors = newPassword ? validatePassword(newPassword) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Ubah Password</h3>
        <p className="text-sm text-gray-600">
          Gunakan password yang kuat untuk menjaga keamanan akun admin Anda.
        </p>
      </div>

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
          <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
            Password Saat Ini
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password saat ini"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
            Password Baru
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-10"
              placeholder="Masukkan password baru"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword && (
            <div className="text-xs space-y-1">
              {newPasswordErrors.length > 0 ? (
                <p className="text-red-600">Password harus memiliki: {newPasswordErrors.join(", ")}</p>
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
            Konfirmasi Password Baru
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
              {newPassword === confirmPassword ? (
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

        <Button
          type="submit"
          disabled={isLoading || newPasswordErrors.length > 0 || newPassword !== confirmPassword || !currentPassword}
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
      </form>
    </motion.div>
  )
}

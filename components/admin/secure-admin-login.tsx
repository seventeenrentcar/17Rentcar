"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react"
import Link from "next/link"

export function SecureAdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()
  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [isAuthenticated, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (!result.success) {
        setError(result.error || "Login gagal. Silakan coba lagi.")
      } else {
        // Redirect to dashboard on successful login
        router.push("/admin/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto h-16 w-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mb-6"
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>

          <Link href="/" className="inline-block mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              17rentcar
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h2>
          <p className="text-gray-600">Masuk untuk mengakses dashboard admin</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center text-xl">Masuk Sebagai Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Admin
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@17rentcar.com"
                      className="pl-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  "Masuk Admin"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Akses Terbatas</span>
            </div>
            <p className="text-xs text-yellow-700">
              Halaman ini hanya untuk administrator yang berwenang. Semua aktivitas login akan dicatat untuk keamanan.
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors">
            ← Kembali ke Beranda
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

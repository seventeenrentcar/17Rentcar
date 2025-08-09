"use client"

import React, { useEffect, useState } from "react"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRound, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          <span className="text-gray-600">Memuat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
            </div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                17rentcar
              </span>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Buat Password Baru
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Masukkan password baru Anda untuk menyelesaikan proses reset.
            </p>
          </CardHeader>
          <CardContent>
            <ResetPasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

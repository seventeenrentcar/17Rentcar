"use client"

import React from "react"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">17</span>
              </div>
            </div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                17rentcar
              </span>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset Password
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Masukkan alamat email Anda dan kami akan mengirimkan link untuk mereset password.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ForgotPasswordForm />
            
            <div className="text-center">
              <Link 
                href="/admin/login" 
                className="inline-flex items-center text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

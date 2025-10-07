"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Lock, Mail, User, Shield } from "lucide-react"
import { ChangePasswordForm } from "./account/change-password-form"
import { ChangeEmailForm } from "./account/change-email-form"
import { useAdminAuth } from "@/hooks/use-admin-auth"

export function AccountManagement() {
  const { admin } = useAdminAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Settings className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kelola Akun</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Ubah password dan email admin</p>
        </div>
      </div>

      {/* Account Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="p-2 bg-red-100 rounded-full">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Super Admin</div>
                  <div className="text-sm text-gray-600">{admin?.email || 'Loading...'}</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <strong>Catatan:</strong> Anda adalah super admin dengan akses penuh ke sistem. 
                Pastikan untuk menggunakan password yang kuat dan email yang aman.
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Management Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Ubah Password
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Ubah Email
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="password" className="mt-6">
                <ChangePasswordForm />
              </TabsContent>
              
              <TabsContent value="email" className="mt-6">
                <ChangeEmailForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

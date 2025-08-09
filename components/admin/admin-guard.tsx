"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { SecureAdminLogin } from "./secure-admin-login"

interface AdminGuardProps {
  children: React.ReactNode
  requiredPermission?: string
  requiredRole?: string
}

export function AdminGuard({ children, requiredPermission, requiredRole }: AdminGuardProps) {
  const { admin, loading, checkPermission, hasRole, isAuthenticated } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we're sure loading is complete and have had enough time
    if (loading) return

    // Add a small delay to prevent premature redirects during tab switches
    const redirectTimer = setTimeout(() => {
      if (!isAuthenticated || !admin) {
        // Don't redirect immediately, let the component show login
        return
      }

      if (admin && requiredRole && !hasRole(requiredRole)) {
        router.push("/admin/unauthorized")
        return
      }

      if (admin && requiredPermission && !checkPermission(requiredPermission)) {
        router.push("/admin/unauthorized")
        return
      }
    }, 500) // Small delay to prevent premature redirects

    return () => clearTimeout(redirectTimer)
  }, [admin, loading, requiredPermission, requiredRole, checkPermission, hasRole, router, isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses admin...</p>
          <p className="text-xs text-gray-400 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !admin) {
    return <SecureAdminLogin />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Anda tidak memiliki role yang diperlukan untuk mengakses halaman ini.</p>
          <p className="text-sm text-gray-500">Role yang diperlukan: {requiredRole}</p>
        </div>
      </div>
    )
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini.</p>
          <p className="text-sm text-gray-500">Izin yang diperlukan: {requiredPermission}</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

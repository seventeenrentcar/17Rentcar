"use client"

import { useAdminAuth } from "@/hooks/use-admin-auth"
import { SecureAdminLogin } from "@/components/admin/secure-admin-login"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function AdminRedirect() {
  const { isAuthenticated, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <SecureAdminLogin />
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  )
}

export default function AdminPage() {
  return <AdminRedirect />
}

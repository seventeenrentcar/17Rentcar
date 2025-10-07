"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AccountManagement } from "@/components/admin/account-management"

export default function AdminAccountPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AccountManagement />
      </AdminLayout>
    </AdminGuard>
  )
}

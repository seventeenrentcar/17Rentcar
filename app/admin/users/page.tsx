"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UserManagementPage } from "@/components/admin/users/user-management-page"

export default function AdminUsersPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <UserManagementPage />
      </AdminLayout>
    </AdminGuard>
  )
}

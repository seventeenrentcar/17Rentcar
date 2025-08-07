"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard"

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AnalyticsDashboard />
      </AdminLayout>
    </AdminGuard>
  )
}

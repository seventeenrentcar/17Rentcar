"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { VehicleManagementPage } from "@/components/admin/vehicles/vehicle-management-page"

export default function AdminVehiclesPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <VehicleManagementPage />
      </AdminLayout>
    </AdminGuard>
  )
}

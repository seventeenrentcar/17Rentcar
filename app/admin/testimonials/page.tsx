"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminTestimonialsPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
              <p className="text-gray-600 mt-2">Kelola testimoni dan ulasan pelanggan</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-600">Testimonials management functionality will be implemented here.</p>
            <p className="text-sm text-gray-500 mt-2">
              Features will include:
              <br />• Add/Edit/Delete testimonials
              <br />• Customer rating management
              <br />• Moderation system
              <br />• Featured testimonials
            </p>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}

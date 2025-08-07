"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function AdminContentPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
              <p className="text-gray-600 mt-2">Kelola konten website dan halaman statis</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-600">Content management functionality will be implemented here.</p>
            <p className="text-sm text-gray-500 mt-2">
              Features will include:
              <br />• Page content editor
              <br />• SEO management
              <br />• Media library
              <br />• Static page management
            </p>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}

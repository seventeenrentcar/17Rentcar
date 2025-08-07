"use client"

import { AdminGuard } from "@/components/admin/admin-guard"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ContactManagementContent } from "@/components/admin/contact/contact-management-content"

export default function ContactManagementPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <ContactManagementContent />
      </AdminLayout>
    </AdminGuard>
  )
}

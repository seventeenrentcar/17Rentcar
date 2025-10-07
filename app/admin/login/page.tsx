"use client"

import { SecureAdminLogin } from "@/components/admin/secure-admin-login"
export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store";
export default function AdminLoginPage() {
  return <SecureAdminLogin />
}

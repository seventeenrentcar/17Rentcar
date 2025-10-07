"use client";

import { Suspense } from "react";
import { SecureAdminLogin } from "@/components/admin/secure-admin-login";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div>Loading admin login...</div>}>
      <SecureAdminLogin />
    </Suspense>
  );
}

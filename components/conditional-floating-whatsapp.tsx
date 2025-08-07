"use client"

import { usePathname } from "next/navigation"
import { FloatingWhatsApp } from "./floating-whatsapp"

export function ConditionalFloatingWhatsApp() {
  const pathname = usePathname()
  
  // Don't show WhatsApp button on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return <FloatingWhatsApp />
}

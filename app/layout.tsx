import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { ConditionalFloatingWhatsApp } from "@/components/conditional-floating-whatsapp"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "17rentcar - Sewa Mobil Terpercaya di Bandung",
  description:
    "Layanan sewa mobil terpercaya di Bandung dengan harga terjangkau. Berbagai pilihan mobil untuk kebutuhan perjalanan Anda.",
  authors: [{ name: "17rentcar" }],
  keywords: [
    "sewa mobil",
    "rental mobil",
    "bandung",
    "transportasi",
    "travel",
    "17rentcar",
  ],
  creator: "17rentcar",
  icons: {
    icon: "/Logo17.png",
    shortcut: "/Logo17.png",
    apple: "/Logo17.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111111" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body className={`${inter.className} min-h-screen antialiased overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
        <ConditionalFloatingWhatsApp />
        <Analytics />
      </body>
    </html>
  )
}

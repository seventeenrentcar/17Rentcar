"use client"


import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"; 
export const fetchCache = "force-no-store";

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Memverifikasi...")

  useEffect(() => {
    const url = new URL(window.location.href)
    const search = url.searchParams
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""))

    const type = search.get("type") || hashParams.get("type")
    const tokenHash = search.get("token_hash") || hashParams.get("token_hash") || hashParams.get("token") || undefined
    const err = search.get("error") || search.get("error_description") || hashParams.get("error") || hashParams.get("error_description")
    const msg = hashParams.get("message")

    ;(async () => {
      if (err) {
        setStatus("error")
        setMessage(err)
        return
      }

      // If Supabase returned a message in the hash, handle common messages
      if (msg) {
        // First step of double-confirm flow
        if (msg.toLowerCase().includes("confirmation link accepted") && msg.toLowerCase().includes("please proceed")) {
          setStatus("success")
          setMessage("Langkah pertama berhasil! Silakan cek email baru Anda dan klik tautan konfirmasi untuk menyelesaikan perubahan.")
          return
        }
        // Sometimes the final step also uses this message, check session to confirm
      }

      if (type === "email_change") {
        try {
          // Give Supabase time to finalize
          await new Promise((r) => setTimeout(r, 500))

          // Optional fallback if token_hash is present
          if (tokenHash) {
            try {
              await supabase.auth.verifyOtp({ type: "email_change", token_hash: tokenHash })
            } catch (_) {
              // ignore fallback failures
            }
          }

          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            setStatus("success")
            setMessage("Email berhasil diperbarui. Mengarahkan...")
            setTimeout(() => router.replace("/admin/account"), 1200)
            return
          }

          // If no user but we had a message, show it
          if (msg) {
            setStatus("success")
            setMessage(msg)
            return
          }

          setStatus("error")
          setMessage("Gagal memverifikasi perubahan email. Tautan mungkin sudah kadaluarsa.")
        } catch {
          setStatus("error")
          setMessage("Terjadi kesalahan saat memverifikasi. Coba lagi.")
        }
        return
      }

      // If we get here with only a message (no type), try to detect success via session
      if (msg) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setStatus("success")
          setMessage("Email berhasil diperbarui. Mengarahkan...")
          setTimeout(() => router.replace("/admin/account"), 1200)
          return
        }
        // Otherwise, show the message verbatim
        setStatus("success")
        setMessage(msg)
        return
      }

      setStatus("error")
      setMessage("Tautan tidak valid.")
    })()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Loader2 className="h-5 w-5 animate-spin text-red-600" />
            <span>{message}</span>
          </div>
        )}
        {status === "success" && (
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span>{message}</span>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-center justify-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  )
}

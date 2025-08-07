"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Upload, Trash2, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

interface AppSettings {
  id: string
  company_name: string
  company_email: string
  company_phone: string
  company_address: string
  company_description: string
  logo_url: string | null
  hero_title: string
  hero_subtitle: string
  hero_background_url: string | null
  booking_whatsapp: string
  booking_email: string
  social_facebook: string | null
  social_instagram: string | null
  social_twitter: string | null
  maintenance_mode: boolean
  updated_at: string
}

export function SettingsManagementPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          company_name: "17rentcar",
          company_email: "info@17rentcar.com",
          company_phone: "+62 123 456 7890",
          company_address: "Bandung, Jawa Barat",
          company_description: "Layanan sewa mobil terpercaya di Bandung",
          logo_url: null,
          hero_title: "Sewa Mobil Terpercaya di Bandung",
          hero_subtitle: "Nikmati perjalanan Anda dengan layanan rental mobil terbaik",
          hero_background_url: null,
          booking_whatsapp: "+62 123 456 7890",
          booking_email: "booking@17rentcar.com",
          social_facebook: null,
          social_instagram: null,
          social_twitter: null,
          maintenance_mode: false,
        }
        
        const { data: newSettings, error: insertError } = await supabase
          .from("app_settings")
          .insert([defaultSettings])
          .select()
          .single()

        if (insertError) throw insertError
        setSettings(newSettings)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from("app_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", settings.id)

      if (error) throw error

      alert("Pengaturan berhasil disimpan!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Gagal menyimpan pengaturan")
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (field: keyof AppSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Gagal memuat pengaturan</p>
        <Button onClick={fetchSettings} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan Aplikasi</h1>
          <p className="text-gray-600 mt-2">Kelola pengaturan dan konfigurasi website</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Umum</TabsTrigger>
              <TabsTrigger value="hero">Beranda</TabsTrigger>
              <TabsTrigger value="contact">Kontak</TabsTrigger>
              <TabsTrigger value="system">Sistem</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informasi Perusahaan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nama Perusahaan</Label>
                    <Input
                      id="company_name"
                      value={settings.company_name}
                      onChange={(e) => updateSettings("company_name", e.target.value)}
                      placeholder="Nama perusahaan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_email">Email Perusahaan</Label>
                    <Input
                      id="company_email"
                      type="email"
                      value={settings.company_email}
                      onChange={(e) => updateSettings("company_email", e.target.value)}
                      placeholder="info@perusahaan.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_phone">Telepon Perusahaan</Label>
                    <Input
                      id="company_phone"
                      value={settings.company_phone}
                      onChange={(e) => updateSettings("company_phone", e.target.value)}
                      placeholder="+62 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo_url">URL Logo</Label>
                    <Input
                      id="logo_url"
                      value={settings.logo_url || ""}
                      onChange={(e) => updateSettings("logo_url", e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="company_address">Alamat Perusahaan</Label>
                  <Textarea
                    id="company_address"
                    value={settings.company_address}
                    onChange={(e) => updateSettings("company_address", e.target.value)}
                    placeholder="Alamat lengkap perusahaan"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="company_description">Deskripsi Perusahaan</Label>
                  <Textarea
                    id="company_description"
                    value={settings.company_description}
                    onChange={(e) => updateSettings("company_description", e.target.value)}
                    placeholder="Deskripsi singkat tentang perusahaan"
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Hero Settings */}
            <TabsContent value="hero" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Pengaturan Beranda</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="hero_title">Judul Utama</Label>
                    <Input
                      id="hero_title"
                      value={settings.hero_title}
                      onChange={(e) => updateSettings("hero_title", e.target.value)}
                      placeholder="Judul utama di beranda"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_subtitle">Subjudul</Label>
                    <Textarea
                      id="hero_subtitle"
                      value={settings.hero_subtitle}
                      onChange={(e) => updateSettings("hero_subtitle", e.target.value)}
                      placeholder="Subjudul atau deskripsi di beranda"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_background_url">URL Background Hero</Label>
                    <Input
                      id="hero_background_url"
                      value={settings.hero_background_url || ""}
                      onChange={(e) => updateSettings("hero_background_url", e.target.value)}
                      placeholder="https://example.com/hero-bg.jpg"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Contact Settings */}
            <TabsContent value="contact" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informasi Kontak & Booking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="booking_whatsapp">WhatsApp Booking</Label>
                    <Input
                      id="booking_whatsapp"
                      value={settings.booking_whatsapp}
                      onChange={(e) => updateSettings("booking_whatsapp", e.target.value)}
                      placeholder="+62 123 456 7890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="booking_email">Email Booking</Label>
                    <Input
                      id="booking_email"
                      type="email"
                      value={settings.booking_email}
                      onChange={(e) => updateSettings("booking_email", e.target.value)}
                      placeholder="booking@perusahaan.com"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Media Sosial</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="social_facebook">Facebook</Label>
                    <Input
                      id="social_facebook"
                      value={settings.social_facebook || ""}
                      onChange={(e) => updateSettings("social_facebook", e.target.value)}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="social_instagram">Instagram</Label>
                    <Input
                      id="social_instagram"
                      value={settings.social_instagram || ""}
                      onChange={(e) => updateSettings("social_instagram", e.target.value)}
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="social_twitter">Twitter</Label>
                    <Input
                      id="social_twitter"
                      value={settings.social_twitter || ""}
                      onChange={(e) => updateSettings("social_twitter", e.target.value)}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* System Settings */}
            <TabsContent value="system" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Pengaturan Sistem</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Mode Maintenance</h4>
                      <p className="text-sm text-gray-600">
                        Aktifkan untuk menonaktifkan sementara website untuk umum
                      </p>
                    </div>
                    <Switch
                      checked={settings.maintenance_mode}
                      onCheckedChange={(checked) => updateSettings("maintenance_mode", checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Cache & Performa</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Clear Cache</h4>
                      <p className="text-sm text-gray-600">
                        Hapus cache untuk memperbarui konten
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}

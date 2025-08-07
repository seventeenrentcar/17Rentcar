"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface ContactInfo {
  id?: string
  phone: string
  email: string
  whatsapp?: string
  updated_at?: string
}

export function ContactManagementContent() {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: "",
    email: "",
    whatsapp: ""
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Fetch current contact information
  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }

      if (data) {
        setContactInfo(data)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
      toast({
        title: "Error",
        description: "Gagal memuat informasi kontak",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveContactInfo = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('contact_settings')
        .upsert({
          id: contactInfo.id || 1, // Use existing ID or default to 1
          phone: contactInfo.phone,
          email: contactInfo.email,
          whatsapp: contactInfo.whatsapp,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setContactInfo(data)
      toast({
        title: "Berhasil",
        description: "Informasi kontak berhasil disimpan",
      })
    } catch (error) {
      console.error('Error saving contact info:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan informasi kontak",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat informasi kontak...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kontak</h1>
        <p className="text-gray-600 mt-1">Kelola informasi kontak yang ditampilkan di website</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informasi Kontak
          </CardTitle>
          <CardDescription>
            Update nomor telepon dan email yang akan ditampilkan di website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Nomor Telepon
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08123456789"
                  value={contactInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                Format: 08123456789 (tanpa tanda +62)
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="info@17rentcar.com"
                  value={contactInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="08123456789"
                  value={contactInfo.whatsapp || ""}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                Nomor WhatsApp untuk tombol floating chat
              </p>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Informasi</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Nomor telepon dan email akan ditampilkan di halaman kontak</li>
                    <li>Nomor WhatsApp akan digunakan untuk seluruh tombol yang mengarah ke WhatsApp</li>
                    <li>Pastikan semua informasi sudah benar sebelum menyimpan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={saveContactInfo} 
              disabled={saving || !contactInfo.phone || !contactInfo.email}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {(contactInfo.phone || contactInfo.email) && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Contoh informasi kontak akan tampil di website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contactInfo.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{contactInfo.phone}</span>
                </div>
              )}
              {contactInfo.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{contactInfo.email}</span>
                </div>
              )}
              {contactInfo.whatsapp && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span className="text-sm">WhatsApp: {contactInfo.whatsapp}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

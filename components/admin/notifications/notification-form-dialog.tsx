"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Notification } from "@/lib/types"

interface NotificationFormDialogProps {
  notification?: Notification | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onSubmit: (data: Partial<Notification>) => Promise<{ success: boolean; error?: string }>
}

export function NotificationFormDialog({
  notification,
  open,
  onOpenChange,
  onSuccess,
  onSubmit
}: NotificationFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
    target_audience: "all" as "all" | "admins" | "users",
    expires_at: ""
  })

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        target_audience: notification.target_audience,
        expires_at: notification.expires_at ? notification.expires_at.split('T')[0] : ""
      })
    } else {
      setFormData({
        title: "",
        message: "",
        type: "info",
        target_audience: "all",
        expires_at: ""
      })
    }
    setError("")
  }, [notification, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const submitData: Partial<Notification> = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target_audience: formData.target_audience,
        expires_at: formData.expires_at || null
      }

      const result = await onSubmit(submitData)
      
      if (result.success) {
        onSuccess()
        onOpenChange(false)
      } else {
        setError(result.error || "Terjadi kesalahan")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {notification ? "Edit Notifikasi" : "Tambah Notifikasi Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                placeholder="Masukkan judul notifikasi"
                required
              />
            </div>

            {/* Type */}
            <div>
              <Label htmlFor="type">Tipe Notifikasi *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: any) => setFormData(prev => ({...prev, type: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Sukses</SelectItem>
                  <SelectItem value="warning">Peringatan</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience */}
            <div>
              <Label htmlFor="target_audience">Target *</Label>
              <Select 
                value={formData.target_audience} 
                onValueChange={(value: any) => setFormData(prev => ({...prev, target_audience: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Pengguna</SelectItem>
                  <SelectItem value="admins">Hanya Admin</SelectItem>
                  <SelectItem value="users">Hanya User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expires At */}
            <div className="md:col-span-2">
              <Label htmlFor="expires_at">Tanggal Kedaluwarsa</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) => setFormData(prev => ({...prev, expires_at: e.target.value}))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Kosongkan jika notifikasi tidak memiliki batas waktu
              </p>
            </div>

            {/* Message */}
            <div className="md:col-span-2">
              <Label htmlFor="message">Pesan *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
                placeholder="Masukkan isi pesan notifikasi..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
            <div className="bg-white border rounded p-3">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  formData.type === 'info' ? 'bg-blue-500' :
                  formData.type === 'success' ? 'bg-green-500' :
                  formData.type === 'warning' ? 'bg-yellow-500' :
                  formData.type === 'error' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {formData.title || "Judul Notifikasi"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.message || "Isi pesan notifikasi"}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      formData.type === 'info' ? 'bg-blue-100 text-blue-800' :
                      formData.type === 'success' ? 'bg-green-100 text-green-800' :
                      formData.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      formData.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.type === 'info' ? 'Info' :
                       formData.type === 'success' ? 'Sukses' :
                       formData.type === 'warning' ? 'Peringatan' :
                       formData.type === 'error' ? 'Error' : formData.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      Target: {
                        formData.target_audience === 'all' ? 'Semua' :
                        formData.target_audience === 'admins' ? 'Admin' :
                        formData.target_audience === 'users' ? 'User' : formData.target_audience
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : notification ? "Update" : "Kirim Notifikasi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

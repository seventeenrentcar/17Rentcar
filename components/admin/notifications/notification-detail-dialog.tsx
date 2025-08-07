"use client"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Notification } from "@/lib/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { 
  Info, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Clock,
  Users,
  Calendar
} from "lucide-react"

interface NotificationDetailDialogProps {
  notification: Notification | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />
    default:
      return <Info className="h-5 w-5 text-gray-500" />
  }
}

const getTypeBadge = (type: string) => {
  switch (type) {
    case 'info':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Info</Badge>
    case 'success':
      return <Badge variant="outline" className="text-green-600 border-green-600">Sukses</Badge>
    case 'warning':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Peringatan</Badge>
    case 'error':
      return <Badge variant="outline" className="text-red-600 border-red-600">Error</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

const getAudienceBadge = (audience: string) => {
  switch (audience) {
    case 'all':
      return <Badge variant="secondary">Semua Pengguna</Badge>
    case 'admins':
      return <Badge variant="outline" className="text-purple-600 border-purple-600">Admin</Badge>
    case 'users':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">User</Badge>
    default:
      return <Badge variant="outline">{audience}</Badge>
  }
}

const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id })
  } catch {
    return dateString
  }
}

const isExpired = (expiresAt: string | null) => {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

export function NotificationDetailDialog({ notification, open, onOpenChange }: NotificationDetailDialogProps) {
  if (!notification) return null

  const expired = isExpired(notification.expires_at)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(notification.type)}
            Detail Notifikasi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{notification.title}</span>
                <div className="flex items-center gap-2">
                  {getTypeBadge(notification.type)}
                  {notification.is_read && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Dibaca
                    </Badge>
                  )}
                  {expired && (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Kedaluwarsa
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {notification.message}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Audience */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Target Audiens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getAudienceBadge(notification.target_audience)}
                <p className="text-xs text-gray-500 mt-2">
                  {notification.target_audience === 'all' ? 'Semua pengguna sistem' :
                   notification.target_audience === 'admins' ? 'Hanya administrator' :
                   notification.target_audience === 'users' ? 'Hanya pengguna biasa' :
                   'Target tidak dikenal'}
                </p>
              </CardContent>
            </Card>

            {/* Type */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  {getTypeIcon(notification.type)}
                  Tipe Notifikasi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getTypeBadge(notification.type)}
                <p className="text-xs text-gray-500 mt-2">
                  {notification.type === 'info' ? 'Informasi umum' :
                   notification.type === 'success' ? 'Notifikasi sukses' :
                   notification.type === 'warning' ? 'Peringatan penting' :
                   notification.type === 'error' ? 'Notifikasi error' :
                   'Tipe tidak dikenal'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informasi Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Tanggal Dibuat
                  </span>
                  <div className="font-medium">{formatDateTime(notification.created_at)}</div>
                </div>
                
                {notification.expires_at && (
                  <div>
                    <span className="text-gray-600 text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tanggal Kedaluwarsa
                    </span>
                    <div className={`font-medium ${expired ? 'text-red-600' : ''}`}>
                      {formatDateTime(notification.expires_at)}
                      {expired && (
                        <span className="text-xs text-red-600 block">
                          Notifikasi ini sudah kedaluwarsa
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {!notification.expires_at && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    Notifikasi ini tidak memiliki tanggal kedaluwarsa dan akan tetap aktif.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Status & Informasi Tambahan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Status Baca:</span>
                <div className="flex items-center gap-2">
                  {notification.is_read ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Sudah dibaca</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-600">Belum dibaca</span>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">ID Notifikasi:</span>
                <span className="text-sm font-mono text-gray-800">
                  {notification.id.slice(-8).toUpperCase()}
                </span>
              </div>

              {notification.created_by && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Dibuat oleh:</span>
                    <span className="text-sm text-gray-800">
                      Admin ID: {notification.created_by.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

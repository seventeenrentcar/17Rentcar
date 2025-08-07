"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Check, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react"
import type { Notification } from "@/lib/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface NotificationsDataTableProps {
  notifications: Notification[]
  onEdit: (notification: Notification) => void
  onDelete: (id: string) => void
  onView: (notification: Notification) => void
  onMarkAsRead: (id: string) => void
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
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
      return <Badge variant="secondary">Semua</Badge>
    case 'admins':
      return <Badge variant="outline" className="text-purple-600 border-purple-600">Admin</Badge>
    case 'users':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">User</Badge>
    default:
      return <Badge variant="outline">{audience}</Badge>
  }
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: id })
  } catch {
    return dateString
  }
}

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function NotificationsDataTable({ 
  notifications, 
  onEdit, 
  onDelete, 
  onView, 
  onMarkAsRead 
}: NotificationsDataTableProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleMarkAsRead = async (id: string) => {
    setLoadingAction(id)
    try {
      await onMarkAsRead(id)
    } finally {
      setLoadingAction(null)
    }
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Status</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Pesan</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Tanggal Dibuat</TableHead>
            <TableHead>Kedaluwarsa</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Belum ada notifikasi
              </TableCell>
            </TableRow>
          ) : (
            notifications.map((notification) => (
              <TableRow 
                key={notification.id}
                className={`${notification.is_read ? 'opacity-60' : ''} ${isExpired(notification.expires_at) ? 'bg-gray-50' : ''}`}
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    {notification.is_read ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(notification.type)}
                    <div>
                      <div className="font-medium">{notification.title}</div>
                      {isExpired(notification.expires_at) && (
                        <div className="text-xs text-red-500">Kedaluwarsa</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-sm text-gray-600">
                      {truncateText(notification.message)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(notification.type)}</TableCell>
                <TableCell>{getAudienceBadge(notification.target_audience)}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(notification.created_at)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {notification.expires_at ? (
                    <span className={isExpired(notification.expires_at) ? 'text-red-500' : ''}>
                      {formatDate(notification.expires_at)}
                    </span>
                  ) : (
                    <span className="text-gray-400">Tidak ada</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        disabled={loadingAction === notification.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(notification)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(notification)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      
                      {!notification.is_read && (
                        <DropdownMenuItem 
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Tandai Dibaca
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem 
                        onClick={() => onDelete(notification.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NotificationsDataTable } from "@/components/admin/tables/notifications-data-table"
import { NotificationFormDialog } from "./notification-form-dialog"
import { NotificationDetailDialog } from "./notification-detail-dialog"
import { 
  Plus, 
  Search, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Trash2,
  RefreshCw
} from "lucide-react"
import { motion } from "framer-motion"
import type { Notification } from "@/lib/types"

export function NotificationsManagementPage() {
  const { 
    notifications, 
    loading, 
    error, 
    createNotification, 
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    deleteExpired,
    refetch 
  } = useNotifications()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || notification.type === filterType
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "read" && notification.is_read) ||
      (filterStatus === "unread" && !notification.is_read) ||
      (filterStatus === "expired" && notification.expires_at && new Date(notification.expires_at) < new Date())

    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    info: notifications.filter(n => n.type === 'info').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    error: notifications.filter(n => n.type === 'error').length,
    success: notifications.filter(n => n.type === 'success').length,
    expired: notifications.filter(n => n.expires_at && new Date(n.expires_at) < new Date()).length
  }

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsFormOpen(true)
  }

  const handleView = (notification: Notification) => {
    setSelectedNotification(notification)
    setIsDetailOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")) {
      const result = await deleteNotification(id)
      if (!result.success) {
        alert(result.error)
      }
    }
  }

  const handleMarkAsRead = async (id: string) => {
    const result = await markAsRead(id)
    if (!result.success) {
      alert(result.error)
    }
  }

  const handleMarkAllAsRead = async () => {
    const result = await markAllAsRead()
    if (!result.success) {
      alert(result.error)
    }
  }

  const handleDeleteExpired = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua notifikasi yang sudah kedaluwarsa?")) {
      const result = await deleteExpired()
      if (!result.success) {
        alert(result.error)
      }
    }
  }

  const handleFormSuccess = () => {
    refetch()
  }

  const handleFormSubmit = async (data: Partial<Notification>) => {
    if (selectedNotification) {
      return await updateNotification(selectedNotification.id, data)
    } else {
      return await createNotification(data)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Notifikasi</h1>
          <p className="text-gray-600">Kelola notifikasi sistem dan komunikasi dengan pengguna</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
          <Button 
            variant="outline"
            onClick={handleDeleteExpired}
            disabled={stats.expired === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus Kedaluwarsa
          </Button>
          <Button onClick={() => {
            setSelectedNotification(null)
            setIsFormOpen(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Notifikasi
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Dibaca</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Info</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.info}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peringatan</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error</CardTitle>
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kedaluwarsa</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-sm border"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari notifikasi berdasarkan judul atau pesan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {/* Type Filters */}
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              size="sm"
            >
              Semua Tipe
            </Button>
            <Button
              variant={filterType === "info" ? "default" : "outline"}
              onClick={() => setFilterType("info")}
              size="sm"
            >
              Info ({stats.info})
            </Button>
            <Button
              variant={filterType === "warning" ? "default" : "outline"}
              onClick={() => setFilterType("warning")}
              size="sm"
            >
              Peringatan ({stats.warning})
            </Button>
            <Button
              variant={filterType === "error" ? "default" : "outline"}
              onClick={() => setFilterType("error")}
              size="sm"
            >
              Error ({stats.error})
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Status Filters */}
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              Semua Status
            </Button>
            <Button
              variant={filterStatus === "unread" ? "default" : "outline"}
              onClick={() => setFilterStatus("unread")}
              size="sm"
            >
              Belum Dibaca ({stats.unread})
            </Button>
            <Button
              variant={filterStatus === "read" ? "default" : "outline"}
              onClick={() => setFilterStatus("read")}
              size="sm"
            >
              Sudah Dibaca
            </Button>
            <Button
              variant={filterStatus === "expired" ? "default" : "outline"}
              onClick={() => setFilterStatus("expired")}
              size="sm"
            >
              Kedaluwarsa ({stats.expired})
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Notifications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <NotificationsDataTable
          notifications={filteredNotifications}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onMarkAsRead={handleMarkAsRead}
        />
      </motion.div>

      {/* Form Dialog */}
      <NotificationFormDialog
        notification={selectedNotification}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
        onSubmit={handleFormSubmit}
      />

      {/* Detail Dialog */}
      <NotificationDetailDialog
        notification={selectedNotification}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}

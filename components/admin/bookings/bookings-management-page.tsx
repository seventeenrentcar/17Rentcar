"use client"

import { useState } from "react"
import { useBookings } from "@/hooks/use-bookings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookingsDataTable } from "@/components/admin/tables/bookings-data-table"
import { BookingFormDialog } from "./booking-form-dialog"
import { BookingDetailDialog } from "./booking-detail-dialog"
import { Plus, Search, Calendar, DollarSign, Users, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import type { Booking } from "@/lib/types"

export function BookingsManagementPage() {
  const { 
    bookings, 
    loading, 
    error, 
    updateBookingStatus, 
    deleteBooking, 
    createBooking, 
    updateBooking,
    refetch 
  } = useBookings()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone.includes(searchTerm) ||
      booking.vehicle?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || booking.booking_status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'pending').length,
    confirmed: bookings.filter(b => b.booking_status === 'confirmed').length,
    ongoing: bookings.filter(b => b.booking_status === 'ongoing').length,
    completed: bookings.filter(b => b.booking_status === 'completed').length,
    revenue: bookings
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.total_amount, 0)
  }

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsFormOpen(true)
  }

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus booking ini?")) {
      const result = await deleteBooking(id)
      if (!result.success) {
        alert(result.error)
      }
    }
  }

  const handleFormSuccess = () => {
    refetch()
  }

  const handleFormSubmit = async (data: Partial<Booking>) => {
    if (selectedBooking) {
      return await updateBooking(selectedBooking.id, data)
    } else {
      return await createBooking(data)
    }
  }

  const handleStatusUpdate = async (id: string, booking_status: string, payment_status?: string) => {
    const result = await updateBookingStatus(id, booking_status, payment_status)
    if (!result.success) {
      alert(result.error)
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Booking</h1>
          <p className="text-gray-600">Kelola semua booking dan pesanan kendaraan</p>
        </div>
        <Button onClick={() => {
          setSelectedBooking(null)
          setIsFormOpen(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Booking
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pending} menunggu konfirmasi
              </p>
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
              <CardTitle className="text-sm font-medium">Sedang Aktif</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ongoing}</div>
              <p className="text-xs text-muted-foreground">
                {stats.confirmed} terkonfirmasi
              </p>
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
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                Booking yang telah selesai
              </p>
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
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {stats.revenue.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-muted-foreground">
                Dari booking yang sudah lunas
              </p>
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari booking berdasarkan nama, telepon, email, atau kendaraan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              Semua ({stats.total})
            </Button>
            <Button
              variant={filterStatus === "pending" ? "default" : "outline"}
              onClick={() => setFilterStatus("pending")}
              size="sm"
            >
              Menunggu ({stats.pending})
            </Button>
            <Button
              variant={filterStatus === "confirmed" ? "default" : "outline"}
              onClick={() => setFilterStatus("confirmed")}
              size="sm"
            >
              Dikonfirmasi ({stats.confirmed})
            </Button>
            <Button
              variant={filterStatus === "ongoing" ? "default" : "outline"}
              onClick={() => setFilterStatus("ongoing")}
              size="sm"
            >
              Aktif ({stats.ongoing})
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("completed")}
              size="sm"
            >
              Selesai ({stats.completed})
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <BookingsDataTable
          bookings={filteredBookings}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onUpdateStatus={handleStatusUpdate}
        />
      </motion.div>

      {/* Form Dialog */}
      <BookingFormDialog
        booking={selectedBooking}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
        onSubmit={handleFormSubmit}
      />

      {/* Detail Dialog */}
      <BookingDetailDialog
        booking={selectedBooking}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}

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
import type { Booking } from "@/lib/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Calendar, 
  DollarSign,
  FileText,
  Clock
} from "lucide-react"

interface BookingDetailDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Menunggu</Badge>
    case 'confirmed':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Dikonfirmasi</Badge>
    case 'ongoing':
      return <Badge variant="outline" className="text-green-600 border-green-600">Sedang Berjalan</Badge>
    case 'completed':
      return <Badge variant="outline" className="text-gray-600 border-gray-600">Selesai</Badge>
    case 'cancelled':
      return <Badge variant="outline" className="text-red-600 border-red-600">Dibatalkan</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getPaymentBadge = (status: string) => {
  switch (status) {
    case 'unpaid':
      return <Badge variant="destructive">Belum Bayar</Badge>
    case 'partial':
      return <Badge variant="outline" className="text-orange-600 border-orange-600">Sebagian</Badge>
    case 'paid':
      return <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">Lunas</Badge>
    case 'refunded':
      return <Badge variant="outline" className="text-blue-600 border-blue-600">Dikembalikan</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id })
  } catch {
    return dateString
  }
}

const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id })
  } catch {
    return dateString
  }
}

export function BookingDetailDialog({ booking, open, onOpenChange }: BookingDetailDialogProps) {
  if (!booking) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Booking #{booking.id.slice(-8).toUpperCase()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Status Booking</CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(booking.booking_status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Status Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                {getPaymentBadge(booking.payment_status)}
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{booking.customer_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{booking.customer_phone}</span>
              </div>
              {booking.customer_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{booking.customer_email}</span>
                </div>
              )}
              {booking.customer_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span>{booking.customer_address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informasi Kendaraan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.vehicle ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{booking.vehicle.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">Merek:</span>
                    <span>{booking.vehicle.brand}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">Tipe:</span>
                    <span>{booking.vehicle.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">Status:</span>
                    {booking.vehicle.is_available ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">Tersedia</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600">Tidak Tersedia</Badge>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-gray-500">Kendaraan tidak ditemukan</span>
              )}
            </CardContent>
          </Card>

          {/* Rental Period & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Periode Sewa & Lokasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Tanggal Mulai</span>
                  <div className="font-medium">{formatDate(booking.start_date)}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Tanggal Selesai</span>
                  <div className="font-medium">{formatDate(booking.end_date)}</div>
                </div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Durasi</span>
                <div className="font-medium">{booking.total_days} hari</div>
              </div>
              <Separator />
              {booking.pickup_location && (
                <div>
                  <span className="text-gray-600 text-sm">Lokasi Pickup</span>
                  <div>{booking.pickup_location}</div>
                </div>
              )}
              {booking.dropoff_location && (
                <div>
                  <span className="text-gray-600 text-sm">Lokasi Dropoff</span>
                  <div>{booking.dropoff_location}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informasi Harga
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Harga per Hari</span>
                  <div className="font-medium">{formatCurrency(booking.price_per_day)}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Total Hari</span>
                  <div className="font-medium">{booking.total_days} hari</div>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-gray-600 text-sm">Total Pembayaran</span>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(booking.total_amount)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Catatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informasi Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Tanggal Booking</span>
                <div>{formatDateTime(booking.created_at)}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Terakhir Update</span>
                <div>{formatDateTime(booking.updated_at)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

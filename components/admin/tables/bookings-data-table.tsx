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
import { MoreHorizontal, Eye, Edit, Trash2, Car, Calendar } from "lucide-react"
import type { Booking } from "@/lib/types"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface BookingsDataTableProps {
  bookings: Booking[]
  onEdit: (booking: Booking) => void
  onDelete: (id: string) => void
  onView: (booking: Booking) => void
  onUpdateStatus: (id: string, booking_status: string, payment_status?: string) => void
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
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id })
  } catch {
    return dateString
  }
}

export function BookingsDataTable({ 
  bookings, 
  onEdit, 
  onDelete, 
  onView, 
  onUpdateStatus 
}: BookingsDataTableProps) {
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)

  const handleStatusUpdate = async (id: string, booking_status: string, payment_status?: string) => {
    setLoadingStatus(id)
    try {
      await onUpdateStatus(id, booking_status, payment_status)
    } finally {
      setLoadingStatus(null)
    }
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Kendaraan</TableHead>
            <TableHead>Periode Sewa</TableHead>
            <TableHead>Total Bayar</TableHead>
            <TableHead>Status Booking</TableHead>
            <TableHead>Status Pembayaran</TableHead>
            <TableHead>Tanggal Booking</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                Belum ada data booking
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                    {booking.customer_email && (
                      <div className="text-sm text-gray-500">{booking.customer_email}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {booking.vehicle?.name || 'Kendaraan tidak ditemukan'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.vehicle?.brand} - {booking.vehicle?.type}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">
                        {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.total_days} hari
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{formatCurrency(booking.total_amount)}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(booking.price_per_day)}/hari
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(booking.booking_status)}</TableCell>
                <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(booking.created_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        disabled={loadingStatus === booking.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(booking)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(booking)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      
                      {/* Status Booking Actions */}
                      {booking.booking_status === 'pending' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        >
                          Konfirmasi Booking
                        </DropdownMenuItem>
                      )}
                      
                      {booking.booking_status === 'confirmed' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(booking.id, 'ongoing')}
                        >
                          Mulai Sewa
                        </DropdownMenuItem>
                      )}
                      
                      {booking.booking_status === 'ongoing' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        >
                          Selesaikan Sewa
                        </DropdownMenuItem>
                      )}
                      
                      {['pending', 'confirmed'].includes(booking.booking_status) && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          className="text-red-600"
                        >
                          Batalkan Booking
                        </DropdownMenuItem>
                      )}

                      {/* Payment Status Actions */}
                      {booking.payment_status === 'unpaid' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(booking.id, booking.booking_status, 'paid')}
                        >
                          Tandai Lunas
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem 
                        onClick={() => onDelete(booking.id)}
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

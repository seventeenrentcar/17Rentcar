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
import type { Booking, Vehicle } from "@/lib/types"
import { useAdminVehicles } from "@/hooks/use-admin-vehicles"

interface BookingFormDialogProps {
  booking?: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  onSubmit: (data: Partial<Booking>) => Promise<{ success: boolean; error?: string }>
}

export function BookingFormDialog({
  booking,
  open,
  onOpenChange,
  onSuccess,
  onSubmit
}: BookingFormDialogProps) {
  const { vehicles, loading: vehiclesLoading } = useAdminVehicles()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
    const [formData, setFormData] = useState({
    vehicle_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    start_date: "",
    end_date: "",
    pickup_location: "",
    dropoff_location: "",
    price_per_day: 0,
    booking_status: "pending" as "pending" | "confirmed" | "ongoing" | "completed" | "cancelled",
    payment_status: "unpaid" as "unpaid" | "partial" | "paid" | "refunded",
    notes: ""
  })

  useEffect(() => {
    if (booking) {
      setFormData({
        vehicle_id: booking.vehicle_id,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email || "",
        customer_phone: booking.customer_phone,
        customer_address: booking.customer_address || "",
        start_date: booking.start_date.split('T')[0], // Format for date input
        end_date: booking.end_date.split('T')[0],
        pickup_location: booking.pickup_location || "",
        dropoff_location: booking.dropoff_location || "",
        price_per_day: booking.price_per_day,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        notes: booking.notes || ""
      })
    } else {
      setFormData({
        vehicle_id: "",
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        customer_address: "",
        start_date: "",
        end_date: "",
        pickup_location: "",
        dropoff_location: "",
        price_per_day: 0,
        booking_status: "pending",
        payment_status: "unpaid",
        notes: ""
      })
    }
    setError("")
  }, [booking, open])

  const calculateTotalDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 1
    }
    return 1
  }

  const handleVehicleChange = (vehicleId: string) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId)
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicleId,
      price_per_day: selectedVehicle?.all_in_price || 0
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const totalDays = calculateTotalDays()
      const totalAmount = totalDays * formData.price_per_day

      const submitData = {
        ...formData,
        total_days: totalDays,
        total_amount: totalAmount
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

  const totalDays = calculateTotalDays()
  const totalAmount = totalDays * formData.price_per_day

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {booking ? "Edit Booking" : "Tambah Booking Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Selection */}
            <div className="md:col-span-2">
              <Label htmlFor="vehicle_id">Kendaraan *</Label>
              <Select value={formData.vehicle_id} onValueChange={handleVehicleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kendaraan" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.brand} ({vehicle.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Customer Information */}
            <div>
              <Label htmlFor="customer_name">Nama Pelanggan *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({...prev, customer_name: e.target.value}))}
                required
              />
            </div>

            <div>
              <Label htmlFor="customer_phone">No. Telepon *</Label>
              <Input
                id="customer_phone"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({...prev, customer_phone: e.target.value}))}
                required
              />
            </div>

            <div>
              <Label htmlFor="customer_email">Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({...prev, customer_email: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="customer_address">Alamat</Label>
              <Input
                id="customer_address"
                value={formData.customer_address}
                onChange={(e) => setFormData(prev => ({...prev, customer_address: e.target.value}))}
              />
            </div>

            {/* Rental Period */}
            <div>
              <Label htmlFor="start_date">Tanggal Mulai *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">Tanggal Selesai *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                required
              />
            </div>

            {/* Pickup & Dropoff */}
            <div>
              <Label htmlFor="pickup_location">Lokasi Pickup</Label>
              <Input
                id="pickup_location"
                value={formData.pickup_location}
                onChange={(e) => setFormData(prev => ({...prev, pickup_location: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="dropoff_location">Lokasi Dropoff</Label>
              <Input
                id="dropoff_location"
                value={formData.dropoff_location}
                onChange={(e) => setFormData(prev => ({...prev, dropoff_location: e.target.value}))}
              />
            </div>

            {/* Pricing */}
            <div>
              <Label htmlFor="price_per_day">Harga per Hari (IDR) *</Label>
              <Input
                id="price_per_day"
                type="number"
                value={formData.price_per_day}
                onChange={(e) => setFormData(prev => ({...prev, price_per_day: Number(e.target.value)}))}
                required
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="booking_status">Status Booking</Label>
              <Select 
                value={formData.booking_status} 
                onValueChange={(value: any) => setFormData(prev => ({...prev, booking_status: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="ongoing">Sedang Berjalan</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_status">Status Pembayaran</Label>
              <Select 
                value={formData.payment_status} 
                onValueChange={(value: any) => setFormData(prev => ({...prev, payment_status: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Belum Bayar</SelectItem>
                  <SelectItem value="partial">Sebagian</SelectItem>
                  <SelectItem value="paid">Lunas</SelectItem>
                  <SelectItem value="refunded">Dikembalikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Ringkasan Booking</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Total Hari: {totalDays} hari</div>
              <div>Harga per Hari: Rp {formData.price_per_day.toLocaleString('id-ID')}</div>
              <div className="col-span-2 font-medium">
                Total Bayar: Rp {totalAmount.toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              placeholder="Catatan tambahan untuk booking ini..."
            />
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
            <Button type="submit" disabled={loading || vehiclesLoading}>
              {loading ? "Menyimpan..." : booking ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

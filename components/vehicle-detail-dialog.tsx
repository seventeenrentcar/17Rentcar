"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency, buildWhatsAppMessage, getWhatsAppUrl } from "@/lib/utils"
import { MessageCircle, Calendar, User } from "lucide-react"
import { useContactInfo } from "@/hooks/use-contact-info"
import type { Vehicle } from "@/lib/types"

interface VehicleDetailDialogProps {
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VehicleDetailDialog({ vehicle, open, onOpenChange }: VehicleDetailDialogProps) {
  const [customerName, setCustomerName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activeTab, setActiveTab] = useState<string>("")
  const { contactInfo } = useContactInfo()

  // Determine default tab based on availability
  useEffect(() => {
    if (!vehicle) return

    const allInAvailable = vehicle.all_in_price > 0
    const unitOnlyAvailable = vehicle.unit_only_price > 0

    if (allInAvailable) {
      setActiveTab("all-in")
    } else if (unitOnlyAvailable) {
      setActiveTab("unit-only")
    } else {
      setActiveTab("all-in") // Default fallback
    }
  }, [vehicle])

  if (!vehicle) return null

  const allInAvailable = vehicle.all_in_price > 0
  const unitOnlyAvailable = vehicle.unit_only_price > 0

  // Calculate number of days between start and end date
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 1
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  // Get the number of days for rental
  const rentalDays = calculateDays(startDate, endDate)

  // Calculate total price
  const calculateTotal = (pricePerDay: number): number => {
    return pricePerDay * rentalDays
  }

  // Validate that end date is not before start date
  const isEndDateValid = !endDate || !startDate || new Date(endDate) >= new Date(startDate)

  const handleWhatsAppBooking = (priceType: "all_in" | "unit_only") => {
    const price = priceType === "all_in" ? vehicle.all_in_price : vehicle.unit_only_price
    const totalPrice = calculateTotal(price)
    const vehicleData = {
      name: vehicle.name,
      all_in_price: price, // Use original per-day price, not total
    }

    // Create booking details message with separate dates
    const priceTypeLabel = priceType === "all_in" ? "All In" : "Unit Only"
    const bookingDetails = `Tanggal Mulai: ${startDate || "Belum ditentukan"}
• Tanggal Selesai: ${endDate || "Belum ditentukan"}
• Durasi: ${rentalDays} hari
• Total: ${formatCurrency(totalPrice)}`
    const message = buildWhatsAppMessage(vehicleData, customerName, bookingDetails, priceTypeLabel)
    
    // Use dynamic phone number from database
    const phoneNumber = contactInfo?.whatsapp ? 
      `62${contactInfo.whatsapp.replace(/^0/, '')}` : // Convert 08xxx to 628xxx
      "6289504796894"
    const whatsappUrl = getWhatsAppUrl(message, phoneNumber)

    window.open(whatsappUrl, "_blank")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-black">{vehicle.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <div className="relative h-48 sm:h-64 lg:h-80 rounded-lg overflow-hidden">
              <Image
                src={vehicle.image_url || "/placeholder.svg?height=400&width=600"}
                alt={vehicle.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="mt-3 sm:mt-4">
              <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 flex-wrap">
                <Badge className="bg-yellow-400 text-black text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1">{vehicle.type}</Badge>
                <span className="text-sm sm:text-base text-gray-600">{vehicle.brand}</span>
              </div>

              <h4 className="font-semibold text-sm sm:text-base text-black mb-2 sm:mb-3">Fitur Unggulan:</h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2">
                {vehicle.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs sm:text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full mr-1.5 sm:mr-2"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-1 sm:mb-2">
                <TabsTrigger 
                  value="all-in" 
                  className={`text-xs sm:text-sm py-1.5 sm:py-2 ${
                    !allInAvailable 
                      ? 'opacity-50 cursor-not-allowed text-gray-400 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-400' 
                      : ''
                  }`}
                  disabled={!allInAvailable}
                >
                  Paket All In
                  {!allInAvailable && <span className="ml-1 text-xs">(Tidak Tersedia)</span>}
                </TabsTrigger>
                <TabsTrigger 
                  value="unit-only" 
                  className={`text-xs sm:text-sm py-1.5 sm:py-2 ${
                    !unitOnlyAvailable 
                      ? 'opacity-50 cursor-not-allowed text-gray-400 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-400' 
                      : ''
                  }`}
                  disabled={!unitOnlyAvailable}
                >
                  Unit Only
                  {!unitOnlyAvailable && <span className="ml-1 text-xs">(Tidak Tersedia)</span>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all-in" className="space-y-3 sm:space-y-4">
                <div className={`p-3 sm:p-4 rounded-lg ${allInAvailable ? 'bg-red-50' : 'bg-gray-100'}`}>
                  <h3 className={`font-bold text-lg sm:text-xl mb-1 sm:mb-2 ${
                    allInAvailable ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {allInAvailable ? `${formatCurrency(vehicle.all_in_price)}/hari` : 'Tidak Tersedia'}
                  </h3>
                  {allInAvailable && startDate && endDate && isEndDateValid && (
                    <div className="mb-2 p-2 bg-red-100 rounded-md">
                      <p className="text-sm font-semibold text-red-700">
                        Total: {formatCurrency(calculateTotal(vehicle.all_in_price))} ({rentalDays} hari)
                      </p>
                    </div>
                  )}
                  <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                    allInAvailable ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {allInAvailable 
                      ? 'Sudah termasuk driver, BBM, dan tol dalam kota Bandung'
                      : 'Paket All In saat ini tidak tersedia untuk kendaraan ini'
                    }
                  </p>

                  {allInAvailable ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <Label htmlFor="name-all-in" className="text-xs sm:text-sm mb-1">Nama Lengkap</Label>
                        <div className="relative">
                          <User className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="name-all-in"
                            placeholder="Masukkan nama lengkap"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="pl-7 sm:pl-10 text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <Label htmlFor="start-date-all-in" className="text-xs sm:text-sm mb-1">Tanggal Mulai</Label>
                          <div className="relative">
                            <Calendar className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <Input
                              id="start-date-all-in"
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="pl-7 sm:pl-10 text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-10"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="end-date-all-in" className="text-xs sm:text-sm mb-1">Tanggal Selesai</Label>
                          <div className="relative">
                            <Calendar className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <Input
                              id="end-date-all-in"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              min={startDate || new Date().toISOString().split('T')[0]}
                              className={`pl-7 sm:pl-10 text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-10 ${
                                !isEndDateValid ? 'border-red-500 focus:border-red-500' : ''
                              }`}
                            />
                          </div>
                          {!isEndDateValid && (
                            <p className="text-red-500 text-xs mt-1">Tanggal selesai tidak boleh sebelum tanggal mulai</p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleWhatsAppBooking("all_in")}
                        disabled={!customerName || !startDate || !endDate || !isEndDateValid}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm h-8 sm:h-10"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Pesan Sekarang via WhatsApp
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">Silakan pilih opsi "Unit Only" atau hubungi kami untuk informasi lebih lanjut.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="unit-only" className="space-y-3 sm:space-y-4">
                <div className={`p-3 sm:p-4 rounded-lg ${unitOnlyAvailable ? 'bg-gray-50' : 'bg-gray-100'}`}>
                  <h3 className={`font-bold text-lg sm:text-xl mb-1 sm:mb-2 ${
                    unitOnlyAvailable ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {unitOnlyAvailable ? `${formatCurrency(vehicle.unit_only_price)}/hari` : 'Tidak Tersedia'}
                  </h3>
                  {unitOnlyAvailable && startDate && endDate && isEndDateValid && (
                    <div className="mb-2 p-2 bg-gray-100 rounded-md">
                      <p className="text-sm font-semibold text-gray-700">
                        Total: {formatCurrency(calculateTotal(vehicle.unit_only_price))} ({rentalDays} hari)
                      </p>
                    </div>
                  )}
                  <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                    unitOnlyAvailable ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {unitOnlyAvailable 
                      ? 'Hanya unit mobil, BBM dan driver ditanggung penyewa'
                      : 'Opsi Unit Only saat ini tidak tersedia untuk kendaraan ini'
                    }
                  </p>

                  {unitOnlyAvailable ? (
                    <div className="space-y-2 sm:space-y-3">
                      <div>
                        <Label htmlFor="name-unit-only" className="text-xs sm:text-sm mb-1">Nama Lengkap</Label>
                        <div className="relative">
                          <User className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <Input
                            id="name-unit-only"
                            placeholder="Masukkan nama lengkap"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="pl-7 sm:pl-10 text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <Label htmlFor="start-date-unit-only" className="text-xs sm:text-sm mb-1">Tanggal Mulai</Label>
                          <div className="relative">
                            <Calendar className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <Input
                              id="start-date-unit-only"
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="pl-7 sm:pl-10 text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-10"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="end-date-unit-only" className="text-xs sm:text-sm mb-1">Tanggal Selesai</Label>
                          <div className="relative">
                            <Calendar className="absolute left-2 sm:left-3 top-2 sm:top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <Input
                              id="end-date-unit-only"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              min={startDate || new Date().toISOString().split('T')[0]}
                              className={`pl-7 sm:pl-10 text-xs sm:text-sm py-1 sm:py-2 h-8 sm:h-10 ${
                                !isEndDateValid ? 'border-red-500 focus:border-red-500' : ''
                              }`}
                            />
                          </div>
                          {!isEndDateValid && (
                            <p className="text-red-500 text-xs mt-1">Tanggal selesai tidak boleh sebelum tanggal mulai</p>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleWhatsAppBooking("unit_only")}
                        disabled={!customerName || !startDate || !endDate || !isEndDateValid}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm h-8 sm:h-10"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Pesan Sekarang via WhatsApp
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">Silakan pilih opsi "Paket All In" atau hubungi kami untuk informasi lebih lanjut.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-xs sm:text-sm text-black mb-1.5 sm:mb-2">Informasi Penting:</h4>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-0.5 sm:space-y-1">
                <li>• Minimal sewa 12 jam</li>
                <li>• Deposit sesuai kesepakatan</li>
                <li>• SIM dan KTP wajib dibawa</li>
                <li>• Konfirmasi ketersediaan via WhatsApp</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

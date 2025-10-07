"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useVehicles } from "@/hooks/use-vehicles"
import { VehicleCard } from "./vehicle-card"
import { VehicleFilters } from "./vehicle-filters"
import { VehicleDetailDialog } from "./vehicle-detail-dialog"
import type { Vehicle } from "@/lib/types"

export function VehicleCatalog() {
  const { vehicles, loading, error } = useVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [filters, setFilters] = useState({
    type: "",
    brand: "",
    priceRange: "",
  })

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (filters.type && vehicle.type !== filters.type) return false
      if (filters.brand && vehicle.brand !== filters.brand) return false

      if (filters.priceRange) {
        const price = vehicle.all_in_price
        switch (filters.priceRange) {
          case "under-500k":
            return price < 500000
          case "500k-1m":
            return price >= 500000 && price <= 1000000
          case "over-1m":
            return price > 1000000
          default:
            return true
        }
      }

      return true
    })
  }, [vehicles, filters])

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-red-50/30 min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat katalog mobil...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-red-50/30 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Terjadi kesalahan: {error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-red-50/30 min-h-screen relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-20 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-red-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 right-20 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl"
        />
      </div>

      {/* Content container with padding */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Katalog{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Mobil Kami</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Pilih kendaraan yang sesuai dengan kebutuhan perjalanan Anda. Semua mobil dalam kondisi prima dan siap pakai
              dengan berbagai pilihan paket yang fleksibel.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <VehicleFilters vehicles={vehicles} filters={filters} onFiltersChange={setFilters} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          >
            {filteredVehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <VehicleCard vehicle={vehicle} onViewDetails={setSelectedVehicle} />
              </motion.div>
            ))}
          </motion.div>

          {filteredVehicles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center py-10 sm:py-16"
            >
              <div className="bg-white/40 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-white/20 shadow-xl max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                <p className="text-lg sm:text-xl text-gray-600 mb-4">Tidak ada mobil yang sesuai dengan filter yang dipilih.</p>
                <p className="text-gray-500">Coba ubah kriteria pencarian Anda.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <VehicleDetailDialog
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </section>
  )
}

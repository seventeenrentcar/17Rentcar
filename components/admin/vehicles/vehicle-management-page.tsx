"use client"

import { useState } from "react"
import { useAdminVehicles } from "@/hooks/use-admin-vehicles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VehicleDataTable } from "../tables/vehicle-data-table"
import { VehicleFormDialog } from "../vehicle-form-dialog"
import { Plus, Search } from "lucide-react"
import { motion } from "framer-motion"
import type { Vehicle } from "@/lib/types"

export function VehicleManagementPage() {
  const { vehicles, loading, error, refetch, deleteVehicle } = useAdminVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "unavailable">("all")

  const handleAdd = () => {
    setSelectedVehicle(null)
    setIsFormOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedVehicle(null)
    refetch()
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "available" && vehicle.is_available) ||
      (filterStatus === "unavailable" && !vehicle.is_available)

    return matchesSearch && matchesFilter
  })

  return (
      <div className="space-y-8">
        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-800">Error: {error}</p>
            <Button 
              onClick={refetch} 
              variant="outline" 
              size="sm" 
              className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
            >
              Coba Lagi
            </Button>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Kendaraan</h1>
            <p className="text-gray-600 mt-2">Tambah, edit, dan kelola semua kendaraan rental</p>
          </div>
          <Button onClick={handleAdd} className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Kendaraan
          </Button>
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
                  placeholder="Cari kendaraan berdasarkan nama, merek, atau tipe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                Semua
              </Button>
              <Button
                variant={filterStatus === "available" ? "default" : "outline"}
                onClick={() => setFilterStatus("available")}
                size="sm"
              >
                Tersedia
              </Button>
              <Button
                variant={filterStatus === "unavailable" ? "default" : "outline"}
                onClick={() => setFilterStatus("unavailable")}
                size="sm"
              >
                Tidak Tersedia
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Vehicle Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VehicleDataTable 
            vehicles={filteredVehicles} 
            loading={loading} 
            onEdit={handleEdit} 
            onRefresh={refetch}
            onDelete={deleteVehicle}
          />
        </motion.div>

        {/* Form Dialog */}
        <VehicleFormDialog
          vehicle={selectedVehicle}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleFormSuccess}
        />
      </div>
  )
}

// Default export
export default VehicleManagementPage;

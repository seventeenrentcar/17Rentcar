"use client"

import { useState, useEffect } from "react"
import { useAdminVehicles } from "@/hooks/use-admin-vehicles"
import { MetricCard } from "./cards/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, Eye, EyeOff, Building2, Settings, Users, RefreshCw, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export function AnalyticsDashboard() {
  const { vehicles, loading, error, refetch } = useAdminVehicles()
  const [vehicleStats, setVehicleStats] = useState({
    totalVehicles: 0,
    visibleVehicles: 0,
    hiddenVehicles: 0,
    totalBrands: 0
  })

  useEffect(() => {
    if (vehicles) {
      const visibleVehicles = vehicles.filter(v => v.is_available).length
      const hiddenVehicles = vehicles.filter(v => !v.is_available).length
      const uniqueBrands = new Set(vehicles.map(v => v.brand)).size

      setVehicleStats({
        totalVehicles: vehicles.length,
        visibleVehicles,
        hiddenVehicles,
        totalBrands: uniqueBrands
      })
    }
  }, [vehicles])

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 sm:p-8 text-center"
          >
            <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Error Memuat Data</h2>
            <p className="text-sm sm:text-base text-white/70 mb-6">{error}</p>
            <Button onClick={refetch} className="bg-red-600 hover:bg-red-700 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Coba Lagi
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Ringkasan statistik kendaraan dan akses cepat</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm" className="flex items-center gap-2 self-start sm:self-auto">
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm">Refresh Data</span>
        </Button>
      </div>

      {/* Vehicle Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <MetricCard
            title="Total Kendaraan"
            value={vehicleStats.totalVehicles}
            icon={Car}
            description="Semua kendaraan"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <MetricCard
            title="Kendaraan Terlihat"
            value={vehicleStats.visibleVehicles}
            icon={Eye}
            description="Dapat dilihat customer"
            trend={`${vehicleStats.totalVehicles > 0 ? Math.round((vehicleStats.visibleVehicles / vehicleStats.totalVehicles) * 100) : 0}%`}
            trendUp={vehicleStats.visibleVehicles > vehicleStats.hiddenVehicles}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MetricCard
            title="Kendaraan Tersembunyi"
            value={vehicleStats.hiddenVehicles}
            icon={EyeOff}
            description="Tidak terlihat customer"
            trend={`${vehicleStats.totalVehicles > 0 ? Math.round((vehicleStats.hiddenVehicles / vehicleStats.totalVehicles) * 100) : 0}%`}
            trendUp={false}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MetricCard
            title="Jumlah Merek"
            value={vehicleStats.totalBrands}
            icon={Building2}
            description="Variasi merek tersedia"
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/admin/vehicles">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Car className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Kelola Kendaraan</div>
                    <div className="text-xs opacity-90">Tambah, edit, hapus kendaraan</div>
                  </div>
                </Button>
              </Link>
              
              <Link href="/admin/contact">
                <Button className="w-full h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Kelola Kontak</div>
                    <div className="text-xs opacity-90">Edit info kontak & WhatsApp</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vehicle Status Overview */}
      {vehicleStats.totalVehicles > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Status Kendaraan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visible Vehicles Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Kendaraan Terlihat</span>
                    <span className="text-sm text-gray-500">{vehicleStats.visibleVehicles} / {vehicleStats.totalVehicles}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${vehicleStats.totalVehicles > 0 ? (vehicleStats.visibleVehicles / vehicleStats.totalVehicles) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Hidden Vehicles Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Kendaraan Tersembunyi</span>
                    <span className="text-sm text-gray-500">{vehicleStats.hiddenVehicles} / {vehicleStats.totalVehicles}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${vehicleStats.totalVehicles > 0 ? (vehicleStats.hiddenVehicles / vehicleStats.totalVehicles) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

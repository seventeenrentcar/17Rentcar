"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { VehicleDetailDialog } from "./vehicle-detail-dialog"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Star, Users, Fuel, Settings, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import type { Vehicle } from "@/lib/types"

export function FeaturedVehicles() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    fetchFeaturedVehicles()
  }, [])
  const fetchFeaturedVehicles = async () => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("Supabase not configured, using empty data")
        setVehicles([])
        return
      }

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(6)

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.warn("Error fetching featured vehicles:", error)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes("Penumpang")) return Users
    if (feature.includes("AC") || feature.includes("Automatic")) return Settings
    if (feature.includes("Diesel") || feature.includes("BBM")) return Fuel
    return Star
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-red-100/30 to-orange-100/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Kendaraan{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Pilihan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pilihan kendaraan terbaik dengan kualitas prima dan harga terjangkau untuk perjalanan Anda.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group"
              >
                <Card className="overflow-hidden bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={vehicle.image_url || "/placeholder.svg?height=300&width=400"}
                      alt={vehicle.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>                    <Badge className="absolute top-4 left-4 bg-red-600 text-white border-0 shadow-lg">
                      {vehicle.type}
                    </Badge>
                    {vehicle.is_available ? (
                      <Badge className="absolute top-4 right-4 bg-green-500 text-white shadow-lg text-xs">Tersedia</Badge>
                    ) : (
                      <Badge className="absolute top-4 right-4 bg-red-500 text-white shadow-lg text-xs">Tidak Tersedia</Badge>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{vehicle.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 font-medium">{vehicle.brand}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">All In:</span>
                        {vehicle.all_in_price > 0 ? (
                          <span className="font-bold text-red-600 text-lg">{formatCurrency(vehicle.all_in_price)}</span>
                        ) : (
                          <span className="font-medium text-sm text-gray-400">Tidak Tersedia</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Unit Only:</span>
                        {vehicle.unit_only_price > 0 ? (
                          <span className="font-semibold text-gray-800">{formatCurrency(vehicle.unit_only_price)}</span>
                        ) : (
                          <span className="font-medium text-sm text-gray-400">Tidak Tersedia</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="grid grid-cols-2 gap-2">
                        {vehicle.features.slice(0, 4).map((feature, featureIndex) => {
                          const IconComponent = getFeatureIcon(feature)
                          return (
                            <div key={featureIndex} className="flex items-center text-xs text-gray-700">
                              <IconComponent className="h-3 w-3 mr-2 text-red-500" />
                              <span className="truncate">{feature}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>                    <Button 
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                      disabled={!vehicle.is_available}
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      Lihat Detail
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link href="/catalog">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Lihat Semua Kendaraan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>          </Link>
        </motion.div>
      </div>

      <VehicleDetailDialog
        vehicle={selectedVehicle}
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
      />
    </section>
  )
}

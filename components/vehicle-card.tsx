"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Star, Users, Fuel, Settings, Eye } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { motion } from "framer-motion"

interface VehicleCardProps {
  vehicle: Vehicle
  onViewDetails: (vehicle: Vehicle) => void
}

export function VehicleCard({ vehicle, onViewDetails }: VehicleCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group h-full"
    >
      <Card className="overflow-hidden bg-white/60 backdrop-blur-lg border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
        <div className="relative h-36 sm:h-48 overflow-hidden">
          <Image
            src={vehicle.image_url || "/placeholder.svg?height=300&width=400"}
            alt={vehicle.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <Badge className="absolute top-2 left-2 bg-yellow-400 text-black font-semibold shadow-lg text-xs">
            {vehicle.type}
          </Badge>
          {vehicle.is_available ? (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white shadow-lg text-xs">Tersedia</Badge>
          ) : (
            <Badge className="absolute top-2 right-2 bg-red-500 text-white shadow-lg text-xs">Tidak Tersedia</Badge>
          )}
        </div>

        <CardContent className="p-3 sm:p-4 md:p-6 flex-grow">
          <div className="mb-3 sm:mb-4">
            <h3 className="font-semibold text-base sm:text-lg md:text-xl text-black mb-1 sm:mb-2 group-hover:text-red-600 transition-colors line-clamp-1">
              {vehicle.name}
            </h3>
            <p className="text-gray-600 font-medium text-sm sm:text-base">{vehicle.brand}</p>
          </div>

          {/* Vehicle Specs */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>7 Kursi</span>
            </div>
            <div className="flex items-center">
              <Fuel className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>Bensin</span>
            </div>
            <div className="flex items-center">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>Manual</span>
            </div>
          </div>

          {/* Features */}
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {vehicle.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-[0.6rem] sm:text-xs bg-gray-100 text-gray-700">
                  {feature}
                </Badge>
              ))}
              {vehicle.features.length > 2 && (
                <Badge variant="secondary" className="text-[0.6rem] sm:text-xs bg-gray-100 text-gray-700">
                  +{vehicle.features.length - 2} lainnya
                </Badge>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">All In:</span>
              {vehicle.all_in_price > 0 ? (
                <span className="font-bold text-sm sm:text-base text-red-600">{formatCurrency(vehicle.all_in_price)}</span>
              ) : (
                <span className="font-medium text-xs sm:text-sm text-gray-400">Tidak Tersedia</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Unit Only:</span>
              {vehicle.unit_only_price > 0 ? (
                <span className="font-semibold text-xs sm:text-sm text-gray-800">{formatCurrency(vehicle.unit_only_price)}</span>
              ) : (
                <span className="font-medium text-xs sm:text-sm text-gray-400">Tidak Tersedia</span>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center">
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-600">(4.9)</span>
          </div>
        </CardContent>

        <CardFooter className="p-3 sm:p-4 md:p-6 pt-0">
          <Button
            onClick={() => onViewDetails(vehicle)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm h-9 sm:h-10 group/btn"
            disabled={!vehicle.is_available}
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 group-hover/btn:scale-110 transition-transform" />
            Lihat Detail
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

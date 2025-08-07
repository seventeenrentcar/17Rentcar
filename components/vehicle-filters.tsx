"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Filter, ChevronDown, ChevronUp } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import { motion } from "framer-motion"

interface VehicleFiltersProps {
  vehicles: Vehicle[]
  filters: {
    type: string
    brand: string
    priceRange: string
  }
  onFiltersChange: (filters: { type: string; brand: string; priceRange: string }) => void
}

export function VehicleFilters({ vehicles, filters, onFiltersChange }: VehicleFiltersProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const types = [...new Set(vehicles.map((v) => v.type))]
  const brands = [...new Set(vehicles.map((v) => v.brand))]

  const clearFilters = () => {
    onFiltersChange({ type: "", brand: "", priceRange: "" })
  }

  const hasActiveFilters = filters.type || filters.brand || filters.priceRange

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-6 sm:mb-8"
    >
      <Card className="bg-white/60 backdrop-blur-lg border-white/20 shadow-xl overflow-hidden">
        {/* Filter Header - Always visible */}
        <div className="p-4 sm:p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter Kendaraan</h3>
            {hasActiveFilters && <Badge className="ml-2 sm:ml-3 bg-red-100 text-red-700">Filter Aktif</Badge>}
          </div>
          
          {/* Mobile Toggle Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sm:hidden"
            aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Filter Content - Collapsible on mobile */}
        <CardContent 
          className={`p-4 sm:p-6 ${isCollapsed ? "hidden sm:block" : "block"}`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Mobil</label>
              <Select
                value={filters.type}
                onValueChange={(value) => onFiltersChange({ ...filters, type: value === "all" ? "" : value })}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-colors w-full">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Merek Mobil</label>
              <Select
                value={filters.brand}
                onValueChange={(value) => onFiltersChange({ ...filters, brand: value === "all" ? "" : value })}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-colors w-full">
                  <SelectValue placeholder="Semua Merek" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                  <SelectItem value="all">Semua Merek</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Rentang Harga</label>
              <Select
                value={filters.priceRange}
                onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value === "all" ? "" : value })}
              >
                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-colors w-full">
                  <SelectValue placeholder="Semua Harga" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-lg border-white/20">
                  <SelectItem value="all">Semua Harga</SelectItem>
                  <SelectItem value="under-500k">{"< Rp500.000"}</SelectItem>
                  <SelectItem value="500k-1m">Rp500.000 - Rp1.000.000</SelectItem>
                  <SelectItem value="over-1m">{"> Rp1.000.000"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-colors group h-10"
                disabled={!hasActiveFilters}
              >
                <RotateCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                Reset Filter
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex flex-wrap gap-2">
                {filters.type && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Tipe: {filters.type}
                  </Badge>
                )}
                {filters.brand && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Merek: {filters.brand}
                  </Badge>
                )}
                {filters.priceRange && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700">
                    Harga:{" "}
                    {filters.priceRange === "under-500k"
                      ? "< Rp500.000"
                      : filters.priceRange === "500k-1m"
                        ? "Rp500.000 - Rp1.000.000"
                        : "> Rp1.000.000"}
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

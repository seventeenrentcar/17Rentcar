"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  description?: string
  isText?: boolean
}

export function MetricCard({ title, value, icon: Icon, trend, trendUp, description, isText = false }: MetricCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">{title}</p>
            <div className="flex items-baseline space-x-2">
              {isText ? (
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[150px]">{value}</p>
              ) : (
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
              )}
              {trend && (
                <span className={`text-xs sm:text-sm font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>{trend}</span>
              )}
            </div>
            {description && <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 truncate">{description}</p>}
          </div>
          <div className="bg-gradient-to-br from-red-100 to-red-200 p-2 sm:p-3 rounded-lg sm:rounded-xl ml-2">
            <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

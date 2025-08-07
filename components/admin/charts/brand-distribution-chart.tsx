"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface BrandDistributionChartProps {
  data: Record<string, number>
}

export function BrandDistributionChart({ data }: BrandDistributionChartProps) {
  const chartData = Object.entries(data).map(([brand, count]) => ({
    brand,
    count,
  }))

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Tidak ada data untuk ditampilkan</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="brand" />
          <YAxis />
          <Tooltip formatter={(value) => [value, "Jumlah Kendaraan"]} labelFormatter={(label) => `Merek: ${label}`} />
          <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

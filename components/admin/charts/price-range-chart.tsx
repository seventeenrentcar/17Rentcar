"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface PriceRangeChartProps {
  data: Array<{
    range: string
    count: number
  }>
}

const COLORS = ["#dc2626", "#f59e0b", "#10b981"]

const RANGE_LABELS: Record<string, string> = {
  "under-500k": "< Rp500.000",
  "500k-1m": "Rp500.000 - Rp1.000.000",
  "over-1m": "> Rp1.000.000",
}

export function PriceRangeChart({ data }: PriceRangeChartProps) {
  const chartData = data.map((item) => ({
    name: RANGE_LABELS[item.range] || item.range,
    value: item.count,
  }))

  if (chartData.length === 0 || chartData.every((item) => item.value === 0)) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Tidak ada data untuk ditampilkan</div>
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "Jumlah Pilihan"]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

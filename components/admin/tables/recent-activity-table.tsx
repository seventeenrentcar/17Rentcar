"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

// Mock data for recent activities
const recentActivities = [
  {
    id: 1,
    type: "booking",
    description: "Pemesanan Toyota Avanza oleh Budi Santoso",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "success",
  },
  {
    id: 2,
    type: "vehicle_added",
    description: "Kendaraan baru Honda Jazz ditambahkan",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: "info",
  },
  {
    id: 3,
    type: "booking",
    description: "Pemesanan Mitsubishi Xpander oleh Sari Dewi",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    status: "success",
  },
  {
    id: 4,
    type: "vehicle_updated",
    description: "Status Toyota Fortuner diperbarui",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    status: "warning",
  },
  {
    id: 5,
    type: "booking",
    description: "Pemesanan Daihatsu Terios oleh Ahmad Rizki",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    status: "success",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    case "info":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "booking":
      return "Pemesanan"
    case "vehicle_added":
      return "Kendaraan Baru"
    case "vehicle_updated":
      return "Update Kendaraan"
    default:
      return "Aktivitas"
  }
}

export function RecentActivityTable() {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipe</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentActivities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>
                <Badge variant="outline">{getTypeLabel(activity.type)}</Badge>
              </TableCell>
              <TableCell className="font-medium">{activity.description}</TableCell>
              <TableCell className="text-gray-500">
                {formatDistanceToNow(activity.timestamp, {
                  addSuffix: true,
                  locale: id,
                })}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(activity.status)}>
                  {activity.status === "success" && "Berhasil"}
                  {activity.status === "warning" && "Peringatan"}
                  {activity.status === "info" && "Info"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

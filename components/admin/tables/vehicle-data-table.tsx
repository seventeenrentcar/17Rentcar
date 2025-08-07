"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { Edit, Trash2, MoreHorizontal, Eye, EyeOff } from "lucide-react"
import type { Vehicle } from "@/lib/types"
import Image from "next/image"

interface VehicleDataTableProps {
  vehicles: Vehicle[]
  loading: boolean
  onEdit: (vehicle: Vehicle) => void
  onRefresh: () => void
  onDelete: (vehicleId: string) => Promise<{ success: boolean; error?: string }>
}

export function VehicleDataTable({ vehicles, loading, onEdit, onRefresh, onDelete }: VehicleDataTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isToggling, setIsToggling] = useState<string | null>(null)

  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kendaraan ini? Foto kendaraan juga akan dihapus dari sistem.")) return

    setIsDeleting(vehicleId)
    try {
      const result = await onDelete(vehicleId)
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete vehicle")
      }

      await onRefresh()
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      alert("Gagal menghapus kendaraan")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    setIsToggling(vehicle.id)
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ is_available: !vehicle.is_available })
        .eq("id", vehicle.id)

      if (error) throw error

      await onRefresh()
    } catch (error) {
      console.error("Error toggling availability:", error)
      alert("Gagal mengubah status kendaraan")
    } finally {
      setIsToggling(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Kendaraan ({vehicles.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Merek</TableHead>
                <TableHead>Harga All In</TableHead>
                <TableHead>Harga Unit Only</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <div className="w-16 h-12 relative rounded-md overflow-hidden">
                      <Image
                        src={vehicle.image_url || "/placeholder.svg?height=48&width=64"}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{vehicle.type}</Badge>
                  </TableCell>
                  <TableCell>{vehicle.brand}</TableCell>
                  <TableCell className="font-semibold">
                    {vehicle.all_in_price > 0 ? (
                      <span className="text-black">{formatCurrency(vehicle.all_in_price)}</span>
                    ) : (
                      <span className="text-red-500">Tidak Tersedia</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {vehicle.unit_only_price > 0 ? (
                      <span className="text-black">{formatCurrency(vehicle.unit_only_price)}</span>
                    ) : (
                      <span className="text-red-500">Tidak Tersedia</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={vehicle.is_available ? "default" : "destructive"}>
                      {vehicle.is_available ? "Tersedia" : "Tidak Tersedia"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleAvailability(vehicle)}
                          disabled={isToggling === vehicle.id}
                        >
                          {vehicle.is_available ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Nonaktifkan
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Aktifkan
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={isDeleting === vehicle.id}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Tidak ada kendaraan yang ditemukan.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

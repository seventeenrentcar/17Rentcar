"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, UserCheck, UserX, Mail, Phone } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import type { User } from "@/lib/types"
import { motion } from "framer-motion"

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "verified">("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active) ||
      (filterStatus === "verified" && user.is_verified)

    return matchesSearch && matchesFilter
  })

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("users").update({ is_active: !currentStatus }).eq("id", userId)

      if (error) throw error
      await fetchUsers()
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("users").update({ is_verified: !currentStatus }).eq("id", userId)

      if (error) throw error
      await fetchUsers()
    } catch (error) {
      console.error("Error updating user verification:", error)
    }
  }

  const stats = {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    verified: users.filter((u) => u.is_verified).length,
    newThisMonth: users.filter((u) => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
            <p className="text-gray-600 mt-1">Kelola akun pengguna dan informasi profil</p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pengguna
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Pengguna", value: stats.total, color: "blue" },
            { label: "Pengguna Aktif", value: stats.active, color: "green" },
            { label: "Terverifikasi", value: stats.verified, color: "purple" },
            { label: "Baru Bulan Ini", value: stats.newThisMonth, color: "orange" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-${stat.color}-100 flex items-center justify-center`}>
                      <div className={`w-6 h-6 rounded-full bg-${stat.color}-500`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari pengguna berdasarkan nama, email, atau telepon..."
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
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                  size="sm"
                >
                  Aktif
                </Button>
                <Button
                  variant={filterStatus === "verified" ? "default" : "outline"}
                  onClick={() => setFilterStatus("verified")}
                  size="sm"
                >
                  Terverifikasi
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  onClick={() => setFilterStatus("inactive")}
                  size="sm"
                >
                  Tidak Aktif
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Pengguna ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pengguna</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.profile_image_url || ""} />
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {user.full_name?.charAt(0) || user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.full_name || "Nama tidak tersedia"}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.is_active ? "Aktif" : "Tidak Aktif"}
                            </Badge>
                            {user.is_verified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                Terverifikasi
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(user.created_at), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleVerification(user.id, user.is_verified)}>
                                {user.is_verified ? (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Batalkan Verifikasi
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Verifikasi
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.is_active)}>
                                {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
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

                {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Tidak ada pengguna yang ditemukan.</p>
                  </div>                )}              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}

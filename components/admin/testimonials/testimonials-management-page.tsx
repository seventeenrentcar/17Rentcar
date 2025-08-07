"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Star, Check, X, MessageSquare, Award, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import type { Testimonial } from "@/lib/types"
import { motion } from "framer-motion"

export function TestimonialsManagementPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "featured">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_role: "",
    content: "",
    rating: 5,
    avatar_url: "",
    is_featured: false,
    is_approved: false,
  })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingTestimonial.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("testimonials").insert([formData])

        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingTestimonial(null)
      resetForm()
      await fetchTestimonials()
    } catch (error) {
      console.error("Error saving testimonial:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_role: "",
      content: "",
      rating: 5,
      avatar_url: "",
      is_featured: false,
      is_approved: false,
    })
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      customer_name: testimonial.customer_name,
      customer_role: testimonial.customer_role || "",
      content: testimonial.content,
      rating: testimonial.rating,
      avatar_url: testimonial.avatar_url || "",
      is_featured: testimonial.is_featured,
      is_approved: testimonial.is_approved,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (testimonialId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus testimoni ini?")) return

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", testimonialId)

      if (error) throw error
      await fetchTestimonials()
    } catch (error) {
      console.error("Error deleting testimonial:", error)
    }
  }

  const handleToggleApproval = async (testimonialId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          is_approved: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testimonialId)

      if (error) throw error
      await fetchTestimonials()
    } catch (error) {
      console.error("Error updating testimonial approval:", error)
    }
  }

  const handleToggleFeatured = async (testimonialId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          is_featured: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", testimonialId)

      if (error) throw error
      await fetchTestimonials()
    } catch (error) {
      console.error("Error updating testimonial featured status:", error)
    }
  }

  const filteredTestimonials = testimonials.filter((testimonial) => {
    const matchesSearch =
      testimonial.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "approved" && testimonial.is_approved) ||
      (filterStatus === "pending" && !testimonial.is_approved) ||
      (filterStatus === "featured" && testimonial.is_featured)

    return matchesSearch && matchesFilter
  })

  const stats = {
    total: testimonials.length,
    approved: testimonials.filter((t) => t.is_approved).length,
    pending: testimonials.filter((t) => !t.is_approved).length,
    featured: testimonials.filter((t) => t.is_featured).length,
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }
  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Testimoni</h1>
            <p className="text-gray-600 mt-1">Kelola testimoni dan ulasan pelanggan</p>
          </div>
          <Button
            onClick={() => {
              setEditingTestimonial(null)
              resetForm()
              setIsDialogOpen(true)
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Testimoni
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Testimoni", value: stats.total, icon: MessageSquare, color: "blue" },
            { label: "Disetujui", value: stats.approved, icon: Check, color: "green" },
            { label: "Menunggu", value: stats.pending, icon: Eye, color: "yellow" },
            { label: "Unggulan", value: stats.featured, icon: Award, color: "purple" },
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
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
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
                    placeholder="Cari testimoni berdasarkan nama atau konten..."
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
                  variant={filterStatus === "approved" ? "default" : "outline"}
                  onClick={() => setFilterStatus("approved")}
                  size="sm"
                >
                  Disetujui
                </Button>
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  onClick={() => setFilterStatus("pending")}
                  size="sm"
                >
                  Menunggu
                </Button>
                <Button
                  variant={filterStatus === "featured" ? "default" : "outline"}
                  onClick={() => setFilterStatus("featured")}
                  size="sm"
                >
                  Unggulan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Testimoni ({filteredTestimonials.length})</CardTitle>
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
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Testimoni</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTestimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={testimonial.avatar_url || ""} />
                              <AvatarFallback className="bg-gray-100 text-gray-600">
                                {testimonial.customer_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{testimonial.customer_name}</p>
                              {testimonial.customer_role && (
                                <p className="text-sm text-gray-500">{testimonial.customer_role}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-900 max-w-xs truncate">{testimonial.content}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">{renderStars(testimonial.rating)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <Badge variant={testimonial.is_approved ? "default" : "secondary"}>
                              {testimonial.is_approved ? "Disetujui" : "Menunggu"}
                            </Badge>
                            {testimonial.is_featured && (
                              <Badge variant="outline" className="text-purple-600 border-purple-600">
                                Unggulan
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(testimonial.created_at), {
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
                              <DropdownMenuItem onClick={() => handleEdit(testimonial)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleApproval(testimonial.id, testimonial.is_approved)}
                              >
                                {testimonial.is_approved ? (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Batalkan Persetujuan
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Setujui
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                              >
                                {testimonial.is_featured ? "Hapus dari Unggulan" : "Jadikan Unggulan"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(testimonial.id)} className="text-red-600">
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

                {filteredTestimonials.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Tidak ada testimoni yang ditemukan.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "Edit Testimoni" : "Tambah Testimoni Baru"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Nama Pelanggan</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Nama pelanggan"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customer_role">Profesi/Jabatan</Label>
                  <Input
                    id="customer_role"
                    value={formData.customer_role}
                    onChange={(e) => setFormData({ ...formData, customer_role: e.target.value })}
                    placeholder="Pengusaha, Mahasiswa, dll."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="content">Testimoni</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Tulis testimoni pelanggan..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="avatar_url">URL Avatar</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_approved"
                    checked={formData.is_approved}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_approved: checked })}
                  />
                  <Label htmlFor="is_approved">Setujui testimoni</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Jadikan unggulan</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingTestimonial ? "Update" : "Simpan"}
                </Button>
              </div>            </form>
          </DialogContent>
        </Dialog>
      </div>
  )
}

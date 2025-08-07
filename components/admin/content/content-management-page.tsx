"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FileText, Globe, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import { motion } from "framer-motion"

interface ContentPage {
  id: string
  title: string
  slug: string
  content: string
  meta_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  author_id: string
  admin_profiles?: {
    full_name: string | null
  }
}

export function ContentManagementPage() {
  const [pages, setPages] = useState<ContentPage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    meta_description: "",
    is_published: false,
  })

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("content_pages")
        .select(`
          *,
          admin_profiles (
            full_name,
            email
          )
        `)
        .order("updated_at", { ascending: false })

      if (error) throw error
      setPages(data || [])
    } catch (error) {
      console.error("Error fetching pages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPage) {
        const { error } = await supabase
          .from("content_pages")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPage.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("content_pages").insert([formData])

        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingPage(null)
      setFormData({
        title: "",
        slug: "",
        content: "",
        meta_description: "",
        is_published: false,
      })
      await fetchPages()
    } catch (error) {
      console.error("Error saving page:", error)
    }
  }

  const handleEdit = (page: ContentPage) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || "",
      meta_description: page.meta_description || "",
      is_published: page.is_published,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus halaman ini?")) return

    try {
      const { error } = await supabase.from("content_pages").delete().eq("id", pageId)

      if (error) throw error
      await fetchPages()
    } catch (error) {
      console.error("Error deleting page:", error)
    }
  }

  const handleTogglePublish = async (pageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("content_pages")
        .update({
          is_published: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pageId)

      if (error) throw error
      await fetchPages()
    } catch (error) {
      console.error("Error updating page status:", error)
    }
  }

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    total: pages.length,
    published: pages.filter((p) => p.is_published).length,
    draft: pages.filter((p) => !p.is_published).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Konten</h1>
            <p className="text-gray-600 mt-1">Kelola halaman dan konten website</p>
          </div>
          <Button
            onClick={() => {
              setEditingPage(null)
              setFormData({
                title: "",
                slug: "",
                content: "",
                meta_description: "",
                is_published: false,
              })
              setIsDialogOpen(true)
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Halaman
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Halaman", value: stats.total, icon: FileText, color: "blue" },
            { label: "Dipublikasi", value: stats.published, icon: Globe, color: "green" },
            { label: "Draft", value: stats.draft, icon: Lock, color: "yellow" },
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

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari halaman berdasarkan judul atau slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Halaman ({filteredPages.length})</CardTitle>
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
                      <TableHead>Judul</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dibuat oleh</TableHead>
                      <TableHead>Terakhir diupdate</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{page.title}</p>
                            {page.meta_description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">{page.meta_description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={page.is_published ? "default" : "secondary"}>
                            {page.is_published ? "Dipublikasi" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {page.admin_profiles?.full_name || "Unknown"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDistanceToNow(new Date(page.updated_at), {
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
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(page)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePublish(page.id, page.is_published)}>
                                {page.is_published ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(page.id)} className="text-red-600">
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

                {filteredPages.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">Tidak ada halaman yang ditemukan.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage ? "Edit Halaman" : "Tambah Halaman Baru"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Judul</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Judul halaman"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-halaman"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Input
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Deskripsi singkat untuk SEO"
                />
              </div>

              <div>
                <Label htmlFor="content">Konten</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Konten halaman..."
                  rows={10}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Publikasikan halaman</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  {editingPage ? "Update" : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
    </div>
  )
}

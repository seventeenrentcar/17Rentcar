"use client"

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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  is_published: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    is_published: false,
    order_index: 0,
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  const fetchFAQs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("order_index", { ascending: true })

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingFaq) {
        const { error } = await supabase
          .from("faqs")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingFaq.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("faqs")
          .insert([{
            ...formData,
            order_index: faqs.length + 1,
          }])

        if (error) throw error
      }

      setIsDialogOpen(false)
      setEditingFaq(null)
      setFormData({
        question: "",
        answer: "",
        category: "",
        is_published: false,
        order_index: 0,
      })
      fetchFAQs()
    } catch (error) {
      console.error("Error saving FAQ:", error)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_published: faq.is_published,
      order_index: faq.order_index,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (faqId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus FAQ ini?")) return

    try {
      const { error } = await supabase
        .from("faqs")
        .delete()
        .eq("id", faqId)

      if (error) throw error
      fetchFAQs()
    } catch (error) {
      console.error("Error deleting FAQ:", error)
    }
  }

  const handleTogglePublish = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from("faqs")
        .update({ 
          is_published: !faq.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", faq.id)

      if (error) throw error
      fetchFAQs()
    } catch (error) {
      console.error("Error updating FAQ:", error)
    }
  }

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = Array.from(new Set(faqs.map(faq => faq.category).filter(Boolean)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600 mt-2">Kelola pertanyaan yang sering diajukan</p>
        </div>
        <Button onClick={() => {
          setEditingFaq(null)
          setFormData({
            question: "",
            answer: "",
            category: "",
            is_published: false,
            order_index: 0,
          })
          setIsDialogOpen(true)
        }} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Tambah FAQ
        </Button>
      </div>

      {/* Search and Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-sm border"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari FAQ berdasarkan pertanyaan, jawaban, atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{faqs.length}</div>
            <div className="text-sm text-blue-600">Total FAQ</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {faqs.filter(f => f.is_published).length}
            </div>
            <div className="text-sm text-green-600">Dipublikasikan</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {faqs.filter(f => !f.is_published).length}
            </div>
            <div className="text-sm text-yellow-600">Draft</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-sm text-purple-600">Kategori</div>
          </div>
        </div>
      </motion.div>

      {/* FAQ Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Daftar FAQ</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada FAQ ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pertanyaan</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Urutan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFAQs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={faq.question}>
                            {faq.question}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{faq.category || "Umum"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={faq.is_published ? "default" : "secondary"}>
                            {faq.is_published ? "Dipublikasikan" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>{faq.order_index}</TableCell>
                        <TableCell>
                          {new Date(faq.created_at).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(faq)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePublish(faq)}>
                                <Eye className="mr-2 h-4 w-4" />
                                {faq.is_published ? "Unpublish" : "Publish"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(faq.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? "Edit FAQ" : "Tambah FAQ Baru"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Pertanyaan</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Masukkan pertanyaan..."
                className="min-h-[80px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="answer">Jawaban</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Masukkan jawaban..."
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Masukkan kategori..."
                />
              </div>

              <div>
                <Label htmlFor="order">Urutan</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="published">Publikasikan langsung</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                {editingFaq ? "Update FAQ" : "Tambah FAQ"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

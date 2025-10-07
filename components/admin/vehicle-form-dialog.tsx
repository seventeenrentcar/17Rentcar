"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useAdminVehicles } from "@/hooks/use-admin-vehicles"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import type { Vehicle } from "@/lib/types"

interface VehicleFormDialogProps {
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const vehicleTypes = ["MPV", "SUV", "Hatchback", "Sedan", "Pickup"]

export function VehicleFormDialog({ vehicle, open, onOpenChange, onSuccess }: VehicleFormDialogProps) {
  const { addVehicle, updateVehicle } = useAdminVehicles()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dialogKey, setDialogKey] = useState(0) // Force re-render
  
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    brand: "",
    features: "",
    all_in_price: "",
    unit_only_price: "",
    image_url: "",
    is_available: true,
    has_all_in: false,
    has_unit_only: false,
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({
        name: vehicle.name,
        type: vehicle.type,
        brand: vehicle.brand,
        features: vehicle.features.join(", "),
        all_in_price: vehicle.all_in_price > 0 ? vehicle.all_in_price.toString() : "",
        unit_only_price: vehicle.unit_only_price > 0 ? vehicle.unit_only_price.toString() : "",
        image_url: vehicle.image_url || "",
        is_available: vehicle.is_available,
        has_all_in: vehicle.all_in_price > 0,
        has_unit_only: vehicle.unit_only_price > 0,
      })
      setImagePreview(vehicle.image_url || null)
    } else {
      setFormData({
        name: "",
        type: "",
        brand: "",
        features: "",
        all_in_price: "",
        unit_only_price: "",
        image_url: "",
        is_available: true,
        has_all_in: false,
        has_unit_only: false,
      })
      setImagePreview(null)
    }
    setSelectedFile(null)
    setError(null)
  }, [vehicle, open])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File gambar maksimal 5MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    try {
      // Check authentication first with retry mechanism
      let session = null
      let retryCount = 0
      const maxRetries = 3
      
      while (retryCount < maxRetries) {
        const { data: { session: currentSession }, error: authError } = await supabase.auth.getSession()
        
        if (authError) {
          console.warn(`Auth check attempt ${retryCount + 1} failed:`, authError)
          if (retryCount === maxRetries - 1) {
            throw new Error("Authentication required for upload")
          }
          retryCount++
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
          continue
        }
        
        if (!currentSession) {
          // Try to refresh session
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
          if (refreshedSession) {
            session = refreshedSession
            break
          } else if (retryCount === maxRetries - 1) {
            throw new Error("Please login to upload images")
          }
        } else {
          session = currentSession
          break
        }
        
        retryCount++
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Attempt upload with longer timeout and better error handling
      const uploadPromise = supabase.storage
        .from('vehicles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      // Increase timeout to 60 seconds for larger files
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Upload timeout (60s) - file may be too large or connection slow")), 60000)
      )

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any

      if (error) {
        // Provide more specific error messages
        if (error.message.includes('Duplicate')) {
          throw new Error("File already exists - please try again")
        } else if (error.message.includes('too large')) {
          throw new Error("File too large - maximum 5MB allowed")
        } else if (error.message.includes('Invalid')) {
          throw new Error("Invalid file format - only JPG, PNG, WEBP allowed")
        } else {
          throw new Error(`Upload failed: ${error.message}`)
        }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('vehicles')
        .getPublicUrl(fileName)
      
      if (!urlData?.publicUrl) {
        throw new Error("Failed to get image URL")
      }

      return urlData.publicUrl
    } catch (error) {
      console.error("Upload error details:", error)
      throw error
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Force dialog re-render on next open
      setDialogKey(prev => prev + 1)
      
      // Simple aggressive cleanup
      setTimeout(() => {
        // Clear all pointer-events
        document.body.style.pointerEvents = ''
        document.documentElement.style.pointerEvents = ''
        
        // Remove any stuck attributes
        document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
          if (!el.closest('[data-radix-portal]')) {
            el.removeAttribute('aria-hidden')
          }
        })
        
        // Force focus reset with multiple attempts
        document.body.focus()
        document.body.click()
        
        setTimeout(() => {
          if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).blur()
          }
          // Final forced interaction
          const event = new MouseEvent('click', { bubbles: true, cancelable: true })
          document.body.dispatchEvent(event)
        }, 100)
      }, 100)
    }
    onOpenChange(open)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (loading) {
      return
    }
    
    setLoading(true)
    setUploadingImage(false) // Reset upload state
    setError(null)

    // Add overall timeout for the entire form submission
    const timeoutId = setTimeout(() => {
        console.error("Form submission timeout after 60 seconds")
      setLoading(false)
      setUploadingImage(false)
      setError("Form submission timeout - please check your connection and try again")
    }, 60000) // 60 second timeout

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Nama kendaraan harus diisi")
      }
      if (!formData.type) {
        throw new Error("Tipe kendaraan harus dipilih")
      }
      if (!formData.brand.trim()) {
        throw new Error("Merek harus diisi")
      }

      // Validate pricing
      if (formData.has_all_in && (!formData.all_in_price || isNaN(Number(formData.all_in_price)) || Number(formData.all_in_price) <= 0)) {
        throw new Error("Harga All In harus berupa angka yang valid dan lebih dari 0")
      }
      if (formData.has_unit_only && (!formData.unit_only_price || isNaN(Number(formData.unit_only_price)) || Number(formData.unit_only_price) <= 0)) {
        throw new Error("Harga Unit Only harus berupa angka yang valid dan lebih dari 0")
      }

      let imageUrl = formData.image_url

      // Upload new image if selected
      if (selectedFile) {
        setUploadingImage(true)
        try {
          const newImageUrl = await uploadImage(selectedFile)
          
          // If this is an edit and we're replacing an image, the old one will be deleted by updateVehicle
          if (vehicle && formData.image_url && formData.image_url !== newImageUrl) {
            // Old image will be replaced
          }
          
          imageUrl = newImageUrl
        } catch (uploadError) {
          setUploadingImage(false)
          throw new Error(`Gagal mengupload foto: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
        }
        setUploadingImage(false)
      }

      // Prepare vehicle data for submission
      const vehicleData = {
        name: formData.name.trim(),
        type: formData.type,
        brand: formData.brand.trim(),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f),
        all_in_price: formData.has_all_in && formData.all_in_price ? Math.floor(Number(formData.all_in_price)) : 0,
        unit_only_price: formData.has_unit_only && formData.unit_only_price ? Math.floor(Number(formData.unit_only_price)) : 0,
        image_url: imageUrl || null,
        is_available: formData.is_available,
      }

      // Additional validation for numeric values
      if (vehicleData.all_in_price < 0 || vehicleData.all_in_price > 2147483647) {
        throw new Error("Harga All In terlalu besar. Maksimal 2,147,483,647")
      }
      if (vehicleData.unit_only_price < 0 || vehicleData.unit_only_price > 2147483647) {
        throw new Error("Harga Unit Only terlalu besar. Maksimal 2,147,483,647")
      }

      // Use admin hook for proper data management
      let result
      if (vehicle) {
        result = await updateVehicle(vehicle.id, vehicleData)
      } else {
        result = await addVehicle(vehicleData)
      }

      // Check if the operation was successful
      if (result && 'success' in result && !result.success) {
        throw new Error(result.error || "Failed to save vehicle")
      }

      // Success - close dialog and refresh data
      clearTimeout(timeoutId)
      onSuccess()
      handleDialogClose(false)
    } catch (error) {
      console.error("Form submission error:", error)
      clearTimeout(timeoutId)
      setError(error instanceof Error ? error.message : "Gagal menyimpan kendaraan")
    } finally {
      // Always ensure states are reset
      clearTimeout(timeoutId)
      setLoading(false)
      setUploadingImage(false)
    }
  }

  return (
    <Dialog 
      key={dialogKey}
      open={open} 
      onOpenChange={(open) => {
        if (!open) {
          // Immediate aggressive cleanup
          document.body.style.pointerEvents = ''
          document.documentElement.style.pointerEvents = ''
          document.body.focus()
          document.body.click()
        }
        handleDialogClose(open)
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? "Edit Kendaraan" : "Tambah Kendaraan Baru"}</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <Label>Foto Kendaraan {vehicle && "- Upload foto baru untuk mengganti yang lama"}</Label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative w-full h-80 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden group">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain group-hover:object-cover transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {vehicle && selectedFile && (
                    <div className="absolute bottom-3 left-3 bg-blue-500 text-white text-sm px-3 py-2 rounded-md shadow-lg">
                      Foto baru akan mengganti yang lama
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                      Hover untuk zoom
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full h-80 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-lg">Klik untuk upload foto</p>
                    <p className="text-sm text-gray-400 mt-1">PNG, JPG hingga 5MB</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex gap-2 mt-3">
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Ganti Foto
                  </Button>
                )}
                {!imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Pilih Foto
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nama Kendaraan</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Toyota Avanza 1.3 G"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipe Kendaraan</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Merek</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Toyota"
                required
              />
            </div>
          </div>

          {/* Pricing Section with Checkboxes */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Pengaturan Harga</Label>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="has_all_in"
                  checked={formData.has_all_in}
                  onCheckedChange={(checked) => {
                    setFormData({ 
                      ...formData, 
                      has_all_in: !!checked,
                      all_in_price: checked ? formData.all_in_price : ""
                    })
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor="has_all_in">Tersedia Paket All In</Label>
                  {formData.has_all_in && (
                    <Input
                      type="number"
                      value={formData.all_in_price}
                      onChange={(e) => setFormData({ ...formData, all_in_price: e.target.value })}
                      placeholder="650000"
                      className="mt-2"
                      required={formData.has_all_in}
                    />
                  )}
                  {!formData.has_all_in && (
                    <p className="text-sm text-gray-500 mt-1">Akan ditampilkan "Tidak Tersedia"</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="has_unit_only"
                  checked={formData.has_unit_only}
                  onCheckedChange={(checked) => {
                    setFormData({ 
                      ...formData, 
                      has_unit_only: !!checked,
                      unit_only_price: checked ? formData.unit_only_price : ""
                    })
                  }}
                />
                <div className="flex-1">
                  <Label htmlFor="has_unit_only">Tersedia Paket Unit Only</Label>
                  {formData.has_unit_only && (
                    <Input
                      type="number"
                      value={formData.unit_only_price}
                      onChange={(e) => setFormData({ ...formData, unit_only_price: e.target.value })}
                      placeholder="450000"
                      className="mt-2"
                      required={formData.has_unit_only}
                    />
                  )}
                  {!formData.has_unit_only && (
                    <p className="text-sm text-gray-500 mt-1">Akan ditampilkan "Tidak Tersedia"</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="features">Fitur (pisahkan dengan koma)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="7 Penumpang, AC, Audio System, Power Steering"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: !!checked })}
            />
            <Label htmlFor="is_available">Kendaraan tersedia untuk disewa</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700" 
              disabled={loading || uploadingImage}
            >
              {uploadingImage ? "Mengupload foto..." : loading ? "Menyimpan..." : vehicle ? "Update" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

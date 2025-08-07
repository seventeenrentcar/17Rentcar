"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import type { Vehicle } from "@/lib/types"

export function useAdminVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { admin, isAuthenticated, loading: authLoading } = useAdminAuth()

  useEffect(() => {
    // Wait for auth to be resolved before fetching
    if (authLoading) {
      return
    }
    
    if (!isAuthenticated || !admin) {
      console.log("Not authenticated, skipping vehicle fetch")
      setVehicles([])
      setLoading(false)
      return
    }

    fetchVehicles()
  }, [isAuthenticated, admin, authLoading])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching all vehicles for admin...")
      
      // Admin can see ALL vehicles, not just available ones
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching vehicles:", error)
        throw error
      }

      console.log(`Fetched ${data?.length || 0} vehicles`)
      setVehicles(data || [])
    } catch (err) {
      console.error("Failed to fetch vehicles:", err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Adding vehicle with data:", vehicleData)
      
      // Check authentication before making the request
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError || !session) {
        throw new Error("Authentication required - please login again")
      }
      
      const { data, error } = await supabase
        .from("vehicles")
        .insert([vehicleData])
        .select()
        .single()

      if (error) {
        console.error("Supabase insert error:", error)
        // Handle specific error types
        if (error.message.includes('duplicate key')) {
          throw new Error("Vehicle with this name already exists")
        } else if (error.message.includes('permission')) {
          throw new Error("Permission denied - please login again")
        } else {
          throw error
        }
      }

      console.log("Vehicle added successfully:", data)
      setVehicles(prev => [data, ...prev])
      return { success: true, data }
    } catch (error) {
      console.error("Error adding vehicle:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add vehicle"
      console.error("Detailed error:", errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    try {
      console.log("Updating vehicle:", id, "with data:", vehicleData)
      
      // Check authentication before making the request
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError || !session) {
        throw new Error("Authentication required - please login again")
      }
      
      // If we're updating with a new image, get the old image first
      let oldImageUrl = null
      if (vehicleData.image_url) {
        const { data: currentVehicle } = await supabase
          .from("vehicles")
          .select("image_url")
          .eq("id", id)
          .single()
        
        oldImageUrl = currentVehicle?.image_url
      }

      // Update the vehicle in database
      const { data, error } = await supabase
        .from("vehicles")
        .update(vehicleData)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Supabase update error:", error)
        // Handle specific error types
        if (error.message.includes('permission')) {
          throw new Error("Permission denied - please login again")
        } else if (error.message.includes('not found')) {
          throw new Error("Vehicle not found - it may have been deleted")
        } else {
          throw error
        }
      }

      // If we have a new image and there was an old image, delete the old one
      if (vehicleData.image_url && oldImageUrl && oldImageUrl !== vehicleData.image_url && oldImageUrl.includes('/vehicles/')) {
        try {
          // Extract filename from old URL
          const urlParts = oldImageUrl.split('/vehicles/')
          if (urlParts.length > 1) {
            const fileName = urlParts[1].split('?')[0] // Remove query parameters
            
            const { error: storageError } = await supabase.storage
              .from('vehicles')
              .remove([fileName])
            
            if (storageError) {
              console.warn("Could not delete old image from storage:", storageError)
              // Don't throw error here - vehicle is already updated
            } else {
              console.log("Successfully deleted old image:", fileName)
            }
          }
        } catch (imageError) {
          console.warn("Error deleting old image:", imageError)
          // Don't throw error here - vehicle is already updated
        }
      }

      console.log("Vehicle updated successfully:", data)
      setVehicles(prev => prev.map(v => v.id === id ? data : v))
      return { success: true, data }
    } catch (error) {
      console.error("Error updating vehicle:", error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to update vehicle" }
    }
  }

  const deleteVehicle = async (id: string) => {
    try {
      // First, get the vehicle data to check if it has an image
      const { data: vehicle, error: fetchError } = await supabase
        .from("vehicles")
        .select("image_url")
        .eq("id", id)
        .single()

      if (fetchError) throw fetchError

      // Delete the vehicle from database
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", id)

      if (error) throw error

      // If vehicle had an image, try to delete it from storage
      if (vehicle?.image_url && vehicle.image_url.includes('/vehicles/')) {
        try {
          // Extract filename from URL
          const urlParts = vehicle.image_url.split('/vehicles/')
          if (urlParts.length > 1) {
            const fileName = urlParts[1].split('?')[0] // Remove query parameters
            
            const { error: storageError } = await supabase.storage
              .from('vehicles')
              .remove([fileName])
            
            if (storageError) {
              console.warn("Could not delete image from storage:", storageError)
              // Don't throw error here - vehicle is already deleted
            }
          }
        } catch (imageError) {
          console.warn("Error deleting image:", imageError)
          // Don't throw error here - vehicle is already deleted
        }
      }

      setVehicles(prev => prev.filter(v => v.id !== id))
      return { success: true }
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      return { success: false, error: error instanceof Error ? error.message : "Failed to delete vehicle" }
    }
  }

  return { 
    vehicles, 
    loading: loading || authLoading, 
    error, 
    refetch: fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  }
}

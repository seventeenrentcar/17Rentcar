"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Vehicle } from "@/lib/types"

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVehicles()
  }, [])
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      
      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("Supabase not configured, using mock data")
        setVehicles([])
        return
      }

      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (err) {
      console.warn("Failed to fetch vehicles:", err)
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      setVehicles([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }

  return { vehicles, loading, error, refetch: fetchVehicles }
}

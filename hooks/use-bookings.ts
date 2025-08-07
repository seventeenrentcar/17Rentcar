"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Booking } from "@/lib/types"

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings")
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id: string, booking_status: string, payment_status?: string) => {
    try {
      const updateData: any = { booking_status }
      if (payment_status) {
        updateData.payment_status = payment_status
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", id)

      if (error) throw error
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id 
            ? { ...booking, ...updateData }
            : booking
        )
      )
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to update booking" 
      }
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id)

      if (error) throw error
      
      // Update local state
      setBookings(prev => prev.filter(booking => booking.id !== id))
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to delete booking" 
      }
    }
  }

  const createBooking = async (bookingData: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .single()

      if (error) throw error
      
      // Update local state
      setBookings(prev => [data, ...prev])
      
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to create booking" 
      }
    }
  }

  const updateBooking = async (id: string, bookingData: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(bookingData)
        .eq("id", id)
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .single()

      if (error) throw error
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? data : booking
        )
      )
      
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to update booking" 
      }
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
    deleteBooking,
    createBooking,
    updateBooking,
    refetch: fetchBookings
  }
}

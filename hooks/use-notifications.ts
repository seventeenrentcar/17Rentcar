"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Notification } from "@/lib/types"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }

  const createNotification = async (notificationData: Partial<Notification>) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([notificationData])
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setNotifications(prev => [data, ...prev])
      
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to create notification" 
      }
    }
  }

  const updateNotification = async (id: string, notificationData: Partial<Notification>) => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .update(notificationData)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? data : notification
        )
      )
      
      return { success: true, data }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to update notification" 
      }
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)

      if (error) throw error
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id))
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to delete notification" 
      }
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)

      if (error) throw error
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, is_read: true }
            : notification
        )
      )
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to mark as read" 
      }
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false)

      if (error) throw error
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      )
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to mark all as read" 
      }
    }
  }

  const deleteExpired = async () => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .lt("expires_at", new Date().toISOString())

      if (error) throw error
      
      // Refresh data
      await fetchNotifications()
      
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to delete expired notifications" 
      }
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    deleteExpired,
    refetch: fetchNotifications
  }
}

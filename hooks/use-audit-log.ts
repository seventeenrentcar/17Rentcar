"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { AuditTrail, AdminActivityLog } from "@/lib/types"

export function useAuditLog() {
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([])
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuditTrails = async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from("audit_trails")
        .select(`
          *,
          admin_profiles:changed_by(full_name, email)
        `)
        .order("changed_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to fetch audit trails")
    }
  }

  const fetchActivityLogs = async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select(`
          *,
          admin_profiles:admin_id(full_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Failed to fetch activity logs")
    }
  }

  const fetchAllLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [trails, activities] = await Promise.all([
        fetchAuditTrails(),
        fetchActivityLogs()
      ])
      
      setAuditTrails(trails)
      setActivityLogs(activities)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
    } finally {
      setLoading(false)
    }
  }

  const searchAuditTrails = async (filters: {
    table_name?: string
    action?: string
    date_from?: string
    date_to?: string
    admin_id?: string
    limit?: number
  }) => {
    try {
      let query = supabase
        .from("audit_trails")
        .select(`
          *,
          admin_profiles:changed_by(full_name, email)
        `)

      if (filters.table_name) {
        query = query.eq("table_name", filters.table_name)
      }
      
      if (filters.action) {
        query = query.eq("action", filters.action)
      }
      
      if (filters.admin_id) {
        query = query.eq("changed_by", filters.admin_id)
      }
      
      if (filters.date_from) {
        query = query.gte("changed_at", filters.date_from)
      }
      
      if (filters.date_to) {
        query = query.lte("changed_at", filters.date_to)
      }

      const { data, error } = await query
        .order("changed_at", { ascending: false })
        .limit(filters.limit || 100)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to search audit trails" 
      }
    }
  }

  const searchActivityLogs = async (filters: {
    action?: string
    resource_type?: string
    date_from?: string
    date_to?: string
    admin_id?: string
    limit?: number
  }) => {
    try {
      let query = supabase
        .from("admin_activity_logs")
        .select(`
          *,
          admin_profiles:admin_id(full_name, email)
        `)

      if (filters.action) {
        query = query.ilike("action", `%${filters.action}%`)
      }
      
      if (filters.resource_type) {
        query = query.eq("resource_type", filters.resource_type)
      }
      
      if (filters.admin_id) {
        query = query.eq("admin_id", filters.admin_id)
      }
      
      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from)
      }
      
      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to)
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(filters.limit || 100)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to search activity logs" 
      }
    }
  }

  const logActivity = async (activityData: {
    action: string
    resource_type?: string
    resource_id?: string
    details?: Record<string, any>
    ip_address?: string
    user_agent?: string
  }) => {
    try {
      // Get current admin ID from session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("No authenticated user")
      }

      const { error } = await supabase
        .from("admin_activity_logs")
        .insert([{
          admin_id: user.id,
          ...activityData
        }])

      if (error) throw error
      return { success: true }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to log activity" 
      }
    }
  }

  const getTableNames = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_trails")
        .select("table_name")
        .order("table_name")

      if (error) throw error
      
      const uniqueTableNames = [...new Set(data?.map(row => row.table_name) || [])]
      return { success: true, data: uniqueTableNames }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to get table names" 
      }
    }
  }

  const getResourceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select("resource_type")
        .not("resource_type", "is", null)
        .order("resource_type")

      if (error) throw error
      
      const uniqueResourceTypes = [...new Set(data?.map(row => row.resource_type) || [])]
      return { success: true, data: uniqueResourceTypes }
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : "Failed to get resource types" 
      }
    }
  }

  useEffect(() => {
    fetchAllLogs()
  }, [])

  return {
    auditTrails,
    activityLogs,
    loading,
    error,
    fetchAllLogs,
    searchAuditTrails,
    searchActivityLogs,
    logActivity,
    getTableNames,
    getResourceTypes,
    refetch: fetchAllLogs
  }
}

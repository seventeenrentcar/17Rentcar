"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { AdminProfile } from "@/lib/types"

interface AdminAuthContextValue {
  admin: AdminProfile | null
  loading: boolean
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkPermission: (permission: string) => boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const defaultContext: AdminAuthContextValue = {
  admin: null,
  loading: true,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false, error: "Context not initialized" }),
  logout: async () => {},
  checkPermission: () => false,
  hasPermission: () => false,
  hasRole: () => false,
}

const AdminAuthContext = createContext<AdminAuthContextValue>(defaultContext)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout
    
    // Set a longer timeout for session check
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn("Authentication check timed out after 15 seconds")
        setLoading(false)
        setSessionChecked(true)
      }
    }, 15000) // Increased to 15 seconds
    
    timeoutId = timeout
    
    async function checkSession() {
      try {
        console.log("Starting session check...")
        
        // First, try to get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          if (mounted) {
            setAdmin(null)
            setLoading(false)
            setSessionChecked(true)
          }
          return
        }

        if (sessionData.session?.user && mounted) {
          console.log("Session found, fetching admin profile...")
          await fetchAdminProfile(sessionData.session.user.id)
        } else {
          console.log("No session found")
          if (mounted) {
            setAdmin(null)
          }
        }
      } catch (error) {
        console.error("Session check error:", error)
        if (mounted) {
          setAdmin(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setSessionChecked(true)
          clearTimeout(timeoutId)
        }
      }
    }

    checkSession()

    // Listen for auth state changes with improved handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)
      
      if (!mounted) return
      
      // Handle different auth events
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("User signed in, fetching admin profile...")
        await fetchAdminProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out")
        setAdmin(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log("Token refreshed, verifying admin profile...")
        // Re-verify admin profile after token refresh
        await fetchAdminProfile(session.user.id)
      } else if (session?.user) {
        // Handle other events where we have a session
        await fetchAdminProfile(session.user.id)
      } else {
        // No session, clear admin
        setAdmin(null)
      }
      
      // Ensure loading is false after auth state changes
      if (sessionChecked) {
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const fetchAdminProfile = async (userId: string) => {
    try {
      console.log("Fetching admin profile for user:", userId)
      
      // Add a timeout for the database query
      const fetchPromise = supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", userId)
        .eq("is_active", true)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Admin profile fetch timeout")), 10000)
      )

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) {
        console.error("Error fetching admin profile:", error)
        if (error.code === 'PGRST116') {
          console.log("Admin profile not found - user is not an admin")
        } else if (error.message?.includes('timeout')) {
          console.error("Admin profile fetch timed out")
        }
        setAdmin(null)
        return
      }

      if (!data) {
        console.log("No admin profile data returned")
        setAdmin(null)
        return
      }

      console.log("Admin profile loaded:", data.email)
      setAdmin(data)
    } catch (error) {
      console.error("Error fetching admin profile:", error)
      setAdmin(null)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        return { success: false, error: error.message }
      }

      // Check if user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", data.user.id)
        .eq("is_active", true)
        .single()

      if (adminError || !adminData) {
        await supabase.auth.signOut()
        return { success: false, error: "Access denied: Admin privileges required" }
      }

      setAdmin(adminData)
      return { success: true }
    } catch (error) {
      return { success: false, error: "An unknown error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setAdmin(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const checkPermission = (permission: string) => {
    if (!admin || !admin.permissions) return false
    
    // Super admin has all permissions
    if (admin.role === "super_admin") return true
    
    // Check specific permission
    const permissionParts = permission.split(".")
    let current = admin.permissions
    
    for (const part of permissionParts) {
      if (typeof current !== "object" || current === null) return false
      current = current[part]
    }
    
    return Boolean(current)
  }

  const hasPermission = checkPermission
  const hasRole = (role: string) => admin?.role === role

  const value: AdminAuthContextValue = {
    admin,
    loading,
    isAuthenticated: !!admin,
    isLoading: loading,
    login,
    logout,
    checkPermission,
    hasPermission,
    hasRole,
  }

  return React.createElement(AdminAuthContext.Provider, { value }, children)
}

export const useAdminAuth = () => useContext(AdminAuthContext)

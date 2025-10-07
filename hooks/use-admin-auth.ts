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
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null)
  const [fetchRetryCount, setFetchRetryCount] = useState(0)
  const [currentFetchController, setCurrentFetchController] = useState<AbortController | null>(null)

  // Handle page visibility changes to prevent session issues during tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden
      
      // Simple approach: just track visibility, don't trigger auth operations
      // Let Supabase handle its own visibility logic
    }

    const handleFocusChange = () => {
      // Window focus tracking for tab visibility
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocusChange)
    window.addEventListener('blur', handleFocusChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocusChange)
      window.removeEventListener('blur', handleFocusChange)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout
    let authEventTimeout: NodeJS.Timeout
    
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
        // Check if logout is in progress
        if (localStorage.getItem('admin_logout_in_progress')) {
          if (mounted) {
            setAdmin(null)
            setLastFetchedUserId(null)
            setIsInitialized(true)
            setLoading(false)
            setSessionChecked(true)
          }
          return
        }
        
        // First, try to get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          if (mounted) {
            setAdmin(null)
            setLoading(false)
            setSessionChecked(true)
          }
          return
        }

        if (sessionData.session?.user && mounted) {
          setLastFetchedUserId(sessionData.session.user.id)
          await fetchAdminProfile(sessionData.session.user.id)
          // Note: fetchAdminProfile now handles setting isInitialized
        } else {
          if (mounted) {
            setAdmin(null)
            setLastFetchedUserId(null)
            setIsInitialized(true) // Mark as initialized even when no session
          }
        }
      } catch (error) {
        if (mounted) {
          setAdmin(null)
          setLastFetchedUserId(null)
          setIsInitialized(true) // Mark as initialized even on error
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

    // Listen for auth state changes with debounced handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      // Check if logout is in progress and skip processing
      if (localStorage.getItem('admin_logout_in_progress')) {
        return
      }
      
      // Clear any pending auth event processing
      if (authEventTimeout) {
        clearTimeout(authEventTimeout)
      }
      
      // Debounce auth events to prevent rapid-fire processing
      authEventTimeout = setTimeout(async () => {
        // Double-check logout flag after timeout
        if (localStorage.getItem('admin_logout_in_progress')) {
          return
        }
        
        // Prevent duplicate processing of the same user
        const currentUserId = session?.user?.id
        if (currentUserId && currentUserId === lastFetchedUserId && admin && event !== 'SIGNED_OUT') {
          return
        }
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          // Only process SIGNED_IN if we don't already have this user's admin profile
          if (!admin || admin.id !== session.user.id) {
            setLastFetchedUserId(session.user.id)
            await fetchAdminProfile(session.user.id)
          } else {
            setIsInitialized(true)
          }
        } else if (event === 'SIGNED_OUT') {
          setAdmin(null)
          setLastFetchedUserId(null)
          setIsInitialized(false)
          setFetchRetryCount(0)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Only re-verify admin profile if we don't already have admin data or it's a different user
          if (!admin || session.user.id !== lastFetchedUserId) {
            setLastFetchedUserId(session.user.id)
            await fetchAdminProfile(session.user.id)
          } else {
            setIsInitialized(true)
          }
        } else if (session?.user && event === 'INITIAL_SESSION' && !isInitialized) {
          // Handle initial session load only once
          setLastFetchedUserId(session.user.id)
          await fetchAdminProfile(session.user.id)
        } else if (!session && event !== 'INITIAL_SESSION' && event !== 'TOKEN_REFRESHED') {
          // No session, clear admin only if we're sure the session is gone
          setAdmin(null)
          setLastFetchedUserId(null)
          setIsInitialized(true)
          setFetchRetryCount(0)
        }
        
        // Ensure loading is false after auth state changes
        if (sessionChecked) {
          setLoading(false)
        }
      }, 300) // 300ms debounce for auth events
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      if (authEventTimeout) {
        clearTimeout(authEventTimeout)
      }
      // Cancel any ongoing fetch when component unmounts
      if (currentFetchController) {
        currentFetchController.abort()
      }
      subscription.unsubscribe()
    }
  }, []) // Removed dependencies to prevent recreation of auth listeners

  const fetchAdminProfile = async (userId: string) => {
    try {
      // Cancel any ongoing fetch request
      if (currentFetchController) {
        currentFetchController.abort()
      }
      
      // Skip if we're already fetching for the same user and have admin data
      if (admin && admin.id === userId) {
        setIsInitialized(true)
        return
      }
      
      // Prevent infinite retries
      if (fetchRetryCount >= 2) {
        setAdmin(null)
        setLastFetchedUserId(null)
        setIsInitialized(true)
        setFetchRetryCount(0)
        return
      }
      
      // Create new AbortController for this request
      const controller = new AbortController()
      setCurrentFetchController(controller)
      
      // Use shorter timeout (3 seconds) with immediate fallback
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 3000) // Reduced to 3 seconds for faster response
      
      try {
        const { data, error } = await supabase
          .from("admin_profiles")
          .select("*")
          .eq("id", userId)
          .eq("is_active", true)
          .abortSignal(controller.signal)
          .single()

        clearTimeout(timeoutId)
        setCurrentFetchController(null)

        if (error) {
          if (error.code === 'PGRST116') {
            // User exists in auth but not in admin_profiles - sign them out
            await supabase.auth.signOut()
          }
          setAdmin(null)
          setLastFetchedUserId(null)
          setIsInitialized(true)
          setFetchRetryCount(0)
          return
        }

        if (!data) {
          console.log("No admin profile data returned")
          setAdmin(null)
          setLastFetchedUserId(null)
          setIsInitialized(true)
          setFetchRetryCount(0)
          return
        }

        setAdmin(data)
        setLastFetchedUserId(userId)
        setIsInitialized(true)
        setFetchRetryCount(0)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        setCurrentFetchController(null)
        
        if (fetchError?.name === 'AbortError') {
          // Don't retry on abort - it was intentional
          if (fetchError.message?.includes('timeout')) {
            const newRetryCount = fetchRetryCount + 1
            setFetchRetryCount(newRetryCount)
            
            if (newRetryCount < 2) {
              // Retry after a very short delay
              setTimeout(() => {
                fetchAdminProfile(userId)
              }, 500)
            } else {
              setIsInitialized(true)
              setFetchRetryCount(0)
              supabase.auth.signOut()
            }
          } else {
            // Regular abort (not timeout), just mark as initialized
            setIsInitialized(true)
          }
        } else {
          setAdmin(null)
          setLastFetchedUserId(null)
          setIsInitialized(true)
          setFetchRetryCount(0)
        }
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error)
      setAdmin(null)
      setLastFetchedUserId(null)
      setIsInitialized(true)
      setFetchRetryCount(0)
      setCurrentFetchController(null)
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
      setLastFetchedUserId(data.user.id)
      return { success: true }
    } catch (error) {
      return { success: false, error: "An unknown error occurred" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Set a flag to prevent any auth state processing during logout
      const logoutFlag = 'admin_logout_in_progress'
      localStorage.setItem(logoutFlag, 'true')
      
      // Clear local state first
      setAdmin(null)
      setLastFetchedUserId(null)
      setIsInitialized(false)
      setFetchRetryCount(0)
      
      // Clear all Supabase storage
      localStorage.removeItem('supabase.auth.token')
      
      // Clear all possible Supabase keys
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      
      // Clear session storage
      sessionStorage.clear()
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' })
      
      // Remove logout flag after a delay
      setTimeout(() => {
        localStorage.removeItem(logoutFlag)
      }, 1000)
    } catch (error) {
      // Even if logout fails, clear local state and storage
      setAdmin(null)
      setLastFetchedUserId(null)
      setIsInitialized(false)
      setFetchRetryCount(0)
      
      // Clear storage anyway
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
      sessionStorage.clear()
      localStorage.removeItem('admin_logout_in_progress')
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

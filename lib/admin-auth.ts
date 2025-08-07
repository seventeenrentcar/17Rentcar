import { createAdminClient } from "./supabase"
import type { AdminProfile } from "./types"

export interface AdminLoginCredentials {
  email: string
  password: string
}

export interface AdminSession {
  admin: AdminProfile
  sessionToken: string
  expiresAt: Date
}

export class AdminAuthService {
  private static instance: AdminAuthService
  private adminClient = createAdminClient()

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService()
    }
    return AdminAuthService.instance
  }

  async loginAdmin(credentials: AdminLoginCredentials, ipAddress?: string, userAgent?: string): Promise<AdminSession> {
    try {
      // First authenticate with Supabase Auth
      const { data: authData, error: authError } = await this.adminClient.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (authError || !authData.user) {
        throw new Error("Invalid credentials")
      }

      // Check if user is an admin
      const { data: adminData, error: adminError } = await this.adminClient
        .from("admin_profiles")
        .select("*")
        .eq("id", authData.user.id)
        .eq("is_active", true)
        .single()

      if (adminError || !adminData) {
        // Sign out if not an admin
        await this.adminClient.auth.signOut()
        throw new Error("Access denied: Admin privileges required")
      }

      // Check if account is locked
      if (adminData.locked_until && new Date(adminData.locked_until) > new Date()) {
        await this.adminClient.auth.signOut()
        throw new Error("Account is temporarily locked due to multiple failed attempts")
      }

      // Create session token
      const sessionToken = this.generateSessionToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Store session in database
      const { error: sessionError } = await this.adminClient.from("admin_sessions").insert({
        admin_id: adminData.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
      })

      if (sessionError) {
        console.error("Failed to create admin session:", sessionError)
      }

      // Update login success
      await this.adminClient
        .from("admin_profiles")
        .update({
          login_attempts: 0,
          locked_until: null,
          last_login: new Date().toISOString(),
        })
        .eq("id", adminData.id)

      // Log the login activity
      await this.logActivity(adminData.id, "admin_login", "auth", adminData.id, {
        ip_address: ipAddress,
        user_agent: userAgent,
      })

      return {
        admin: adminData,
        sessionToken,
        expiresAt,
      }
    } catch (error) {
      // Handle failed login
      await this.handleFailedLogin(credentials.email)
      throw error
    }
  }

  async logoutAdmin(sessionToken: string): Promise<void> {
    try {
      // Get session info for logging
      const { data: sessionData } = await this.adminClient
        .from("admin_sessions")
        .select("admin_id")
        .eq("session_token", sessionToken)
        .single()

      // Delete the session
      await this.adminClient.from("admin_sessions").delete().eq("session_token", sessionToken)

      // Sign out from Supabase Auth
      await this.adminClient.auth.signOut()

      // Log the logout activity
      if (sessionData?.admin_id) {
        await this.logActivity(sessionData.admin_id, "admin_logout", "auth", sessionData.admin_id)
      }
    } catch (error) {
      console.error("Admin logout error:", error)
    }
  }

  async validateSession(sessionToken: string): Promise<AdminProfile | null> {
    try {
      const { data: sessionData, error } = await this.adminClient
        .from("admin_sessions")
        .select(
          `
          admin_id,
          expires_at,
          admin_profiles!inner (
            id,
            email,
            full_name,
            role,
            permissions,
            is_active,
            created_at
          )
        `,
        )
        .eq("session_token", sessionToken)
        .single()

      if (error || !sessionData) {
        return null
      }

      // Check if session is expired
      if (new Date(sessionData.expires_at) < new Date()) {
        await this.adminClient.from("admin_sessions").delete().eq("session_token", sessionToken)
        return null
      }

      // Update last activity
      await this.adminClient
        .from("admin_sessions")
        .update({ last_activity: new Date().toISOString() })
        .eq("session_token", sessionToken)

      return sessionData.admin_profiles as AdminProfile
    } catch (error) {
      console.error("Session validation error:", error)
      return null
    }
  }

  async checkPermission(adminId: string, permission: string): Promise<boolean> {
    try {
      const { data: adminData, error } = await this.adminClient
        .from("admin_profiles")
        .select("role, permissions")
        .eq("id", adminId)
        .eq("is_active", true)
        .single()

      if (error || !adminData) {
        return false
      }

      // Super admin has all permissions
      if (adminData.role === "super_admin") {
        return true
      }

      // Check specific permission
      const [resource, action] = permission.split(".")
      return adminData.permissions?.[resource]?.[action] === true
    } catch (error) {
      console.error("Permission check error:", error)
      return false
    }
  }

  async getAdminSessions(adminId: string): Promise<any[]> {
    try {
      const { data, error } = await this.adminClient
        .from("admin_sessions")
        .select("*")
        .eq("admin_id", adminId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching admin sessions:", error)
      return []
    }
  }

  async getActivityLog(adminId?: string, limit = 50): Promise<any[]> {
    try {
      let query = this.adminClient
        .from("admin_activity_log")
        .select(
          `
          *,
          admin_profiles!inner (
            email,
            full_name
          )
        `,
        )
        .order("created_at", { ascending: false })
        .limit(limit)

      if (adminId) {
        query = query.eq("admin_id", adminId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching activity log:", error)
      return []
    }
  }

  private async handleFailedLogin(email: string): Promise<void> {
    try {
      const { data: adminData } = await this.adminClient
        .from("admin_profiles")
        .select("id, login_attempts")
        .eq("email", email)
        .single()

      if (adminData) {
        const newAttempts = (adminData.login_attempts || 0) + 1
        const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null

        await this.adminClient
          .from("admin_profiles")
          .update({
            login_attempts: newAttempts,
            locked_until: lockedUntil?.toISOString(),
          })
          .eq("id", adminData.id)

        // Log the failed attempt
        await this.logActivity(adminData.id, "failed_login", "auth", adminData.id, {
          attempts: newAttempts,
        })
      }
    } catch (error) {
      console.error("Error handling failed login:", error)
    }
  }

  private async logActivity(
    adminId: string,
    action: string,
    resourceType?: string,
    resourceId?: string,
    details?: any,
  ): Promise<void> {
    try {
      await this.adminClient.from("admin_activity_log").insert({
        admin_id: adminId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || null,
      })
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  private generateSessionToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    )
  }
}

export const adminAuth = AdminAuthService.getInstance()

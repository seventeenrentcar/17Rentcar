"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Car,
  LogOut,
  BarChart3,
  Settings,
  Menu,
  Home,
  ChevronDown,
  X,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout, hasRole, checkPermission } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if the viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleSignOut = async () => {
    try {
      // Immediately set logout flag and redirect
      localStorage.setItem('admin_logout_in_progress', 'true')
      
      // Use router.replace for immediate navigation without page reload
      router.replace('/admin/login')
      
      // Call logout after navigation starts
      await logout()
    } catch (error) {
      // Ensure redirect even if logout fails
      router.replace('/admin/login')
    }
  }
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
      current: pathname === "/admin/dashboard",
      permission: "admin", // Basic admin permission - all admins should see dashboard
    },
    {
      name: "Kelola Kendaraan",
      href: "/admin/vehicles",
      icon: Car,
      current: pathname === "/admin/vehicles",
      permission: "vehicles.read",
    },
    {
      name: "Kelola Kontak",
      href: "/admin/contact",
      icon: MessageSquare,
      current: pathname === "/admin/contact",
      permission: "content.read",
    },
    {
      name: "Kelola Akun",
      href: "/admin/account",
      icon: Settings,
      current: pathname === "/admin/account",
      permission: "admin", // All admins should be able to manage their own account
    },
  ]

  const visibleNavigation = navigation.filter((item) => {
    // Dashboard and Account Management should always be visible for any logged-in admin
    if (item.name === "Dashboard" || item.name === "Kelola Akun") return true
    return checkPermission(item.permission)
  })

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-red-600/10 to-pink-600/10 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-2xl"
        />
      </div>

      {/* Mobile Sidebar Header with Close Button */}
      {isMobile && (
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-700/50 relative z-10">
          <Link href="/" className="flex items-center space-x-2 group" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              17rentcar
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Desktop Logo */}
      {!isMobile && (
        <div className="flex h-16 items-center px-6 border-b border-gray-700/50 relative z-10">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200">
              17rentcar
            </span>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
        <div className="space-y-1">
          {visibleNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                item.current
                  ? "bg-red-50 text-red-700 border-r-2 border-red-600"
                  : "text-gray-300 hover:bg-gray-700/20 hover:text-gray-50"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  item.current ? "text-red-600" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {item.name}
            </Link>
          ))}
        </div>

        <Separator className="my-6 bg-gray-700/50" />

        {/* Quick Actions */}
        <div className="space-y-1 relative z-10">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</p>
          <Link
            href="/"
            className="group flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-700/20 hover:text-gray-50 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <Home className="mr-3 h-4 w-4 text-gray-500 group-hover:text-gray-300" />
            Lihat Website
          </Link>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-700/50 relative z-10">        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" />            <AvatarFallback className="bg-red-100 text-red-700 text-xs font-semibold">
              {admin?.full_name?.charAt(0) || admin?.email?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-50 truncate">{admin?.full_name || admin?.email}</p>
            <div className="flex items-center space-x-1">
              {hasRole("super_admin") && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                  Super Admin
                </Badge>
              )}
              {admin?.role === "admin" && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger className="hidden">Open Menu</SheetTrigger>
        <SheetContent side="left" className="p-0 w-full max-w-[280px] sm:w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white shadow-xl border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {navigation.find((item) => item.current)?.name || "Admin Panel"}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Menu */}
              <DropdownMenu>                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-2 sm:px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-red-100 text-red-700 text-sm font-semibold">
                        {admin?.full_name?.charAt(0) || admin?.email?.charAt(0) || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{admin?.full_name || admin?.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{admin?.role}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-full overflow-x-hidden"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

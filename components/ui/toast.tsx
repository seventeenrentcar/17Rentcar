"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"

export interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
}

interface ToastProviderProps {
  children: React.ReactNode
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void
  hideToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove toast
    setTimeout(() => {
      hideToast(id)
    }, newToast.duration)
  }

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getColors = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`
                max-w-md p-4 rounded-lg border shadow-lg
                ${getColors(toast.type)}
              `}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getIcon(toast.type)}
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="font-medium">{toast.title}</h4>
                  {toast.message && (
                    <p className="mt-1 text-sm opacity-90">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => hideToast(toast.id)}
                  className="ml-3 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

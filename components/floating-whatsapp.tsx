"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useContactInfo } from "@/hooks/use-contact-info"

// WhatsApp Logo SVG Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
  </svg>
)

export function FloatingWhatsApp() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { contactInfo } = useContactInfo()

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Halo Admin 17rentcar! Saya ingin bertanya tentang layanan sewa mobil Anda."
    )
    // Use dynamic WhatsApp number from contact info, fallback to default
    const phoneNumber = contactInfo?.whatsapp ? 
      `62${contactInfo.whatsapp.replace(/^0/, '')}` : // Convert 08xxx to 628xxx
      "6287817090619"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -50, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -50, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-xs"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">17rentcar</p>
                  <p className="text-xs text-green-500">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Halo! Ada yang bisa kami bantu? Tanyakan tentang sewa mobil atau reservasi Anda.
            </p>
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Mulai Chat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:shadow-3xl group relative overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: "60px",
          height: "60px",
        }}
      >
        {/* Ripple effect */}
        <div className="absolute inset-0 bg-green-400 rounded-full opacity-30 animate-ping" />
        
        {/* Icon */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <WhatsAppIcon className="w-7 h-7" />
        </div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
        
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      </motion.button>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, MessageCircle, X } from "lucide-react"
import { motion } from "framer-motion"
import { useContactInfo } from "@/hooks/use-contact-info"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { contactInfo } = useContactInfo()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20)
      }
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Halo, saya ingin bertanya tentang layanan sewa mobil 17rentcar")
    const phoneNumber = contactInfo?.whatsapp ? 
      `62${contactInfo.whatsapp.replace(/^0/, '')}` : // Convert 08xxx to 628xxx
      "6289504796894"
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
    }
  }
    const navItems = [
    { name: "Beranda", href: "/" },
    { name: "Katalog Mobil", href: "/catalog" },
    { name: "Tentang Kami", href: "/about" },
    { name: "Testimoni", href: "/testimonials" },
    { name: "Kontak", href: "/contact" },
  ]
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5" 
          : "bg-white/70 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group z-20">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
            >
              <span className="text-red-600 drop-shadow-sm">17</span>
              <span className="text-gray-900">rentcar</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative text-gray-700 hover:text-red-600 transition-colors font-medium group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Contact Button - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden lg:block"
          >
            <Button
              onClick={handleWhatsAppContact}
              className="relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <span className="relative z-10 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Hubungi Kami</span>
                <span className="sm:hidden">Hubungi</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </motion.div>
          
          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden flex items-center justify-center p-2 rounded-md focus:outline-none z-20"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6 text-gray-800" />
              </Button>
            </SheetTrigger>            <SheetContent 
              side="right" 
              className="w-full sm:max-w-sm bg-white/95 backdrop-blur-xl border-l border-white/20 p-0 [&>button]:hidden"
            >
              <div className="flex flex-col h-full">                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200/50 relative">
                  <Link 
                    href="/" 
                    className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-red-600 drop-shadow-sm">17</span>
                    <span className="text-gray-900">rentcar</span>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center justify-center p-2 rounded-md focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6 text-gray-800" />
                  </Button>
                </div>

                <nav className="flex-1 py-6 md:py-8 overflow-y-auto px-4">
                  <div className="space-y-3">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex w-full items-center text-lg font-medium text-gray-700 hover:text-red-600 transition-colors py-3 px-2 rounded-md hover:bg-red-50"
                        >
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                <div className="p-4 md:p-6 border-t border-gray-200/50 mt-auto">
                  <Button
                    onClick={() => {
                      handleWhatsAppContact()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-full font-medium shadow-md flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Hubungi Kami
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

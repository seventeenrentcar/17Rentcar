"use client"

import { motion } from "framer-motion"
import { MapPin, Phone, Mail, Clock, MessageCircle, Instagram, Facebook, Twitter } from "lucide-react"
import Link from "next/link"
import { useContactInfo, formatPhoneNumber } from "@/hooks/use-contact-info"

export function Footer() {
  const { contactInfo } = useContactInfo()

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Halo, saya ingin bertanya tentang layanan sewa mobil 17rentcar")
    const phoneNumber = contactInfo?.whatsapp ? 
      `62${contactInfo.whatsapp.replace(/^0/, '')}` : // Convert 08xxx to 628xxx
      "6289504796894"
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
  }

  const footerLinks = {
    layanan: [
      { name: "Sewa Harian", href: "/catalog" },
      { name: "Sewa Bulanan", href: "/catalog" },
      { name: "Antar Jemput", href: "#contact" },
      { name: "Driver Service", href: "#contact" },
    ],
    perusahaan: [
      { name: "Tentang Kami", href: "#about" },
      { name: "Layanan", href: "#services" },
      { name: "Testimoni", href: "#testimonials" },
      { name: "Kontak", href: "#contact" },
    ],
    bantuan: [
      { name: "FAQ", href: "#faq" },
      { name: "Syarat & Ketentuan", href: "#" },
      { name: "Kebijakan Privasi", href: "#" },
      { name: "Panduan Booking", href: "#" },
    ],
  }

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="mb-6">
                  <div className="text-3xl font-bold mb-4">
                    <span className="text-red-500">17</span>
                    <span className="text-white">rentcar</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    Layanan sewa mobil terpercaya di Bandung dengan komitmen memberikan pengalaman perjalanan yang
                    nyaman dan aman untuk setiap pelanggan.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleWhatsAppContact}
                    className="bg-green-600 hover:bg-green-700 p-3 rounded-full transition-colors shadow-lg"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors shadow-lg"
                  >
                    <Facebook className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-pink-600 hover:bg-pink-700 p-3 rounded-full transition-colors shadow-lg"
                  >
                    <Instagram className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-sky-600 hover:bg-sky-700 p-3 rounded-full transition-colors shadow-lg"
                  >
                    <Twitter className="h-5 w-5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {Object.entries(footerLinks).map(([category, links], index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg font-bold mb-4 text-white capitalize">
                      {category.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <ul className="space-y-3">
                      {links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link href={link.href} className="text-gray-300 hover:text-red-400 transition-colors text-sm">
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-bold mb-6 text-white">Kontak Kami</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm">Jl. Kembar Baru No.20, Cigereleng</p>
                      <p className="text-gray-400 text-xs">Kec. Regol, Kota Bandung, Jawa Barat 40253</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm">
                        {contactInfo?.phone ? formatPhoneNumber(contactInfo.phone) : "+62 895-0479-6894"}
                      </p>
                      <p className="text-gray-400 text-xs">Telepon & WhatsApp</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm">
                        {contactInfo?.email || "innomardia@gmail.com"}
                      </p>
                      <p className="text-gray-400 text-xs">Email resmi</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm">24 Jam Setiap Hari</p>
                      <p className="text-gray-400 text-xs">Siap melayani Anda</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-gray-400 text-sm mb-4 md:mb-0"
              >
                © 2024 17rentcar. Semua hak cipta dilindungi.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center space-x-6"
              >
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Syarat & Ketentuan
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Kebijakan Privasi
                </Link>
                <div className="flex items-center text-gray-400 text-sm">
                  <span>Made with</span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    className="text-red-500 mx-1"
                  >
                    ♥
                  </motion.span>
                  <span>in Bandung</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

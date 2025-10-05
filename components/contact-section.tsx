"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, MessageCircle, ArrowRight } from "lucide-react"
import { useContactInfo, formatPhoneNumber } from "@/hooks/use-contact-info"

export function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { contactInfo: dbContactInfo } = useContactInfo()

  // Use dynamic contact info or fallback to default
  const contactInfo = [
    {
      icon: MapPin,
      title: "Lokasi Kami",
      content: "Jl. Kembar Baru No.20, Cigereleng",
      description: "Kec. Regol, Kota Bandung, Jawa Barat 40253",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Phone,
      title: "Telepon",
      content: dbContactInfo?.phone ? formatPhoneNumber(dbContactInfo.phone) : "+62 895-0479-6894",
      description: "Hubungi kami untuk informasi dan pemesanan",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Mail,
      title: "Email",
      content: dbContactInfo?.email || "17rentcarr@gmail.com",
      description: "Kirim pertanyaan atau saran melalui email",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Jam Operasional",
      content: "24 Jam Setiap Hari",
      description: "Siap melayani kapan saja Anda membutuhkan",
      color: "from-orange-500 to-orange-600",
    },
  ]

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Halo, saya ingin bertanya tentang layanan sewa mobil 17rentcar")
    const phoneNumber = dbContactInfo?.whatsapp ? 
      `62${dbContactInfo.whatsapp.replace(/^0/, '')}` : // Convert 08xxx to 628xxx
      "6289504796894"
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
    }
  }

  const handleEmailContact = () => {
    const email = dbContactInfo?.email || "17rentcarr@gmail.com"
    if (typeof window !== "undefined") {
      window.open(`mailto:${email}?subject=Pertanyaan tentang Sewa Mobil`, "_blank")
    }
  }

  const handlePhoneContact = () => {
    const phone = dbContactInfo?.phone ? 
      `+62${dbContactInfo.phone.substring(1)}` : // Convert 08xxx to +628xxx for tel: link
      "+6289504796894"
    if (typeof window !== "undefined") {
      window.open(`tel:${phone}`, "_blank")
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 28,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-red-100/30 to-pink-100/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 24,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hubungi <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Kami</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tim customer service kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami kapan saja.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <Card className="bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                <CardContent className="p-6 text-center">
                  <div
                    className={`bg-gradient-to-br ${info.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <info.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-red-600 font-semibold mb-2">{info.content}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{info.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>        {/* Office Location Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}          className="bg-white/70 backdrop-blur-lg rounded-3xl p-4 border border-white/20 shadow-xl"
        >
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13743.838604693534!2d107.61055532918728!3d-6.940201154682213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e88fc13ac3ed%3A0x79d4cb4b017ab88a!2sJl.%20Kembar%20Baru%20No.20%2C%20Cigereleng%2C%20Kec.%20Regol%2C%20Kota%20Bandung%2C%20Jawa%20Barat%2040253!5e0!3m2!1sen!2sid!4v1750358405501!5m2!1sen!2sid" 
              width="100%" 
              height="400" 
              style={{border:0}} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

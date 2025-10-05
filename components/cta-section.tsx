"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight } from "lucide-react"
import { useContactInfo } from "@/hooks/use-contact-info"

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { contactInfo } = useContactInfo()
  
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Halo, saya ingin memesan mobil rental dari 17rentcar")
    const phoneNumber = contactInfo?.whatsapp ? 
      `62${contactInfo.whatsapp.replace(/^0/, '')}` : // Convert 08xxx to 628xxx
      "6289504796894"
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
  }

  return (
    <section className="py-20 relative overflow-hidden" ref={ref}>
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        {/* Animated Background Elements */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Glass Morphism Overlay */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Siap Memulai
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Perjalanan Anda?
            </span>
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
            Hubungi kami sekarang untuk mendapatkan penawaran terbaik dan booking mobil impian Anda dengan mudah dan
            cepat.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              onClick={handleWhatsAppContact}
              className="bg-white/20 backdrop-blur-lg text-white hover:bg-white/30 border border-white/30 px-12 py-4 text-lg rounded-full shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="flex items-center">
                <MessageCircle className="mr-3 h-6 w-6" />
                WhatsApp Sekarang
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16"
          >
            {[
              { number: "500+", label: "Pelanggan Puas" },
              { number: "50+", label: "Armada Tersedia" },
              { number: "24/7", label: "Layanan Siaga" },
              { number: "5★", label: "Rating Terbaik" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-4 h-4 bg-white/30 rounded-full"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-6 h-6 bg-white/20 rounded-full"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </section>
  )
}

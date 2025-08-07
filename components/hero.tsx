"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageCircle, ArrowRight, Star, Shield, Clock } from "lucide-react"
import { useContactInfo } from "@/hooks/use-contact-info"

export function Hero() {
  const { contactInfo } = useContactInfo()

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Halo, saya ingin bertanya tentang layanan sewa mobil 17rentcar")
    const phoneNumber = contactInfo?.whatsapp ? 
      `62${contactInfo.whatsapp.replace(/^0/, '')}` : // Convert 08xxx to 628xxx
      "6287817090619"
    if (typeof window !== "undefined") {
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
    }
  }
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-16 sm:pt-20 md:pt-0">
      {/* Animated Background Elements - Optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -25, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 sm:right-20 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-gradient-to-br from-red-100/40 to-pink-100/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 sm:w-52 md:w-64 h-40 sm:h-52 md:h-64 bg-gradient-to-br from-yellow-100/30 to-orange-100/30 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Particles - Responsive with fewer particles on mobile */}
      {[...Array(window.innerWidth < 768 ? 3 : 6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 sm:w-2 h-1.5 sm:h-2 bg-red-400/30 rounded-full"
          animate={{
            x: [0, Math.random() * 60 - 30],
            y: [0, Math.random() * 60 - 30],
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
        />
      ))}

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 sm:mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Sewa Mobil Terpercaya di{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Bandung</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
              Nikmati perjalanan nyaman dengan armada berkualitas, driver berpengalaman, dan pelayanan terbaik untuk
              setiap kebutuhan transportasi Anda.
            </p>
          </motion.div>

          {/* CTA Buttons - Stacked on mobile, side by side on larger screens */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-12"
          >
            <Button
              size="lg"
              onClick={handleWhatsAppContact}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
            >
              <span className="flex items-center justify-center">
                <MessageCircle className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                Hubungi Sekarang
                <ArrowRight className="ml-2 sm:ml-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>   
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <a href="#about">
                <span className="flex items-center justify-center">
                  Pelajari Lebih Lanjut
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </a>
            </Button>
          </motion.div>

          {/* Features - Single column on mobile, three columns on larger screens */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Star,
                title: "Rating 5 Bintang",
                description: "Kepuasan pelanggan terjamin",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Asuransi Lengkap",
                description: "Perlindungan menyeluruh",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Clock,
                title: "Layanan 24/7",
                description: "Siap melayani kapan saja",
                color: "from-blue-500 to-cyan-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="group"
              >
                <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div
                    className={`bg-gradient-to-r ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

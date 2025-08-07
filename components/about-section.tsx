"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Shield, Award, Users, Clock, Car, Heart } from "lucide-react"

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: Shield,
      title: "Keamanan Terjamin",
      description: "Semua kendaraan diasuransikan dan dalam kondisi prima untuk keamanan perjalanan Anda.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Award,
      title: "Kualitas Terbaik",
      description: "Armada terawat dengan standar kualitas tinggi dan perawatan rutin berkala.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      title: "Pelayanan Profesional",
      description: "Tim berpengalaman siap membantu kebutuhan transportasi Anda dengan pelayanan terbaik.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: "Fleksibel 24/7",
      description: "Layanan tersedia kapan saja sesuai kebutuhan dengan sistem booking yang mudah.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Car,
      title: "Armada Lengkap",
      description: "Berbagai pilihan kendaraan dari ekonomis hingga premium untuk semua kebutuhan.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Heart,
      title: "Kepuasan Pelanggan",
      description: "Komitmen kami adalah kepuasan dan kenyamanan setiap pelanggan dalam setiap perjalanan.",
      color: "from-pink-500 to-pink-600",
    },
  ]
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-red-100/50 to-pink-100/50 rounded-full blur-3xl"
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
            Tentang{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              <span className="text-red-600">17</span>rentcar
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Dengan pengalaman bertahun-tahun dalam industri rental mobil, kami berkomitmen memberikan layanan terbaik
            untuk setiap perjalanan Anda di Bandung dan sekitarnya.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full">
                <div
                  className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">Siap Melayani Perjalanan Anda</h3>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Dari perjalanan bisnis hingga liburan keluarga, kami menyediakan solusi transportasi yang tepat untuk
                setiap kebutuhan Anda.
              </p>
            </div>

            {/* Decorative elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute -top-4 -right-4 w-24 h-24 border-2 border-white/20 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-white/20 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

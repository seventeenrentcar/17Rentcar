"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Car, MapPin, Headphones, CreditCard, Calendar, Shield } from "lucide-react"

export function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const services = [
    {
      icon: Car,
      title: "Sewa Harian",
      description: "Rental mobil dengan sistem harian, cocok untuk perjalanan singkat dalam kota.",
      features: ["Driver berpengalaman", "BBM included", "Asuransi lengkap"],
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      icon: Calendar,
      title: "Sewa Bulanan",
      description: "Paket sewa bulanan dengan harga spesial untuk kebutuhan jangka panjang.",
      features: ["Harga ekonomis", "Maintenance included", "Fleksibilitas tinggi"],
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
    },
    {
      icon: MapPin,
      title: "Layanan Antar Jemput",
      description: "Layanan antar jemput ke lokasi yang Anda inginkan di area Bandung.",
      features: ["Pickup gratis", "Tepat waktu", "Area coverage luas"],
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
    {
      icon: Shield,
      title: "Asuransi Komprehensif",
      description: "Perlindungan menyeluruh untuk keamanan dan ketenangan pikiran Anda.",
      features: ["All risk coverage", "24/7 assistance", "Claim mudah"],
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
    },
    {
      icon: Headphones,
      title: "Customer Support",
      description: "Tim customer service yang siap membantu Anda kapan saja dibutuhkan.",
      features: ["Respon cepat", "Solusi terbaik", "Layanan ramah"],
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100",
    },
    {
      icon: CreditCard,
      title: "Pembayaran Mudah",
      description: "Berbagai metode pembayaran yang mudah dan aman untuk kemudahan Anda.",
      features: ["Transfer bank", "E-wallet", "Cash on delivery"],
      color: "from-indigo-500 to-indigo-600",
      bgColor: "from-indigo-50 to-indigo-100",
    },
  ]
  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden" ref={ref}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl"
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
            Layanan{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Terbaik</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kami menyediakan berbagai layanan rental mobil yang disesuaikan dengan kebutuhan dan budget Anda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 h-full">
                <div
                  className={`bg-gradient-to-br ${service.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <service.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3 shadow-sm`}></div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

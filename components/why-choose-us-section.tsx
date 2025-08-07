"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { CheckCircle } from "lucide-react"

export function WhyChooseUsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const reasons = [
    "Armada lengkap dan terawat dengan berbagai pilihan kendaraan",
    "Driver berpengalaman dan berlisensi resmi",
    "Harga transparan tanpa biaya tersembunyi",
    "Asuransi komprehensif untuk keamanan perjalanan",
    "Maintenance rutin untuk performa optimal kendaraan",
  ]

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Mengapa Memilih{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">17rentcar?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Kami berkomitmen memberikan pengalaman rental mobil terbaik dengan standar pelayanan yang tinggi dan
              kepuasan pelanggan sebagai prioritas utama.
            </p>

            <div className="space-y-4">
              {reasons.map((reason, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{reason}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-3xl p-8 text-white">
              <h3 className="text-3xl font-bold mb-6">Kepuasan Pelanggan</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">98%</div>
                  <div className="text-red-100">Tingkat Kepuasan</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-red-100">Pelanggan Setia</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">5 Tahun</div>
                  <div className="text-red-100">Pengalaman</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-red-100">Support</div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-red-300 rounded-full opacity-30"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Star, Quote, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Pengusaha",
      content:
        "Pelayanan sangat memuaskan! Mobil bersih, driver ramah, dan harga sangat terjangkau. Sudah beberapa kali menggunakan jasa 17rentcar untuk keperluan bisnis.",
      rating: 5,
      avatar: null, // Force fallback to User icon
    },
    {
      name: "Sari Dewi",
      role: "Ibu Rumah Tangga",
      content:
        "Sangat membantu untuk acara keluarga. Proses booking mudah, mobil tepat waktu, dan driver sangat profesional. Recommended banget!",
      rating: 5,
      avatar: null, // Force fallback to User icon
    },
    {
      name: "Ahmad Rizki",
      role: "Mahasiswa",
      content:
        "Harga student-friendly dan pelayanan prima. Cocok untuk mahasiswa yang butuh transportasi reliable dengan budget terbatas.",
      rating: 5,
      avatar: null, // Force fallback to User icon
    },
    {
      name: "Maya Putri",
      role: "Karyawan Swasta",
      content:
        "Driver sangat berpengalaman dan mengenal rute dengan baik. Perjalanan jadi lebih nyaman dan efisien. Terima kasih 17rentcar!",
      rating: 5,
      avatar: null, // Force fallback to User icon
    },
    {
      name: "Dedi Kurniawan",
      role: "Wiraswasta",
      content:
        "Mobil selalu dalam kondisi prima dan bersih. Pelayanan customer service juga sangat responsif. Pasti akan menggunakan lagi!",
      rating: 5,
      avatar: null, // Force fallback to User icon
    },
    {
      name: "Rina Marlina",
      role: "Guru",
      content:
        "Sangat puas dengan layanan antar jemput. Tepat waktu dan driver sangat ramah. Cocok untuk perjalanan keluarga.",
      rating: 5,
      avatar: null, // Force fallback to User icon
    },
  ]
  return (
    <section
      className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
      ref={ref}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 22,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-32 left-32 w-72 h-72 bg-gradient-to-br from-yellow-100/40 to-orange-100/40 rounded-full blur-3xl"
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
            Kata{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">Pelanggan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kepuasan pelanggan adalah prioritas utama kami. Simak testimoni dari pelanggan yang telah merasakan layanan
            terbaik 17rentcar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 relative h-full">
                <Quote className="h-8 w-8 text-red-600 opacity-20 absolute top-6 right-6" />

                <div className="flex items-center mb-6">
                  <Avatar className="w-14 h-14 mr-4 ring-2 ring-red-100">
                    <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed italic">&quot;{testimonial.content}&quot;</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

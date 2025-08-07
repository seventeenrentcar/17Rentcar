import dynamic from "next/dynamic"

// Dynamic imports for components that use framer-motion
const Header = dynamic(() => import("@/components/header").then(mod => ({ default: mod.Header })), {
  ssr: false
})
const TestimonialsSection = dynamic(() => import("@/components/testimonials-section").then(mod => ({ default: mod.TestimonialsSection })), {
  ssr: false
})
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  ssr: false
})

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="pt-20 md:pt-24 pb-12 md:pb-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <TestimonialsSection />
      </div>
      <Footer />
    </div>
  )
}

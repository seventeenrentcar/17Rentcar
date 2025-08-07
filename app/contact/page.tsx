import dynamic from "next/dynamic"

// Dynamic imports for components that use framer-motion
const Header = dynamic(() => import("@/components/header").then(mod => ({ default: mod.Header })), {
  ssr: false
})
const ContactSection = dynamic(() => import("@/components/contact-section").then(mod => ({ default: mod.ContactSection })), {
  ssr: false
})
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  ssr: false
})

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      
      {/* Removed horizontal padding and max-width to allow full-width gradient background */}
      <div className="pt-20 md:pt-24 pb-12 md:pb-16">
        <ContactSection />
      </div>
      
      <Footer />
    </div>
  )
}

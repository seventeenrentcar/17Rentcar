import dynamic from "next/dynamic"

// Dynamic imports for components that use framer-motion
const Header = dynamic(() => import("@/components/header").then(mod => ({ default: mod.Header })), {
  ssr: false
})
const Hero = dynamic(() => import("@/components/hero").then(mod => ({ default: mod.Hero })), {
  ssr: false
})
const AboutSection = dynamic(() => import("@/components/about-section").then(mod => ({ default: mod.AboutSection })), {
  ssr: false
})
const ServicesSection = dynamic(() => import("@/components/services-section").then(mod => ({ default: mod.ServicesSection })), {
  ssr: false
})
const FeaturedVehicles = dynamic(() => import("@/components/featured-vehicles").then(mod => ({ default: mod.FeaturedVehicles })), {
  ssr: false
})
const TestimonialsSection = dynamic(() => import("@/components/testimonials-section").then(mod => ({ default: mod.TestimonialsSection })), {
  ssr: false
})
const WhyChooseUsSection = dynamic(() => import("@/components/why-choose-us-section").then(mod => ({ default: mod.WhyChooseUsSection })), {
  ssr: false
})
const CTASection = dynamic(() => import("@/components/cta-section").then(mod => ({ default: mod.CTASection })), {
  ssr: false
})
const ContactSection = dynamic(() => import("@/components/contact-section").then(mod => ({ default: mod.ContactSection })), {
  ssr: false
})
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  ssr: false
})

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="w-full">
        <Hero />
        <FeaturedVehicles />
        <AboutSection />
        <ServicesSection />
        <WhyChooseUsSection />
        <TestimonialsSection />
        <CTASection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  )
}

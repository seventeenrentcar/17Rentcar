import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import Link from "next/link"

// Dynamic imports for components that use framer-motion
const Header = dynamic(() => import("@/components/header").then(mod => ({ default: mod.Header })), {
  ssr: false
})
const AboutSection = dynamic(() => import("@/components/about-section").then(mod => ({ default: mod.AboutSection })), {
  ssr: false
})
const ServicesSection = dynamic(() => import("@/components/services-section").then(mod => ({ default: mod.ServicesSection })), {
  ssr: false
})
const WhyChooseUsSection = dynamic(() => import("@/components/why-choose-us-section").then(mod => ({ default: mod.WhyChooseUsSection })), {
  ssr: false
})
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  ssr: false
})

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Sections */}
      <div className="pt-24 pb-16">
        <AboutSection />
      </div>
      
      <div className="flex justify-center py-4">
        <Button variant="ghost" asChild className="rounded-full animate-bounce">
          <Link href="#services" scroll={false}>
            <ArrowDown className="h-6 w-6" />
          </Link>
        </Button>
      </div>
      
      <div id="services" className="scroll-mt-28">
        <ServicesSection />
      </div>
      
      <div className="flex justify-center py-4">
        <Button variant="ghost" asChild className="rounded-full animate-bounce">
          <Link href="#why-choose-us" scroll={false}>
            <ArrowDown className="h-6 w-6" />
          </Link>
        </Button>
      </div>
      
      <div id="why-choose-us" className="scroll-mt-28">
        <WhyChooseUsSection />
      </div>
      
      <Footer />
    </div>
  )
}

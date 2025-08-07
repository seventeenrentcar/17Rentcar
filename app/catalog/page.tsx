import dynamic from "next/dynamic"

// Dynamic imports for components that use framer-motion
const Header = dynamic(() => import("@/components/header").then(mod => ({ default: mod.Header })), {
  ssr: false
})
const VehicleCatalog = dynamic(() => import("@/components/vehicle-catalog").then(mod => ({ default: mod.VehicleCatalog })), {
  ssr: false
})
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), {
  ssr: false
})

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <div className="pt-16 md:pt-20">
        <VehicleCatalog />
      </div>
      <Footer />
    </div>
  )
}

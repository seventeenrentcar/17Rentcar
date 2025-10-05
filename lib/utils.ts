import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function buildWhatsAppMessage(
  vehicle: {
    name: string
    all_in_price: number
  },
  customerName = "",
  bookingDate = "",
  priceType = "All In",
): string {
  const message = `Halo Admin 17rentcar!

Nama: ${customerName || "Belum diisi"}

Saya ingin booking mobil:
• Kendaraan: ${vehicle.name}
• Paket: ${priceType}
• Harga: ${formatCurrency(vehicle.all_in_price)}
• ${bookingDate || "Tanggal: Belum ditentukan"}

Mohon info ketersediaan dan proses bookingnya.
Terima kasih!`

  return encodeURIComponent(message)
}

export function getWhatsAppUrl(message: string, phoneNumber = "6289504796894"): string {
  return `https://wa.me/${phoneNumber}?text=${message}`
}

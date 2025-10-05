import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ContactInfo {
  id?: string
  phone: string
  email: string
  whatsapp?: string
  updated_at?: string
}

// Utility function to format phone number with dashes
export const formatPhoneNumber = (phone: string): string => {
  // Remove any existing formatting
  const cleanPhone = phone.replace(/\D/g, '')
  
  // If it starts with 62, format as +62 xxx-xxxx-xxxx
  if (cleanPhone.startsWith('62')) {
    const withoutCountryCode = cleanPhone.substring(2)
    if (withoutCountryCode.length >= 10) {
      return `+62 ${withoutCountryCode.substring(0, 3)}-${withoutCountryCode.substring(3, 7)}-${withoutCountryCode.substring(7)}`
    }
  }
  
  // If it starts with 0, format as +62 xxx-xxxx-xxxx
  if (cleanPhone.startsWith('0')) {
    const withoutZero = cleanPhone.substring(1)
    if (withoutZero.length >= 10) {
      return `+62 ${withoutZero.substring(0, 3)}-${withoutZero.substring(3, 7)}-${withoutZero.substring(7)}`
    }
  }
  
  // Default fallback
  return `+62 ${phone}`
}

export function useContactInfo() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('contact_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }

      setContactInfo(data || {
        phone: '089504796894',
        email: 'innomardia@gmail.com',
        whatsapp: '089504796894'
      })
    } catch (err) {
      console.error('Error fetching contact info:', err)
      setError('Failed to load contact information')
      // Set default values on error
      setContactInfo({
        phone: '089504796894',
        email: 'innomardia@gmail.com',
        whatsapp: '089504796894'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateContactInfo = async (newContactInfo: Partial<ContactInfo>) => {
    try {
      const { data, error } = await supabase
        .from('contact_settings')
        .upsert({
          id: contactInfo?.id || 1,
          ...contactInfo,
          ...newContactInfo,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setContactInfo(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating contact info:', err)
      return { success: false, error: err }
    }
  }

  return {
    contactInfo,
    loading,
    error,
    refetch: fetchContactInfo,
    updateContactInfo
  }
}

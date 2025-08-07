"use client"

import { useState, useEffect } from "react"
import { getAnalyticsData, type AnalyticsData } from "@/lib/analytics"

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const data = await getAnalyticsData()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return { analytics, loading, error, refetch: fetchAnalytics }
}

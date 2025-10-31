'use client'

import { useEffect } from 'react'
import { setupDemoData, isDemoDataSetup } from '@/lib/demo-data'

export default function DemoDataInitializer() {
  useEffect(() => {
    // Setup demo data on first load
    if (typeof window !== 'undefined' && !isDemoDataSetup()) {
      setupDemoData()
    }
  }, [])

  return null // This component doesn't render anything
}
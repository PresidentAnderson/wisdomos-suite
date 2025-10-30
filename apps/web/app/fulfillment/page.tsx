'use client'

import React, { useState, useEffect } from 'react'
import FulfillmentDisplayV5 from '@/components/fulfillment/FulfillmentDisplayV5'
import { LifeArea } from '@/types/fulfillment-v5'
import { SAMPLE_DATA } from '@/data/fulfillment-v5-sample'

export default function FulfillmentPage() {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([])

  useEffect(() => {
    // Load from API or use sample data
    setLifeAreas(SAMPLE_DATA)
  }, [])

  const handleMetricUpdate = (
    areaId: string,
    subdomainId: string,
    dimensionName: string,
    metric: number
  ) => {
    setLifeAreas(prev =>
      prev.map(area => {
        if (area.id !== areaId) return area

        return {
          ...area,
          subdomains: area.subdomains.map(subdomain => {
            if (subdomain.id !== subdomainId) return subdomain

            return {
              ...subdomain,
              dimensions: subdomain.dimensions.map(dim => {
                if (dim.name !== dimensionName) return dim

                return {
                  ...dim,
                  metric,
                  lastUpdated: new Date()
                }
              })
            }
          })
        }
      })
    )

    // Also save to API/database
    console.log('Updating metric:', { areaId, subdomainId, dimensionName, metric })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FulfillmentDisplayV5
        lifeAreas={lifeAreas}
        onMetricUpdate={handleMetricUpdate}
      />
    </div>
  )
}
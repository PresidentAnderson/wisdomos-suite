'use client'

// Force dynamic rendering - must be before imports
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FulfillmentDisplayV5 from '@/components/fulfillment/FulfillmentDisplayV5'
import { LifeArea } from '@/types/fulfillment-v5'

const fetchFulfillmentData = async (): Promise<{ lifeAreas: LifeArea[] }> => {
  const response = await fetch('/api/fulfillment-v5')
  if (!response.ok) {
    throw new Error('Failed to fetch fulfillment data')
  }
  return response.json()
}

export default function FulfillmentPage() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['fulfillment-v5'],
    queryFn: fetchFulfillmentData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const updateMetricMutation = useMutation({
    mutationFn: async ({
      dimensionId,
      metric,
    }: {
      dimensionId: string
      metric: number
    }) => {
      const response = await fetch(`/api/fulfillment-v5/dimensions/${dimensionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric }),
      })

      if (!response.ok) {
        throw new Error('Failed to update metric')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch the fulfillment data
      queryClient.invalidateQueries({ queryKey: ['fulfillment-v5'] })
    },
    onError: (error) => {
      console.error('Error updating metric:', error)
      alert('Failed to update metric. Please try again.')
    },
  })

  const handleMetricUpdate = async (
    areaId: string,
    subdomainId: string,
    dimensionName: string,
    metric: number
  ) => {
    try {
      // Find the dimension ID
      const lifeArea = data?.lifeAreas?.find((a: LifeArea) => a.id === areaId)
      const subdomain = lifeArea?.subdomains.find((s) => s.id === subdomainId)
      const dimension = subdomain?.dimensions.find((d) => d.name === dimensionName)

      if (!dimension) {
        console.error('Dimension not found')
        return
      }

      // Call API to update
      await updateMetricMutation.mutateAsync({
        dimensionId: dimension.id,
        metric,
      })

      console.log('Metric updated successfully:', {
        areaId,
        subdomainId,
        dimensionName,
        metric,
      })
    } catch (error) {
      console.error('Error updating metric:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phoenix-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fulfillment data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading fulfillment data</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['fulfillment-v5'] })}
            className="px-4 py-2 bg-phoenix-orange text-white rounded hover:bg-phoenix-red"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FulfillmentDisplayV5
        lifeAreas={data?.lifeAreas || []}
        onMetricUpdate={handleMetricUpdate}
      />
    </div>
  )
}
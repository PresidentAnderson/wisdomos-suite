import dynamic from 'next/dynamic'

// Dynamically import the client component with no SSR
// This prevents Next.js from trying to pre-render a page that uses React Query
const FulfillmentClient = dynamic(() => import('./FulfillmentClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phoenix-orange mx-auto mb-4"></div>
        <p className="text-gray-600">Loading fulfillment data...</p>
      </div>
    </div>
  ),
})

export const dynamic = 'force-dynamic'

export default function FulfillmentPage() {
  return <FulfillmentClient />
}

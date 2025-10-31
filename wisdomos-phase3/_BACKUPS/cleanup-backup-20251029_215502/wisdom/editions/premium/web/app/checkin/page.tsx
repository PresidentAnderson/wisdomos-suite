import CheckInForm from '@/components/CheckInForm'

export default function CheckInPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 flame-text">
        Guest Check-In System
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Create bookings with real-time error reporting from Supabase
      </p>
      <CheckInForm />
    </div>
  )
}
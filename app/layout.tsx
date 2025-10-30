/**
 * Root Layout
 *
 * Wraps entire application with providers
 */

import { AuthProvider } from './hooks/useAuth'
import './globals.css'

export const metadata = {
  title: 'WisdomOS - Personal Transformation Platform',
  description: 'Track your fulfillment journey across 30 life areas'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}

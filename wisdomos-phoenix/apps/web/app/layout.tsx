import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WisdomOS - Rise into Fulfillment',
  description: 'Phoenix Operating System for Life Transformation. From ashes to clarity.',
  keywords: 'fulfillment, transformation, phoenix, wisdom, life dashboard, boundary reset',
  authors: [{ name: 'WisdomOS Team' }],
  openGraph: {
    title: 'WisdomOS - Rise into Fulfillment',
    description: 'Transform your life through the Phoenix Cycle. Journal, track, and rise.',
    images: ['/phoenix-og.png'],
  },
  icons: {
    icon: '/phoenix-icon.svg',
    apple: '/phoenix-apple.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-phoenix-smoke text-white`}>
        <div className="phoenix-glow min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
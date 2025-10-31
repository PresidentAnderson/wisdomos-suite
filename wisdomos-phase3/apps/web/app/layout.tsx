import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { AuthProvider } from '@/lib/auth-context'
import DemoDataInitializer from '@/components/DemoDataInitializer'
import { LifeAreasProvider } from '@/contexts/LifeAreasContext'
import { ToastProvider } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WisdomOS - Rise into Fulfillment',
  description: 'Phoenix Operating System for Life Transformation. From ashes to clarity.',
  keywords: 'fulfillment, transformation, phoenix, wisdom, life dashboard, boundary reset',
  authors: [
    { name: 'Jonathan Anderson', url: 'https://github.com/axaiinovation' }
  ],
  creator: 'AXAI Innovations',
  openGraph: {
    title: 'WisdomOS - Rise into Fulfillment',
    description: 'Transform your life through the Phoenix Cycle. Journal, track, and rise.',
    images: ['/phoenix-og.png'],
  },
  icons: {
    icon: '/phoenix-icon.svg',
    apple: '/phoenix-apple.png',
  },
  other: {
    'company': 'AXAI Innovations',
    'developer': 'Jonathan Anderson'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <AuthProvider>
          <LifeAreasProvider>
            <ToastProvider>
              <DemoDataInitializer />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <Analytics />
            </ToastProvider>
          </LifeAreasProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
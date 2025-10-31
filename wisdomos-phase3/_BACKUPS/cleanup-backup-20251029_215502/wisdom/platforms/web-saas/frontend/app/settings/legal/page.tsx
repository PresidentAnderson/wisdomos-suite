'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, Shield } from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'

export default function LegalNoticesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/settings">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Settings
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold text-black">Legal Notices</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-phoenix-gold/20">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-phoenix-orange" />
            <h2 className="text-2xl font-bold text-black">Legal Information</h2>
          </div>

          {/* Copyright Notice */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-3">Copyright</h3>
            <p className="text-gray-600">
              © 2025 AXAI Innovations / Jonathan Anderson. All rights reserved.
            </p>
            <p className="text-gray-600 mt-2">
              WisdomOS and all associated content, features, and functionality are owned by AXAI Innovations 
              and Jonathan Anderson, and are protected by international copyright, trademark, patent, trade secret, 
              and other intellectual property or proprietary rights laws.
            </p>
          </section>

          {/* Independence Statement */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-3">Independence Statement</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 font-medium mb-2">
                This is an independent project by AXAI Innovations.
              </p>
              <p className="text-gray-600">
                WisdomOS has no connection to Landmark Worldwide LLC or its programs. 
                All trademarks belong to their respective owners.
              </p>
            </div>
          </section>

          {/* Terms of Use */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-3">Terms of Use</h3>
            <p className="text-gray-600 mb-4">
              By accessing and using WisdomOS, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>The application is provided "as is" without any warranties, expressed or implied</li>
              <li>You use the application at your own risk</li>
              <li>The creator is not liable for any damages arising from your use of the application</li>
              <li>You agree not to misuse the application or help anyone else do so</li>
            </ul>
          </section>

          {/* Privacy */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-3">Privacy</h3>
            <p className="text-gray-600">
              WisdomOS respects your privacy. Any data you enter is stored locally on your device 
              or in your personal cloud account. We do not collect, store, or share your personal 
              information with third parties.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold text-black mb-3">Disclaimer</h3>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-amber-800 text-sm">
                This application is for personal development and self-reflection purposes only. 
                It is not a substitute for professional medical, psychological, or therapeutic advice. 
                If you are experiencing mental health issues, please consult with a qualified healthcare professional.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-lg font-semibold text-black mb-3">Contact</h3>
            <p className="text-gray-600">
              For legal inquiries regarding WisdomOS, please contact AXAI Innovations / Jonathan Anderson through 
              the GitHub repository: <a 
                href="https://github.com/axaiinovation/wisdomos" 
                className="text-phoenix-orange hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/axaiinovation/wisdomos
              </a>
            </p>
            <p className="text-gray-600 mt-2">
              Email: contact@axaiinovations.com
            </p>
          </section>

          {/* Last Updated */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Last updated: August 23, 2025
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
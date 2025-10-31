'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-phoenix-gold/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* WisdomOS */}
          <div>
            <h3 className="font-semibold text-black mb-3">WisdomOS</h3>
            <p className="text-sm text-gray-600 mb-3">
              Phoenix Operating System for Life Transformation
            </p>
            <p className="text-xs text-gray-500">
              Developed by AXAI Innovations
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-black mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/journal" className="text-gray-600 hover:text-phoenix-orange transition-colors">Journal</Link></li>
              <li><Link href="/fulfillment" className="text-gray-600 hover:text-phoenix-orange transition-colors">Fulfillment</Link></li>
              <li><Link href="/wisdom-coach" className="text-gray-600 hover:text-phoenix-orange transition-colors">Wisdom Coach</Link></li>
              <li><Link href="/settings" className="text-gray-600 hover:text-phoenix-orange transition-colors">Settings</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-black mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/credits" className="text-gray-600 hover:text-phoenix-orange transition-colors">Credits</Link></li>
              <li>
                <a 
                  href="https://github.com/axaiinovation" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-phoenix-orange transition-colors inline-flex items-center gap-1"
                >
                  AXAI Innovations <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/axaiinovation/wisdomos" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-phoenix-orange transition-colors inline-flex items-center gap-1"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://vercel.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-phoenix-orange transition-colors inline-flex items-center gap-1"
                >
                  Vercel <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Development */}
          <div>
            <h3 className="font-semibold text-black mb-3">Development</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Built with Next.js 14</li>
              <li>TypeScript & Tailwind CSS</li>
              <li>Deployed on Vercel</li>
              <li>Containerized with Docker</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <p>© 2025 AXAI Innovations / Jonathan Anderson. All rights reserved.</p>
            </div>
            <div className="text-xs text-gray-500 text-center sm:text-right">
              <p>Not affiliated with Landmark Worldwide LLC. All trademarks belong to their respective owners.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
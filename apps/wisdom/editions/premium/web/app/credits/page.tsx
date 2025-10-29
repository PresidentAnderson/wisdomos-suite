'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, Code, Sparkles, Users, Award, Coffee } from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'

export default function CreditsPage() {
  const contributors = [
    {
      name: "Jonathan Anderson",
      role: "Founder & CEO, AXAI Innovations", 
      contribution: "Product vision, architecture, implementation, and system integration",
      icon: "👨‍💼",
      details: "Conceptualized and built WisdomOS as a Phoenix Operating System for life transformation at AXAI Innovations"
    }
  ]

  const technologies = [
    { name: "Next.js 14", purpose: "React framework with App Router" },
    { name: "TypeScript", purpose: "Type-safe development" },
    { name: "Tailwind CSS", purpose: "Utility-first styling" },
    { name: "Framer Motion", purpose: "Smooth animations" },
    { name: "Lucide React", purpose: "Beautiful icon system" },
    { name: "Supabase", purpose: "Database and authentication" },
    { name: "Vercel", purpose: "Cloud deployment platform" },
    { name: "Docker", purpose: "Containerized deployment" }
  ]

  const features = [
    "Phoenix Cycle Life Transformation Framework",
    "Integrated Journal with Reset Ritual System", 
    "Life Areas Context Management",
    "Wisdom Coach AI Integration",
    "Fulfillment Display with Interactive Overview",
    "Autobiography Timeline Integration",
    "Monthly Audit and Boundary Setting",
    "Community Connection Tracking",
    "Accessibility-First Design",
    "Progressive Web App Support"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Credits & Acknowledgments
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-phoenix-red" />
            <h2 className="text-3xl font-bold text-black">Built with Gratitude</h2>
            <Heart className="w-6 h-6 text-phoenix-red" />
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            WisdomOS is a Phoenix Operating System for life transformation, 
            designed to help you rise from your ashes into clarity and fulfillment through 
            structured journaling, boundary management, and personal growth tracking.
          </p>
        </motion.div>

        {/* Core Contributors */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-8">
            <Users className="w-6 h-6 text-phoenix-orange" />
            <h3 className="text-2xl font-bold text-black">Core Contributors</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {contributors.map((contributor, index) => (
              <motion.div
                key={contributor.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-phoenix-gold/20 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{contributor.icon}</div>
                  <h4 className="text-xl font-bold text-black">{contributor.name}</h4>
                  <p className="text-phoenix-orange font-medium">{contributor.role}</p>
                </div>
                <p className="text-gray-600 text-sm mb-3">{contributor.contribution}</p>
                <p className="text-xs text-gray-500 italic">{contributor.details}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technology Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-8">
            <Code className="w-6 h-6 text-phoenix-orange" />
            <h3 className="text-2xl font-bold text-black">Technology Stack</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {technologies.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-semibold text-black text-sm">{tech.name}</div>
                  <div className="text-xs text-gray-600">{tech.purpose}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Key Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-phoenix-orange" />
            <h3 className="text-2xl font-bold text-black">Key Features Implemented</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.03 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-2 h-2 bg-phoenix-orange rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-black">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Development Process */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-8">
            <Award className="w-6 h-6 text-phoenix-orange" />
            <h3 className="text-2xl font-bold text-black">Development Highlights</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-black mb-3">Technical Architecture</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Advanced TypeScript architecture with strict typing</li>
                  <li>• Component-based design with reusable patterns</li>
                  <li>• Accessibility-first implementation</li>
                  <li>• Performance-optimized with lazy loading</li>
                  <li>• Comprehensive error handling and validation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black mb-3">Deployment Excellence</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Multi-platform deployment (Vercel, Docker)</li>
                  <li>• Automated CI/CD with GitHub integration</li>
                  <li>• Production-ready containerization</li>
                  <li>• Server-side rendering compatibility</li>
                  <li>• Progressive Web App features</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Acknowledgments */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-phoenix-gold/10 via-phoenix-orange/10 to-phoenix-red/10 rounded-xl p-8 border border-phoenix-gold/20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coffee className="w-5 h-5 text-phoenix-orange" />
              <h3 className="text-xl font-bold text-black">Special Thanks</h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              WisdomOS was created with a vision to provide a comprehensive personal development platform 
              that helps individuals track their growth, manage boundaries, and achieve fulfillment through 
              structured self-reflection and continuous improvement.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>© 2025 AXAI Innovations / Jonathan Anderson. All rights reserved.</p>
              <p>Built with ❤️ for life transformation and personal growth</p>
              <p className="text-xs italic mt-4">Independent project. Not affiliated with Landmark Worldwide LLC or its programs.</p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
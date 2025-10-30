'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PhoenixLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

export default function PhoenixLogo({ size = 'md', animated = true, className = '' }: PhoenixLogoProps) {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  }

  const phoenixPath = {
    hidden: {
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  }

  const flameAnimation = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: {
      scale: [0.8, 1.1, 0.9, 1],
      opacity: [0.5, 1, 0.8, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className={`${sizeMap[size]} ${className} relative phoenix-logo`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Phoenix Body - Geometric Design */}
        <motion.g
          initial="initial"
          animate={animated ? "animate" : "initial"}
          variants={flameAnimation}
        >
          {/* Outer Flames */}
          <motion.path
            d="M100 20 L120 60 L140 40 L130 80 L150 70 L130 110 L160 100 L130 130 L150 140 L120 150 L140 170 L100 160 L60 170 L80 150 L50 140 L70 130 L40 100 L70 110 L50 70 L70 80 L60 40 L80 60 Z"
            fill="url(#phoenixGradient)"
            opacity="0.8"
          />
          
          {/* Inner Phoenix Core */}
          <motion.path
            d="M100 50 L110 70 L120 65 L115 85 L125 82 L115 100 L130 98 L115 115 L125 120 L110 125 L120 135 L100 130 L80 135 L90 125 L75 120 L85 115 L70 98 L85 100 L75 82 L85 85 L80 65 L90 70 Z"
            fill="url(#phoenixCoreGradient)"
          />
          
          {/* Phoenix Head */}
          <motion.circle
            cx="100"
            cy="45"
            r="15"
            fill="url(#phoenixHeadGradient)"
          />
          
          {/* Eye */}
          <circle
            cx="105"
            cy="43"
            r="3"
            fill="#1D3557"
          />
        </motion.g>

        {/* Rising Lines - Animated */}
        {animated && (
          <>
            <motion.path
              d="M100 160 L100 180"
              stroke="url(#risingGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              initial="hidden"
              animate="visible"
              variants={phoenixPath}
            />
            <motion.path
              d="M90 165 L85 185"
              stroke="url(#risingGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              initial="hidden"
              animate="visible"
              variants={phoenixPath}
            />
            <motion.path
              d="M110 165 L115 185"
              stroke="url(#risingGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              initial="hidden"
              animate="visible"
              variants={phoenixPath}
            />
          </>
        )}

        {/* Gradients */}
        <defs>
          <linearGradient id="phoenixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E63946" />
            <stop offset="33%" stopColor="#FF914D" />
            <stop offset="66%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FCBF49" />
          </linearGradient>
          
          <linearGradient id="phoenixCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FCBF49" />
            <stop offset="100%" stopColor="#F77F00" />
          </linearGradient>
          
          <radialGradient id="phoenixHeadGradient">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FF914D" />
          </radialGradient>
          
          <linearGradient id="risingGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#2C3E50" />
            <stop offset="50%" stopColor="#FF914D" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Embers */}
      {animated && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="ember-particle"
              initial={{ y: 0, x: 0, opacity: 0 }}
              animate={{
                y: [-20, -100, -200],
                x: [0, (i - 2) * 20, (i - 2) * 40],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
              style={{
                left: `${45 + i * 10}%`,
                bottom: '10%',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
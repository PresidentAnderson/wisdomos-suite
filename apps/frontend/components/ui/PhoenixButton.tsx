'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PhoenixButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  phoenixEffect?: boolean
  children: React.ReactNode
}

export default function PhoenixButton({
  variant = 'primary',
  size = 'md',
  phoenixEffect = true,
  className,
  children,
  ...props
}: PhoenixButtonProps) {
  const baseStyles = 'relative font-semibold rounded-xl transition-all duration-300 overflow-hidden'
  
  const variants = {
    primary: 'bg-gradient-to-r from-phoenix-red to-phoenix-orange text-white hover:shadow-lg hover:shadow-phoenix-orange/30',
    secondary: 'bg-gradient-to-r from-phoenix-indigo to-phoenix-ash text-white hover:shadow-lg hover:shadow-phoenix-indigo/30',
    ghost: 'bg-transparent border border-phoenix-gold/30 text-phoenix-gold hover:bg-phoenix-gold/10',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:shadow-lg hover:shadow-red-500/30'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg'
  }

  return (
    <motion.button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {phoenixEffect && variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-phoenix-gold/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}
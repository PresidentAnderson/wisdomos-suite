'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PhoenixButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning' | 'reset'
  size?: 'sm' | 'md' | 'lg'
  phoenixEffect?: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function PhoenixButton({
  variant = 'primary',
  size = 'md',
  phoenixEffect = true,
  className,
  children,
  onClick,
  disabled,
  type = 'button'
}: PhoenixButtonProps) {
  const baseStyles = 'relative font-semibold rounded-xl transition-all duration-300 overflow-hidden'
  
  const variants = {
    primary: 'bg-gradient-to-r from-phoenix-red to-phoenix-orange text-black hover:shadow-lg hover:shadow-phoenix-orange/30 hover:from-phoenix-red/90 hover:to-phoenix-orange/90',
    secondary: 'bg-gradient-to-r from-phoenix-indigo to-phoenix-ash text-black hover:shadow-lg hover:shadow-phoenix-indigo/30',
    ghost: 'bg-white/90 border border-gray-300 text-black hover:bg-gray-100 hover:border-gray-400',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-black hover:shadow-lg hover:shadow-red-500/30 hover:from-red-700 hover:to-red-600',
    success: 'bg-gradient-to-r from-green-600 to-green-500 text-black hover:shadow-lg hover:shadow-green-500/30 hover:from-green-700 hover:to-green-600',
    warning: 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:shadow-lg hover:shadow-yellow-500/30 hover:from-yellow-700 hover:to-yellow-600',
    reset: 'bg-gradient-to-r from-orange-600 to-orange-500 text-black hover:shadow-lg hover:shadow-orange-500/30 hover:from-orange-700 hover:to-orange-600'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg'
  }

  return (
    <motion.button
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        disabled && 'opacity-50 cursor-not-allowed hover:shadow-none',
        className
      )}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
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
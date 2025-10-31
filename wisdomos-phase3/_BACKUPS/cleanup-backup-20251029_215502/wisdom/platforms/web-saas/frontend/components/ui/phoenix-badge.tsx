/**
 * Phoenix-themed Badge Component for WisdomOS
 * AXAI Innovations - Proprietary
 * 
 * Status badges with Phoenix lifecycle colors and animations
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const phoenixBadgeVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-futura font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-phoenix-gradient text-white shadow-phoenix",
        ash: "bg-phoenix-ash text-phoenix-gold border-phoenix-charcoal",
        ember: "bg-phoenix-ember text-white animate-ember-glow",
        gold: "bg-phoenix-gold text-phoenix-smoke shadow-gold",
        transformation: "bg-transformation-gradient text-white animate-transformation",
        wisdom: {
          green: "bg-wisdom-green text-white shadow-lg shadow-wisdom-green/30",
          yellow: "bg-wisdom-yellow text-phoenix-smoke shadow-lg shadow-wisdom-yellow/30",
          red: "bg-wisdom-red text-white shadow-lg shadow-wisdom-red/30",
        },
        glass: "bg-glass-white backdrop-blur-glass border-white/20 text-phoenix-indigo",
        outline: "border-current bg-transparent",
        phoenix: "bg-phoenix-red text-white hover:animate-phoenix-rise",
        floating: "bg-glass-phoenix border-phoenix-orange/30 animate-float",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base font-medium",
      },
      glow: {
        none: "",
        subtle: "shadow-sm",
        medium: "shadow-md animate-pulse-gold",
        intense: "shadow-lg animate-ember-glow",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
)

export interface PhoenixBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof phoenixBadgeVariants> {
  phoenixEffect?: boolean
  pulse?: boolean
  shimmer?: boolean
}

const PhoenixBadge = React.forwardRef<HTMLDivElement, PhoenixBadgeProps>(
  ({ className, variant, size, glow, phoenixEffect, pulse, shimmer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          phoenixBadgeVariants({ variant, size, glow }),
          {
            "relative overflow-hidden": shimmer,
            "animate-pulse": pulse,
          },
          className
        )}
        {...props}
      >
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-shimmer opacity-40" />
        )}
        
        {phoenixEffect && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-phoenix-gold rounded-full animate-phoenix-breath opacity-80" />
        )}
        
        <span className="relative z-10">{children}</span>
      </div>
    )
  }
)

PhoenixBadge.displayName = "PhoenixBadge"

// Specialized Phoenix badge variants
export const WisdomBadge = React.forwardRef<HTMLDivElement, PhoenixBadgeProps & { status: 'thriving' | 'attention' | 'breakdown' }>(
  ({ status, ...props }, ref) => {
    const statusMap = {
      thriving: { variant: 'wisdom' as any, children: 'Thriving', glow: 'subtle' as any },
      attention: { variant: 'wisdom' as any, children: 'Attention Needed', glow: 'medium' as any, pulse: true },
      breakdown: { variant: 'wisdom' as any, children: 'Breakdown', glow: 'intense' as any, phoenixEffect: true },
    }
    
    return (
      <PhoenixBadge
        ref={ref}
        {...statusMap[status]}
        {...props}
      />
    )
  }
)

export const PhoenixCycleBadge = React.forwardRef<HTMLDivElement, PhoenixBadgeProps & { cycle: 'ash' | 'ember' | 'transformation' | 'rebirth' }>(
  ({ cycle, ...props }, ref) => {
    const cycleMap = {
      ash: { variant: 'ash' as any, children: 'Ash Phase', size: 'lg' as any },
      ember: { variant: 'ember' as any, children: 'Ember Phase', phoenixEffect: true },
      transformation: { variant: 'transformation' as any, children: 'Transformation', size: 'lg' as any },
      rebirth: { variant: 'phoenix' as any, children: 'Rebirth', glow: 'intense' as any, shimmer: true },
    }
    
    return (
      <PhoenixBadge
        ref={ref}
        {...cycleMap[cycle]}
        {...props}
      />
    )
  }
)

export const StatusBadge = React.forwardRef<HTMLDivElement, PhoenixBadgeProps & { status: string; level?: 'low' | 'medium' | 'high' | 'critical' }>(
  ({ status, level = 'medium', ...props }, ref) => {
    const levelMap = {
      low: { variant: 'glass' as any, glow: 'none' as any },
      medium: { variant: 'gold' as any, glow: 'subtle' as any },
      high: { variant: 'ember' as any, glow: 'medium' as any, phoenixEffect: true },
      critical: { variant: 'phoenix' as any, glow: 'intense' as any, shimmer: true, pulse: true },
    }
    
    return (
      <PhoenixBadge
        ref={ref}
        {...levelMap[level]}
        {...props}
      >
        {status}
      </PhoenixBadge>
    )
  }
)

export { PhoenixBadge, phoenixBadgeVariants }
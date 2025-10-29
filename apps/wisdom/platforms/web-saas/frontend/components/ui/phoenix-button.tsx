/**
 * Phoenix-themed Button Component for WisdomOS
 * AXAI Innovations - Proprietary
 * 
 * Advanced button with Phoenix lifecycle animations and glass morphism
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const phoenixButtonVariants = cva(
  "inline-flex items-center justify-center rounded-phoenix text-sm font-futura font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix-gold focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-phoenix-gradient text-white hover:shadow-transformation hover:scale-105 active:scale-95",
        ash: "bg-ash-gradient text-phoenix-gold hover:bg-phoenix-charcoal border border-phoenix-ash",
        ember: "bg-phoenix-ember text-white hover:animate-ember-glow hover:shadow-ember",
        gold: "bg-phoenix-gold text-phoenix-smoke hover:bg-phoenix-flame hover:shadow-gold",
        glass: "bg-glass-white backdrop-blur-glass border border-white/20 text-phoenix-indigo hover:bg-glass-phoenix",
        transformation: "bg-transformation-gradient text-white animate-transformation hover:animate-rebirth",
        outline: "border-2 border-phoenix-gold bg-transparent text-phoenix-gold hover:bg-phoenix-gold hover:text-phoenix-smoke",
        ghost: "text-phoenix-gold hover:bg-glass-gold hover:text-phoenix-smoke",
        phoenix: "bg-phoenix-red text-white hover:animate-phoenix-rise hover:shadow-transformation group",
      },
      size: {
        sm: "h-9 rounded-md px-3",
        default: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-phoenix px-10 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        hover: "hover:animate-phoenix-breath",
        pulse: "animate-pulse-gold",
        float: "animate-float",
        flicker: "animate-flame-flicker",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
)

export interface PhoenixButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof phoenixButtonVariants> {
  loading?: boolean
  phoenixEffect?: boolean
  shimmer?: boolean
}

const PhoenixButton = React.forwardRef<HTMLButtonElement, PhoenixButtonProps>(
  ({ className, variant, size, animation, loading, phoenixEffect, shimmer, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          phoenixButtonVariants({ variant, size, animation }),
          {
            "relative overflow-hidden": shimmer,
            "cursor-not-allowed": loading || disabled,
          },
          className
        )}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {shimmer && !loading && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-shimmer opacity-30" />
        )}
        
        {phoenixEffect && !loading && (
          <>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-phoenix-gold rounded-full animate-phoenix-breath opacity-80" />
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-phoenix-ember rounded-full animate-ember-glow opacity-60" />
          </>
        )}
        
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-phoenix-gold" />
        )}
        
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {variant === "phoenix" && (
          <div className="absolute inset-0 bg-phoenix-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-phoenix" />
        )}
      </button>
    )
  }
)

PhoenixButton.displayName = "PhoenixButton"

// Specialized Phoenix button variants
export const PhoenixRiseButton = React.forwardRef<HTMLButtonElement, PhoenixButtonProps>(
  (props, ref) => (
    <PhoenixButton
      ref={ref}
      variant="phoenix"
      animation="hover"
      phoenixEffect
      {...props}
    />
  )
)

export const PhoenixTransformButton = React.forwardRef<HTMLButtonElement, PhoenixButtonProps>(
  (props, ref) => (
    <PhoenixButton
      ref={ref}
      variant="transformation"
      size="lg"
      shimmer
      {...props}
    />
  )
)

export const PhoenixEmberButton = React.forwardRef<HTMLButtonElement, PhoenixButtonProps>(
  (props, ref) => (
    <PhoenixButton
      ref={ref}
      variant="ember"
      animation="flicker"
      phoenixEffect
      {...props}
    />
  )
)

export { PhoenixButton, phoenixButtonVariants }
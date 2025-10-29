/**
 * Phoenix-themed Input Component for WisdomOS
 * AXAI Innovations - Proprietary
 * 
 * Enhanced input with Phoenix animations and glass morphism
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff } from 'lucide-react'

const phoenixInputVariants = cva(
  "flex w-full rounded-phoenix border bg-transparent px-3 py-2 text-sm font-garamond ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phoenix-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-phoenix-charcoal/30 bg-glass-white backdrop-blur-glass hover:border-phoenix-gold/50 focus-visible:bg-glass-phoenix",
        glass: "border-white/20 bg-glass-white backdrop-blur-glass hover:border-phoenix-gold/60",
        ember: "border-phoenix-ember/40 bg-glass-phoenix hover:border-phoenix-ember focus-visible:shadow-ember",
        gold: "border-phoenix-gold/40 bg-glass-gold hover:border-phoenix-gold focus-visible:shadow-gold",
        ash: "border-phoenix-ash/40 bg-ash-gradient hover:border-phoenix-charcoal",
        floating: "border-phoenix-orange/30 animate-float",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        default: "h-10 px-3",
        lg: "h-12 px-4 text-lg",
        xl: "h-14 px-6 text-xl",
      },
      glow: {
        none: "",
        subtle: "focus-visible:shadow-phoenix/20",
        medium: "focus-visible:shadow-phoenix focus-visible:animate-ember-glow",
        intense: "focus-visible:shadow-transformation focus-visible:animate-pulse-gold",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "subtle",
    },
  }
)

export interface PhoenixInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof phoenixInputVariants> {
  phoenixEffect?: boolean
  shimmer?: boolean
  label?: string
  error?: string
  success?: boolean
}

const PhoenixInput = React.forwardRef<HTMLInputElement, PhoenixInputProps>(
  ({ className, variant, size, glow, phoenixEffect, shimmer, label, error, success, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-futura font-medium text-phoenix-gold">
            {label}
            {phoenixEffect && <span className="ml-1 animate-phoenix-breath">🔥</span>}
          </label>
        )}
        
        <div className="relative">
          <input
            type={inputType}
            className={cn(
              phoenixInputVariants({ variant, size, glow }),
              {
                "relative overflow-hidden": shimmer,
                "border-wisdom-red text-wisdom-red focus-visible:ring-wisdom-red": error,
                "border-wisdom-green text-wisdom-green focus-visible:ring-wisdom-green": success,
                "pr-10": isPassword,
              },
              className
            )}
            ref={ref}
            {...props}
          />
          
          {shimmer && (
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-shimmer opacity-20 pointer-events-none rounded-phoenix" />
          )}
          
          {phoenixEffect && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-phoenix-gold rounded-full animate-phoenix-breath opacity-70 pointer-events-none" />
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-phoenix-charcoal hover:text-phoenix-gold transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        
        {error && (
          <p className="text-xs text-wisdom-red font-garamond flex items-center gap-1">
            <span className="w-1 h-1 bg-wisdom-red rounded-full animate-pulse"></span>
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="text-xs text-wisdom-green font-garamond flex items-center gap-1">
            <span className="w-1 h-1 bg-wisdom-green rounded-full animate-pulse-gold"></span>
            Input validated successfully
          </p>
        )}
      </div>
    )
  }
)

PhoenixInput.displayName = "PhoenixInput"

// Specialized Phoenix input variants
export const PhoenixSearchInput = React.forwardRef<HTMLInputElement, PhoenixInputProps>(
  (props, ref) => (
    <PhoenixInput
      ref={ref}
      variant="glass"
      glow="medium"
      phoenixEffect
      placeholder="Search through Phoenix wisdom..."
      {...props}
    />
  )
)

export const PhoenixPasswordInput = React.forwardRef<HTMLInputElement, PhoenixInputProps>(
  (props, ref) => (
    <PhoenixInput
      ref={ref}
      type="password"
      variant="ember"
      glow="intense"
      phoenixEffect
      {...props}
    />
  )
)

export const PhoenixEmailInput = React.forwardRef<HTMLInputElement, PhoenixInputProps>(
  (props, ref) => (
    <PhoenixInput
      ref={ref}
      type="email"
      variant="gold"
      shimmer
      placeholder="your-phoenix@email.com"
      {...props}
    />
  )
)

export { PhoenixInput, phoenixInputVariants }
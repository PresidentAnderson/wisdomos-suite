/**
 * Phoenix-themed Card Component for WisdomOS
 * AXAI Innovations - Proprietary
 * 
 * A glass morphism card with Phoenix animations and themes
 */
import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const phoenixCardVariants = cva(
  "relative overflow-hidden rounded-phoenix border border-white/10 backdrop-blur-glass shadow-glass transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-glass-white hover:bg-glass-phoenix",
        ash: "bg-ash-gradient border-phoenix-ash/20",
        ember: "bg-glass-phoenix border-phoenix-ember/30 shadow-ember",
        gold: "bg-glass-gold border-phoenix-gold/40 shadow-gold",
        transformation: "bg-transformation-gradient animate-transformation",
        floating: "animate-float shadow-transformation"
      },
      size: {
        sm: "p-3 text-sm",
        default: "p-6",
        lg: "p-8 text-lg",
        xl: "p-12 text-xl"
      },
      glow: {
        none: "",
        subtle: "shadow-phoenix/20",
        medium: "shadow-phoenix animate-ember-glow",
        intense: "shadow-transformation animate-pulse-gold"
      },
      interactive: {
        none: "",
        hover: "hover:scale-[1.02] hover:shadow-transformation cursor-pointer",
        press: "active:scale-[0.98] transition-transform duration-150",
        phoenix: "hover:animate-phoenix-rise cursor-pointer group"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
      interactive: "none"
    }
  }
)

export interface PhoenixCardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof phoenixCardVariants> {
  children: React.ReactNode
  shimmer?: boolean
  phoenixEffect?: boolean
}

const PhoenixCard = React.forwardRef<HTMLDivElement, PhoenixCardProps>(
  ({ className, variant, size, glow, interactive, children, shimmer, phoenixEffect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(phoenixCardVariants({ variant, size, glow, interactive }), className)}
        {...props}
      >
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-shimmer opacity-30" />
        )}
        {phoenixEffect && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-phoenix-gradient rounded-full animate-phoenix-breath opacity-70" />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)

PhoenixCard.displayName = "PhoenixCard"

const PhoenixCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
PhoenixCardHeader.displayName = "PhoenixCardHeader"

const PhoenixCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-futura text-lg font-semibold leading-none tracking-tight text-phoenix-gold",
      className
    )}
    {...props}
  />
))
PhoenixCardTitle.displayName = "PhoenixCardTitle"

const PhoenixCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-phoenix-charcoal/80 font-garamond", className)}
    {...props}
  />
))
PhoenixCardDescription.displayName = "PhoenixCardDescription"

const PhoenixCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
PhoenixCardContent.displayName = "PhoenixCardContent"

const PhoenixCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-white/10", className)}
    {...props}
  />
))
PhoenixCardFooter.displayName = "PhoenixCardFooter"

export {
  PhoenixCard,
  PhoenixCardHeader,
  PhoenixCardFooter,
  PhoenixCardTitle,
  PhoenixCardDescription,
  PhoenixCardContent,
}
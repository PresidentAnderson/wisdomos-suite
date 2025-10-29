import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        phoenix: {
          gold: '#FFD700',      // Solar Gold - wisdom, vitality
          red: '#E63946',       // Phoenix Red - fire of transformation
          orange: '#FF914D',    // Ember Orange - energy, progress
          indigo: '#1D3557',    // Midnight Indigo - reflection
          ash: '#2C3E50',       // Deep ash gray
          ember: '#F77F00',     // Bright ember
          flame: '#FCBF49',     // Flame yellow
          smoke: '#1A1F2E',     // Dark smoke
          crimson: '#DC143C',   // Deep crimson for intense states
          amber: '#FFC107',     // Warm amber for comfort
          sapphire: '#0066CC',  // Deep sapphire for trust
          charcoal: '#36454F',  // Charcoal for neutral backgrounds
        },
        wisdom: {
          green: '#10B981',     // Thriving
          yellow: '#F59E0B',    // Attention needed
          red: '#EF4444',       // Breakdown
          emerald: '#059669',   // Deep growth
          amber: '#D97706',     // Caution
          rose: '#F43F5E',      // Challenge
        },
        // Glass morphism colors
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          black: 'rgba(0, 0, 0, 0.1)',
          phoenix: 'rgba(255, 145, 77, 0.1)',
          gold: 'rgba(255, 215, 0, 0.1)',
        }
      },
      fontFamily: {
        'futura': ['Futura', 'system-ui', 'sans-serif'],
        'garamond': ['Garamond', 'Georgia', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'phoenix-rise': 'phoenixRise 3s ease-in-out infinite',
        'ember-glow': 'emberGlow 2s ease-in-out infinite',
        'flame-flicker': 'flameFlicker 1.5s ease-in-out infinite',
        'ash-scatter': 'ashScatter 4s ease-in-out infinite',
        'phoenix-breath': 'phoenixBreath 4s ease-in-out infinite',
        'transformation': 'transformation 6s ease-in-out infinite',
        'rebirth': 'rebirth 8s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
      },
      keyframes: {
        phoenixRise: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: '1' },
        },
        emberGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 145, 77, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 145, 77, 0.8)' },
        },
        flameFlicker: {
          '0%, 100%': { transform: 'scaleY(1) rotate(0deg)' },
          '25%': { transform: 'scaleY(1.1) rotate(-2deg)' },
          '75%': { transform: 'scaleY(0.95) rotate(2deg)' },
        },
        ashScatter: {
          '0%': { transform: 'translateX(0) translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(100px) translateY(-100px) rotate(360deg)', opacity: '0' },
        },
        phoenixBreath: {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.2)' },
        },
        transformation: {
          '0%': { transform: 'rotate(0deg) scale(1)', filter: 'hue-rotate(0deg)' },
          '25%': { transform: 'rotate(90deg) scale(0.8)', filter: 'hue-rotate(90deg)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)', filter: 'hue-rotate(180deg)' },
          '75%': { transform: 'rotate(270deg) scale(0.9)', filter: 'hue-rotate(270deg)' },
          '100%': { transform: 'rotate(360deg) scale(1)', filter: 'hue-rotate(360deg)' },
        },
        rebirth: {
          '0%': { opacity: '0', transform: 'scale(0) rotate(-180deg)' },
          '25%': { opacity: '0.3', transform: 'scale(0.3) rotate(-90deg)' },
          '50%': { opacity: '0.7', transform: 'scale(0.7) rotate(0deg)' },
          '75%': { opacity: '0.9', transform: 'scale(1.1) rotate(90deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255, 215, 0, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'phoenix-gradient': 'linear-gradient(135deg, #E63946 0%, #FF914D 25%, #FFD700 50%, #FCBF49 75%, #F77F00 100%)',
        'ash-gradient': 'linear-gradient(180deg, #1A1F2E 0%, #2C3E50 50%, #1D3557 100%)',
        'ember-radial': 'radial-gradient(circle at center, #FF914D 0%, #E63946 50%, #1D3557 100%)',
        'phoenix-radial': 'radial-gradient(ellipse at center, #FFD700 0%, #FF914D 35%, #E63946 70%, #1D3557 100%)',
        'transformation-gradient': 'conic-gradient(from 0deg, #E63946, #FF914D, #FFD700, #FCBF49, #F77F00, #E63946)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'phoenix': '0 0 20px rgba(255, 145, 77, 0.5)',
        'gold': '0 0 30px rgba(255, 215, 0, 0.6)',
        'ember': '0 0 25px rgba(247, 127, 0, 0.7)',
        'transformation': '0 0 40px rgba(230, 57, 70, 0.5), 0 0 80px rgba(255, 145, 77, 0.3)',
      },
      borderRadius: {
        'phoenix': '12px',
        'xl-phoenix': '20px',
      },
      spacing: {
        'phoenix': '1.618rem', // Golden ratio spacing
      }
    },
  },
  plugins: [],
}

export default config
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        },
        wisdom: {
          green: '#10B981',     // Thriving
          yellow: '#F59E0B',    // Attention needed
          red: '#EF4444',       // Breakdown
        }
      },
      fontFamily: {
        'futura': ['Futura', 'system-ui', 'sans-serif'],
        'garamond': ['Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'phoenix-rise': 'phoenixRise 3s ease-in-out infinite',
        'ember-glow': 'emberGlow 2s ease-in-out infinite',
        'flame-flicker': 'flameFlicker 1.5s ease-in-out infinite',
        'ash-scatter': 'ashScatter 4s ease-in-out infinite',
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
      },
      backgroundImage: {
        'phoenix-gradient': 'linear-gradient(135deg, #E63946 0%, #FF914D 25%, #FFD700 50%, #FCBF49 75%, #F77F00 100%)',
        'ash-gradient': 'linear-gradient(180deg, #1A1F2E 0%, #2C3E50 50%, #1D3557 100%)',
        'ember-radial': 'radial-gradient(circle at center, #FF914D 0%, #E63946 50%, #1D3557 100%)',
      },
    },
  },
  plugins: [],
}

export default config
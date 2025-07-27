/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // BiteBase Brand Colors - Dark Theme with Green Accents
        brand: {
          primary: '#22c55e',    // Bright green
          secondary: '#16a34a',  // Darker green
          accent: '#00ff88',     // Neon green
          dark: '#0f172a',       // Dark navy
          darker: '#020617',     // Almost black
          light: '#1e293b',      // Lighter dark
        },
        
        // Dark Theme Base Colors
        background: '#020617',     // Almost black background
        foreground: '#f8fafc',     // Light text
        card: {
          DEFAULT: '#0f172a',      // Dark navy cards
          foreground: '#f8fafc',   // Light text on cards
        },
        popover: {
          DEFAULT: '#1e293b',      // Popover background
          foreground: '#f8fafc',   // Popover text
        },
        primary: {
          DEFAULT: '#22c55e',      // Green primary
          foreground: '#ffffff',   // White text on green
        },
        secondary: {
          DEFAULT: '#1e293b',      // Dark secondary
          foreground: '#cbd5e1',   // Light gray text
        },
        muted: {
          DEFAULT: '#334155',      // Muted background
          foreground: '#94a3b8',   // Muted text
        },
        accent: {
          DEFAULT: '#00ff88',      // Neon green accent
          foreground: '#020617',   // Dark text on accent
        },
        destructive: {
          DEFAULT: '#ef4444',      // Red for destructive actions
          foreground: '#ffffff',   // White text on red
        },
        border: '#334155',         // Border color
        input: '#1e293b',          // Input background
        ring: '#22c55e',           // Focus ring color
        
        // Status Colors for Dark Theme
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          900: '#7f1d1d',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        
        // Chart Colors for Dark Theme
        chart: {
          1: '#22c55e',  // Green
          2: '#3b82f6',  // Blue
          3: '#f59e0b',  // Orange
          4: '#ef4444',  // Red
          5: '#8b5cf6',  // Purple
        },
      },
      
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-lg': '0 0 40px rgba(34, 197, 94, 0.4)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(34, 197, 94, 0.1)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(34, 197, 94, 0.6)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        'dot-pattern': 'radial-gradient(circle, rgba(255,255,255,.1) 1px, transparent 1px)',
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
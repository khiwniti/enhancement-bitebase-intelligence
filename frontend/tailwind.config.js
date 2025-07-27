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
        // BiteBase Brand Colors (Primary Identity)
        bitebase: {
          primary: '#74C365',      // Main BiteBase green
          'primary-dark': '#5fa854',
          'primary-light': '#e8f5e5',
          50: '#f0f9ee',
          100: '#e8f5e5',
          200: '#c8e6c0',
          300: '#a8d79b',
          400: '#8ed080',
          500: '#74C365',
          600: '#5fa854',
          700: '#4a8d43',
          800: '#357232',
          900: '#205721',
        },

        // Food Delivery Theme Colors
        food: {
          orange: '#FF6B35',
          'orange-light': '#FFE5DC',
          red: '#E23D28',
          'red-light': '#F8E6E3',
          yellow: '#F4C431',
          'yellow-light': '#FEF7E0',
          brown: '#8B4513',
          'brown-light': '#F5F0EA',
        },

        // Food Category Colors
        category: {
          pizza: '#FF6B35',
          burger: '#8B4513',
          sushi: '#E23D28',
          taco: '#F4C431',
          pasta: '#74C365',
          dessert: '#FF69B4',
          healthy: '#74C365',
          fastfood: '#FF6B35',
          asian: '#E23D28',
          mexican: '#F4C431',
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
          DEFAULT: '#74C365',      // BiteBase green primary
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
        
        // Chart Colors with Food Theme
        chart: {
          1: '#74C365',  // BiteBase Green
          2: '#FF6B35',  // Food Orange
          3: '#E23D28',  // Food Red
          4: '#F4C431',  // Food Yellow
          5: '#8B4513',  // Food Brown
          6: '#3b82f6',  // Blue
          7: '#8b5cf6',  // Purple
          8: '#FF69B4',  // Pink (desserts)
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
        'food-float': 'foodFloat 6s ease-in-out infinite',
        'delivery-bounce': 'deliveryBounce 2s infinite',
        'plate-spin': 'plateSpinIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'steam-rise': 'steamRise 3s linear infinite',
        'sizzle': 'sizzle 1.5s ease-in-out infinite',
        'chop': 'chop 0.6s ease-in-out',
        'serve': 'serve 1s ease-out',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(116, 195, 101, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(116, 195, 101, 0.6)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        foodFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(1deg)' },
          '50%': { transform: 'translateY(-20px) rotate(0deg)' },
          '75%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        deliveryBounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-20px)' },
          '60%': { transform: 'translateY(-10px)' },
        },
        plateSpinIn: {
          '0%': { transform: 'rotate(-180deg) scale(0)', opacity: '0' },
          '100%': { transform: 'rotate(0deg) scale(1)', opacity: '1' },
        },
        steamRise: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        sizzle: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
        chop: {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-10deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' },
        },
        serve: {
          '0%': { transform: 'translateX(-100px) scale(0.8)', opacity: '0' },
          '60%': { transform: 'translateX(10px) scale(1.05)', opacity: '1' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
        'dot-pattern': 'radial-gradient(circle, rgba(255,255,255,.1) 1px, transparent 1px)',
        'food-warm': 'linear-gradient(135deg, #FF6B35 0%, #E23D28 100%)',
        'food-fresh': 'linear-gradient(135deg, #74C365 0%, #F4C431 100%)',
        'food-premium': 'linear-gradient(135deg, #5fa854 0%, #8B4513 100%)',
        'delivery-hero': 'linear-gradient(135deg, #74C365 0%, #FF6B35 50%, #F4C431 100%)',
        'kitchen-vibes': 'linear-gradient(45deg, #8B4513 0%, #FF6B35 25%, #E23D28 50%, #F4C431 75%, #74C365 100%)',
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
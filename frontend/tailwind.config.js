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
        sans: ['DB Helvetica', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        primary: ['JetBrains Mono', 'Fira Code', 'monospace'],
        secondary: ['DB Helvetica', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // BiteBase Brand Colors (Corporate Identity 2024)
        bitebase: {
          primary: '#74C365',      // Mantis Green - primary brand color
          'primary-hover': '#68B359',
          'primary-light': '#e8f5e5',
          accent: '#E23D28',       // Chili Red - accent color
          'accent-hover': '#D12E18',
          'accent-light': '#f8e6e3',
          secondary: '#F4C431',    // Saffron - secondary color
          'secondary-light': '#fef7e0',
          50: '#f0f9ee',
          100: '#e8f5e5',
          200: '#c8e6c0',
          300: '#a8d79b',
          400: '#8ed080',
          500: '#74C365',
          600: '#68B359',
          700: '#5fa854',
          800: '#4a8d43',
          900: '#357232',
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
        
        // Light Theme Base Colors (Corporate Identity 2024)
        background: '#F8F9FA',     // Light gray background
        foreground: '#2D2D2D',     // Dark text
        card: {
          DEFAULT: '#FFFFFF',      // White cards
          foreground: '#2D2D2D',   // Dark text on cards
        },
        popover: {
          DEFAULT: '#FFFFFF',      // White popover background
          foreground: '#2D2D2D',   // Dark popover text
        },
        primary: {
          DEFAULT: '#74C365',      // Mantis Green primary
          foreground: '#FFFFFF',   // White text on green
        },
        secondary: {
          DEFAULT: '#F8F9FA',      // Light secondary
          foreground: '#2D2D2D',   // Dark text
        },
        muted: {
          DEFAULT: '#F8F9FA',      // Light muted background
          foreground: '#6C757D',   // Gray muted text
        },
        accent: {
          DEFAULT: '#E23D28',      // Chili Red accent
          foreground: '#FFFFFF',   // White text on accent
        },
        destructive: {
          DEFAULT: '#E74C3C',      // Red for destructive actions
          foreground: '#FFFFFF',   // White text on red
        },
        border: '#E9ECEF',         // Light border color
        input: '#FFFFFF',          // White input background
        ring: '#74C365',           // Mantis Green focus ring
        
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
        
        // Chart Colors (Corporate Identity 2024)
        chart: {
          1: '#74C365',  // Mantis Green - primary data series
          2: '#E23D28',  // Chili Red - secondary/contrast data
          3: '#F4C431',  // Saffron - tertiary/accent data
          4: '#2196F3',  // Info Blue - additional data series
          5: '#6C757D',  // Neutral - neutral data and baselines
          6: '#FF6B35',  // Legacy Orange (compatibility)
          7: '#8B4513',  // Brown (food categories)
          8: '#FF69B4',  // Pink (special categories)
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
        'brand-primary': 'linear-gradient(135deg, #74C365 0%, #68B359 100%)',
        'brand-accent': 'linear-gradient(135deg, #E23D28 0%, #D12E18 100%)',
        'brand-warm': 'linear-gradient(135deg, #E23D28 0%, #F4C431 100%)',
        'brand-fresh': 'linear-gradient(135deg, #74C365 0%, #F4C431 100%)',
        'brand-hero': 'linear-gradient(135deg, #74C365 0%, #E23D28 50%, #F4C431 100%)',
        'food-warm': 'linear-gradient(135deg, #FF6B35 0%, #E23D28 100%)', // Legacy compatibility
        'food-fresh': 'linear-gradient(135deg, #74C365 0%, #F4C431 100%)', // Legacy compatibility
      },
      
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
'use client'

import React, { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { deliveryVariants, gestureAnimations } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'delivery' | 'food' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  foodTheme?: 'pizza' | 'burger' | 'healthy' | 'asian' | 'dessert'
  animationType?: 'delivery' | 'bounce' | 'scale' | 'food'
  motionProps?: MotionProps
}

const buttonVariants = {
  primary: 'bg-bitebase-primary hover:bg-bitebase-primary-dark text-white',
  secondary: 'bg-white hover:bg-gray-50 text-bitebase-primary border-2 border-bitebase-primary',
  delivery: 'bg-gradient-to-r from-bitebase-primary via-food-orange to-food-yellow text-white',
  food: 'bg-food-warm text-white',
  ghost: 'bg-transparent hover:bg-bitebase-100 text-bitebase-700',
}

const sizeVariants = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
}

const foodThemeVariants = {
  pizza: 'bg-category-pizza hover:bg-category-pizza/90',
  burger: 'bg-category-burger hover:bg-category-burger/90',
  healthy: 'bg-category-healthy hover:bg-category-healthy/90',
  asian: 'bg-category-asian hover:bg-category-asian/90',
  dessert: 'bg-category-dessert hover:bg-category-dessert/90',
}

const animationVariants = {
  delivery: deliveryVariants,
  bounce: {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    },
    tap: { 
      scale: 0.95,
      y: 0,
      transition: { duration: 0.1 }
    },
  },
  scale: {
    idle: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.97,
      transition: { duration: 0.1 }
    },
  },
  food: {
    idle: { 
      scale: 1,
      rotate: 0,
    },
    hover: { 
      scale: 1.05,
      rotate: [0, -1, 1, 0],
      transition: { 
        scale: { duration: 0.2 },
        rotate: { duration: 0.5, repeat: 1 }
      }
    },
    tap: { 
      scale: 0.95,
      rotate: -2,
      transition: { duration: 0.1 }
    },
  },
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    foodTheme,
    animationType = 'bounce',
    motionProps = {},
    children,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
      'transition-colors focus-visible:outline-none focus-visible:ring-2',
      'focus-visible:ring-bitebase-primary focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'relative overflow-hidden',
      sizeVariants[size],
      foodTheme ? foodThemeVariants[foodTheme] : buttonVariants[variant],
      className
    )

    const currentVariants = animationVariants[animationType]

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        variants={currentVariants}
        initial="idle"
        whileHover={!disabled ? "hover" : "idle"}
        whileTap={!disabled ? "tap" : "idle"}
        disabled={disabled || isLoading}
        {...motionProps}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
        
        {/* Button content */}
        <motion.div
          className={cn("flex items-center gap-2", isLoading && "opacity-0")}
          layout
        >
          {leftIcon && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {leftIcon}
            </motion.span>
          )}
          {children}
          {rightIcon && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {rightIcon}
            </motion.span>
          )}
        </motion.div>

        {/* Ripple effect for food variant */}
        {variant === 'delivery' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        )}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

// Specialized Food-themed buttons
export const PizzaButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'foodTheme'>>(
  (props, ref) => (
    <AnimatedButton 
      ref={ref} 
      {...props} 
      foodTheme="pizza" 
      animationType="food"
      leftIcon="🍕"
    />
  )
)

PizzaButton.displayName = 'PizzaButton'

export const BurgerButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'foodTheme'>>(
  (props, ref) => (
    <AnimatedButton 
      ref={ref} 
      {...props} 
      foodTheme="burger" 
      animationType="food"
      leftIcon="🍔"
    />
  )
)

BurgerButton.displayName = 'BurgerButton'

export const HealthyButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'foodTheme'>>(
  (props, ref) => (
    <AnimatedButton 
      ref={ref} 
      {...props} 
      foodTheme="healthy" 
      animationType="food"
      leftIcon="🥗"
    />
  )
)

HealthyButton.displayName = 'HealthyButton'

export const DeliveryButton = forwardRef<HTMLButtonElement, Omit<AnimatedButtonProps, 'variant'>>(
  (props, ref) => (
    <AnimatedButton 
      ref={ref} 
      {...props} 
      variant="delivery" 
      animationType="delivery"
      rightIcon="🚚"
    />
  )
)

DeliveryButton.displayName = 'DeliveryButton'

export default AnimatedButton
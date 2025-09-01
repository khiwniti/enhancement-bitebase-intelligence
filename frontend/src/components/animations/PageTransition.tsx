'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, heroEntranceVariants, staggerContainer } from '@/lib/animations'
import { FoodParticles, FloatingFoodIcons } from './FoodParticles'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  enableParticles?: boolean
  enableFloatingIcons?: boolean
  variant?: 'default' | 'hero' | 'dashboard'
  particleCount?: number
}

export function PageTransition({
  children,
  className = '',
  enableParticles = false,
  enableFloatingIcons = false,
  variant = 'default',
  particleCount = 15,
}: PageTransitionProps) {
  const variants = {
    default: pageVariants,
    hero: heroEntranceVariants,
    dashboard: staggerContainer,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={`min-h-screen ${className}`}
        variants={variants[variant]}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Background Food Effects */}
        {enableParticles && (
          <FoodParticles 
            count={particleCount} 
            isActive={true}
            className="opacity-30"
          />
        )}
        
        {enableFloatingIcons && (
          <FloatingFoodIcons className="opacity-20" />
        )}

        {/* Page Content */}
        <motion.div
          className="relative z-10"
          variants={variant === 'dashboard' ? staggerContainer : undefined}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Specialized Page Wrappers
export function HeroPageTransition({ children, ...props }: Omit<PageTransitionProps, 'variant'>) {
  return (
    <PageTransition 
      {...props} 
      variant="hero" 
      enableParticles 
      enableFloatingIcons
      particleCount={10}
    >
      {children}
    </PageTransition>
  )
}

export function DashboardPageTransition({ children, ...props }: Omit<PageTransitionProps, 'variant'>) {
  return (
    <PageTransition 
      {...props} 
      variant="dashboard"
      enableFloatingIcons
    >
      {children}
    </PageTransition>
  )
}

export function LandingPageTransition({ children, ...props }: Omit<PageTransitionProps, 'variant'>) {
  return (
    <PageTransition 
      {...props} 
      variant="hero"
      enableParticles
      enableFloatingIcons
      particleCount={20}
    >
      {children}
    </PageTransition>
  )
}

export default PageTransition
'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { foodParticleVariants } from '@/lib/animations'

interface FoodParticle {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  delay: number
}

interface FoodParticlesProps {
  count?: number
  className?: string
  foodTypes?: string[]
  isActive?: boolean
}

const defaultFoodEmojis = ['🍕', '🍔', '🌮', '🍜', '🍱', '🥗', '🍰', '🥙', '🍗', '🍳']

export function FoodParticles({ 
  count = 20, 
  className = '', 
  foodTypes = defaultFoodEmojis,
  isActive = true 
}: FoodParticlesProps) {
  const [particles, setParticles] = useState<FoodParticle[]>([])
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateWindowSize()
    window.addEventListener('resize', updateWindowSize)
    return () => window.removeEventListener('resize', updateWindowSize)
  }, [])

  useEffect(() => {
    if (!isActive || windowSize.width === 0) return

    const generateParticles = () => {
      const newParticles: FoodParticle[] = []
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: `particle-${i}`,
          emoji: foodTypes[Math.floor(Math.random() * foodTypes.length)],
          x: Math.random() * windowSize.width,
          y: windowSize.height + 50, // Start below viewport
          size: Math.random() * 20 + 20, // 20-40px
          delay: Math.random() * 5, // 0-5s delay
        })
      }
      
      setParticles(newParticles)
    }

    generateParticles()
  }, [count, foodTypes, isActive, windowSize])

  if (!isActive) return null

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      <AnimatePresence>
        {particles.map((particle, index) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: particle.x,
              bottom: 0,
              fontSize: particle.size,
            }}
            variants={foodParticleVariants}
            custom={index}
            initial="float"
            animate="float"
            exit={{ opacity: 0 }}
          >
            {particle.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Specialized food particle components
export function PizzaParticles(props: Omit<FoodParticlesProps, 'foodTypes'>) {
  return <FoodParticles {...props} foodTypes={['🍕']} />
}

export function BurgerParticles(props: Omit<FoodParticlesProps, 'foodTypes'>) {
  return <FoodParticles {...props} foodTypes={['🍔']} />
}

export function HealthyParticles(props: Omit<FoodParticlesProps, 'foodTypes'>) {
  return <FoodParticles {...props} foodTypes={['🥗', '🥙', '🍱', '🥑']} />
}

export function AsianParticles(props: Omit<FoodParticlesProps, 'foodTypes'>) {
  return <FoodParticles {...props} foodTypes={['🍜', '🍱', '🥟', '🍙', '🥢']} />
}

// Interactive floating food icons (smaller, always visible)
export function FloatingFoodIcons({ className = '' }: { className?: string }) {
  const floatingFoods = [
    { emoji: '🍕', x: '10%', y: '20%', delay: 0 },
    { emoji: '🍔', x: '85%', y: '15%', delay: 1 },
    { emoji: '🌮', x: '15%', y: '70%', delay: 2 },
    { emoji: '🍜', x: '80%', y: '60%', delay: 3 },
    { emoji: '🥗', x: '50%', y: '80%', delay: 4 },
    { emoji: '🍰', x: '90%', y: '85%', delay: 5 },
  ]

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-10 ${className}`}>
      {floatingFoods.map((food, index) => (
        <motion.div
          key={`floating-${index}`}
          className="absolute text-2xl opacity-20"
          style={{
            left: food.x,
            top: food.y,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 6 + index,
            repeat: Infinity,
            delay: food.delay,
            ease: 'easeInOut',
          }}
        >
          {food.emoji}
        </motion.div>
      ))}
    </div>
  )
}

// Steam effect for hot food
export function SteamEffect({ 
  isVisible = true, 
  className = '',
  count = 3 
}: { 
  isVisible?: boolean
  className?: string
  count?: number 
}) {
  if (!isVisible) return null

  return (
    <div className={`relative ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={`steam-${i}`}
          className="absolute w-1 h-4 bg-gray-300 rounded-full opacity-60"
          style={{
            left: `${20 + i * 15}%`,
            bottom: '100%',
          }}
          animate={{
            y: [-20, -40],
            opacity: [0.6, 0],
            scale: [1, 1.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export default FoodParticles
'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedButton } from '@/components/animations/AnimatedButton'
import { FoodParticles, FloatingFoodIcons } from '@/components/animations/FoodParticles'
import FoodInspiredLandingPage from '@/components/landing/FoodInspiredLandingPage'
import EnhancedFloatingChatbot from '@/components/ai/EnhancedFloatingChatbot'
import { 
  ArrowRight,
  Sparkles,
  Rocket,
  Zap
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Enhanced Floating Chatbot */}
      <EnhancedFloatingChatbot position="bottom-right" />
      
      {/* Food Inspired Landing Page */}
      <FoodInspiredLandingPage />
      
      {/* Quick Access Panel */}
      <motion.div
        className="fixed top-6 right-6 z-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-lg">
          <div className="text-center space-y-3">
            <div className="text-2xl">🚀</div>
            <p className="text-sm font-medium text-gray-700">Enhanced Experience</p>
            <div className="space-y-2">
              <Link href="/enhanced">
                <AnimatedButton variant="primary" size="sm" className="w-full">
                  <Sparkles className="h-4 w-4" />
                  Full Demo
                </AnimatedButton>
              </Link>
              <Link href="/dashboard/builder">
                <AnimatedButton variant="secondary" size="sm" className="w-full">
                  <Zap className="h-4 w-4" />
                  Dashboard
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

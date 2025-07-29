'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Rocket,
  BarChart3,
  MapPin,
  Brain,
  Star,
  Users,
  ChefHat,
  Coffee,
  Utensils,
  Pizza,
  Cookie,
  ArrowRight,
  Play,
  CheckCircle,
  Globe,
  Shield,
  Zap as Lightning,
  TrendingUp,
  Target,
  Smartphone,
  Monitor,
  Tablet,
  Eye,
  Heart,
  Cpu,
  Database,
  Cloud
} from 'lucide-react'

// Enhanced Floating Elements with Multiple Layers
const FloatingElements = () => {
  const foodIcons = [ChefHat, Coffee, Utensils, Pizza, Cookie]
  const techIcons = [Cpu, Database, Cloud, Brain, BarChart3]
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })

      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight })
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Background Orbs */}
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={`orb-${index}`}
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, ${
              ['rgba(59, 130, 246, 0.1)', 'rgba(147, 51, 234, 0.1)', 'rgba(236, 72, 153, 0.1)',
               'rgba(34, 197, 94, 0.1)', 'rgba(251, 191, 36, 0.1)', 'rgba(239, 68, 68, 0.1)'][index]
            } 0%, transparent 70%)`,
            width: `${200 + Math.random() * 300}px`,
            height: `${200 + Math.random() * 300}px`,
          }}
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Food Icons Layer */}
      {foodIcons.map((Icon, index) => (
        <motion.div
          key={`food-${index}`}
          className="absolute text-blue-200/20"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            rotate: 0,
            scale: 0.8
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            rotate: 360,
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 25 + Math.random() * 15,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Icon size={20 + Math.random() * 20} />
        </motion.div>
      ))}

      {/* Tech Icons Layer */}
      {techIcons.map((Icon, index) => (
        <motion.div
          key={`tech-${index}`}
          className="absolute text-purple-200/15"
          initial={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            rotate: 0
          }}
          animate={{
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            rotate: -360
          }}
          transition={{
            duration: 30 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Icon size={16 + Math.random() * 12} />
        </motion.div>
      ))}
    </div>
  )
}

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return <span>{count}{suffix}</span>
}

// Interactive Cursor Follower
const CursorFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full pointer-events-none z-50 mix-blend-difference"
      animate={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
        scale: 1
      }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
    />
  )
}

export default function StunningLandingPage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])
  const rotate = useTransform(scrollY, [0, 300], [0, -5])

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cursor Follower */}
      <CursorFollower />

      {/* Enhanced Animated Background - Style Guide Compliant */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent" />

        {/* Interactive Mouse Parallax */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 107, 53, 0.05), transparent 40%)`
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />

        <FloatingElements />
      </div>

      {/* Hero Section */}
      <motion.div
        style={{ y: y1, opacity, scale, rotateX: rotate }}
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* Enhanced Floating Badge with Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center space-x-3 bg-white/90 backdrop-blur-xl rounded-full px-8 py-4 border border-gray-200 shadow-2xl"
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 1)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Sparkles className="h-6 w-6 text-orange-500" />
              </motion.div>
              <span className="text-gray-700 font-semibold text-lg">AI-Powered Restaurant Intelligence</span>
              <motion.div
                className="w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                LIVE
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Main Headline with Advanced Typography */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-6 leading-none">
              <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.7, type: "spring", stiffness: 100 }}
                className="block relative"
              >
                <span className="text-orange-500 relative z-10" style={{
                  textShadow: '0 4px 8px rgba(255, 107, 53, 0.3)',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}>BiteBase</span>
                <motion.div
                  className="absolute inset-0 bg-orange-500/20 blur-xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.9, type: "spring", stiffness: 100 }}
                className="block relative"
              >
                <span className="text-gray-800 relative z-10" style={{
                  textShadow: '0 4px 8px rgba(45, 45, 45, 0.3)',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                }}>
                  Intelligence
                </span>
                <motion.div
                  className="absolute inset-0 bg-gray-800/20 blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 1, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.div>
            </h1>
          </motion.div>

          {/* Enhanced Subtitle with Staggered Animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="max-w-5xl mx-auto mb-16"
          >
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="text-2xl md:text-3xl text-gray-700 leading-relaxed font-light mb-6"
            >
              Harness the power of{' '}
              <motion.span
                className="font-bold text-orange-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI
              </motion.span>
              {' '}to optimize operations, boost profits, and delight customers.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
            >
              Join{' '}
              <motion.span
                className="font-semibold text-green-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                5,000+
              </motion.span>
              {' '}restaurants already transforming their business with BiteBase Intelligence.
            </motion.p>
          </motion.div>

          {/* Enhanced CTA Buttons with Advanced Interactions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-20"
          >
            {/* Primary CTA Button */}
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl border-0"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-4"
                >
                  <Rocket className="h-7 w-7" />
                </motion.div>
                Start Free Trial
                <motion.div
                  className="ml-4"
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-6 w-6" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Secondary CTA Button */}
            <motion.div
              whileHover={{
                scale: 1.05,
                y: -5
              }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/40 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"
              />
              <Button
                variant="outline"
                size="lg"
                className="relative border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800 px-12 py-6 text-xl font-bold rounded-full backdrop-blur-xl"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="mr-4"
                >
                  <Play className="h-7 w-7" />
                </motion.div>
                Watch Demo
                <motion.div
                  className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Eye className="h-6 w-6" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Trust Indicators with Interactive Elements */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              { icon: Shield, label: "Enterprise Security", color: "from-green-400 to-emerald-500", description: "Bank-level encryption" },
              { icon: Globe, label: "Global Scale", color: "from-blue-400 to-cyan-500", description: "50+ countries" },
              { icon: Lightning, label: "Real-time Analytics", color: "from-yellow-400 to-orange-500", description: "Sub-second insights" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 2.2 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  y: -5
                }}
                className="group"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 hover:border-orange-500 transition-all duration-300 shadow-lg">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h4 className="text-gray-800 font-semibold text-lg">{item.label}</h4>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Interactive Device Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.5 }}
            className="mt-20 relative"
          >
            <div className="flex items-center justify-center space-x-8">
              {[
                { icon: Smartphone, label: "Mobile", delay: 0 },
                { icon: Tablet, label: "Tablet", delay: 0.2 },
                { icon: Monitor, label: "Desktop", delay: 0.4 }
              ].map((device, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 2.7 + device.delay,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{
                    scale: 1.1,
                    y: -10
                  }}
                  className="text-center group cursor-pointer"
                >
                  <motion.div
                    className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-3 border border-white/20 group-hover:border-white/40 transition-all duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <device.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <span className="text-white/80 text-sm font-medium">{device.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Stats Section with Glassmorphism */}
      <motion.div
        style={{ y: y2 }}
        className="relative z-10 py-32 bg-gradient-to-b from-white/5 via-white/10 to-white/5 backdrop-blur-xl"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full"
              style={{
                background: `radial-gradient(circle, ${
                  ['rgba(59, 130, 246, 0.1)', 'rgba(147, 51, 234, 0.1)', 'rgba(236, 72, 153, 0.1)'][i]
                } 0%, transparent 70%)`,
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2
              className="text-5xl md:text-7xl font-black text-gray-800 mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Trusted by{' '}
              <motion.span
                className="text-orange-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Industry Leaders
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of restaurants worldwide who have transformed their business with our{' '}
              <span className="font-bold text-orange-500">AI platform</span>
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: 5000,
                suffix: "+",
                label: "Restaurants",
                icon: ChefHat,
                color: "from-blue-500 to-cyan-500",
                description: "Active users"
              },
              {
                number: 98,
                suffix: "%",
                label: "Satisfaction Rate",
                icon: Heart,
                color: "from-pink-500 to-rose-500",
                description: "Customer happiness"
              },
              {
                number: 2.5,
                suffix: "M+",
                label: "Orders Analyzed",
                icon: TrendingUp,
                color: "from-green-500 to-emerald-500",
                description: "Data processed"
              },
              {
                number: 35,
                suffix: "%",
                label: "Avg. Revenue Increase",
                icon: Target,
                color: "from-purple-500 to-violet-500",
                description: "Business growth"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    y: -10,
                    rotateY: 5
                  }}
                  className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 hover:border-orange-500 transition-all duration-500 overflow-hidden shadow-lg"
                >
                  {/* Background Gradient */}
                  <motion.div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mb-6 mx-auto relative z-10`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Number */}
                  <motion.div
                    className="text-4xl md:text-5xl font-black text-gray-800 mb-3 relative z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </motion.div>

                  {/* Label */}
                  <div className="text-gray-800 font-bold text-lg mb-2 relative z-10">{stat.label}</div>
                  <div className="text-gray-600 text-sm relative z-10">{stat.description}</div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Interactive Features Preview Section */}
      <div className="relative z-10 py-32 bg-gradient-to-b from-black/20 to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-8">
              Experience the{' '}
              <span className="text-orange-500">
                Future
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Interactive AI-powered tools that revolutionize how restaurants operate
            </p>
          </motion.div>

          {/* Interactive Demo Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "AI Chat Assistant",
                description: "Ask questions in natural language",
                icon: Brain,
                color: "from-blue-500 to-cyan-500",
                demo: "💬 'Show me today's best-selling items'"
              },
              {
                title: "Real-time Dashboard",
                description: "Live metrics and insights",
                icon: BarChart3,
                color: "from-green-500 to-emerald-500",
                demo: "📊 Revenue: $12,450 ↗️ +15%"
              },
              {
                title: "Smart Predictions",
                description: "AI-powered forecasting",
                icon: Target,
                color: "from-purple-500 to-pink-500",
                demo: "🔮 Tomorrow: 340 orders expected"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  y: -10
                }}
                className="group cursor-pointer"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 hover:border-orange-500 transition-all duration-500 relative overflow-hidden shadow-lg">
                  {/* Background Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>

                  {/* Demo Preview */}
                  <motion.div
                    className="bg-gray-100 rounded-xl p-4 border border-gray-200"
                    whileHover={{ scale: 1.02 }}
                  >
                    <code className="text-green-600 text-sm font-mono">{feature.demo}</code>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative z-10 py-32 bg-gradient-to-b from-white via-gray-50 to-white">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <motion.h2
              className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Everything You Need to{' '}
              <motion.span
                className="text-orange-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Succeed
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Comprehensive restaurant intelligence platform with{' '}
              <span className="font-bold text-orange-500">AI-powered insights</span> that drive real results
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description: "Monitor performance, track KPIs, and get actionable insights with our advanced analytics dashboard.",
                features: ["Live sales tracking", "Customer behavior analysis", "Performance benchmarking"],
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-50 to-cyan-50",
                stats: "99.9% uptime"
              },
              {
                icon: MapPin,
                title: "Location Intelligence",
                description: "Optimize site selection and understand market dynamics with AI-powered location analytics.",
                features: ["Market analysis", "Competitor insights", "Demographic data"],
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
                stats: "50+ data sources"
              },
              {
                icon: Brain,
                title: "AI Predictions",
                description: "Leverage machine learning to forecast trends, optimize pricing, and maximize profitability.",
                features: ["Demand forecasting", "Price optimization", "Menu engineering"],
                color: "from-green-500 to-emerald-500",
                bgColor: "from-green-50 to-emerald-50",
                stats: "95% accuracy"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -15,
                  rotateY: 5,
                  scale: 1.02
                }}
                className="group perspective-1000"
              >
                <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 h-full relative overflow-hidden transform-gpu transition-all duration-500 group-hover:shadow-3xl">
                  {/* Enhanced Background Gradient */}
                  <motion.div
                    className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-5 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 group-hover:opacity-10 transition-all duration-700`}
                  />
                  <motion.div
                    className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr ${feature.bgColor} opacity-30 rounded-full translate-y-16 -translate-x-16 group-hover:scale-125 transition-transform duration-500`}
                  />

                  {/* Enhanced Icon with 3D Effect */}
                  <motion.div
                    whileHover={{
                      rotate: 360,
                      scale: 1.1
                    }}
                    transition={{ duration: 0.6 }}
                    className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mb-8 relative z-10 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <feature.icon className="h-10 w-10 text-white" />
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-3xl"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  {/* Stats Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                    className={`inline-block bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-bold mb-6 relative z-10`}
                  >
                    {feature.stats}
                  </motion.div>

                  {/* Enhanced Content */}
                  <h3 className="text-3xl font-black text-gray-900 mb-6 relative z-10 group-hover:text-gray-800 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-8 relative z-10 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Enhanced Features List */}
                  <ul className="space-y-4 relative z-10 mb-8">
                    {feature.features.map((item, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: (index * 0.2) + (idx * 0.1) + 0.4 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 5 }}
                        className="flex items-center space-x-4 group/item"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        </motion.div>
                        <span className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors duration-200">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Enhanced CTA */}
                  <motion.div
                    whileHover={{ x: 10 }}
                    className="relative z-10"
                  >
                    <Link
                      href="/analytics"
                      className="inline-flex items-center text-orange-500 font-bold hover:text-orange-600 text-lg group/link"
                    >
                      Learn more
                      <motion.div
                        className="ml-3"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5 group-hover/link:translate-x-1 transition-transform duration-200" />
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Hover Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative z-10 py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real stories from restaurant owners who transformed their business with BiteBase Intelligence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Owner, Golden Dragon Restaurant",
                avatar: "👩‍🍳",
                rating: 5,
                quote: "BiteBase Intelligence helped us increase revenue by 40% in just 6 months. The AI insights are incredible!"
              },
              {
                name: "Marco Rodriguez",
                role: "CEO, Bella Vista Chain",
                avatar: "👨‍💼",
                rating: 5,
                quote: "The location intelligence feature saved us from making a costly mistake. ROI was immediate."
              },
              {
                name: "Emily Johnson",
                role: "Manager, Coastal Cafe",
                avatar: "👩‍💻",
                rating: 5,
                quote: "Real-time analytics transformed how we operate. We can now predict busy periods and optimize staffing."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="text-gray-800 font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 text-lg leading-relaxed">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Final CTA Section */}
      <div className="relative z-10 py-32 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, white 0%, transparent 70%)`,
                left: `${-10 + i * 25}%`,
                top: `${-20 + i * 10}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                x: [0, 50, 0],
                y: [0, -30, 0]
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-5xl md:text-8xl font-black text-gray-800 mb-12 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to{' '}
              <motion.span
                className="relative inline-block text-orange-500"
                whileHover={{ scale: 1.05 }}
              >
                Transform
                <motion.div
                  className="absolute inset-0 bg-orange-500/20 blur-xl rounded-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.span>
              <br />
              Your Restaurant?
            </motion.h2>

            <motion.p
              className="text-2xl md:text-3xl text-gray-600 mb-16 leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join{' '}
              <motion.span
                className="font-bold text-orange-500"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                5,000+
              </motion.span>
              {' '}successful restaurants. Start your free trial today and see results in{' '}
              <motion.span
                className="font-bold text-orange-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                24 hours
              </motion.span>
              .
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Primary CTA - Enhanced */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -8
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <motion.div
                  className="absolute -inset-2 bg-white/30 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <Button
                  size="lg"
                  className="relative bg-orange-500 text-white hover:bg-orange-600 px-16 py-8 text-2xl font-black rounded-full shadow-2xl border-0 group-hover:shadow-3xl transition-all duration-300"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="mr-4"
                  >
                    <Rocket className="h-8 w-8" />
                  </motion.div>
                  Start Free Trial
                  <motion.div
                    className="ml-4"
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-8 w-8" />
                  </motion.div>
                </Button>
              </motion.div>

              {/* Secondary CTA - Enhanced */}
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -8
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <motion.div
                  className="absolute -inset-2 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"
                />
                <Button
                  variant="outline"
                  size="lg"
                  className="relative border-3 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800 px-16 py-8 text-2xl font-black rounded-full backdrop-blur-xl group-hover:shadow-2xl transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="mr-4"
                  >
                    <Users className="h-8 w-8" />
                  </motion.div>
                  Book Demo
                  <motion.div
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="h-8 w-8" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                { icon: CheckCircle, text: "14-day free trial", subtext: "Full access" },
                { icon: CheckCircle, text: "No credit card required", subtext: "Start instantly" },
                { icon: CheckCircle, text: "Setup in 5 minutes", subtext: "Quick onboarding" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="flex flex-col items-center text-center group"
                >
                  <motion.div
                    className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 group-hover:border-orange-500 transition-all duration-300 w-full shadow-lg"
                    whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                      className="mb-3"
                    >
                      <item.icon className="h-8 w-8 text-green-500 mx-auto" />
                    </motion.div>
                    <div className="text-gray-800 font-bold text-lg mb-1">{item.text}</div>
                    <div className="text-gray-600 text-sm">{item.subtext}</div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 3, duration: 0.8, type: "spring", stiffness: 200 }}
        whileHover={{
          scale: 1.15,
          y: -5
        }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative group">
          <motion.div
            className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <Link href="/dashboard">
            <Button
              size="lg"
              className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full p-6 shadow-2xl border-0 group-hover:shadow-3xl transition-all duration-300"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>
            </Button>
          </Link>

          {/* Tooltip */}
          <motion.div
            className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap"
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            Go to Dashboard
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      <motion.div
        className="fixed bottom-8 left-8 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 3.5, duration: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          size="lg"
          className="bg-white/90 backdrop-blur-xl border border-gray-200 text-gray-800 hover:bg-white hover:border-orange-500 rounded-full p-4 shadow-xl"
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowRight className="h-6 w-6 rotate-[-90deg]" />
          </motion.div>
        </Button>
      </motion.div>
    </div>
  )
}

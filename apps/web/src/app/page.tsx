'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/button'
import { LandingNavbar } from '@/components/landing-navbar'
import { Footer } from '@/components/footer'
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
    return undefined
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
      {/* Landing Navbar */}
      <LandingNavbar />

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
        className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 lg:pt-24"
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
                asChild
                size="lg"
                className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl border-0"
              >
                <Link href="/auth/signup">
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
                </Link>
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
                asChild
                variant="outline"
                size="lg"
                className="relative border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800 px-12 py-6 text-xl font-bold rounded-full backdrop-blur-xl"
              >
                <Link href="/auth/login">
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
                </Link>
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
      <motion.div
        id="analytics"
        className="relative z-10 py-32 bg-gradient-to-b from-black/20 to-transparent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-5xl md:text-6xl font-black text-gray-800 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Experience the{' '}
              <motion.span
                className="text-orange-500"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255, 107, 53, 0.5)",
                    "0 0 40px rgba(255, 107, 53, 0.8)",
                    "0 0 20px rgba(255, 107, 53, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Future
              </motion.span>
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Interactive AI-powered tools that revolutionize how restaurants operate
            </motion.p>
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
                  scale: 1.05,
                  y: -10,
                  rotateY: 5
                }}
                className="group cursor-pointer perspective-1000"
              >
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 hover:border-orange-500 transition-all duration-500 relative overflow-hidden shadow-lg">
                  {/* Background Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Animated Background Particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </div>

                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 relative z-10`}
                    whileHover={{
                      rotate: 360,
                      scale: 1.1
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 relative z-10">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 relative z-10">{feature.description}</p>

                  {/* Demo Preview */}
                  <motion.div
                    className="bg-gray-100 rounded-xl p-4 border border-gray-200 relative z-10"
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.code
                      className="text-green-600 text-sm font-mono"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {feature.demo}
                    </motion.code>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Features Section */}
      <div id="features" className="relative z-10 py-32 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Everything You Need to{' '}
              <span className="text-orange-500">Succeed</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Comprehensive restaurant intelligence platform with{' '}
              <span className="font-bold text-orange-500">AI-powered insights</span> that drive real results
            </p>
          </div>

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
              <div key={index} className="group perspective-1000">
                <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 h-full relative overflow-hidden transform-gpu transition-all duration-500 group-hover:shadow-3xl">
                  {/* Enhanced Background Gradient */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-5 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 group-hover:opacity-10 transition-all duration-700`} />
                  <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr ${feature.bgColor} opacity-30 rounded-full translate-y-16 -translate-x-16 group-hover:scale-125 transition-transform duration-500`} />

                  {/* Enhanced Icon */}
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mb-8 relative z-10 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Stats Badge */}
                  <div className={`inline-block bg-gradient-to-r ${feature.color} text-white px-4 py-2 rounded-full text-sm font-bold mb-6 relative z-10`}>
                    {feature.stats}
                  </div>

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
                      <li key={idx} className="flex items-center space-x-4 group/item">
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors duration-200">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Enhanced CTA */}
                  <div className="relative z-10">
                    <Link
                      href="/analytics"
                      className="inline-flex items-center text-orange-500 font-bold hover:text-orange-600 text-lg group/link"
                    >
                      Learn more
                      <ArrowRight className="h-5 w-5 ml-3 group-hover/link:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <motion.div
        id="about"
        className="relative z-10 py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              What Our Customers Say
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Real stories from restaurant owners who transformed their business with BiteBase Intelligence
            </motion.p>
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
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.05,
                  y: -10
                }}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-gray-200 shadow-lg"
              >
                <motion.div
                  className="flex items-center mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="text-4xl mr-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <h4 className="text-gray-800 font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex mb-4"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.5 }}
                  viewport={{ once: true }}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.2 + 0.6 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.p
                  className="text-gray-700 text-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 + 0.7 }}
                  viewport={{ once: true }}
                >
                  "{testimonial.quote}"
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Final CTA Section */}
      <motion.div
        id="pricing"
        className="relative z-10 py-32 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full bg-white/5"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
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
              className="text-5xl md:text-8xl font-black text-white mb-12 leading-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to{' '}
              <motion.span
                className="relative inline-block text-white"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(255, 255, 255, 0.5)",
                    "0 0 40px rgba(255, 255, 255, 0.8)",
                    "0 0 20px rgba(255, 255, 255, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Transform
              </motion.span>
              <br />
              Your Restaurant?
            </motion.h2>

            <motion.p
              className="text-2xl md:text-3xl text-white/90 mb-16 leading-relaxed font-light"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join{' '}
              <motion.span
                className="font-bold text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                5,000+
              </motion.span>
              {' '}successful restaurants. Start your free trial today and see results in{' '}
              <motion.span
                className="font-bold text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
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
                className="relative group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute -inset-2 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <Button
                  asChild
                  size="lg"
                  className="relative bg-white text-orange-600 hover:bg-gray-100 px-16 py-8 text-2xl font-black rounded-full shadow-2xl border-0 group-hover:shadow-3xl transition-all duration-300"
                >
                  <Link href="/auth/signup">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
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
                  </Link>
                </Button>
              </motion.div>

              {/* Secondary CTA - Enhanced */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute -inset-2 bg-white/10 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"
                />
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="relative border-3 border-white text-white hover:bg-white hover:text-orange-600 hover:border-white px-16 py-8 text-2xl font-black rounded-full backdrop-blur-xl group-hover:shadow-2xl transition-all duration-300"
                >
                  <Link href="/auth/login">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="mr-4"
                    >
                      <Users className="h-8 w-8" />
                    </motion.div>
                    Book Demo
                    <motion.div
                      className="ml-4"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Play className="h-8 w-8" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.p
                className="text-white/80 text-lg mb-4"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ✅ No credit card required • ✅ 14-day free trial • ✅ Cancel anytime
              </motion.p>
              <div className="flex items-center justify-center space-x-8 text-white/60">
                {[
                  { icon: Shield, label: "Enterprise Security" },
                  { icon: Users, label: "24/7 Support" },
                  { icon: Globe, label: "Global Scale" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AnimatedButton,
  AnimatedCard,
  FloatingFoodIcons,
  FoodParticles,
  HeroPageTransition,
  staggerContainer,
  heroEntranceVariants,
  deliveryVariants
} from '@/components/animations'
import { 
  Zap, 
  MapPin, 
  TrendingUp, 
  Users, 
  Building, 
  BarChart3, 
  Target, 
  Globe,
  ArrowRight,
  CheckCircle,
  Brain,
  Search,
  Activity,
  ChefHat,
  Utensils,
  Coffee,
  Store
} from 'lucide-react'

export default function LandingPage() {
  return (
    <HeroPageTransition enableParticles enableFloatingIcons particleCount={25}>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Food Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <FloatingFoodIcons className="opacity-10" />
          <FoodParticles count={30} isActive={true} className="opacity-20" />
        </div>

        {/* Navigation */}
        <motion.nav 
          className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-br from-bitebase-primary to-food-orange rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChefHat className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-xl font-bold bg-gradient-to-r from-bitebase-primary to-food-orange bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    🍽️ BiteBase
                  </motion.h1>
                  <motion.p 
                    className="text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Restaurant Intelligence
                  </motion.p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Analytics
                </Link>
                <Link href="#insights" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  AI Insights
                </Link>
                <Link href="/dashboard">
                  <AnimatedButton
                    variant="delivery"
                    animationType="delivery"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Launch Dashboard
                  </AnimatedButton>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.section 
          className="container mx-auto px-6 py-20 text-center relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.8 } }
              }}
            >
              <Badge variant="outline" className="bg-bitebase-primary/10 text-bitebase-primary border-bitebase-primary/20 mb-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <Activity className="h-3 w-3 mr-1" />
                </motion.div>
                🚀 Enhanced with Food Delivery Intelligence
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold leading-tight"
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { delay: 1.0, duration: 0.8 } }
              }}
            >
              <motion.span
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="bg-gradient-to-r from-bitebase-primary via-food-orange to-food-red bg-300% bg-clip-text text-transparent"
              >
                🍕 Restaurant Intelligence
              </motion.span>
              <br />
              <motion.span 
                className="bg-gradient-to-r from-food-orange to-bitebase-primary bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
              >
                Platform 2.0
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { delay: 1.5, duration: 0.6 } }
              }}
            >
              🎯 Discover profitable locations, track food delivery trends, and optimize restaurant operations with 
              <span className="text-bitebase-primary font-semibold"> interactive maps</span>, 
              <span className="text-food-orange font-semibold"> real-time analytics</span>, and 
              <span className="text-food-red font-semibold"> AI-driven insights</span> that boost your bottom line! 📈
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { delay: 1.8, duration: 0.6 } }
              }}
            >
              <Link href="/dashboard">
                <AnimatedButton
                  size="lg"
                  variant="delivery"
                  animationType="delivery"
                  className="text-lg px-8 py-3"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  🚀 Start Food Intelligence Analysis
                </AnimatedButton>
              </Link>
              <AnimatedButton 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-3"
                animationType="bounce"
                leftIcon={<Globe className="h-5 w-5" />}
              >
                🌟 Explore Live Food Demo
              </AnimatedButton>
            </motion.div>

            {/* Floating Food Demo Icons */}
            <motion.div 
              className="flex justify-center items-center gap-8 mt-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
            >
              {['🍕', '🍔', '🍜', '🥗', '🍰', '☕'].map((emoji, index) => (
                <motion.div
                  key={emoji}
                  className="text-4xl"
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.3, rotate: 360 }}
                >
                  {emoji}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Stats Section */}
        <motion.section 
          className="container mx-auto px-6 py-16 relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-bitebase-primary/10 to-food-orange/10 border border-bitebase-primary/20"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.1 } }
              }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="text-4xl font-bold bg-gradient-to-r from-bitebase-primary to-food-orange bg-clip-text text-transparent mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                15,000+
              </motion.div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                🏪 Restaurants Analyzed
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-food-orange/10 to-food-red/10 border border-food-orange/20"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.2 } }
              }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="text-4xl font-bold bg-gradient-to-r from-food-orange to-food-red bg-clip-text text-transparent mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              >
                42%
              </motion.div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                📈 Revenue Increase
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-food-green/10 to-bitebase-primary/10 border border-food-green/20"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.3 } }
              }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="text-4xl font-bold bg-gradient-to-r from-food-green to-bitebase-primary bg-clip-text text-transparent mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.0 }}
              >
                99.9%
              </motion.div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                ⚡ Platform Uptime
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-food-purple/10 to-food-blue/10 border border-food-purple/20"
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.4 } }
              }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="text-4xl font-bold bg-gradient-to-r from-food-purple to-food-blue bg-clip-text text-transparent mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              >
                Real-time
              </motion.div>
              <div className="text-muted-foreground flex items-center justify-center gap-1">
                🚀 Food Analytics
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Food Delivery Intelligence Showcase */}
        <motion.section 
          className="container mx-auto px-6 py-20 relative z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="text-center mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { delay: 0.1 } }
              }}
            >
              <motion.span 
                className="bg-gradient-to-r from-bitebase-primary via-food-orange to-food-red bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 8, repeat: Infinity }}
              >
                🍽️ Interactive Food Intelligence
              </motion.span> & Analytics
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
              }}
            >
              🚀 Experience the next generation of restaurant intelligence with 
              <span className="text-bitebase-primary font-semibold"> interactive food maps</span>, 
              <span className="text-food-orange font-semibold"> real-time delivery data</span>, and 
              <span className="text-food-red font-semibold"> AI-powered culinary insights</span> 📊
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="space-y-6"
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0, transition: { delay: 0.3, duration: 0.8 } }
              }}
            >
              <AnimatedCard 
                variant="menu"
                className="card-dark relative overflow-hidden"
                foodCategory="pizza"
                showFoodIcon
              >
                <CardHeader>
                  <motion.div 
                    className="w-12 h-12 bg-bitebase-primary/10 rounded-lg flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <MapPin className="h-6 w-6 text-bitebase-primary" />
                  </motion.div>
                  <CardTitle className="flex items-center gap-2">
                    🗺️ Interactive Food Location Intelligence
                  </CardTitle>
                  <CardDescription>
                    Click anywhere on the food map to instantly analyze demographics, food delivery zones, and market potential with AI-powered culinary scoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.ul 
                    className="space-y-2 text-sm text-muted-foreground"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.li 
                      className="flex items-center gap-2"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { delay: 0.1 } }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-bitebase-primary" />
                      🍕 Real-time food delivery analysis
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-2"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { delay: 0.2 } }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-bitebase-primary" />
                      🏪 Interactive restaurant competitor mapping
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-2"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { delay: 0.3 } }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-bitebase-primary" />
                      🤖 AI-powered culinary market scoring
                    </motion.li>
                  </motion.ul>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard 
                variant="menu"
                className="card-dark relative overflow-hidden"
                foodCategory="healthy"
                showFoodIcon
              >
                <CardHeader>
                  <motion.div 
                    className="w-12 h-12 bg-food-orange/10 rounded-lg flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: -10 }}
                  >
                    <Search className="h-6 w-6 text-food-orange" />
                  </motion.div>
                  <CardTitle className="flex items-center gap-2">
                    📊 Dynamic Food Market Research
                  </CardTitle>
                  <CardDescription>
                    Configure food analysis parameters in real-time and watch culinary insights update instantly as you explore different food delivery scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.ul 
                    className="space-y-2 text-sm text-muted-foreground"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.li 
                      className="flex items-center gap-2"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { delay: 0.1 } }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-food-orange" />
                      🎯 Configurable delivery radius analysis
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-2"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { delay: 0.2 } }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-food-orange" />
                      🍜 Cuisine-specific targeting & trends
                    </motion.li>
                    <motion.li 
                      className="flex items-center gap-2"
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { delay: 0.3 } }
                      }}
                    >
                      <CheckCircle className="h-4 w-4 text-food-orange" />
                      ⚡ Real-time food parameter updates
                    </motion.li>
                  </motion.ul>
                </CardContent>
              </AnimatedCard>
            </motion.div>

            <motion.div 
              className="relative"
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0, transition: { delay: 0.6, duration: 0.8 } }
              }}
            >
              <motion.div 
                className="bg-gradient-to-br from-bitebase-primary/20 via-food-orange/15 to-food-red/20 rounded-2xl p-8 backdrop-blur-sm border border-bitebase-primary/20 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Floating background elements */}
                <motion.div
                  className="absolute top-4 right-4 text-3xl"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🍔
                </motion.div>
                <motion.div
                  className="absolute bottom-4 left-4 text-2xl"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -15, 15, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  🍕
                </motion.div>

                <div className="aspect-video bg-card rounded-lg border border-border flex items-center justify-center relative overflow-hidden">
                  <motion.div 
                    className="text-center space-y-4 z-10 relative"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-bitebase-primary via-food-orange to-food-red rounded-full flex items-center justify-center mx-auto"
                      variants={{
                        hidden: { scale: 0, rotate: -180 },
                        visible: { scale: 1, rotate: 0, transition: { delay: 0.1, type: 'spring', stiffness: 200 } }
                      }}
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <ChefHat className="h-8 w-8 text-white" />
                    </motion.div>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
                      }}
                    >
                      <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                        🍽️ Interactive Food Dashboard Preview
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time food analytics with interactive restaurant maps, dynamic culinary charts, and AI-powered delivery insights 📊
                      </p>
                    </motion.div>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        visible: { opacity: 1, scale: 1, transition: { delay: 0.3 } }
                      }}
                    >
                      <Link href="/dashboard">
                        <AnimatedButton
                          variant="delivery"
                          animationType="delivery"
                          size="lg"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          🚀 Launch Food Intelligence Demo
                        </AnimatedButton>
                      </Link>
                    </motion.div>
                  </motion.div>

                  {/* Animated background pattern */}
                  <motion.div
                    className="absolute inset-0 opacity-10"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FF6B35" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>

      {/* Enhanced Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive <span className="gradient-text">Intelligence Suite</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make data-driven restaurant location and operational decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Advanced machine learning algorithms analyze market conditions, demographics, and competition patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Predictive market modeling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Risk assessment algorithms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Success probability scoring
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Live data visualization with interactive charts, maps, and comprehensive market research tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Interactive data exploration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Dynamic chart updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Custom dashboard creation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-400" />
              </div>
              <CardTitle>Competitive Intelligence</CardTitle>
              <CardDescription>
                Track nearby restaurants, analyze market saturation, and identify opportunities in your target area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Real-time competitor tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Market saturation analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Opportunity gap identification
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle>Demographic Intelligence</CardTitle>
              <CardDescription>
                Deep insights into population, income, lifestyle, and consumer behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Population density analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Income distribution mapping
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Consumer behavior insights
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle>Location Optimization</CardTitle>
              <CardDescription>
                Multi-location comparison, site selection scoring, and expansion planning tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Multi-location comparison
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Site selection scoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Expansion planning tools
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle>Market Intelligence</CardTitle>
              <CardDescription>
                Real-time market trends, seasonal patterns, and predictive analytics for strategic planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Market trend analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Seasonal pattern detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Predictive forecasting
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your <span className="gradient-text">Restaurant Business</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of restaurant owners who use BiteBase Intelligence to make smarter location and operational decisions with interactive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="btn-primary text-lg px-12 py-4 glow-green">
                Launch Interactive Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-12 py-4">
              <Globe className="h-5 w-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

        {/* Enhanced Footer */}
        <motion.footer 
          className="border-t border-border bg-card/30 backdrop-blur-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Footer background elements */}
          <div className="absolute inset-0 opacity-5">
            <motion.div
              className="absolute top-4 left-1/4 text-6xl"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🍕
            </motion.div>
            <motion.div
              className="absolute bottom-4 right-1/3 text-5xl"
              animate={{
                y: [0, -15, 0],
                rotate: [0, -15, 15, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              🍔
            </motion.div>
          </div>

          <div className="container mx-auto px-6 py-12 relative z-10">
            <motion.div 
              className="flex flex-col md:flex-row justify-between items-center"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex items-center space-x-2 mb-4 md:mb-0"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { delay: 0.1 } }
                }}
              >
                <motion.div 
                  className="w-6 h-6 bg-gradient-to-br from-bitebase-primary to-food-orange rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <ChefHat className="h-4 w-4 text-white" />
                </motion.div>
                <span className="font-bold bg-gradient-to-r from-bitebase-primary to-food-orange bg-clip-text text-transparent">
                  🍽️ BiteBase Intelligence 2.0
                </span>
              </motion.div>
              <motion.div 
                className="text-sm text-muted-foreground"
                variants={{
                  hidden: { opacity: 0, x: 20 },
                  visible: { opacity: 1, x: 0, transition: { delay: 0.2 } }
                }}
              >
                © 2024 BiteBase Intelligence. Enhanced with Food Delivery Intelligence & AI Analytics. 🚀
              </motion.div>
            </motion.div>
          </div>
        </motion.footer>
      </div>
    </HeroPageTransition>
  )
}

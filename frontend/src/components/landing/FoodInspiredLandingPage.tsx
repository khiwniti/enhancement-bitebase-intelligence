'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  MessageCircle,
  Play,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
  Brain,
  MapPin
} from 'lucide-react';
import { FoodParticles } from '../animations/FoodParticles';
import { AnimatedButton } from '../animations/AnimatedButton';
import { SimpleAnimatedCard } from '../animations/AnimatedCard';

// Animated food particles floating around
const FloatingFoodElements = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    emoji: string;
    speed: number;
    rotation: number;
  }>>([]);

  useEffect(() => {
    const foodEmojis = ['🍕', '🍔', '🌮', '🍟', '🥗', '🍣', '🍝', '🧆', '🥘', '🍱'];
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 30 + 20,
          emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
          speed: Math.random() * 0.5 + 0.2,
          rotation: Math.random() * 360,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
    window.addEventListener('resize', generateParticles);
    return () => window.removeEventListener('resize', generateParticles);
  }, []);

  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y - particle.speed,
        rotation: particle.rotation + 0.5,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.5,
        ...(particle.y < -50 ? { y: window.innerHeight + 50 } : {})
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            fontSize: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Gradient background animation
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, #FF6B35 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #74C365 0%, transparent 50%), radial-gradient(ellipse at 40% 80%, #F4C431 0%, transparent 50%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default function FoodInspiredLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Location Intelligence",
      description: "Advanced geospatial analytics for optimal restaurant placement and market analysis",
      gradient: "from-blue-500 to-cyan-500",
      delay: 0
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Insights", 
      description: "Smart recommendations and predictive analytics for revenue optimization",
      gradient: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Real-time Analytics",
      description: "Live dashboards with performance metrics and competitive intelligence",
      gradient: "from-green-500 to-emerald-500", 
      delay: 0.4
    }
  ];

  const stats = [
    { number: "1000+", label: "Restaurants Analyzed", icon: "🏪" },
    { number: "25%", label: "Average Revenue Increase", icon: "📈" },
    { number: "99.9%", label: "Platform Uptime", icon: "⚡" },
    { number: "50+", label: "Cities Covered", icon: "🌍" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden relative">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Floating Food Elements */}
      <FloatingFoodElements />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                🍽️
              </div>
              <div>
                <div className="font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  BiteBase
                </div>
                <div className="text-xs text-slate-600">Intelligence</div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {[
                  { href: "#features", label: "Features" },
                  { href: "#analytics", label: "Analytics" },
                  { href: "#pricing", label: "Pricing" },
                  { href: "#contact", label: "Contact" }
                ].map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="relative text-slate-600 hover:text-orange-600 transition-colors duration-300 group font-medium"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                  </motion.a>
                ))}
              </div>
              
              <Link href="/dashboard">
                <AnimatedButton
                  variant="primary"
                  size="md"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  Get Started
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-6 py-3 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="h-5 w-5 text-orange-500" />
            <span className="text-orange-600 font-semibold">AI-Powered Restaurant Intelligence</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              BiteBase
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Intelligence
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Transform your restaurant business with AI-powered analytics, location intelligence, and real-time market insights. Make data-driven decisions that drive growth.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/dashboard">
              <AnimatedButton
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-orange-500/25"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </AnimatedButton>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-full font-semibold text-lg transition-all bg-white/80 backdrop-blur-sm flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-6"
            >
              <Zap className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-semibold">Powerful Features</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
            >
              Everything you need to succeed
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-600 max-w-3xl mx-auto"
            >
              Comprehensive analytics, AI insights, and location intelligence all in one platform
            </motion.p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <SimpleAnimatedCard
                key={index}
                delay={feature.delay}
                className="hover:scale-105 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                <motion.div 
                  className="mt-6 flex items-center text-orange-600 font-semibold cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Learn more <ChevronRight className="ml-1 h-4 w-4" />
                </motion.div>
              </SimpleAnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"
          >
            Ready to transform your restaurant?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-slate-600 mb-8"
          >
            Join thousands of restaurants already using BiteBase Intelligence
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/dashboard">
              <AnimatedButton
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold shadow-lg shadow-orange-500/25"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
              🍽️
            </div>
            <div>
              <div className="font-bold text-2xl">BiteBase</div>
              <div className="text-slate-400">Intelligence</div>
            </div>
          </div>
          <p className="text-slate-400 mb-8">
            Empowering restaurants with AI-driven insights and analytics
          </p>
          <div className="flex justify-center space-x-8 mb-8">
            {["Privacy", "Terms", "Support", "Contact"].map((item) => (
              <a key={item} href="#" className="text-slate-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <p className="text-slate-500">
            © 2024 BiteBase Intelligence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
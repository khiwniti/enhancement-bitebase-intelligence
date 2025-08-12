'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue, useInView } from 'framer-motion';
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
  MapPin,
  Rocket,
  Target,
  Lightbulb,
  Award,
  Eye,
  Heart
} from 'lucide-react';
import FoodParticles from '../animations/FoodParticles';
import AnimatedButton from '../animations/AnimatedButton';
import { SimpleAnimatedCard } from '../animations/AnimatedCard';
import AILandingEnhancement from '../ai/AILandingEnhancement';

// Animated Counter Component
const AnimatedCounter: React.FC<{
  value: string;
  duration: number;
  delay: number;
}> = ({ value, duration, delay }) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!hasStarted) return;

    const numericValue = parseInt(value.replace(/[^\d]/g, ''));
    if (isNaN(numericValue)) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * numericValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, value, duration]);

  const formatValue = (num: number) => {
    const suffix = value.replace(/[\d,]/g, '');
    if (value.includes('%')) return `${num}%`;
    if (value.includes('+')) return `${num.toLocaleString()}+`;
    if (value.includes('.')) return `${(num / 10).toFixed(1)}%`;
    return num.toLocaleString() + suffix;
  };

  return <span>{formatValue(count)}</span>;
};

// Interactive Particle System
const InteractiveParticles: React.FC = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
  }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FF6B35', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

    const createParticle = (x: number, y: number) => ({
      id: Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < 3; i++) {
        setParticles(prev => [...prev.slice(-50), createParticle(x, y)]);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setParticles(prev => prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.02,
          size: particle.size * 0.99
        }))
        .filter(particle => particle.life > 0)
      );

      particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// Stunning 3D floating elements with advanced physics
const FloatingElements = () => {
  const [elements, setElements] = useState<Array<{
    id: number;
    x: number;
    y: number;
    z: number;
    size: number;
    type: 'food' | 'icon' | 'shape';
    content: string | React.ReactNode;
    speed: number;
    rotation: number;
    color: string;
    glowColor: string;
  }>>([]);

  useEffect(() => {
    const foodEmojis = ['🍕', '🍔', '🌮', '🍟', '🥗', '🍣', '🍝', '🧆', '🥘', '🍱'];
    const icons = [
      <BarChart3 className="w-full h-full" />,
      <Brain className="w-full h-full" />,
      <Zap className="w-full h-full" />,
      <Target className="w-full h-full" />,
      <Rocket className="w-full h-full" />,
      <Award className="w-full h-full" />
    ];
    const shapes = ['◆', '●', '▲', '■', '★', '♦'];

    const generateElements = () => {
      const newElements = [];
      for (let i = 0; i < 30; i++) {
        const type = Math.random() < 0.4 ? 'food' : Math.random() < 0.7 ? 'icon' : 'shape';
        let content, color, glowColor;

        if (type === 'food') {
          content = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
          color = 'text-orange-500';
          glowColor = 'shadow-orange-500/30';
        } else if (type === 'icon') {
          content = icons[Math.floor(Math.random() * icons.length)];
          color = 'text-blue-500';
          glowColor = 'shadow-blue-500/30';
        } else {
          content = shapes[Math.floor(Math.random() * shapes.length)];
          color = 'text-purple-500';
          glowColor = 'shadow-purple-500/30';
        }

        newElements.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          z: Math.random() * 100,
          size: Math.random() * 40 + 20,
          type,
          content,
          speed: Math.random() * 0.8 + 0.3,
          rotation: Math.random() * 360,
          color,
          glowColor
        });
      }
      setElements(newElements);
    };

    generateElements();
    window.addEventListener('resize', generateElements);
    return () => window.removeEventListener('resize', generateElements);
  }, []);

  useEffect(() => {
    const animateElements = () => {
      setElements(prev => prev.map(element => ({
        ...element,
        y: element.y - element.speed,
        rotation: element.rotation + (element.speed * 2),
        x: element.x + Math.sin(element.y * 0.005) * 1.5,
        z: element.z + Math.cos(element.y * 0.003) * 0.5,
        ...(element.y < -100 ? {
          y: window.innerHeight + 100,
          x: Math.random() * window.innerWidth
        } : {})
      })));
    };

    const interval = setInterval(animateElements, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map(element => (
        <motion.div
          key={element.id}
          className={`absolute ${element.color} ${element.glowColor}`}
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            fontSize: element.type === 'food' || element.type === 'shape' ? `${element.size}px` : undefined,
            width: element.type === 'icon' ? `${element.size}px` : undefined,
            height: element.type === 'icon' ? `${element.size}px` : undefined,
            transform: `rotate(${element.rotation}deg) translateZ(${element.z}px)`,
            filter: 'drop-shadow(0 0 20px currentColor)',
          }}
          animate={{
            y: [-30, 30, -30],
            rotate: [element.rotation, element.rotation + 360],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            y: { duration: 8 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 15 + Math.random() * 10, repeat: Infinity, ease: "linear" },
            scale: { duration: 6 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {element.content}
        </motion.div>
      ))}
    </div>
  );
};

// Stunning morphing background with multiple layers
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary morphing gradient */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, #FF6B35 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #74C365 0%, transparent 60%), radial-gradient(ellipse at 40% 80%, #F4C431 0%, transparent 60%)',
        }}
        animate={{
          scale: [1, 1.3, 1.1, 1],
          opacity: [0.4, 0.7, 0.5, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Secondary flowing gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, #8B5CF6, #06B6D4, #10B981, #F59E0B, #EF4444, #8B5CF6)',
        }}
        animate={{
          rotate: [0, 360],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
          scale: { duration: 15, repeat: Infinity, ease: "easeInOut" }
        }}
      />

      {/* Animated mesh gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(circle at 25% 25%, #FF6B35 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, #8B5CF6 0%, transparent 50%),
            radial-gradient(circle at 25% 75%, #06B6D4 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, #10B981 0%, transparent 50%)
          `,
        }}
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${
              ['#FF6B35', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'][i]
            } 0%, transparent 70%)`,
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.5, 0.8, 1],
            opacity: [0.1, 0.3, 0.1, 0.1],
          }}
          transition={{
            duration: 15 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2
          }}
        />
      ))}
    </div>
  );
};

export default function FoodInspiredLandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: false, amount: 0.3 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Advanced scroll transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.7]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -200]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.4], [0, -5]);

  // Parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const midgroundY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Mouse-based parallax
  const mouseX = useSpring(mousePosition.x, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(mousePosition.y, { stiffness: 100, damping: 30 });

  const parallaxX = useTransform(mouseX, [0, window.innerWidth || 1920], [-50, 50]);
  const parallaxY = useTransform(mouseY, [0, window.innerHeight || 1080], [-30, 30]);

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
      
      {/* Stunning Floating Elements */}
      <FloatingElements />

      {/* Interactive Particle System */}
      <InteractiveParticles />

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

      {/* Hero Section with 3D Effects */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-16 perspective-1000"
        style={{
          opacity: heroOpacity,
          scale: heroScale,
          y: heroY,
          rotateX: useTransform(scrollYProgress, [0, 0.2], [0, 5])
        }}
      >
        {/* Interactive 3D Background Elements */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            x: useTransform(mouseX, [0, window.innerWidth || 1920], [-30, 30]),
            y: useTransform(mouseY, [0, window.innerHeight || 1080], [-20, 20]),
          }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 rounded-full opacity-5"
              style={{
                background: `radial-gradient(circle, ${
                  ['#FF6B35', '#8B5CF6', '#06B6D4', '#10B981'][i % 4]
                } 0%, transparent 70%)`,
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 3) * 25}%`,
              }}
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.5
              }}
            />
          ))}
        </motion.div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Floating Badge with Glow */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 1.2,
              type: "spring",
              stiffness: 100,
              delay: 0.2
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 30px rgba(255, 107, 53, 0.3)"
            }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-full px-8 py-4 mb-12 backdrop-blur-xl shadow-2xl"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Sparkles className="h-6 w-6 text-orange-500" />
            </motion.div>
            <span className="text-orange-600 font-bold text-lg">AI-Powered Restaurant Intelligence</span>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          </motion.div>

          {/* 3D Animated Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 100, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 1.5,
              delay: 0.4,
              type: "spring",
              stiffness: 50
            }}
            className="text-7xl md:text-9xl font-black mb-8 leading-tight transform-gpu"
            style={{
              textShadow: "0 10px 30px rgba(0,0,0,0.3)",
              transform: "translateZ(50px)"
            }}
          >
            <motion.span
              className="block bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent"
              whileHover={{
                scale: 1.05,
                textShadow: "0 0 50px rgba(255,255,255,0.5)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              BiteBase
            </motion.span>
            <motion.span
              className="block bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
              whileHover={{
                scale: 1.05,
                filter: "drop-shadow(0 0 20px rgba(255, 107, 53, 0.5))"
              }}
            >
              Intelligence
            </motion.span>
          </motion.h1>

          {/* Animated Description with Typewriter Effect */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mb-16"
          >
            <motion.p
              className="text-2xl md:text-3xl text-slate-600 max-w-5xl mx-auto leading-relaxed font-light"
              style={{
                textShadow: "0 2px 10px rgba(0,0,0,0.1)"
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                Transform your restaurant business with{" "}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold"
              >
                AI-powered analytics
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                ,{" "}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-semibold"
              >
                location intelligence
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.8 }}
              >
                , and{" "}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 2 }}
                className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-semibold"
              >
                real-time market insights
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 2.2 }}
              >
                . Make data-driven decisions that drive exponential growth.
              </motion.span>
            </motion.p>
          </motion.div>

          {/* Stunning CTA Buttons with 3D Effects */}
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 1.2,
              delay: 2.4,
              type: "spring",
              stiffness: 100
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
          >
            {/* Primary CTA with 3D Hover Effect */}
            <Link href="/dashboard">
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  rotateX: 5,
                  z: 50
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.button
                  className="relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-2xl border border-white/20 backdrop-blur-sm flex items-center gap-3 transform-gpu"
                  style={{
                    boxShadow: "0 20px 40px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                  }}
                >
                  <Rocket className="w-6 h-6" />
                  Start Free Trial
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </Link>

            {/* Secondary CTA with Glass Morphism */}
            <motion.div
              whileHover={{
                scale: 1.05,
                rotateY: -5,
                rotateX: 5,
                z: 30
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative group cursor-pointer"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"
              />
              <motion.button
                className="relative border-2 border-white/30 hover:border-white/50 text-slate-700 hover:text-slate-900 px-12 py-5 rounded-2xl font-bold text-xl transition-all bg-white/20 backdrop-blur-xl flex items-center gap-3 shadow-2xl transform-gpu"
                style={{
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Play className="w-6 h-6 text-blue-600" />
                </motion.div>
                Watch Demo
                <Eye className="w-6 h-6 text-purple-600" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Animated Stats with Counter Effect */}
          <motion.div
            ref={statsRef}
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                animate={statsInView ? {
                  opacity: 1,
                  scale: 1,
                  rotateY: 0
                } : {}}
                transition={{
                  duration: 0.8,
                  delay: 0.8 + index * 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  scale: 1.1,
                  rotateY: 10,
                  z: 50
                }}
                className="text-center group cursor-pointer"
              >
                <motion.div
                  className="text-6xl mb-4 filter drop-shadow-lg"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  {stat.icon}
                </motion.div>

                <motion.div
                  className="text-4xl md:text-5xl font-black mb-3 relative"
                  style={{
                    background: `linear-gradient(135deg,
                      ${index === 0 ? '#FF6B35, #F59E0B' :
                        index === 1 ? '#8B5CF6, #06B6D4' :
                        index === 2 ? '#10B981, #059669' :
                        '#EF4444, #DC2626'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}
                >
                  <AnimatedCounter
                    value={stat.number}
                    duration={2000}
                    delay={1000 + index * 200}
                  />

                  {/* Glowing effect on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg,
                        ${index === 0 ? '#FF6B35, #F59E0B' :
                          index === 1 ? '#8B5CF6, #06B6D4' :
                          index === 2 ? '#10B981, #059669' :
                          '#EF4444, #DC2626'})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'blur(8px) brightness(1.5)'
                    }}
                  >
                    <AnimatedCounter
                      value={stat.number}
                      duration={0}
                      delay={0}
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="text-slate-600 font-semibold text-lg group-hover:text-slate-800 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={statsInView ? { opacity: 1 } : {}}
                  transition={{ delay: 1.2 + index * 0.2 }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section with 3D Effects */}
      <section
        ref={featuresRef}
        id="features"
        className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm overflow-hidden"
      >
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-96 h-96 rounded-full opacity-5"
              style={{
                background: `radial-gradient(circle, ${
                  ['#FF6B35', '#8B5CF6', '#06B6D4'][i % 3]
                } 0%, transparent 70%)`,
                left: `${-10 + i * 25}%`,
                top: `${-20 + (i % 2) * 60}%`,
              }}
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -50, 30, 0],
                scale: [1, 1.2, 0.8, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 3
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header with Magnetic Effect */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 40px rgba(34, 197, 94, 0.3)"
              }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-full px-8 py-4 mb-8 backdrop-blur-xl shadow-2xl"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Zap className="h-6 w-6 text-green-600" />
              </motion.div>
              <span className="text-green-700 font-bold text-lg">Powerful Features</span>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 50, rotateX: -45 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 50 }}
              className="text-5xl md:text-7xl font-black mb-8 leading-tight"
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #475569 50%, #1e293b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 10px 30px rgba(0,0,0,0.2)"
              }}
            >
              Everything you need to{" "}
              <motion.span
                className="block bg-gradient-to-r from-orange-600 via-red-500 to-purple-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ backgroundSize: "200% 200%" }}
              >
                dominate the market
              </motion.span>
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

          {/* Stunning 3D Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <Link key={index} href={
                feature.title.includes('Location') ? '/place-intelligence' :
                feature.title.includes('AI') ? '/product-intelligence' :
                '/price-intelligence'
              }>
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 100,
                    rotateX: -45,
                    scale: 0.8
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    scale: 1
                  }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 10,
                    rotateX: 5,
                    z: 50,
                    boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative cursor-pointer transform-gpu"
                  style={{ perspective: "1000px" }}
                >
                  {/* Card Glow Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${
                        feature.gradient.includes('orange') ? '#FF6B35, #F59E0B' :
                        feature.gradient.includes('blue') ? '#3B82F6, #06B6D4' :
                        '#8B5CF6, #EC4899'
                      })`,
                      filter: 'blur(20px)',
                      transform: 'scale(1.1)'
                    }}
                  />

                  {/* Main Card */}
                  <motion.div
                    className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
                    }}
                  >
                    {/* Animated Background Pattern */}
                    <motion.div
                      className="absolute inset-0 opacity-5"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%"],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, ${
                          feature.gradient.includes('orange') ? '#FF6B35' :
                          feature.gradient.includes('blue') ? '#3B82F6' :
                          '#8B5CF6'
                        } 0%, transparent 50%)`,
                        backgroundSize: "400% 400%"
                      }}
                    />

                    {/* Icon with 3D Effect */}
                    <motion.div
                      className={`relative w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl`}
                      whileHover={{
                        rotateY: 180,
                        scale: 1.1
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        duration: 0.6
                      }}
                      style={{
                        boxShadow: `0 10px 30px ${
                          feature.gradient.includes('orange') ? 'rgba(255, 107, 53, 0.4)' :
                          feature.gradient.includes('blue') ? 'rgba(59, 130, 246, 0.4)' :
                          'rgba(139, 92, 246, 0.4)'
                        }`
                      }}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                    </motion.div>

                    {/* Content */}
                    <motion.h3
                      className="text-2xl font-black mb-4 text-slate-800 group-hover:text-slate-900 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      {feature.title}
                    </motion.h3>

                    <motion.p
                      className="text-slate-600 leading-relaxed mb-6 group-hover:text-slate-700 transition-colors"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {feature.description}
                    </motion.p>

                    {/* CTA with Magnetic Effect */}
                    <motion.div
                      className="flex items-center font-bold text-lg group-hover:gap-3 transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${
                          feature.gradient.includes('orange') ? '#FF6B35, #F59E0B' :
                          feature.gradient.includes('blue') ? '#3B82F6, #06B6D4' :
                          '#8B5CF6, #EC4899'
                        })`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                      whileHover={{ x: 10 }}
                    >
                      Explore Feature
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ChevronRight className="ml-2 h-5 w-5" style={{ color: 'currentColor' }} />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Enhancement Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Experience AI-Powered Intelligence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Interact with our AI assistant and see how it can transform your restaurant operations in real-time
            </p>
          </motion.div>
          <AILandingEnhancement />
        </div>
      </section>

      {/* Epic Final CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, #FF6B35 0%, #F59E0B 25%, #EF4444 50%, #EC4899 75%, #8B5CF6 100%)",
              "linear-gradient(135deg, #8B5CF6 0%, #06B6D4 25%, #10B981 50%, #F59E0B 75%, #FF6B35 100%)",
              "linear-gradient(135deg, #FF6B35 0%, #F59E0B 25%, #EF4444 50%, #EC4899 75%, #8B5CF6 100%)"
            ]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Orbs */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${
                  ['#FFFFFF', '#FFE4E1', '#F0F8FF'][i % 3]
                } 0%, transparent 70%)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -80, 60, 0],
                scale: [1, 1.5, 0.8, 1],
                opacity: [0.2, 0.4, 0.1, 0.2],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.5
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Magnetic Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0, rotateY: -180 }}
            whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, type: "spring", stiffness: 100 }}
            whileHover={{
              scale: 1.1,
              rotateY: 10,
              boxShadow: "0 0 50px rgba(255,255,255,0.5)"
            }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-8 py-4 mb-12 shadow-2xl"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.3, 1]
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Rocket className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-white font-bold text-lg">Ready for Launch</span>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-white rounded-full"
            />
          </motion.div>

          {/* Epic Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, type: "spring", stiffness: 50 }}
            className="text-6xl md:text-8xl font-black mb-8 text-white leading-tight"
            style={{
              textShadow: "0 10px 30px rgba(0,0,0,0.3), 0 0 60px rgba(255,255,255,0.1)"
            }}
          >
            <motion.span
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.5)",
                  "0 0 40px rgba(255,255,255,0.8)",
                  "0 0 20px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Transform Your
            </motion.span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{ backgroundSize: "200% 200%" }}
            >
              Restaurant Empire
            </motion.span>
          </motion.h2>

          {/* Animated Description */}
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-2xl text-white/90 mb-16 max-w-4xl mx-auto leading-relaxed font-light"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
          >
            Join <motion.span
              className="font-bold text-yellow-300"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              10,000+
            </motion.span> restaurants already dominating their markets with AI-powered intelligence
          </motion.p>

          {/* Epic CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.5 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5, type: "spring", stiffness: 100 }}
          >
            <Link href="/dashboard">
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotateY: 5,
                  z: 50
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group cursor-pointer inline-block"
              >
                {/* Button Glow */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-300"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Main Button */}
                <motion.button
                  className="relative bg-white text-gray-900 px-16 py-6 rounded-3xl font-black text-2xl shadow-2xl border-4 border-white/20 backdrop-blur-sm flex items-center gap-4 transform-gpu"
                  style={{
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)"
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-500" />
                  </motion.div>

                  Start Your Empire

                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-8 h-8 text-orange-500" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/70"
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-300" />
              <span>Loved by 10,000+ restaurants</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-300" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-300" />
              <span>Industry leader</span>
            </div>
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
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, MapPinIcon, ChartBarIcon, SparklesIcon, ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { Brain } from 'lucide-react';
import Link from 'next/link';

// Floating particles animation component
const FloatingParticles = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-bitebase-primary to-bitebase-secondary rounded-full opacity-30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient background
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-background via-bitebase-primary/5 to-background"
        animate={{
          background: [
            "linear-gradient(45deg, #F8F9FA, rgba(116, 195, 101, 0.05), #F8F9FA)",
            "linear-gradient(45deg, #F8F9FA, rgba(116, 195, 101, 0.1), #F8F9FA)",
            "linear-gradient(45deg, #F8F9FA, rgba(116, 195, 101, 0.05), #F8F9FA)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <FloatingParticles />
    </div>
  );
};

// Hero section with stunning animations
const HeroSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.section
      ref={ref}
      style={{ y, opacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-bitebase-primary/20 to-bitebase-secondary/20 border border-bitebase-primary/30 backdrop-blur-sm mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <SparklesIcon className="w-5 h-5 text-bitebase-primary mr-2" />
            <span className="text-bitebase-primary text-sm font-medium font-secondary">AI-Powered Business Intelligence</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-primary font-bold bg-gradient-to-r from-foreground via-bitebase-primary to-bitebase-accent bg-clip-text text-transparent leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            BiteBase
            <br />
            <span className="bg-gradient-to-r from-bitebase-primary to-bitebase-accent bg-clip-text text-transparent">
              Intelligence
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-6 font-secondary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Transform your restaurant business with AI-powered location intelligence, 
            interactive market research, and real-time analytics that drive success.
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Link href="/location-intelligence">
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-bitebase-primary to-bitebase-accent rounded-xl text-white font-semibold text-lg shadow-2xl shadow-bitebase-primary/25 overflow-hidden font-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-bitebase-primary-hover to-bitebase-accent-hover"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 flex items-center">
                Start Analysis
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
          </Link>

          <motion.button
            className="px-8 py-4 border border-border rounded-xl text-foreground font-semibold text-lg hover:bg-muted/50 transition-all duration-300 backdrop-blur-sm flex items-center font-secondary"
            whileHover={{ scale: 1.05, borderColor: "var(--color-brand-primary)" }}
            whileTap={{ scale: 0.95 }}
          >
            <PlayIcon className="w-5 h-5 mr-2" />
            Watch Demo
          </motion.button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-gradient-to-b from-bitebase-primary to-bitebase-accent rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </motion.section>
  );
};

// Core features section with interactive cards
const CoreFeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Interactive Marketing Research Agent",
      description: "AI-powered agent that conducts comprehensive market research, analyzes competitors, and provides actionable insights for your restaurant business.",
      gradient: "from-bitebase-primary to-bitebase-secondary",
      delay: 0.1,
      href: "/research-agent"
    },
    {
      icon: MapPinIcon,
      title: "Interactive Map Dashboard",
      description: "Advanced location intelligence with real-time data visualization, competitor mapping, and demographic analysis for optimal site selection.",
      gradient: "from-bitebase-accent to-bitebase-primary",
      delay: 0.2,
      href: "/location-intelligence"
    },
    {
      icon: ChartBarIcon,
      title: "Real-Time Analytics Engine",
      description: "Dynamic dashboards with live data processing, predictive analytics, and automated insights that adapt to market changes.",
      gradient: "from-bitebase-secondary to-bitebase-accent",
      delay: 0.3,
      href: "/analytics"
    }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-primary font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-6">
            Core Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-secondary">
            Powerful tools designed to revolutionize how you analyze and understand your restaurant market
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Link href={feature.href}>
                <div className="relative p-8 bg-gradient-to-br from-card to-muted/30 rounded-2xl border border-border backdrop-blur-sm overflow-hidden cursor-pointer h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-primary font-bold text-foreground mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-bitebase-primary group-hover:to-bitebase-accent group-hover:bg-clip-text transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 font-secondary">
                    {feature.description}
                  </p>

                  {/* Learn more link */}
                  <motion.div
                    className="flex items-center text-bitebase-primary font-medium group-hover:text-bitebase-accent transition-colors duration-300 font-secondary"
                    whileHover={{ x: 5 }}
                  >
                    Learn more
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Interactive demo section
const InteractiveDemoSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { name: "Location Intelligence", preview: "🗺️", description: "Interactive Map Analysis" },
    { name: "Market Research", preview: "🤖", description: "AI-Powered Insights" },
    { name: "Real-Time Analytics", preview: "📊", description: "Live Dashboard" }
  ];

  return (
    <section className="relative py-32 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-primary font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-secondary">
            Experience the power of AI-driven restaurant intelligence
          </p>
        </motion.div>

        {/* Tab navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-card/50 rounded-xl p-2 backdrop-blur-sm border border-border">
            {tabs.map((tab, index) => (
              <motion.button
                key={index}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 font-secondary ${
                  activeTab === index
                    ? 'bg-gradient-to-r from-bitebase-primary to-bitebase-accent text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Demo preview */}
        <motion.div
          className="relative max-w-5xl mx-auto"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative bg-gradient-to-br from-card to-muted/30 rounded-2xl border border-border backdrop-blur-sm p-8 min-h-[400px] flex items-center justify-center shadow-lg">
            <div className="text-center">
              <motion.div
                className="text-8xl mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {tabs[activeTab].preview}
              </motion.div>
              <h3 className="text-3xl font-primary font-bold text-foreground mb-4">{tabs[activeTab].name}</h3>
              <p className="text-muted-foreground text-lg mb-8 font-secondary">{tabs[activeTab].description}</p>
              <Link href={activeTab === 0 ? "/location-intelligence" : activeTab === 1 ? "/research-agent" : "/analytics"}>
                <motion.button
                  className="px-8 py-3 bg-gradient-to-r from-bitebase-primary to-bitebase-accent rounded-xl text-white font-semibold shadow-lg font-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Interactive Demo
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Stats section with animated counters
const StatsSection = () => {
  const stats = [
    { number: "99.9%", label: "Uptime Guarantee", suffix: "" },
    { number: "2", label: "Second Load Time", suffix: "s" },
    { number: "500", label: "Data Refresh", suffix: "ms" },
    { number: "24/7", label: "AI Monitoring", suffix: "" }
  ];

  return (
    <section className="relative py-20 bg-gradient-to-r from-bitebase-primary/10 to-bitebase-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="text-4xl md:text-5xl font-primary font-bold bg-gradient-to-r from-bitebase-primary to-bitebase-accent bg-clip-text text-transparent mb-2"
                whileHover={{ scale: 1.1 }}
              >
                {stat.number}{stat.suffix}
              </motion.div>
              <p className="text-muted-foreground font-medium font-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA section
const CTASection = () => {
  return (
    <section className="relative py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-primary font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-secondary">
            Join the future of restaurant intelligence with AI-powered insights that drive real results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/location-intelligence">
              <motion.button
                className="px-10 py-4 bg-gradient-to-r from-bitebase-primary to-bitebase-accent rounded-xl text-white font-bold text-lg shadow-2xl font-secondary"
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(116, 195, 101, 0.5)" }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
              </motion.button>
            </Link>
            <motion.button
              className="px-10 py-4 border-2 border-border rounded-xl text-foreground font-bold text-lg hover:border-bitebase-primary transition-colors font-secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Main stunning landing page component
export default function StunningLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <HeroSection />
      <CoreFeaturesSection />
      <InteractiveDemoSection />
      <StatsSection />
      <CTASection />
    </div>
  );
}

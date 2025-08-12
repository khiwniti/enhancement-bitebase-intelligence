/**
 * AI Landing Page Enhancement
 * Adds stunning AI-powered interactive elements to the landing page
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  Brain,
  Zap,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Target,
  Lightbulb,
  Activity,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCopilotChat } from "@copilotkit/react-core";

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  demo: string;
}

const aiFeatures: AIFeature[] = [
  {
    id: "revenue-analysis",
    title: "AI Revenue Analysis",
    description: "Get instant insights into your revenue patterns with AI-powered analysis",
    icon: <DollarSign className="w-6 h-6" />,
    color: "from-green-500 to-emerald-600",
    demo: "Show me a detailed revenue analysis for the last 30 days",
  },
  {
    id: "customer-insights",
    title: "Smart Customer Insights",
    description: "Understand your customers better with AI-driven behavioral analysis",
    icon: <Users className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-600",
    demo: "Analyze customer segments and show lifetime value insights",
  },
  {
    id: "predictive-forecasting",
    title: "Predictive Forecasting",
    description: "Forecast future performance with machine learning algorithms",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-purple-500 to-violet-600",
    demo: "Generate a 14-day revenue forecast with confidence intervals",
  },
  {
    id: "menu-optimization",
    title: "Menu Optimization",
    description: "Optimize your menu pricing and placement with AI recommendations",
    icon: <Target className="w-6 h-6" />,
    color: "from-orange-500 to-red-600",
    demo: "Analyze menu performance and suggest pricing optimizations",
  },
];

const liveMetrics = [
  { label: "AI Insights Generated", value: "2,847", change: "+12%" },
  { label: "Revenue Optimized", value: "$1.2M", change: "+18%" },
  { label: "Restaurants Served", value: "450+", change: "+25%" },
  { label: "Accuracy Rate", value: "94.7%", change: "+2.1%" },
];

export default function AILandingEnhancement() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isAIActive, setIsAIActive] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(0);
  const { appendMessage } = useCopilotChat();

  // Rotate metrics display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % liveMetrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate AI activation
  useEffect(() => {
    const timer = setTimeout(() => setIsAIActive(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleFeatureDemo = (feature: AIFeature) => {
    appendMessage({
      content: feature.demo,
      role: "user",
    });
    setActiveFeature(feature.id);
  };

  const handleStartAIChat = () => {
    appendMessage({
      content: "Hello! I'm interested in learning more about BiteBase Intelligence's AI capabilities. Can you show me what you can do?",
      role: "user",
    });
  };

  return (
    <div className="relative">
      {/* AI Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mb-12"
      >
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 bg-white/20 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Brain className="w-8 h-8" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    AI-Powered Restaurant Intelligence
                    {isAIActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          <Activity className="w-3 h-3 mr-1" />
                          Live
                        </Badge>
                      </motion.div>
                    )}
                  </h3>
                  <p className="text-blue-100">
                    Experience the future of restaurant analytics with our AI assistant
                  </p>
                </div>
              </div>
              <Button
                onClick={handleStartAIChat}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Try AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Live Metrics Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mb-12"
      >
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Live AI Metrics</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMetric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm text-gray-600">
                  {liveMetrics[currentMetric].label}:
                </span>
                <span className="font-bold text-gray-900">
                  {liveMetrics[currentMetric].value}
                </span>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  {liveMetrics[currentMetric].change}
                </Badge>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* AI Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mb-12"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Experience AI-Powered Features
          </h3>
          <p className="text-gray-600">
            Click on any feature to see a live AI demonstration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                  activeFeature === feature.id
                    ? "border-blue-500 shadow-lg"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleFeatureDemo(feature)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} text-white`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-2 text-blue-600">
                        <Play className="w-4 h-4" />
                        <span className="text-sm font-medium">Try Demo</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Chat Prompt */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}
        className="text-center"
      >
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white"
              >
                <Bot className="w-8 h-8" />
              </motion.div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Ready to Experience AI-Powered Intelligence?
            </h3>
            <p className="text-gray-600 mb-6">
              Start a conversation with our AI assistant and discover how it can transform your restaurant operations
            </p>
            <Button
              onClick={handleStartAIChat}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start AI Conversation
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

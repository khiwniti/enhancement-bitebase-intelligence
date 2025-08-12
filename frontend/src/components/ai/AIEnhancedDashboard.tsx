/**
 * AI-Enhanced Dashboard Component
 * Integrates CopilotKit with the main dashboard for stunning AI interactions
 */

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Zap,
  MessageSquare,
  Brain,
  Target,
  Lightbulb,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCopilotChat } from "@copilotkit/react-core";

interface AIInsight {
  id: string;
  type: "opportunity" | "warning" | "trend" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  action?: string;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  color: string;
}

const mockInsights: AIInsight[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Revenue Growth Opportunity",
    description: "Increase pricing on high-demand items by 8-12% to boost revenue by $15K monthly",
    confidence: 92,
    impact: "high",
    action: "Analyze pricing strategy",
  },
  {
    id: "2",
    type: "trend",
    title: "Weekend Performance Surge",
    description: "Weekend sales are 35% higher than weekdays, consider extending hours",
    confidence: 88,
    impact: "medium",
    action: "Review staffing schedule",
  },
  {
    id: "3",
    type: "warning",
    title: "Inventory Alert",
    description: "3 popular items are running low and may impact weekend sales",
    confidence: 95,
    impact: "high",
    action: "Check inventory levels",
  },
];

const quickActions: QuickAction[] = [
  {
    id: "revenue",
    label: "Analyze Revenue",
    prompt: "Show me a detailed revenue analysis for the last 30 days with breakdown by category",
    icon: <DollarSign className="w-5 h-5" />,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "customers",
    label: "Customer Insights",
    prompt: "Analyze customer segments and show me lifetime value analysis",
    icon: <Users className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "forecast",
    label: "Generate Forecast",
    prompt: "Generate a 14-day revenue forecast with confidence intervals",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "optimize",
    label: "Optimize Menu",
    prompt: "Analyze menu performance and suggest pricing optimizations",
    icon: <Target className="w-5 h-5" />,
    color: "from-orange-500 to-red-600",
  },
];

export default function AIEnhancedDashboard() {
  const [activeInsights, setActiveInsights] = useState<AIInsight[]>(mockInsights);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const { appendMessage } = useCopilotChat();

  // Simulate real-time AI insights
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newInsight: AIInsight = {
          id: Date.now().toString(),
          type: "trend",
          title: "New Pattern Detected",
          description: "AI has detected a new customer behavior pattern worth investigating",
          confidence: Math.floor(Math.random() * 20) + 80,
          impact: "medium",
        };
        setActiveInsights(prev => [newInsight, ...prev.slice(0, 2)]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleQuickAction = (action: QuickAction) => {
    setIsAIThinking(true);
    appendMessage({
      content: action.prompt,
      role: "user",
    });
    
    setTimeout(() => setIsAIThinking(false), 2000);
  };

  const handleInsightAction = (insight: AIInsight) => {
    if (insight.action) {
      appendMessage({
        content: `Help me with: ${insight.action}. Context: ${insight.description}`,
        role: "user",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
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
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Brain className="w-8 h-8" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold">AI Intelligence Active</h2>
                  <p className="text-blue-100">
                    Continuously analyzing your restaurant data for insights
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-white/20 text-white border-0 mb-2">
                  <Activity className="w-4 h-4 mr-1" />
                  Live Analysis
                </Badge>
                <p className="text-sm text-blue-100">
                  {activeInsights.length} active insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick AI Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick AI Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    onClick={() => handleQuickAction(action)}
                    disabled={isAIThinking}
                    className={`w-full h-auto p-4 bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-300 text-white border-0`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {action.icon}
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
            
            {isAIThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Bot className="w-5 h-5 text-blue-600" />
                  </motion.div>
                  <span className="text-sm text-blue-800">
                    AI is processing your request...
                  </span>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {activeInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant={
                              insight.type === "opportunity" ? "default" :
                              insight.type === "warning" ? "destructive" :
                              insight.type === "trend" ? "secondary" : "outline"
                            }
                            className="capitalize"
                          >
                            {insight.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence}% confidence
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              insight.impact === "high" ? "text-red-600 border-red-200" :
                              insight.impact === "medium" ? "text-yellow-600 border-yellow-200" :
                              "text-green-600 border-green-200"
                            }`}
                          >
                            {insight.impact} impact
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {insight.description}
                        </p>
                        {insight.action && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleInsightAction(insight)}
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

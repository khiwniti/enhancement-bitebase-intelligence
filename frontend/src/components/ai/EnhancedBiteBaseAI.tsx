/**
 * Enhanced BiteBase AI Assistant
 * Comprehensive Business Intelligence for Restaurant & Cafe Industry
 */

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Bot,
  Send,
  Trash,
  User,
  Globe,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Utensils,
  Coffee,
  PieChart,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Calendar,
  ShoppingCart,
  MessageSquare,
  Settings,
  Zap,
  Brain,
  Activity
} from "lucide-react";

// Business Intelligence Categories
const BI_CATEGORIES = {
  SALES: {
    icon: DollarSign,
    color: "text-green-600",
    bg: "bg-green-50",
    keywords: ["sales", "revenue", "profit", "income", "earnings", "money", "financial"]
  },
  CUSTOMERS: {
    icon: Users,
    color: "text-blue-600", 
    bg: "bg-blue-50",
    keywords: ["customer", "guest", "visitor", "demographic", "satisfaction", "loyalty"]
  },
  OPERATIONS: {
    icon: Activity,
    color: "text-purple-600",
    bg: "bg-purple-50", 
    keywords: ["operation", "efficiency", "staff", "inventory", "cost", "workflow"]
  },
  MARKETING: {
    icon: Target,
    color: "text-orange-600",
    bg: "bg-orange-50",
    keywords: ["marketing", "promotion", "campaign", "social", "brand", "advertising"]
  },
  MENU: {
    icon: Utensils,
    color: "text-red-600",
    bg: "bg-red-50",
    keywords: ["menu", "food", "dish", "recipe", "ingredient", "cuisine", "pricing"]
  },
  LOCATION: {
    icon: MapPin,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    keywords: ["location", "area", "competition", "market", "demographic", "foot traffic"]
  },
  ANALYTICS: {
    icon: BarChart3,
    color: "text-teal-600",
    bg: "bg-teal-50",
    keywords: ["analytics", "data", "trend", "forecast", "insight", "performance"]
  },
  STRATEGY: {
    icon: Brain,
    color: "text-pink-600",
    bg: "bg-pink-50",
    keywords: ["strategy", "plan", "growth", "expansion", "optimization", "improvement"]
  }
};

// Enhanced AI Prompts for Restaurant Business Intelligence
const ENHANCED_AI_PROMPTS = {
  SALES_ANALYSIS: `Analyze restaurant sales performance including:
- Revenue trends and patterns
- Peak hours and seasonal variations
- Average order value optimization
- Payment method preferences
- Upselling opportunities
- Price elasticity analysis`,

  CUSTOMER_INSIGHTS: `Provide customer intelligence including:
- Customer segmentation and personas
- Dining behavior patterns
- Satisfaction metrics and feedback analysis
- Loyalty program effectiveness
- Customer lifetime value
- Retention strategies`,

  OPERATIONAL_EFFICIENCY: `Evaluate operational performance:
- Staff productivity and scheduling optimization
- Kitchen efficiency and wait times
- Inventory turnover and waste reduction
- Cost control and margin analysis
- Quality consistency metrics
- Service speed optimization`,

  MARKETING_INTELLIGENCE: `Marketing performance analysis:
- Campaign ROI and effectiveness
- Social media engagement metrics
- Brand sentiment analysis
- Competitor positioning
- Customer acquisition costs
- Digital marketing optimization`,

  MENU_OPTIMIZATION: `Menu engineering insights:
- Item profitability analysis
- Popular vs profitable items
- Seasonal menu recommendations
- Pricing strategy optimization
- Ingredient cost analysis
- Dietary trend adaptation`,

  LOCATION_ANALYTICS: `Location-based intelligence:
- Foot traffic patterns
- Competitor analysis
- Market penetration
- Demographic alignment
- Delivery zone optimization
- Expansion opportunities`,

  PREDICTIVE_ANALYTICS: `Predictive business insights:
- Demand forecasting
- Seasonal trend predictions
- Customer behavior modeling
- Revenue projections
- Risk assessment
- Growth opportunity identification`,

  STRATEGIC_PLANNING: `Strategic business guidance:
- Market positioning strategy
- Competitive advantage development
- Growth planning and scaling
- Investment prioritization
- Risk mitigation strategies
- Innovation opportunities`
};

interface AIResponse {
  content: string;
  type: string;
  category?: keyof typeof BI_CATEGORIES;
  insights?: BusinessInsight[];
  recommendations?: Recommendation[];
  metrics?: Metric[];
  language: "th" | "en";
}

interface BusinessInsight {
  type: "opportunity" | "warning" | "trend" | "achievement";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  action: string;
  expected_impact: string;
  timeline: string;
  resources_needed: string[];
}

interface Metric {
  name: string;
  value: string | number;
  change?: number;
  trend: "up" | "down" | "stable";
  benchmark?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  response?: AIResponse;
  category?: keyof typeof BI_CATEGORIES;
}

interface EnhancedBiteBaseAIProps {
  userId?: string;
  title?: string;
  placeholder?: string;
  className?: string;
  defaultLanguage?: "th" | "en";
  restaurantData?: any;
}

const EnhancedBiteBaseAI: React.FC<EnhancedBiteBaseAIProps> = ({
  userId = "default-user",
  title = "BiteBase Business Intelligence Assistant",
  placeholder = "Ask me anything about your restaurant business...",
  className = "",
  defaultLanguage = "en",
  restaurantData
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<"th" | "en">(defaultLanguage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick action suggestions based on business intelligence
  const quickActions = [
    {
      category: "SALES" as keyof typeof BI_CATEGORIES,
      text: "Analyze my sales performance this month",
      icon: DollarSign
    },
    {
      category: "CUSTOMERS" as keyof typeof BI_CATEGORIES,
      text: "Show customer satisfaction insights",
      icon: Users
    },
    {
      category: "MENU" as keyof typeof BI_CATEGORIES,
      text: "Optimize my menu pricing strategy",
      icon: Utensils
    },
    {
      category: "MARKETING" as keyof typeof BI_CATEGORIES,
      text: "Suggest marketing campaigns for next month",
      icon: Target
    },
    {
      category: "OPERATIONS" as keyof typeof BI_CATEGORIES,
      text: "How can I improve operational efficiency?",
      icon: Activity
    },
    {
      category: "ANALYTICS" as keyof typeof BI_CATEGORIES,
      text: "Predict next quarter's performance",
      icon: BarChart3
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Categorize user input based on keywords
  const categorizeInput = (input: string): keyof typeof BI_CATEGORIES | null => {
    const lowerInput = input.toLowerCase();

    for (const [category, config] of Object.entries(BI_CATEGORIES)) {
      if (config.keywords.some(keyword => lowerInput.includes(keyword))) {
        return category as keyof typeof BI_CATEGORIES;
      }
    }
    return null;
  };

  // Enhanced AI response generation
  const generateEnhancedResponse = async (userInput: string, category?: keyof typeof BI_CATEGORIES): Promise<AIResponse> => {
    // Simulate AI processing with enhanced business intelligence
    await new Promise(resolve => setTimeout(resolve, 1500));

    const insights: BusinessInsight[] = [];
    const recommendations: Recommendation[] = [];
    const metrics: Metric[] = [];

    // Generate category-specific insights
    if (category) {
      switch (category) {
        case "SALES":
          insights.push({
            type: "trend",
            title: "Revenue Growth Trend",
            description: "Your sales have increased 15% compared to last month, driven by weekend dinner service.",
            impact: "high",
            confidence: 0.87
          });
          metrics.push(
            { name: "Monthly Revenue", value: "฿125,000", change: 15, trend: "up", benchmark: "฿108,000" },
            { name: "Average Order Value", value: "฿450", change: 8, trend: "up", benchmark: "฿420" },
            { name: "Daily Transactions", value: "85", change: 12, trend: "up", benchmark: "76" }
          );
          recommendations.push({
            priority: "high",
            action: "Implement dynamic pricing for peak hours",
            expected_impact: "10-15% revenue increase",
            timeline: "2-3 weeks",
            resources_needed: ["POS system update", "Staff training"]
          });
          break;

        case "CUSTOMERS":
          insights.push({
            type: "opportunity",
            title: "Customer Retention Opportunity",
            description: "First-time customers have a 65% return rate, but frequency drops after 3 visits.",
            impact: "medium",
            confidence: 0.82
          });
          metrics.push(
            { name: "Customer Satisfaction", value: "4.2/5", change: 5, trend: "up", benchmark: "4.0/5" },
            { name: "Return Rate", value: "65%", change: -3, trend: "down", benchmark: "68%" },
            { name: "Average Visits/Month", value: 2.3, change: 0, trend: "stable", benchmark: "2.5" }
          );
          break;

        case "OPERATIONS":
          insights.push({
            type: "warning",
            title: "Kitchen Efficiency Alert",
            description: "Average preparation time has increased by 12% during lunch rush hours.",
            impact: "medium",
            confidence: 0.91
          });
          metrics.push(
            { name: "Avg Prep Time", value: "18 min", change: 12, trend: "up", benchmark: "16 min" },
            { name: "Staff Productivity", value: "87%", change: -5, trend: "down", benchmark: "92%" },
            { name: "Food Waste", value: "8%", change: -15, trend: "down", benchmark: "12%" }
          );
          break;

        case "MARKETING":
          insights.push({
            type: "achievement",
            title: "Social Media Success",
            description: "Instagram engagement increased 45% after implementing food photography strategy.",
            impact: "high",
            confidence: 0.94
          });
          break;

        case "MENU":
          insights.push({
            type: "trend",
            title: "Menu Performance Analysis",
            description: "Vegetarian options show 23% higher profit margins than meat dishes.",
            impact: "medium",
            confidence: 0.78
          });
          break;

        case "LOCATION":
          insights.push({
            type: "opportunity",
            title: "Delivery Zone Expansion",
            description: "High demand detected in nearby areas with 15-minute delivery potential.",
            impact: "high",
            confidence: 0.85
          });
          break;

        case "ANALYTICS":
          insights.push({
            type: "trend",
            title: "Predictive Analytics Insight",
            description: "Weather patterns suggest 20% increase in delivery orders during rainy season.",
            impact: "medium",
            confidence: 0.89
          });
          break;

        case "STRATEGY":
          insights.push({
            type: "opportunity",
            title: "Market Expansion Opportunity",
            description: "Competitor analysis reveals underserved market segment in healthy fast-casual dining.",
            impact: "high",
            confidence: 0.76
          });
          break;
      }
    }

    // Generate comprehensive response
    const responses = {
      sales: "Based on your sales data analysis, I can see strong performance indicators with room for strategic improvements. Your revenue trends show positive growth, particularly in weekend dinner service.",
      customers: "Your customer analytics reveal interesting patterns in dining behavior and satisfaction metrics. There are clear opportunities to enhance customer retention and lifetime value.",
      operations: "Operational efficiency analysis shows both strengths and areas for optimization. Kitchen workflow and staff productivity metrics indicate specific improvement opportunities.",
      marketing: "Marketing performance data suggests your current strategies are effective, with particular success in digital engagement. There are opportunities to expand successful campaigns.",
      menu: "Menu engineering analysis reveals interesting profitability patterns and customer preferences. Strategic menu optimization could significantly impact your bottom line.",
      location: "Location intelligence data shows strong market positioning with expansion opportunities. Foot traffic patterns and demographic analysis support growth strategies.",
      analytics: "Predictive analytics indicate several trend patterns that could inform strategic decisions. Data-driven insights suggest optimal timing for various business initiatives.",
      strategy: "Strategic analysis reveals competitive advantages and market opportunities. Your positioning allows for several growth vectors with calculated risk profiles.",
      general: "I'm here to help you analyze your restaurant business from multiple angles. I can provide insights on sales, customers, operations, marketing, menu optimization, location analytics, and strategic planning."
    };

    const categoryKey = category?.toLowerCase() as keyof typeof responses;
    const content = responses[categoryKey] || responses.general;

    return {
      content,
      type: "business_intelligence",
      category,
      insights,
      recommendations,
      metrics,
      language
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    const category = categorizeInput(input);
    if (category) {
      userMessage.category = category;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const aiResponse = await generateEnhancedResponse(input, category || undefined);

      const assistantMessage: Message = {
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
        response: aiResponse,
        category: category || undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI response error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setInput(action.text);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render insight component
  const renderInsight = (insight: BusinessInsight, index: number) => {
    const getInsightIcon = () => {
      switch (insight.type) {
        case "opportunity": return <Lightbulb className="h-4 w-4" />;
        case "warning": return <AlertTriangle className="h-4 w-4" />;
        case "trend": return <TrendingUp className="h-4 w-4" />;
        case "achievement": return <CheckCircle className="h-4 w-4" />;
        default: return <Lightbulb className="h-4 w-4" />;
      }
    };

    const getInsightColor = () => {
      switch (insight.type) {
        case "opportunity": return "text-blue-600 bg-blue-50";
        case "warning": return "text-orange-600 bg-orange-50";
        case "trend": return "text-green-600 bg-green-50";
        case "achievement": return "text-purple-600 bg-purple-50";
        default: return "text-gray-600 bg-gray-50";
      }
    };

    return (
      <div key={index} className={`p-3 rounded-lg border ${getInsightColor()}`}>
        <div className="flex items-start space-x-2">
          <div className="mt-0.5">{getInsightIcon()}</div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <p className="text-xs mt-1 opacity-90">{insight.description}</p>
            <div className="flex items-center justify-between mt-2">
              <Badge variant="secondary" className="text-xs">
                {insight.impact.toUpperCase()} IMPACT
              </Badge>
              <span className="text-xs opacity-75">
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render metric component
  const renderMetric = (metric: Metric, index: number) => {
    const getTrendIcon = () => {
      switch (metric.trend) {
        case "up": return <TrendingUp className="h-3 w-3 text-green-500" />;
        case "down": return <TrendingDown className="h-3 w-3 text-red-500" />;
        case "stable": return <div className="h-3 w-3 rounded-full bg-gray-400" />;
      }
    };

    return (
      <div key={index} className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{metric.name}</span>
          {getTrendIcon()}
        </div>
        <div className="mt-1">
          <span className="text-lg font-bold text-gray-900">{metric.value}</span>
          {metric.change && (
            <span className={`ml-2 text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </span>
          )}
        </div>
        {metric.benchmark && (
          <div className="text-xs text-gray-500 mt-1">
            Benchmark: {metric.benchmark}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto h-[600px] flex flex-col ${className}`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <span>{title}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === "en" ? "th" : "en")}
            >
              <Globe className="h-4 w-4 mr-1" />
              {language.toUpperCase()}
            </Button>
            <Button variant="outline" size="sm" onClick={clearChat}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Quick Business Intelligence Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickActions.map((action, index) => {
                const categoryConfig = BI_CATEGORIES[action.category];
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className={`justify-start text-left h-auto p-3 ${categoryConfig.bg} hover:${categoryConfig.bg}`}
                  >
                    <IconComponent className={`h-4 w-4 mr-2 ${categoryConfig.color}`} />
                    <span className="text-sm">{action.text}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                } rounded-lg p-3`}
              >
                <div className="flex items-start space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {message.role === "user" ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    {/* Category Badge */}
                    {message.category && (
                      <div className="mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {message.category}
                        </Badge>
                      </div>
                    )}

                    {/* Message Content */}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* AI Response Details */}
                    {message.response && (
                      <div className="mt-3 space-y-3">
                        {/* Insights */}
                        {message.response.insights && message.response.insights.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Key Insights</h4>
                            <div className="space-y-2">
                              {message.response.insights.map((insight, idx) => renderInsight(insight, idx))}
                            </div>
                          </div>
                        )}

                        {/* Metrics */}
                        {message.response.metrics && message.response.metrics.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Key Metrics</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {message.response.metrics.map((metric, idx) => renderMetric(metric, idx))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {message.response.recommendations && message.response.recommendations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2 text-gray-700">Recommendations</h4>
                            <div className="space-y-2">
                              {message.response.recommendations.map((rec, idx) => (
                                <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                  <div className="flex items-start justify-between">
                                    <h5 className="font-medium text-sm text-blue-900">{rec.action}</h5>
                                    <Badge
                                      variant={rec.priority === "high" ? "destructive" : rec.priority === "medium" ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {rec.priority.toUpperCase()}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-blue-700 mt-1">{rec.expected_impact}</p>
                                  <div className="flex items-center justify-between mt-2 text-xs text-blue-600">
                                    <span>Timeline: {rec.timeline}</span>
                                    <span>Resources: {rec.resources_needed.join(", ")}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs opacity-75 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="flex-shrink-0">
        <div className="flex w-full space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            size="lg"
            className="px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EnhancedBiteBaseAI;

/**
 * AI Menu Optimizer Component
 * Interactive menu optimization with CopilotKit integration
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Sparkles,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  AlertTriangle,
  CheckCircle,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCopilotAction } from "@copilotkit/react-core";

interface MenuItem {
  id: string;
  name: string;
  currentPrice: number;
  cost: number;
  sales: number;
  category: string;
  profitMargin: number;
  popularity: number;
  aiRecommendation: "increase" | "decrease" | "maintain" | "remove";
  potentialImpact: number;
}

const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    currentPrice: 12.99,
    cost: 4.50,
    sales: 450,
    category: "Burgers",
    profitMargin: 65.4,
    popularity: 92,
    aiRecommendation: "increase",
    potentialImpact: 15.2,
  },
  {
    id: "2",
    name: "Caesar Salad",
    currentPrice: 9.99,
    cost: 3.20,
    sales: 320,
    category: "Salads",
    profitMargin: 68.0,
    popularity: 78,
    aiRecommendation: "maintain",
    potentialImpact: 2.1,
  },
  {
    id: "3",
    name: "Grilled Chicken",
    currentPrice: 15.99,
    cost: 6.80,
    sales: 280,
    category: "Mains",
    profitMargin: 57.5,
    popularity: 85,
    aiRecommendation: "increase",
    potentialImpact: 12.8,
  },
  {
    id: "4",
    name: "Fish & Chips",
    currentPrice: 13.99,
    cost: 5.20,
    sales: 180,
    category: "Mains",
    profitMargin: 62.8,
    popularity: 65,
    aiRecommendation: "decrease",
    potentialImpact: -8.5,
  },
  {
    id: "5",
    name: "Veggie Wrap",
    currentPrice: 8.99,
    cost: 2.80,
    sales: 220,
    category: "Wraps",
    profitMargin: 68.9,
    popularity: 72,
    aiRecommendation: "increase",
    potentialImpact: 9.3,
  },
];

export default function AIMenuOptimizer() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  // Register CopilotKit action for menu optimization
  useCopilotAction({
    name: "optimizeMenuItem",
    description: "Optimize a specific menu item's pricing and positioning",
    parameters: [
      { name: "itemName", type: "string", description: "Name of the menu item", required: true },
      { name: "targetMargin", type: "number", description: "Target profit margin percentage" },
    ],
    handler: async ({ itemName, targetMargin }: { itemName: string; targetMargin?: number }) => {
      const item = mockMenuItems.find(i => i.name.toLowerCase().includes(itemName.toLowerCase()));
      if (!item) return { error: "Menu item not found" };

      const optimizedPrice = targetMargin ? 
        item.cost / (1 - targetMargin / 100) : 
        item.currentPrice * (1 + item.potentialImpact / 100);

      return {
        success: true,
        item: item.name,
        currentPrice: item.currentPrice,
        optimizedPrice: Math.round(optimizedPrice * 100) / 100,
        expectedImpact: item.potentialImpact,
        reasoning: `Based on popularity (${item.popularity}%) and current margin (${item.profitMargin}%), this optimization could increase revenue by ${item.potentialImpact}%`,
      };
    },
  });

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "increase":
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case "decrease":
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      case "maintain":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "remove":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "increase":
        return "text-green-600 bg-green-50 border-green-200";
      case "decrease":
        return "text-red-600 bg-red-50 border-red-200";
      case "maintain":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "remove":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleOptimizeAll = async () => {
    setIsOptimizing(true);
    
    // Simulate AI optimization process
    setTimeout(() => {
      const totalImpact = mockMenuItems.reduce((sum, item) => sum + Math.abs(item.potentialImpact), 0);
      setOptimizationResults({
        totalItems: mockMenuItems.length,
        itemsToIncrease: mockMenuItems.filter(i => i.aiRecommendation === "increase").length,
        itemsToDecrease: mockMenuItems.filter(i => i.aiRecommendation === "decrease").length,
        expectedRevenueIncrease: totalImpact,
        confidence: 87,
      });
      setIsOptimizing(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 bg-white/20 rounded-lg"
            >
              <ChefHat className="w-6 h-6" />
            </motion.div>
            AI Menu Optimizer
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Optimization Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={handleOptimizeAll}
              disabled={isOptimizing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isOptimizing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 mr-2"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              {isOptimizing ? "Optimizing..." : "Optimize All Items"}
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>

          {/* Optimization Results */}
          <AnimatePresence>
            {optimizationResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Optimization Complete!</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Items Analyzed:</span>
                    <div className="font-bold text-gray-900">{optimizationResults.totalItems}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Price Increases:</span>
                    <div className="font-bold text-green-600">{optimizationResults.itemsToIncrease}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected Revenue Boost:</span>
                    <div className="font-bold text-green-600">+{optimizationResults.expectedRevenueIncrease.toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <div className="font-bold text-blue-600">{optimizationResults.confidence}%</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMenuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedItem?.id === item.id ? "ring-2 ring-purple-500" : ""
              }`}
              onClick={() => setSelectedItem(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {item.category}
                    </Badge>
                  </div>
                  <Badge
                    className={`${getRecommendationColor(item.aiRecommendation)} border`}
                  >
                    {getRecommendationIcon(item.aiRecommendation)}
                    <span className="ml-1 capitalize">{item.aiRecommendation}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Price and Margin */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Price:</span>
                    <span className="font-bold text-lg">${item.currentPrice}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Profit Margin:</span>
                    <span className="font-semibold text-green-600">{item.profitMargin.toFixed(1)}%</span>
                  </div>

                  {/* Popularity */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Popularity:</span>
                      <span className="text-sm font-medium">{item.popularity}%</span>
                    </div>
                    <Progress value={item.popularity} className="h-2" />
                  </div>

                  {/* Sales */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Sales:</span>
                    <span className="font-semibold">{item.sales}</span>
                  </div>

                  {/* AI Impact */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Impact:</span>
                    <span
                      className={`font-semibold ${
                        item.potentialImpact > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.potentialImpact > 0 ? "+" : ""}{item.potentialImpact.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Item Details */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  AI Recommendations for {selectedItem.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Suggested Price</div>
                      <div className="text-xl font-bold">
                        ${(selectedItem.currentPrice * (1 + selectedItem.potentialImpact / 100)).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Revenue Impact</div>
                      <div className="text-xl font-bold text-green-600">
                        +{selectedItem.potentialImpact.toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="text-xl font-bold">87%</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">AI Analysis:</h4>
                    <p className="text-sm text-gray-700">
                      Based on popularity ({selectedItem.popularity}%), current margin ({selectedItem.profitMargin.toFixed(1)}%), 
                      and sales volume ({selectedItem.sales} monthly), our AI recommends{" "}
                      <span className="font-semibold capitalize">{selectedItem.aiRecommendation}</span> pricing. 
                      This could result in a {Math.abs(selectedItem.potentialImpact).toFixed(1)}% revenue impact.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

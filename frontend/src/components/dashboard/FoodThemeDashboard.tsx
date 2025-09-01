'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  MapPin, 
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Zap,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Filter
} from 'lucide-react';
import { SimpleAnimatedCard } from '../animations/AnimatedCard';
import { AnimatedButton } from '../animations/AnimatedButton';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  foodIcon?: string;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  foodIcon = '📊',
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
    >
      {/* Background food icon */}
      <div className="absolute top-4 right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        {foodIcon}
      </div>
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-red-50/0 group-hover:from-orange-50/30 group-hover:to-red-50/30 transition-all duration-300 rounded-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white">
              {icon}
            </div>
            <h3 className="text-gray-600 font-medium">{title}</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </motion.button>
        </div>
        
        <div className="space-y-2">
          <motion.div 
            className="text-3xl font-bold text-gray-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.div>
          
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            <span className="font-semibold">{Math.abs(change)}%</span>
            <span className="text-gray-500">vs last month</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  foodTheme?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  children, 
  delay = 0,
  foodTheme = '📈'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{foodTheme}</div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <AnimatedButton variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </AnimatedButton>
          <AnimatedButton variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </AnimatedButton>
        </div>
      </div>
      {children}
    </motion.div>
  );
};

const FoodThemeDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$12,580',
      change: 12.5,
      trend: 'up' as const,
      icon: <DollarSign className="h-5 w-5" />,
      foodIcon: '💰',
      delay: 0
    },
    {
      title: 'Orders Today',
      value: '142',
      change: 8.2,
      trend: 'up' as const,
      icon: <Activity className="h-5 w-5" />,
      foodIcon: '🛍️',
      delay: 0.1
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8★',
      change: 5.1,
      trend: 'up' as const,
      icon: <Star className="h-5 w-5" />,
      foodIcon: '⭐',
      delay: 0.2
    },
    {
      title: 'Average Order',
      value: '$28.50',
      change: -2.1,
      trend: 'down' as const,
      icon: <Target className="h-5 w-5" />,
      foodIcon: '🎯',
      delay: 0.3
    }
  ];

  const quickActions = [
    { icon: <BarChart3 className="h-5 w-5" />, label: 'View Analytics', emoji: '📊' },
    { icon: <PieChart className="h-5 w-5" />, label: 'Menu Analysis', emoji: '🍽️' },
    { icon: <MapPin className="h-5 w-5" />, label: 'Location Insights', emoji: '📍' },
    { icon: <Users className="h-5 w-5" />, label: 'Customer Data', emoji: '👥' }
  ];

  const popularItems = [
    { name: 'Margherita Pizza', orders: 42, emoji: '🍕', trend: 'up', change: 15 },
    { name: 'Chicken Burger', orders: 38, emoji: '🍔', trend: 'up', change: 8 },
    { name: 'Caesar Salad', orders: 31, emoji: '🥗', trend: 'down', change: -3 },
    { name: 'Spaghetti Carbonara', orders: 29, emoji: '🍝', trend: 'up', change: 12 },
    { name: 'Fish Tacos', orders: 25, emoji: '🌮', trend: 'up', change: 22 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Restaurant Dashboard
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
              {['7d', '30d', '90d'].map((range) => (
                <motion.button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {range}
                </motion.button>
              ))}
            </div>
            
            <AnimatedButton variant="primary" size="md">
              <Calendar className="h-4 w-4" />
              Export Report
            </AnimatedButton>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <ChartCard title="Revenue Trends" delay={0.4} foodTheme="💰">
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">📈</div>
                <p className="text-gray-600">Revenue chart visualization</p>
                <p className="text-sm text-gray-500 mt-2">Integration with Chart.js coming soon</p>
              </motion.div>
            </div>
          </ChartCard>

          {/* Orders Chart */}
          <ChartCard title="Order Distribution" delay={0.5} foodTheme="🍽️">
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">🥧</div>
                <p className="text-gray-600">Order distribution chart</p>
                <p className="text-sm text-gray-500 mt-2">Interactive pie chart coming soon</p>
              </motion.div>
            </div>
          </ChartCard>
        </div>

        {/* Popular Items & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Items */}
          <ChartCard title="Popular Menu Items" delay={0.6} foodTheme="🏆">
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-orange-50 hover:to-red-50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                      {item.emoji}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.orders} orders today</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    item.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{Math.abs(item.change)}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>

          {/* Quick Actions */}
          <ChartCard title="Quick Actions" delay={0.7} foodTheme="⚡">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/50 hover:border-orange-300 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {action.emoji}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 group-hover:text-orange-600 transition-colors">
                    {action.icon}
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Real-time Updates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 text-8xl">🍽️</div>
            <div className="absolute bottom-4 left-4 text-6xl">📊</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Real-time Insights</h3>
                <p className="text-orange-100">
                  Your restaurant served 12 orders in the last hour. Peak time detected!
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                <Zap className="h-8 w-8" />
              </motion.div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <AnimatedButton variant="secondary" size="sm">
                View Details
              </AnimatedButton>
              <AnimatedButton variant="ghost" size="sm" className="text-white border-white/30 hover:bg-white/10">
                Set Alerts
              </AnimatedButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FoodThemeDashboard;
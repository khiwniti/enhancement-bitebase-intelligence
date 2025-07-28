'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  User,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import FoodInspiredLandingPage from '../../../components/landing/FoodInspiredLandingPage';
import FoodThemeDashboard from '../../../components/dashboard/FoodThemeDashboard';
import EnhancedFloatingChatbot from '../../../components/ai/EnhancedFloatingChatbot';
import { AnimatedButton } from '../../../components/animations/AnimatedButton';
import { FoodParticles } from '../../../components/animations/FoodParticles';

type ViewType = 'landing' | 'dashboard' | 'analytics' | 'chat';

interface NavigationItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
  description: string;
  emoji: string;
}

const EnhancedBiteBasePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'landing',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      description: 'Stunning landing page with food animations',
      emoji: '🏠'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Advanced analytics with food-themed design',
      emoji: '📊'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Deep insights and market intelligence',
      emoji: '📈'
    },
    {
      id: 'chat',
      label: 'AI Assistant',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Advanced AI chatbot with multi-language support',
      emoji: '🤖'
    }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <FoodInspiredLandingPage />;
      case 'dashboard':
        return <FoodThemeDashboard />;
      case 'analytics':
        return <AnalyticsPreview />;
      case 'chat':
        return <ChatPreview />;
      default:
        return <FoodInspiredLandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background Food Particles */}
      <FoodParticles count={8} className="opacity-30" />
      
      {/* Enhanced Floating Chatbot - Always visible */}
      <EnhancedFloatingChatbot position="bottom-right" />
      
      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-50 lg:hidden bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl p-3 shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </motion.button>

      {/* Sidebar Navigation */}
      <motion.div
        className={`fixed left-0 top-0 h-full w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 z-40 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        initial={{ x: -320 }}
        animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              🍽️
            </div>
            <div>
              <div className="font-bold text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                BiteBase
              </div>
              <div className="text-sm text-gray-600">Intelligence Enhanced</div>
            </div>
          </motion.div>

          {/* Navigation Items */}
          <div className="space-y-2 flex-1">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'hover:bg-orange-50 text-gray-700'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background emoji */}
                <div className={`absolute top-2 right-2 text-3xl opacity-10 group-hover:opacity-20 transition-opacity ${
                  currentView === item.id ? 'opacity-20' : ''
                }`}>
                  {item.emoji}
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      currentView === item.id 
                        ? 'bg-white/20' 
                        : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
                    } transition-colors duration-300`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-300 ${
                      currentView === item.id ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </div>
                  <p className={`text-sm ${
                    currentView === item.id ? 'text-orange-100' : 'text-gray-500'
                  } group-hover:text-gray-600 transition-colors duration-300`}>
                    {item.description}
                  </p>
                </div>

                {/* Selection indicator */}
                {currentView === item.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            className="pt-6 border-t border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Enhanced Features</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Experience stunning animations, AI-powered insights, and enterprise-grade design.
              </p>
              <AnimatedButton variant="primary" size="sm" className="w-full">
                <Settings className="h-4 w-4" />
                Customize
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-80'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Analytics Preview Component
const AnalyticsPreview: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 flex items-center justify-center">
    <motion.div
      className="text-center max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-8xl mb-6">📈</div>
      <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
        Advanced Analytics
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        Deep insights and market intelligence coming soon. Experience comprehensive restaurant analytics with AI-powered recommendations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '🎯', title: 'Market Targeting', desc: 'Identify ideal customer segments' },
          { icon: '📊', title: 'Performance Metrics', desc: 'Track KPIs and growth trends' },
          { icon: '🔮', title: 'Predictive Analytics', desc: 'Forecast demand and revenue' }
        ].map((item, index) => (
          <motion.div
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

// Chat Preview Component
const ChatPreview: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 flex items-center justify-center">
    <motion.div
      className="text-center max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-8xl mb-6">🤖</div>
      <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
        AI Assistant
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        Try the enhanced floating chatbot in the bottom-right corner! It features multi-language support, voice input, and advanced analytics assistance.
      </p>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <h3 className="font-semibold text-gray-900 mb-4">Features:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {[
            '🌍 Multi-language support (EN/TH)',
            '🎙️ Voice input capability',
            '🌙 Dark/Light theme toggle',
            '🔔 Smart notifications',
            '📊 Analytics integration',
            '⚡ Real-time responses'
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <span>{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  </div>
);

export default EnhancedBiteBasePage;
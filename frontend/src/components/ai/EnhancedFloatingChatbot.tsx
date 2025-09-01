'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Languages,
  Minimize2,
  Maximize2,
  Settings,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Sparkles,
  Bot,
  Send,
  Mic,
  MicOff,
  MoreVertical
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const EnhancedFloatingChatbot: React.FC<ChatbotProps> = ({ 
  className = '', 
  position = 'bottom-right' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'th'>('en');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      title: 'BiteBase AI Assistant',
      status: 'Online - Ready to help with restaurant analytics',
      statusTyping: 'AI is analyzing your request...',
      placeholder: 'Ask about sales, customers, menu performance, or location insights...',
      inputPlaceholder: 'Type your message here...',
      minimize: 'Minimize',
      expand: 'Expand',
      settings: 'Settings',
      language: 'Language',
      sound: 'Sound',
      theme: 'Theme',
      send: 'Send',
      voice: 'Voice input',
      welcomeMessage: 'Hi! I\'m your BiteBase AI assistant. I can help you analyze restaurant data, understand market trends, and optimize your business performance. What would you like to know?'
    },
    th: {
      title: 'ผู้ช่วย AI BiteBase',
      status: 'ออนไลน์ - พร้อมช่วยเหลือเรื่องการวิเคราะห์ร้านอาหาร',
      statusTyping: 'AI กำลังวิเคราะห์คำขอของคุณ...',
      placeholder: 'ถามเกี่ยวกับยอดขาย, ลูกค้า, ประสิทธิภาพเมนู, หรือข้อมูลเชิงพื้นที่...',
      inputPlaceholder: 'พิมพ์ข้อความของคุณที่นี่...',
      minimize: 'ย่อเล็กสุด',
      expand: 'ขยาย',
      settings: 'การตั้งค่า',
      language: 'ภาษา',
      sound: 'เสียง',
      theme: 'ธีม',
      send: 'ส่ง',
      voice: 'ป้อนเสียง',
      welcomeMessage: 'สวัสดี! ฉันคือผู้ช่วย AI ของ BiteBase ฉันสามารถช่วยคุณวิเคราะห์ข้อมูลร้านอาหาร เข้าใจแนวโน้มตลาด และเพิ่มประสิทธิภาพธุรกิจของคุณ คุณต้องการทราบอะไร?'
    }
  };

  const t = translations[currentLanguage];

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        content: t.welcomeMessage,
        role: 'assistant',
        timestamp: new Date()
      }]);
    }
  }, [currentLanguage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('chatbot-language') as 'en' | 'th';
      const savedSound = localStorage.getItem('chatbot-sound');
      const savedTheme = localStorage.getItem('chatbot-theme');
      
      if (savedLanguage) setCurrentLanguage(savedLanguage);
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');
      if (savedTheme !== null) setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save preferences to localStorage
  const savePreference = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'th' : 'en';
    setCurrentLanguage(newLanguage);
    savePreference('chatbot-language', newLanguage);
  };

  const toggleSound = () => {
    const newSound = !soundEnabled;
    setSoundEnabled(newSound);
    savePreference('chatbot-sound', newSound.toString());
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    savePreference('chatbot-theme', newTheme ? 'dark' : 'light');
  };

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on your restaurant data, I can see some interesting trends. Would you like me to analyze your peak hours, customer demographics, or menu performance?",
        "I've analyzed your location data. The foot traffic in your area increases by 40% during lunch hours. Consider optimizing your lunch menu for better revenue.",
        "Your sales data shows strong performance in appetizers and desserts. I recommend featuring these items more prominently in your marketing campaigns.",
        "Market analysis indicates your competitors are pricing similar items 15% higher. This presents an opportunity to optimize your pricing strategy."
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return { button: 'bottom-6 left-6', chat: 'bottom-24 left-6' };
      case 'top-right':
        return { button: 'top-6 right-6', chat: 'top-24 right-6' };
      case 'top-left':
        return { button: 'top-6 left-6', chat: 'top-24 left-6' };
      default:
        return { button: 'bottom-6 right-6', chat: 'bottom-24 right-6' };
    }
  };

  const positionClasses = getPositionClasses();

  // Get chat window dimensions
  const getChatDimensions = () => {
    if (isExpanded) {
      return { width: 'w-[500px]', height: 'h-[700px]' };
    }
    if (isMinimized) {
      return { width: 'w-80', height: 'h-16' };
    }
    return { width: 'w-96', height: 'h-[600px]' };
  };

  const dimensions = getChatDimensions();

  return (
    <>
      {/* Floating Button */}
      <motion.div 
        className={`fixed ${positionClasses.button} z-50`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <motion.button
          onClick={handleToggleOpen}
          className={`relative h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${className}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Ripple effect */}
          <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <MessageCircle className="h-6 w-6" />
                {hasNewMessage && (
                  <motion.div
                    className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Sparkle animation when AI is active */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                className="absolute -top-2 -left-2 text-yellow-400"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            ref={chatRef}
            className={`fixed ${positionClasses.chat} ${dimensions.width} ${dimensions.height} ${
              darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            } rounded-2xl shadow-2xl border z-40 flex flex-col overflow-hidden`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className={`${
              darkMode ? 'bg-gray-800 text-white' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
            } px-4 py-3 flex items-center justify-between transition-colors duration-300`}>
              <div className="flex items-center space-x-3">
                <motion.div 
                  className={`${
                    darkMode ? 'bg-gray-700' : 'bg-white'
                  } p-2 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300`}
                  animate={isTyping ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: isTyping ? Infinity : 0 }}
                >
                  <Bot className={`h-5 w-5 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  } transition-colors duration-300`} />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-sm truncate">{t.title}</h2>
                  <p className={`text-xs truncate transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-orange-100'
                  }`}>
                    {isTyping ? t.statusTyping : t.status}
                  </p>
                </div>
              </div>
              
              {!isMinimized && (
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLanguage}
                    className={`h-7 w-7 p-0 rounded-full ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-orange-600 text-white'
                    } transition-colors duration-300 flex items-center justify-center`}
                    title={t.language}
                  >
                    <Languages className="h-3.5 w-3.5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSound}
                    className={`h-7 w-7 p-0 rounded-full ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-orange-600 text-white'
                    } transition-colors duration-300 flex items-center justify-center`}
                    title={t.sound}
                  >
                    {soundEnabled ? (
                      <Volume2 className="h-3.5 w-3.5" />
                    ) : (
                      <VolumeX className="h-3.5 w-3.5" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className={`h-7 w-7 p-0 rounded-full ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-orange-600 text-white'
                    } transition-colors duration-300 flex items-center justify-center`}
                    title={t.theme}
                  >
                    {darkMode ? (
                      <Sun className="h-3.5 w-3.5" />
                    ) : (
                      <Moon className="h-3.5 w-3.5" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleExpand}
                    className={`h-7 w-7 p-0 rounded-full ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-orange-600 text-white'
                    } transition-colors duration-300 flex items-center justify-center`}
                    title={t.expand}
                  >
                    {isExpanded ? (
                      <Minimize2 className="h-3.5 w-3.5" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5" />
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMinimize}
                    className={`h-7 w-7 p-0 rounded-full ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-orange-600 text-white'
                    } transition-colors duration-300 flex items-center justify-center`}
                    title={t.minimize}
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                  </motion.button>
                </div>
              )}
              
              {isMinimized && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleMinimize}
                  className={`h-7 w-7 p-0 rounded-full ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-orange-600 text-white'
                  } transition-colors duration-300 flex items-center justify-center`}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </div>

            {/* Chat Messages */}
            {!isMinimized && (
              <>
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                  darkMode ? 'bg-gray-900' : 'bg-gray-50'
                }`}>
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : darkMode 
                              ? 'bg-gray-800 text-white border border-gray-700' 
                              : 'bg-white text-gray-800 border border-gray-200'
                        } shadow-sm`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 opacity-70`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className={`p-3 rounded-2xl ${
                        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      } shadow-sm`}>
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-orange-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${
                  darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t.inputPlaceholder}
                        className={`w-full px-4 py-2 rounded-full border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200`}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsVoiceActive(!isVoiceActive)}
                      className={`p-2 rounded-full ${
                        isVoiceActive 
                          ? 'bg-red-500 text-white' 
                          : darkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      } transition-colors duration-200`}
                      title={t.voice}
                    >
                      {isVoiceActive ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      title={t.send}
                    >
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedFloatingChatbot;
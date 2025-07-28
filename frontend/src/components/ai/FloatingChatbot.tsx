'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
  Send
} from 'lucide-react';

interface ChatbotProps {
  className?: string;
}

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const FloatingChatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'th'>('en');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      title: 'BiteBase Assistant',
      status: 'Online - Ready to help',
      statusTyping: 'AI is typing...',
      placeholder: 'Ask about sales, customers, or menu performance...',
      inputPlaceholder: 'Ask me anything about your restaurant business...',
      minimize: 'Minimize',
      expand: 'Expand',
      settings: 'Settings',
      language: 'Language',
      sound: 'Sound',
      theme: 'Theme',
      send: 'Send message',
      welcomeMessage: 'Hello! I\'m your BiteBase AI assistant. How can I help you with your restaurant business today?'
    },
    th: {
      title: 'ผู้ช่วย BiteBase',
      status: 'ออนไลน์ - พร้อมช่วยเหลือ',
      statusTyping: 'AI กำลังพิมพ์...',
      placeholder: 'สอบถามเกี่ยวกับยอดขาย, ลูกค้า, หรือประสิทธิภาพเมนู...',
      inputPlaceholder: 'ถามฉันเกี่ยวกับธุรกิจร้านอาหารของคุณ...',
      minimize: 'ย่อเล็กสุด',
      expand: 'ขยาย',
      settings: 'การตั้งค่า',
      language: 'ภาษา',
      sound: 'เสียง',
      theme: 'ธีม',
      send: 'ส่งข้อความ',
      welcomeMessage: 'สวัสดี! ฉันเป็นผู้ช่วย AI ของ BiteBase วันนี้ฉันจะช่วยอะไรคุณเกี่ยวกับธุรกิจร้านอาหารได้บ้าง?'
    }
  };

  const t = translations[currentLanguage];

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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: t.welcomeMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [currentLanguage]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: currentLanguage === 'en' 
          ? "I understand you're asking about your restaurant business. I'm here to help with analytics, insights, and recommendations!"
          : "ฉันเข้าใจว่าคุณถามเกี่ยวกับธุรกิจร้านอาหารของคุณ ฉันพร้อมช่วยเหลือด้านการวิเคราะห์ ข้อมูลเชิงลึก และคำแนะนำ!",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Get chat window dimensions
  const getChatDimensions = () => {
    if (isExpanded) {
      return {
        width: 'w-[500px]',
        height: 'h-[700px]',
        bottom: 'bottom-6',
        right: 'right-6'
      };
    }
    if (isMinimized) {
      return {
        width: 'w-80',
        height: 'h-16',
        bottom: 'bottom-24',
        right: 'right-6'
      };
    }
    return {
      width: 'w-96',
      height: 'h-[600px]',
      bottom: 'bottom-24',
      right: 'right-6'
    };
  };

  const dimensions = getChatDimensions();

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggleOpen}
          className={`relative h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 ${className} ${
            isOpen ? 'rotate-180' : ''
          }`}
          size="lg"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-300" />
          ) : (
            <>
              <MessageCircle className="h-6 w-6 transition-transform duration-300" />
              {hasNewMessage && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" aria-hidden="true">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                </div>
              )}
            </>
          )}
        </Button>
        
        {/* Sparkle animation when AI is active */}
        {isTyping && (
          <div className="absolute -top-2 -left-2 text-yellow-400 animate-bounce" aria-hidden="true">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div 
          ref={chatRef}
          className={`fixed ${dimensions.bottom} ${dimensions.right} ${dimensions.width} ${dimensions.height} ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          } rounded-2xl shadow-2xl border z-40 flex flex-col overflow-hidden transition-all duration-300`}
          role="dialog"
          aria-label="AI Chat Assistant"
        >
          {/* Header */}
          <div className={`${
            darkMode ? 'bg-gray-800 text-white' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
          } px-4 py-3 flex items-center justify-between transition-colors duration-300`}>
            <div className="flex items-center space-x-3">
              <div className={`${
                darkMode ? 'bg-gray-700' : 'bg-white'
              } p-2 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                isTyping ? 'animate-pulse' : ''
              }`}>
                <Bot className={`h-5 w-5 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                } transition-colors duration-300`} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-sm truncate">{t.title}</h2>
                <p className={`text-xs truncate transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-amber-100'
                }`} aria-live="polite">
                  {isTyping ? t.statusTyping : t.status}
                </p>
              </div>
            </div>
            
            {!isMinimized && (
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className={`h-7 w-7 p-0 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-amber-600 text-white'
                  } transition-colors duration-300`}
                  title={t.language}
                  aria-label={`Switch language to ${currentLanguage === 'en' ? 'Thai' : 'English'}`}
                >
                  <Languages className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className={`h-7 w-7 p-0 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-amber-600 text-white'
                  } transition-colors duration-300`}
                  title={t.sound}
                  aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className={`h-7 w-7 p-0 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-amber-600 text-white'
                  } transition-colors duration-300`}
                  title={t.theme}
                  aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {darkMode ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : (
                    <Moon className="h-3.5 w-3.5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpand}
                  className={`h-7 w-7 p-0 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-amber-600 text-white'
                  } transition-colors duration-300`}
                  title={t.expand}
                  aria-label={isExpanded ? 'Minimize window' : 'Expand window'}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-3.5 w-3.5" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimize}
                  className={`h-7 w-7 p-0 ${
                    darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-amber-600 text-white'
                  } transition-colors duration-300`}
                  title={t.minimize}
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            
            {isMinimized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMinimize}
                className={`h-7 w-7 p-0 ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-amber-600 text-white'
                } transition-colors duration-300`}
                aria-label="Restore chat"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                darkMode ? 'bg-gray-900' : 'bg-gray-50'
              }`}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.isBot
                          ? darkMode
                            ? 'bg-gray-700 text-white'
                            : 'bg-white text-gray-900 shadow-sm'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className={`text-xs opacity-70 mt-1 block ${
                        message.isBot 
                          ? darkMode ? 'text-gray-300' : 'text-gray-500'
                          : 'text-blue-100'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`px-4 py-2 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-white shadow-sm'
                    }`}>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className={`p-4 border-t ${
                darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t.inputPlaceholder}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={isTyping}
                    aria-label="Type your message"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                    aria-label={t.send}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
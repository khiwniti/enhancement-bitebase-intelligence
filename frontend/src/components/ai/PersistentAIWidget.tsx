'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles,
  Bot,
  User,
  Loader2,
  ChefHat,
  BarChart3,
  TrendingUp,
  MapPin,
  Coffee
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
  data?: any
}

interface PersistentAIWidgetProps {
  className?: string
}

export const PersistentAIWidget: React.FC<PersistentAIWidgetProps> = ({
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Hi! I'm your BiteBase AI assistant. I can help you analyze your restaurant data, understand market trends, and provide insights. What would you like to explore today?",
      timestamp: new Date(),
      suggestions: [
        "📊 Show me my revenue trends",
        "🗺️ Analyze my location performance", 
        "📈 What are my best-selling items?",
        "🎯 Give me optimization suggestions"
      ]
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Floating icons for animation
  const floatingIcons = [ChefHat, BarChart3, TrendingUp, MapPin, Coffee]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // Mock AI response generation
  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const responses = [
      {
        content: "📊 Based on your recent data, I can see some interesting trends! Your revenue has increased by 15% this month compared to last month. Would you like me to break this down by day or show you which menu items are driving this growth?",
        suggestions: ["📅 Show daily breakdown", "🍽️ Top performing items", "📈 Compare with last quarter"]
      },
      {
        content: "🗺️ Your location analysis shows high foot traffic during lunch hours (11 AM - 2 PM) and dinner rush (6 PM - 9 PM). I notice you could optimize your staffing during these peak times. Would you like specific recommendations?",
        suggestions: ["👥 Staffing recommendations", "⏰ Peak hour analysis", "💡 Optimization tips"]
      },
      {
        content: "🎯 I've identified 3 key opportunities for your restaurant: 1) Increase pricing on high-demand items by 8-12%, 2) Promote underperforming menu items during slow hours, 3) Expand delivery radius based on competitor analysis.",
        suggestions: ["💰 Pricing strategy", "📋 Menu optimization", "🚚 Delivery expansion"]
      }
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: randomResponse.content,
      timestamp: new Date(),
      suggestions: randomResponse.suggestions
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await generateAIResponse(currentMessage)
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error generating AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion.replace(/[📊🗺️📈🎯👥⏰💡💰📋🚚📅🍽️]/g, '').trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Widget trigger button
  const widgetButton = (
    <motion.div
      className={`fixed bottom-6 right-6 z-50 ${isOpen ? 'hidden' : 'block'}`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Floating background effects */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-md opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Floating icons around the button */}
        {floatingIcons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-white/30"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((index * 72) * Math.PI / 180) * 40,
              y: Math.sin((index * 72) * Math.PI / 180) * 40,
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 4 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon size={16} />
          </motion.div>
        ))}

        <Button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl border-0"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Bot className="h-8 w-8 text-white" />
          </motion.div>
          
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {unreadCount}
            </motion.div>
          )}
        </Button>

        {/* Pulsing effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  )

  // Chat window
  const chatWindow = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed bottom-6 right-6 z-50 ${isMinimized ? 'w-80' : 'w-96'} ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Card className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl overflow-hidden">
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Avatar className="w-8 h-8 bg-white/20">
                    <AvatarFallback className="text-white bg-transparent">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sm">BiteBase AI Assistant</h3>
                  <motion.p 
                    className="text-xs text-white/80"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🤖 Ready to help
                  </motion.p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <X size={16} />
                </Button>
              </div>
            </motion.div>

            {/* Chat content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  {/* Messages */}
                  <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                          <motion.div
                            className={`p-3 rounded-2xl shadow-sm ${
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-sm'
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </motion.div>
                          
                          {/* Suggestions */}
                          {message.suggestions && (
                            <motion.div 
                              className="mt-2 space-y-1"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              {message.suggestions.map((suggestion, idx) => (
                                <motion.button
                                  key={idx}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 transition-colors"
                                  whileHover={{ scale: 1.02, x: 5 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {suggestion}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                        
                        <Avatar className={`w-8 h-8 ${message.type === 'user' ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                          <AvatarFallback className={message.type === 'user' ? 'bg-blue-100' : 'bg-purple-100'}>
                            {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                    ))}
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <Avatar className="w-8 h-8 mr-2">
                          <AvatarFallback className="bg-purple-100">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                          <motion.div
                            className="flex items-center space-x-2"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                            <span className="text-sm text-gray-600">Thinking...</span>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <motion.div 
                    className="p-4 bg-white border-t border-gray-200"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask about your restaurant data..."
                          className="pr-12 border-gray-300 focus:border-blue-500 rounded-full bg-gray-50"
                          disabled={isLoading}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsVoiceActive(!isVoiceActive)}
                          className={`absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto rounded-full ${
                            isVoiceActive ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {isVoiceActive ? <MicOff size={16} /> : <Mic size={16} />}
                        </Button>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isLoading}
                        className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 p-2 h-auto"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {widgetButton}
      {chatWindow}
    </>
  )
}

export default PersistentAIWidget

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { Badge } from '@/components/badge'
import { geminiAI, type GeminiResponse } from '@/shared/lib/ai/gemini-service'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  confidence?: number
  context?: string
}

interface AIAssistantProps {
  context?: string
  placeholder?: string
  suggestions?: string[]
}

export function AIAssistant({ 
  context = 'general', 
  placeholder = 'Ask me anything about your restaurant business...',
  suggestions = [
    "Analyze my restaurant performance",
    "What are the latest food trends?",
    "How can I improve customer satisfaction?",
    "Show me competitor analysis"
  ]
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your intelligent business assistant. I can help you analyze restaurant data, provide market insights, and answer questions about your business. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
      confidence: 1.0,
      context: 'greeting'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      // Simulate typing delay for more natural interaction
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response: GeminiResponse = await geminiAI.generateResponse(input, context)
      
      setIsTyping(false)
      
      // Simulate gradual text appearance
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        confidence: response.confidence,
        context: response.context || ''
      }

      setMessages(prev => [...prev, aiMessage])

      // Animate text appearance
      const words = response.text.split(' ')
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, text: words.slice(0, i + 1).join(' ') }
            : msg
        ))
      }
    } catch (error) {
      setIsTyping(false)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        confidence: 0.1,
        context: 'error'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500'
    if (confidence > 0.8) return 'bg-green-500'
    if (confidence > 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          AI Business Assistant
          <Badge variant="outline" className="ml-auto">
            {context}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border shadow-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.sender === 'ai' && message.confidence && (
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getConfidenceColor(message.confidence)}`}
                      ></div>
                      <span>{Math.round(message.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm p-3 rounded-lg">
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

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

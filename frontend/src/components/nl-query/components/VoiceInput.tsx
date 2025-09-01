/**
 * BiteBase Intelligence Voice Input Component 2.0
 * Enhanced with food delivery theme and advanced voice animations
 * Handles speech-to-text input for natural language queries
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedButton } from '@/components/animations'
import type { VoiceInputProps } from '../types/nlQueryTypes'

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onActiveChange,
  config = {}
}) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<any>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Default configuration
  const defaultConfig = {
    language: 'en-US',
    continuous: false,
    interimResults: true,
    maxAlternatives: 1,
    ...config
  }

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      
      // Configure recognition
      recognitionRef.current.lang = defaultConfig.language
      recognitionRef.current.continuous = defaultConfig.continuous
      recognitionRef.current.interimResults = defaultConfig.interimResults
      recognitionRef.current.maxAlternatives = defaultConfig.maxAlternatives
    }
  }, [defaultConfig.language, defaultConfig.continuous, defaultConfig.interimResults, defaultConfig.maxAlternatives])

  // Setup event handlers
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    const handleResult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)

      // If we have a final result, send it to parent
      if (finalTranscript) {
        onTranscript(finalTranscript.trim())
        stopListening()
      }
    }

    const handleError = (event: any) => {
      console.error('Speech recognition error:', event.error)
      
      let errorMessage = 'Speech recognition failed'
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.'
          break
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your connection.'
          break
        default:
          errorMessage = `Speech recognition error: ${event.error}`
      }
      
      setError(errorMessage)
      stopListening()
    }

    const handleStart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
    }

    const handleEnd = () => {
      setIsListening(false)
    }

    recognition.addEventListener('result', handleResult)
    recognition.addEventListener('error', handleError)
    recognition.addEventListener('start', handleStart)
    recognition.addEventListener('end', handleEnd)

    return () => {
      recognition.removeEventListener('result', handleResult)
      recognition.removeEventListener('error', handleError)
      recognition.removeEventListener('start', handleStart)
      recognition.removeEventListener('end', handleEnd)
    }
  }, [onTranscript])

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    try {
      recognitionRef.current.start()
      onActiveChange(true)
      
      // Set timeout to stop listening after 30 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop()
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }

        setIsListening(false)
        onActiveChange(false)
        setTranscript('')
      }, 30000)
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setError('Failed to start speech recognition')
    }
  }, [isListening, onActiveChange])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsListening(false)
    onActiveChange(false)
    setTranscript('')
  }, [isListening, onActiveChange])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  // Don't render if not supported
  if (!isSupported) {
    return null
  }

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedButton
        type="button"
        variant={isListening ? "delivery" : "secondary"}
        size="lg"
        onClick={toggleListening}
        animationType="bounce"
        className={`flex items-center space-x-2 relative overflow-hidden ${
          isListening 
            ? 'bg-gradient-to-r from-food-red to-red-600 text-white shadow-lg' 
            : 'bg-gradient-to-r from-bitebase-primary/10 to-food-orange/10 border-bitebase-primary/30 hover:border-bitebase-primary'
        }`}
        title={isListening ? '🛑 Stop voice input' : '🎤 Start voice input'}
      >
        <motion.div
          animate={isListening ? {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{
            duration: 0.8,
            repeat: isListening ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </motion.div>
        
        {/* Ripple effect when listening */}
        {isListening && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-lg"
            animate={{
              scale: [1, 1.5],
              opacity: [0.5, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </AnimatedButton>

      {/* Enhanced Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div 
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-bitebase-primary to-food-orange text-white px-4 py-3 rounded-xl text-sm whitespace-nowrap shadow-xl border border-white/20"
              animate={{
                boxShadow: [
                  '0 10px 25px rgba(116, 195, 101, 0.3)',
                  '0 15px 35px rgba(255, 107, 53, 0.4)',
                  '0 10px 25px rgba(116, 195, 101, 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                </motion.div>
                <span className="flex items-center gap-2">
                  🎤 Listening for food intelligence...
                </span>
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex space-x-1"
                >
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </motion.div>
              </div>
              
              <AnimatePresence>
                {transcript && (
                  <motion.div 
                    className="mt-2 text-white/90 max-w-64 text-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="italic"
                    >
                      💬 &quot;{transcript}&quot;
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Error indicator */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl text-sm max-w-72 shadow-xl border border-red-400/20"
              animate={{
                x: [0, -2, 2, 0],
              }}
              transition={{
                duration: 0.5,
                repeat: 2
              }}
            >
              <div className="flex items-center space-x-2">
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="text-lg"
                >
                  ⚠️
                </motion.span>
                <span className="font-medium">Voice Input Error</span>
              </div>
              <div className="mt-1 text-red-100 text-xs">
                {error}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice waves animation when listening */}
      {isListening && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 border-2 border-bitebase-primary/30 rounded-lg"
              animate={{
                scale: [1, 1.5 + i * 0.3],
                opacity: [0.6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default VoiceInput
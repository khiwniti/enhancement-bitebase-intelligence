/**
 * BiteBase Intelligence Voice Input Component
 * Handles speech-to-text input for natural language queries
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
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

    const handleResult = (event: SpeechRecognitionEvent) => {
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

    const handleError = (event: SpeechRecognitionErrorEvent) => {
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
  }, [onTranscript, stopListening])

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    try {
      recognitionRef.current.start()
      onActiveChange(true)
      
      // Set timeout to stop listening after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening()
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
  }, [isListening, onActiveChange, stopListening])

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
    <div className="relative">
      <Button
        type="button"
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={toggleListening}
        className={`flex items-center space-x-1 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'hover:bg-gray-100'
        }`}
        title={isListening ? 'Stop voice input' : 'Start voice input'}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-3 w-3 animate-pulse" />
              <span>Listening...</span>
            </div>
            {transcript && (
              <div className="mt-1 text-gray-300 max-w-48 truncate">
                &quot;{transcript}&quot;
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap max-w-64">
            {error}
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceInput
"use client"

import { useState, useEffect, useRef } from "react"

interface TextToSpeechHook {
  speak: (text: string, language?: string) => void
  stop: () => void
  isSpeaking: boolean
  stopSpeaking: () => void
}

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = (text: string, language = "en-US") => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported')
      return
    }

    // Stop any current speech
    stop()

    // Create a new utterance
    const newUtterance = new SpeechSynthesisUtterance(text)
    newUtterance.lang = language
    newUtterance.rate = 0.9
    newUtterance.pitch = 1

    // Store in ref
    utteranceRef.current = newUtterance

    // Set up event handlers
    newUtterance.onstart = () => {
      setIsSpeaking(true)
    }

    newUtterance.onend = () => {
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    newUtterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e)
      setIsSpeaking(false)
      utteranceRef.current = null
      // Force reset the speech synthesis
      window.speechSynthesis.cancel()
    }

    // Add a small delay to ensure previous speech is fully cancelled
    setTimeout(() => {
      window.speechSynthesis.speak(newUtterance)
    }, 100)
  }

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      utteranceRef.current = null
    }
  }

  return { 
    speak, 
    stop, 
    isSpeaking, 
    stopSpeaking: stop 
  }
}

export default useTextToSpeech
"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface TextToSpeechHook {
  speak: (text: string, language?: string) => void
  stopSpeaking: () => void
  isSpeaking: boolean
}

export const useTextToSpeech = (): TextToSpeechHook => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      if (isMounted.current) {
        setIsSpeaking(false)
        utteranceRef.current = null
      }
    }
  }, [])

  const speak = useCallback((text: string, language = "en-US") => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported")
      return
    }

    stopSpeaking() // Cancel any ongoing speech first

    const newUtterance = new SpeechSynthesisUtterance(text)
    newUtterance.lang = language
    newUtterance.rate = 0.9
    newUtterance.pitch = 1

    utteranceRef.current = newUtterance

    newUtterance.onstart = () => {
      if (isMounted.current) {
        setIsSpeaking(true)
      }
    }

    newUtterance.onend = () => {
      if (isMounted.current) {
        setIsSpeaking(false)
        utteranceRef.current = null
      }
    }

    newUtterance.onerror = (e: any) => {
      console.error("SpeechSynthesis error:", e?.error || e)
      if (isMounted.current) {
        setIsSpeaking(false)
        utteranceRef.current = null
      }
    }
    

    window.speechSynthesis.speak(newUtterance)
  }, [stopSpeaking])

  return {
    speak,
    stopSpeaking,
    isSpeaking
  }
}

export default useTextToSpeech
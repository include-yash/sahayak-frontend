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
  const isMounted = useRef(true) // Track component mount state

  // Clean up on unmount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      }
    }
  }, [])

  const speak = (text: string, language = "en-US") => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported")
      return
    }

    // Cancel any ongoing or queued speech
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel()
      console.log("Cleared existing speech queue")
    }

    // Create a new utterance
    const newUtterance = new SpeechSynthesisUtterance(text)
    newUtterance.lang = language
    newUtterance.rate = 0.9
    newUtterance.pitch = 1

    // Store in ref
    utteranceRef.current = newUtterance

    // Event handlers
    newUtterance.onstart = () => {
      if (isMounted.current) {
        setIsSpeaking(true)
        console.log(`Started speaking: "${text.substring(0, 50)}..."`)
      }
    }

    newUtterance.onend = () => {
      if (isMounted.current) {
        setIsSpeaking(false)
        utteranceRef.current = null
        console.log(`Finished speaking: "${text.substring(0, 50)}..."`)
      }
    }

    newUtterance.onerror = (e) => {
      if (isMounted.current) {
        console.error("SpeechSynthesis error:", e)
        setIsSpeaking(false)
        utteranceRef.current = null
        window.speechSynthesis.cancel() // Ensure cleanup
      }
    }

    // Speak immediately after canceling previous utterances
    window.speechSynthesis.speak(newUtterance)
  }

  const stop = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      if (isMounted.current) {
        setIsSpeaking(false)
        utteranceRef.current = null
        console.log("Speech stopped manually")
      }
    }
  }

  return {
    speak,
    stop,
    isSpeaking,
    stopSpeaking: stop,
  }
}

export default useTextToSpeech
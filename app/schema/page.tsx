"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Moon, Sun, Settings, ArrowLeft, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import Avatar from "@/components/avatar"
import ChatMessage from "@/components/chat-message"
import SchemeMode from "@/components/modes/scheme-mode"
import LanguageSelector from "@/components/language-selector"
import EmergencyCall from "@/components/emergency-call"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { useLocation } from "@/hooks/use-location"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function SchemePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmergencyCall, setShowEmergencyCall] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([])
  const [avatarMood, setAvatarMood] = useState<"neutral" | "happy" | "thinking" | "scheme" | "wellness" | "shopping">("scheme")

  const { t, language, setLanguage } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const { location, requestLocation } = useLocation()
  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech()

  const SpeechRecognitionConstructor = typeof window !== "undefined"
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : undefined
  const recognition = SpeechRecognitionConstructor ? new SpeechRecognitionConstructor() : null

  if (recognition) {
    recognition.lang = language === "hi" ? "hi-IN" : "en-US"
    recognition.continuous = false
    recognition.interimResults = false
  }

  useEffect(() => {
    const welcomeMessage = t("scheme_welcome")
    setMessages([{ text: welcomeMessage, isUser: false }])
    speak(welcomeMessage, language)
    
    if (isAuthenticated && !location) {
      requestLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const askGemini = async (prompt: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }
    const modePrompt = `Act as an expert on Indian state government welfare schemes. Provide verified details about [Scheme Name/Keywords - e.g., 'farmers', 'housing', 'women empowerment'] in [State Name - e.g., 'Karnataka', 'Punjab', 'Tamil Nadu']. Follow this strict format:

1. Scheme Overview  
Official Name:  
  
Launch Year + Last Update:  
  
Governing Department/Ministry:  
  
Objective: (1 sentence)  
  
Source: (Official state/central government link)  

2. Subsidy/Benefits  
Type: (Direct Cash Transfer / Interest Subsidy / Free Ration / etc.)  
  
Amount/Coverage: (e.g., "₹6,000/year for farmers" or "Free healthcare up to ₹5L")  
  
Target Group: (Farmers/Women/SC-ST/OBC/MSMEs/Students/Disabled)  

3. Eligibility (State-Specific)  
Mandatory Documents: (Aadhaar, Voter ID, Income Certificate, Caste Certificate, etc.)  
  
Residency Requirement: (Must be a resident of [State] for X years)  
  
Income/Age/Gender/Caste Criteria:  
  
Exclusions: (e.g., "Taxpayers earning >₹10L/year")  

4. Application Process  
Online:  
  
Portal Link: (State Seva Kendhra/Central Govt. Portal)  
  
Steps: (1. Register → 2. Upload Docs → 3. Submit)  
  
Offline:  
  
Nearest Office: (CSC/Block Office/Gram Panchayat)  
  
Required Forms: (Form XYZ available at [location])  
  
Helpline: (Toll-free number/email)  

5. Pro Tips for [State] Applicants  
Processing Time: (e.g., "30-60 days for verification")  
  
Tracking: (SMS format like SCHEME <APPID> to 12345 or portal link)  
  
Common Mistakes: (e.g., "Incomplete income proof" or "Wrong bank details")  
  
Disclaimer: "Verify updates on [Official State Portal] before applying. Policies may change."`;

    const fullPrompt = modePrompt + prompt

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gemini`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response
  }

  const handleMicToggle = () => {
    if (!recognition) {
      setMessages((prev) => [...prev, { text: t("speech_not_supported"), isUser: false }])
      return
    }

    setIsListening(!isListening)
    setAvatarMood(isListening ? "thinking" : "scheme")

    if (!isListening) {
      recognition.start()
      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const userPrompt = event.results[0][0].transcript
        setMessages((prev) => [...prev, { text: userPrompt, isUser: true }])
        setAvatarMood("thinking")

        try {
          const aiResponse = await askGemini(userPrompt)
          setMessages((prev) => [...prev, { text: aiResponse, isUser: false }])
          setAvatarMood("scheme")
          stopSpeaking()
          setTimeout(() => speak(aiResponse, language), 300)
        } catch (error) {
          setMessages((prev) => [...prev, { text: t("error_message"), isUser: false }])
          setAvatarMood("neutral")
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false)
        setMessages((prev) => [...prev, { text: t("speech_error"), isUser: false }])
        setAvatarMood("neutral")
        stopSpeaking()
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    } else {
      recognition.stop()
      stopSpeaking()
    }
  }

  const handleEmergencyCall = () => {
    setShowEmergencyCall(true)
  }

  return (
    <main
      className={cn(
        "min-h-screen transition-colors duration-300",
        darkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-b from-amber-50 to-orange-100 text-gray-800"
      )}
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}
              >
                <ArrowLeft size={24} />
              </Button>
            </Link>
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
              style={{ fontSize: `${1.5 * fontSize}rem` }}
            >
              {t("scheme_mode")}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEmergencyCall}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Phone size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}
            >
              <Settings size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </Button>
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} darkMode={darkMode} />
          </div>
        </motion.div>

        {/* Settings panel and Emergency Call Modal same as before */}

        {/* Avatar and chat area */}
        <motion.div
          className="mb-6 flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Avatar mood={avatarMood} darkMode={darkMode} />
          <div className="w-full mt-4 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.text}
                isUser={message.isUser}
                darkMode={darkMode}
                fontSize={fontSize}
                onSpeakText={() => speak(message.text, language)}
                isSpeaking={isSpeaking}
                stopSpeaking={stopSpeaking}
              />
            ))}
          </div>
        </motion.div>

        {/* Scheme-specific content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <SchemeMode darkMode={darkMode} fontSize={fontSize} location={location} />
        </motion.div>

        {/* Microphone button */}
        <motion.div
          className="fixed bottom-8 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.button
            className={cn(
              "p-6 rounded-full shadow-lg flex items-center justify-center",
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-purple-500 hover:bg-purple-600"
            )}
            onClick={handleMicToggle}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {isListening ? <MicOff size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
          </motion.button>
        </motion.div>
      </div>
    </main>
  )
}
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Moon, Sun, Settings, ArrowLeft, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import Avatar from "@/components/avatar"
import ChatMessage from "@/components/chat-message"
import ShoppingMode from "@/components/modes/shopping-mode"
import LanguageSelector from "@/components/language-selector"
import EmergencyCall from "@/components/emergency-call"
import { useTranslation } from "@/hooks/use-translation"

import { useAuth } from "@/hooks/use-auth"
import { useLocation } from "@/hooks/use-location"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ShoppingPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmergencyCall, setShowEmergencyCall] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([])
  const [avatarMood, setAvatarMood] = useState<"neutral" | "happy" | "thinking" | "religious" | "wellness" | "shopping">("shopping")
  const [hasWelcomed, setHasWelcomed] = useState(false)

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
    if (!hasWelcomed && isAuthenticated) {
      const welcome = t("shopping_welcome")
      setMessages([{ text: welcome, isUser: false }])
      speak(welcome, language)
      setHasWelcomed(true)

      if (!location) {
        requestLocation()
      }
    }
  }, [hasWelcomed, isAuthenticated, t, language, location, requestLocation, speak])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  const askGemini = async (prompt: string) => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No authentication token found")

    const modePrompt = ` Suggest good restaurants in bangalore just give restaurant name in response in proper format `
    const fullPrompt = modePrompt + prompt

    const response = await fetch("http://127.0.0.1:8000/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
    setAvatarMood(isListening ? "thinking" : "shopping")

    if (!isListening) {
      recognition.start()
      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const userPrompt = event.results[0][0].transcript
        setMessages((prev) => [...prev, { text: userPrompt, isUser: true }])
        setAvatarMood("thinking")

        try {
          const aiResponse = await askGemini(userPrompt)
          setMessages((prev) => [...prev, { text: aiResponse, isUser: false }])
          setAvatarMood("shopping")
          stopSpeaking()
          speak(aiResponse, language)
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

      recognition.onend = () => setIsListening(false)
    } else {
      recognition.stop()
      stopSpeaking()
    }
  }

  const handleEmergencyCall = () => setShowEmergencyCall(true)

 

  return (
    <main className={cn("min-h-screen transition-colors duration-300", darkMode ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white" : "bg-gradient-to-b from-amber-50 to-orange-100 text-gray-800")}>
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <motion.div className="flex justify-between items-center mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}>
                <ArrowLeft size={24} />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent" style={{ fontSize: `${1.5 * fontSize}rem` }}>
              {t("app_name")}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={handleEmergencyCall} className="rounded-full bg-red-500 hover:bg-red-600 text-white">
              <Phone size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}>
              <Settings size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}>
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </Button>
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} darkMode={darkMode} />
          </div>
        </motion.div>

        {/* Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={cn("mb-6 p-4 rounded-xl shadow-lg", darkMode ? "bg-gray-800" : "bg-white")}>
              <h2 className="text-xl font-semibold mb-4" style={{ fontSize: `${1.25 * fontSize}rem` }}>{t("settings")}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: `${1 * fontSize}rem` }}>{t("dark_mode")}</span>
                  <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>{t("text_size")}</span>
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>{Math.round(fontSize * 100)}%</span>
                  </div>
                  <Slider value={[fontSize]} min={0.8} max={1.5} step={0.1} onValueChange={(value) => setFontSize(value[0])} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>{t("contrast")}</span>
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>{Math.round(contrast * 100)}%</span>
                  </div>
                  <Slider value={[contrast]} min={0.8} max={1.2} step={0.1} onValueChange={(value) => setContrast(value[0])} />
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={logout}>
                    {t("logout")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Call Modal */}
        <AnimatePresence>
          {showEmergencyCall && (
            <EmergencyCall onClose={() => setShowEmergencyCall(false)} darkMode={darkMode} fontSize={fontSize} emergencyContact={user?.emergency_contact || { name: "Rahul", phone: "+91 98765 43210" }} />
          )}
        </AnimatePresence>

        {/* Avatar and chat */}
        <motion.div className="mb-6 flex flex-col items-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
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

        {/* Mode-specific content */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <ShoppingMode darkMode={darkMode} fontSize={fontSize} location={location} />
        </motion.div>

       

        {/* Mic Button */}
        <motion.div className="fixed bottom-8 left-0 right-0 flex justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
          <motion.button
            className={cn("p-6 rounded-full shadow-lg flex items-center justify-center", isListening ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600")}
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

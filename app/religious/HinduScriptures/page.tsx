"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Moon, Sun, Settings, ArrowLeft, Phone, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import Avatar from "@/components/avatar"
import ChatMessage from "@/components/chat-message"
import LanguageSelector from "@/components/language-selector"
import EmergencyCall from "@/components/emergency-call"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { useLocation } from "@/hooks/use-location"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function HinduScripturesPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmergencyCall, setShowEmergencyCall] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([])
  const [avatarMood, setAvatarMood] = useState<"neutral" | "happy" | "thinking" | "religious" | "wellness" | "shopping">("religious")
  const [inputText, setInputText] = useState("")

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

  // Initialize the page - runs only once on mount
  useEffect(() => {
    const welcomeMessage = t("scriptures_welcome") || "Welcome to Hindu Scriptures. Ask me about Vedas, Upanishads, Bhagavad Gita, or any other sacred texts."
    setMessages([{ text: welcomeMessage, isUser: false }])
    speak(welcomeMessage, language)
    
    if (isAuthenticated && !location) {
      requestLocation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array means this runs only once on mount

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const askGemini = async (prompt: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }
    const scripturePrompt = `
      You are an expert on Hindu scriptures. Provide accurate information from authentic sources about:
      - Vedas (Rigveda, Yajurveda, Samaveda, Atharvaveda)
      - Upanishads
      - Bhagavad Gita
      - Puranas
      - Ramayana
      - Mahabharata
      - Other Hindu scriptures
      
      For verse references, provide chapter and verse numbers when possible.
      Respond in a respectful, devotional tone suitable for spiritual guidance.
      Question: ${prompt}
    `

    const response = await fetch("http://127.0.0.1:8000/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: scripturePrompt }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response
  }

  const handleMicToggle = () => {
    if (!recognition) {
      setMessages((prev) => [...prev, { text: t("speech_not_supported") || "Speech recognition not supported in your browser", isUser: false }])
      return
    }

    setIsListening(!isListening)
    setAvatarMood(isListening ? "thinking" : "religious")

    if (!isListening) {
      recognition.start()
      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const userPrompt = event.results[0][0].transcript
        setMessages((prev) => [...prev, { text: userPrompt, isUser: true }])
        setAvatarMood("thinking")

        try {
          const aiResponse = await askGemini(userPrompt)
          setMessages((prev) => [...prev, { text: aiResponse, isUser: false }])
          setAvatarMood("religious")
          stopSpeaking()
          setTimeout(() => speak(aiResponse, language), 300)
        } catch (error) {
          setMessages((prev) => [...prev, { text: t("error_message") || "Sorry, I couldn't process your request", isUser: false }])
          setAvatarMood("neutral")
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false)
        setMessages((prev) => [...prev, { text: t("speech_error") || "There was an error with speech recognition", isUser: false }])
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

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setMessages((prev) => [...prev, { text: inputText, isUser: true }])
    setAvatarMood("thinking")
    setInputText("")

    try {
      const aiResponse = await askGemini(inputText)
      setMessages((prev) => [...prev, { text: aiResponse, isUser: false }])
      setAvatarMood("religious")
      stopSpeaking()
      setTimeout(() => speak(aiResponse, language), 300)
    } catch (error) {
      setMessages((prev) => [...prev, { text: t("error_message") || "Sorry, I couldn't process your request", isUser: false }])
      setAvatarMood("neutral")
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
            <Link href="/religious">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}
              >
                <ArrowLeft size={24} />
              </Button>
            </Link>
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
              style={{ fontSize: `${1.5 * fontSize}rem` }}
            >
              {t("hindu_scriptures") || "Hindu Scriptures"}
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

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn("mb-6 p-4 rounded-xl shadow-lg", darkMode ? "bg-gray-800" : "bg-white")}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ fontSize: `${1.25 * fontSize}rem` }}>
                {t("settings")}
              </h2>
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
                  <Slider
                    value={[fontSize]}
                    min={0.8}
                    max={1.5}
                    step={0.1}
                    onValueChange={(value) => setFontSize(value[0])}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>{t("contrast")}</span>
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>{Math.round(contrast * 100)}%</span>
                  </div>
                  <Slider
                    value={[contrast]}
                    min={0.8}
                    max={1.2}
                    step={0.1}
                    onValueChange={(value) => setContrast(value[0])}
                  />
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
            <EmergencyCall
              onClose={() => setShowEmergencyCall(false)}
              darkMode={darkMode}
              fontSize={fontSize}
              emergencyContact={user?.emergency_contact || { name: "Rahul", phone: "+91 98765 43210" }}
            />
          )}
        </AnimatePresence>

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

        {/* Scripture Quick Access */}
        <motion.div
          className={cn("mb-6 p-4 rounded-xl shadow-lg", darkMode ? "bg-gray-800" : "bg-white")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ fontSize: `${1.25 * fontSize}rem` }}>
            <BookOpen size={24} />
            {t("quick_access") || "Quick Access"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Bhagavad Gita", "Ramayana", "Mahabharata", "Vedas", "Upanishads", "Puranas"].map((scripture) => (
              <Button
                key={scripture}
                variant="outline"
                className={cn(
                  "text-sm py-2 h-auto",
                  darkMode ? "hover:bg-gray-700" : "hover:bg-amber-100"
                )}
                onClick={() => setInputText(`Tell me about ${scripture}`)}
              >
                {scripture}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Input area */}
        <motion.div
          className="fixed bottom-8 left-0 right-0 flex justify-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="max-w-4xl w-full flex gap-2">
            <form onSubmit={handleTextSubmit} className="flex-1 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t("ask_about_scriptures") || "Ask about Hindu scriptures..."}
                className={cn(
                  "flex-1 p-4 rounded-full shadow-lg focus:outline-none focus:ring-2",
                  darkMode
                    ? "bg-gray-700 text-white focus:ring-amber-500"
                    : "bg-white text-gray-800 focus:ring-orange-500"
                )}
                style={{ fontSize: `${1 * fontSize}rem` }}
              />
              <Button
                type="submit"
                className="p-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {t("send") || "Send"}
              </Button>
            </form>
            <motion.button
              className={cn(
                "p-4 rounded-full shadow-lg flex items-center justify-center",
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-orange-500 hover:bg-orange-600"
              )}
              onClick={handleMicToggle}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {isListening ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
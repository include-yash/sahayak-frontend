"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Moon, Sun, Settings, ArrowLeft, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import WelcomeAnimation from "@/components/welcome-animation"
import ModeCard from "@/components/mode-card"
import Avatar from "@/components/avatar"
import ChatMessage from "@/components/chat-message"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import ReligiousMode from "@/components/modes/religious-mode"
import WellnessMode from "@/components/modes/wellness-mode"
import ShoppingMode from "@/components/modes/shopping-mode"
import SchemeMode from "@/components/modes/scheme-mode"
import LanguageSelector from "@/components/language-selector"
import EmergencyCall from "@/components/emergency-call"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { useLocation } from "@/hooks/use-location"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"



export type AppMode = "home" | "religious" | "wellness" | "shopping" | "scheme"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmergencyCall, setShowEmergencyCall] = useState(false)
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([])
  const [avatarMood, setAvatarMood] = useState<
    "neutral" | "happy" | "thinking" | "religious" | "wellness" | "shopping"
  >("neutral")
  const [currentMode, setCurrentMode] = useState<AppMode>("home")

  const isMobile = useMobile()
  const { t, language, setLanguage } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const { location, requestLocation } = useLocation()
  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech()

  // Initialize Speech Recognition with proper typing
  const SpeechRecognitionConstructor = typeof window !== "undefined"
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : undefined
  const recognition = SpeechRecognitionConstructor ? new SpeechRecognitionConstructor() : null

  if (recognition) {
    recognition.lang = language === "hi" ? "hi-IN" : "en-US"
    recognition.continuous = false
    recognition.interimResults = false
  }

  // Simulate loading time for welcome animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setMessages([{ text: t("welcome_message"), isUser: false }])
      setAvatarMood("happy")
    }, 3000)
    return () => clearTimeout(timer)
  }, [t])

  // Request location when app loads
  useEffect(() => {
    if (isAuthenticated && !location) {
      requestLocation()
    }
  }, [isAuthenticated, location, requestLocation])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const askGemini = async (prompt: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("No authentication token found")
    }

    let modePrompt = ""
    switch (currentMode) {
      case "religious":
        modePrompt = "You are a spiritual guide. Respond with information or stories about gods, goddesses, or religious practices: "
        break
      case "wellness":
        modePrompt = "You are a health assistant. Provide medical or wellness advice: "
        break
      case "shopping":
        modePrompt = `You are a shopping assistant. Suggest nearby stores or products${location ? ` near latitude ${location.latitude}, longitude ${location.longitude}` : ""}: `
        break
      case "scheme":
        modePrompt = "You are a government scheme advisor. Provide information about schemes for senior citizens: "
        break
      default:
        modePrompt = "You are a friendly assistant. Answer generally: "
    }

    const fullPrompt = modePrompt + prompt

    const response = await fetch("http://127.0.0.1:8000/api/gemini", {
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
    setAvatarMood(isListening ? "thinking" : "neutral")
  
    if (!isListening) {
      recognition.start()
      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const userPrompt = event.results[0][0].transcript
        setMessages((prev) => [...prev, { text: userPrompt, isUser: true }])
        setAvatarMood("thinking")
  
        try {
          const aiResponse = await askGemini(userPrompt)
          setMessages((prev) => [...prev, { text: aiResponse, isUser: false }])
          setAvatarMood("neutral")
          
          // Stop any current speech and speak new response
          stopSpeaking()
          setTimeout(() => speak(aiResponse, language), 300) // Small delay helps
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

  const handleModeSelect = (mode: AppMode) => {
    setCurrentMode(mode)
    switch (mode) {
      case "religious":
        setAvatarMood("religious")
        setMessages([{ text: t("religious_welcome"), isUser: false }])
        break
      case "wellness":
        setAvatarMood("wellness")
        setMessages([{ text: t("wellness_welcome"), isUser: false }])
        break
      case "shopping":
        setAvatarMood("shopping")
        setMessages([{ text: t("shopping_welcome"), isUser: false }])
        break
      case "scheme":
        setAvatarMood("neutral")
        setMessages([{ text: t("scheme_welcome"), isUser: false }])
        break
      default:
        setAvatarMood("happy")
    }
  }

  const handleBackToHome = () => {
    setCurrentMode("home")
    setAvatarMood("happy")
    setMessages([{ text: t("back_to_home"), isUser: false }])
  }

  const handleEmergencyCall = () => {
    setShowEmergencyCall(true)
  }

  if (isLoading) {
    return <WelcomeAnimation />
  }

  if (!isAuthenticated) {
    window.location.href = "/login"
    return null
  }

  return (
    <main
      className={cn(
        "min-h-screen transition-colors duration-300",
        darkMode
          ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-b from-amber-50 to-orange-100 text-gray-800",
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
            {currentMode !== "home" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToHome}
                className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}
              >
                <ArrowLeft size={24} />
              </Button>
            )}
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
              style={{ fontSize: `${1.5 * fontSize}rem` }}
            >
              {t("app_name")}
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

        {/* Mode selection or specific mode content */}
        <AnimatePresence mode="wait">
          {currentMode === "home" ? (
            <motion.div
              key="home-modes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <ModeCard
                title={t("religious_mode")}
                description={t("religious_description")}
                icon="🛕"
                color="from-orange-400 to-red-500"
                darkMode={darkMode}
                fontSize={fontSize}
                onClick={() => handleModeSelect("religious")}
              />
              <ModeCard
                title={t("wellness_mode")}
                description={t("wellness_description")}
                icon="💊"
                color="from-green-400 to-teal-500"
                darkMode={darkMode}
                fontSize={fontSize}
                onClick={() => handleModeSelect("wellness")}
              />
              <ModeCard
                title={t("shopping_mode")}
                description={t("shopping_description")}
                icon="🛒"
                color="from-blue-400 to-indigo-500"
                darkMode={darkMode}
                fontSize={fontSize}
                onClick={() => handleModeSelect("shopping")}
              />
              <ModeCard
                title={t("scheme_mode")}
                description={t("scheme_description")}
                icon="📜"
                color="from-purple-400 to-pink-500"
                darkMode={darkMode}
                fontSize={fontSize}
                onClick={() => handleModeSelect("scheme")}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`${currentMode}-content`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              {currentMode === "religious" && (
                <ReligiousMode darkMode={darkMode} fontSize={fontSize} location={location} />
              )}
              {currentMode === "wellness" && <WellnessMode darkMode={darkMode} fontSize={fontSize} />}
              {currentMode === "shopping" && (
                <ShoppingMode darkMode={darkMode} fontSize={fontSize} location={location} />
              )}
              {currentMode === "scheme" && <SchemeMode darkMode={darkMode} fontSize={fontSize} />}
            </motion.div>
          )}
        </AnimatePresence>

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
                : currentMode === "religious"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : currentMode === "wellness"
                    ? "bg-green-500 hover:bg-green-600"
                    : currentMode === "shopping"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : currentMode === "scheme"
                        ? "bg-purple-500 hover:bg-purple-600"
                        : darkMode
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-amber-500 hover:bg-amber-600",
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
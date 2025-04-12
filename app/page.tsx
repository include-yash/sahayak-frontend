"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Sun, Settings, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import WelcomeAnimation from "@/components/welcome-animation"
import ModeCard from "@/components/mode-card"
import LanguageSelector from "@/components/language-selector"
import EmergencyCall from "@/components/emergency-call"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmergencyCall, setShowEmergencyCall] = useState(false)

  const { t, language, setLanguage } = useTranslation()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleEmergencyCall = () => {
    setShowEmergencyCall(true)
  }

  if (!isAuthenticated && !authLoading) {
    window.location.href = "/login"
    return null
  }  

  if (isLoading || authLoading) {
    return <WelcomeAnimation />
  }

  return (
    <main
      className={cn(
        "min-h-screen transition-colors duration-300",
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-amber-50 text-gray-800"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-2xl sm:text-3xl font-semibold text-amber-600"
            style={{ fontSize: `${1.5 * fontSize}rem` }}
          >
            {t("app_name")}
          </h1>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEmergencyCall}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white h-10 w-10"
            >
              <Phone size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "rounded-full h-10 w-10",
                darkMode ? "hover:bg-gray-700" : "hover:bg-amber-100"
              )}
            >
              <Settings size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className={cn(
                "rounded-full h-10 w-10",
                darkMode ? "hover:bg-gray-700" : "hover:bg-amber-100"
              )}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <LanguageSelector 
              currentLanguage={language} 
              onLanguageChange={setLanguage} 
              darkMode={darkMode} 
            />
          </div>
        </motion.div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "mb-8 p-6 rounded-lg shadow-sm border",
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}
            >
              <h2 
                className="text-lg font-medium mb-4" 
                style={{ fontSize: `${1.25 * fontSize}rem` }}
              >
                {t("settings")}
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: `${1 * fontSize}rem` }}>
                    {t("dark_mode")}
                  </span>
                  <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>
                      {t("text_size")}
                    </span>
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>
                      {Math.round(fontSize * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[fontSize]}
                    min={0.8}
                    max={1.5}
                    step={0.1}
                    onValueChange={(value) => setFontSize(value[0])}
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>
                      {t("contrast")}
                    </span>
                    <span style={{ fontSize: `${1 * fontSize}rem` }}>
                      {Math.round(contrast * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[contrast]}
                    min={0.8}
                    max={1.2}
                    step={0.1}
                    onValueChange={(value) => setContrast(value[0])}
                    className="mt-2"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={logout}
                >
                  {t("logout")}
                </Button>
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

        {/* Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <Link href="/rag-companion">
            <ModeCard
              title={t("rag_mode")}
              description={t("rag_description")}
              icon="🤖"
              color="from-teal-400 to-blue-500"
              darkMode={darkMode}
              fontSize={fontSize}
              onClick={() => {}}
            />
          </Link>
          <Link href="/finder">
            <ModeCard
              title={t("finder_mode")}
              description={t("finder_description")}
              icon="🗺️"
              color="from-lime-400 to-emerald-500"
              darkMode={darkMode}
              fontSize={fontSize}
              onClick={() => {}}
            />
          </Link>
          <Link href="/religious">
            <ModeCard
              title={t("religious_mode")}
              description={t("religious_description")}
              icon="🛕"
              color="from-orange-400 to-red-500"
              darkMode={darkMode}
              fontSize={fontSize}
              onClick={() => {}}
            />
          </Link>
          <Link href="/wellness">
            <ModeCard
              title={t("wellness_mode")}
              description={t("wellness_description")}
              icon="💊"
              color="from-green-400 to-teal-500"
              darkMode={darkMode}
              fontSize={fontSize}
              onClick={() => {}}
            />
          </Link>
          <Link href="/shopping">
            <ModeCard
              title={t("shopping_mode")}
              description={t("shopping_description")}
              icon="🛒"
              color="from-blue-400 to-indigo-500"
              darkMode={darkMode}
              fontSize={fontSize}
              onClick={() => {}}
            />
          </Link>
          <Link href="/schema">
            <ModeCard
              title={t("scheme_mode")}
              description={t("scheme_description")}
              icon="📜"
              color="from-purple-400 to-pink-500"
              darkMode={darkMode}
              fontSize={fontSize}
              onClick={() => {}}
            />
          </Link>
          <Link href="/timeline">
            <ModeCard
              title={t("legacy_mode")}
              description={t("legacy_mode")}
              icon="🧓🏻"
              color="from-teal-400 to-blue-500"
              darkMode={darkMode}
              fontSize={fontSize}
              onClick={() => {}}
            />
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
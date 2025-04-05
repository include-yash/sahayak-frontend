"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Moon, Sun, CheckCircle, Trash2, Settings, ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function TodoPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [isListening, setIsListening] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [todos, setTodos] = useState<{ id: number; text: string; completed: boolean }[]>([])
  const [nextId, setNextId] = useState(1)

  const { t, language } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const { speak, stopSpeaking } = useTextToSpeech()

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
    const welcomeMessage = t("todo_welcome") || "Welcome to your Todo list. Speak to add new tasks."
    speak(welcomeMessage, language)
  }, [])

  const processTodo = (text: string) => {
    const newTodo = {
      id: nextId,
      text: text.trim(),
      completed: false
    }
    setTodos(prev => [...prev, newTodo])
    setNextId(prev => prev + 1)
    return `Added todo: ${text}`
  }

  const toggleTodo = (id: number) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const handleMicToggle = () => {
    if (!recognition) {
      speak(t("speech_not_supported") || "Speech recognition not supported", language)
      return
    }

    setIsListening(!isListening)

    if (!isListening) {
      recognition.start()
      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const spokenText = event.results[0][0].transcript
        const response = processTodo(spokenText)
        
        setIsListening(false)
        stopSpeaking()
        setTimeout(() => speak(response, language), 300)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false)
        speak(t("speech_error") || "Error with speech recognition", language)
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    } else {
      recognition.stop()
      stopSpeaking()
    }
  }


  return (
    <main
      className={cn(
        "min-h-screen transition-colors duration-300",
        darkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      )}
    >
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1
              className="text-2xl font-semibold"
              style={{ fontSize: `${1.5 * fontSize}rem` }}
            >
              {t("todo_title") || "Todo List"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Settings size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                "mb-8 p-6 rounded-lg border",
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              )}
            >
              <h2 className="text-lg font-medium mb-4" style={{ fontSize: `${1.25 * fontSize}rem` }}>
                {t("settings")}
              </h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: `${1 * fontSize}rem` }}>{t("dark_mode")}</span>
                  <Switch checked={darkMode} onCheckedChange={() => setDarkMode(!darkMode)} />
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
                    className="w-full"
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
                    className="w-full"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600"
                  onClick={logout}
                >
                  {t("logout")}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Todo List */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={cn(
            "p-6 rounded-lg border",
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium" style={{ fontSize: `${1.25 * fontSize}rem` }}>
                {t("your_todos") || "Your Tasks"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={handleMicToggle}
              >
                <Plus size={16} className="mr-1" />
                Add Task
              </Button>
            </div>
            {todos.length === 0 ? (
              <p style={{ fontSize: `${1 * fontSize}rem` }} className="text-gray-500 text-center py-4">
                {t("no_todos") || "No tasks yet. Use the microphone to add one!"}
              </p>
            ) : (
              <div className="space-y-3">
                {todos.map(todo => (
                  <motion.div
                    key={todo.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md transition-colors",
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
                      todo.completed && "opacity-70"
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleTodo(todo.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <CheckCircle
                          size={18}
                          className={todo.completed ? "text-green-500" : ""}
                        />
                      </Button>
                      <span
                        style={{ fontSize: `${1 * fontSize}rem` }}
                        className={cn("flex-1", todo.completed && "line-through text-gray-500")}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Microphone Button */}
        <motion.div
          className="fixed bottom-6 right-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.button
            className={cn(
              "w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            )}
            onClick={handleMicToggle}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
          >
            {isListening ? (
              <MicOff size={24} className="text-white" />
            ) : (
              <Mic size={24} className="text-white" />
            )}
          </motion.button>
        </motion.div>
      </div>
    </main>
  )
}
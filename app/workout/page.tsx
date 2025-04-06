"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Moon, Sun, Settings, ArrowLeft, Phone, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import Avatar from "@/components/avatar"
import ChatMessage from "@/components/chat-message"
import LanguageSelector from "@/components/language-selector"
import EmergencyCall from "@/components/emergency-call"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

const stretches = ["Neck Rolls", "Shoulder Rolls", "Torso Twists"]
const workouts = ["Jumping Jacks", "Bodyweight Squats", "Push-ups"]
const yoga = ["Downward Dog", "Child’s Pose", "Cobra Stretch"]
const cooldowns = ["Light Jog in Place", "Hamstring Stretch", "Breathing Exercises"]

export default function TodoPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [todos, setTodos] = useState<Todo[]>([])
  const { t, language, setLanguage } = useTranslation()
  const { speak } = useTextToSpeech()

  useEffect(() => {
    const welcomeMessage = t("todo_welcome_message")
    speak(welcomeMessage, language)
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) setTodos(JSON.parse(savedTodos))
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  const toggleDarkMode = () => setDarkMode(!darkMode)

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
              className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent"
              style={{ fontSize: `${1.5 * fontSize}rem` }}
            >
              {t("todo_page_title")}
            </h1>
          </div>
        </motion.div>

        <div className="space-y-6">
          <WorkoutSection title="Stretching Exercises" list={stretches} />
          <WorkoutSection title="Normal Workout" list={workouts} />
          <WorkoutSection title="Yoga" list={yoga} />
          <WorkoutSection title="Cooldown Workout" list={cooldowns} />

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Watch Demo Video</h2>
            <a
              href="https://your-video-link.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 underline text-lg"
            >
              Click here to watch workout video
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

function WorkoutSection({ title, list }: { title: string, list: string[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <ul className="list-disc list-inside space-y-1">
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

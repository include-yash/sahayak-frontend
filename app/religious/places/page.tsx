"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/hooks/use-translation"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function PlacesPage() {
  const [isListening, setIsListening] = useState(false)
  const [locationQuery, setLocationQuery] = useState("")
  const [templeResults, setTempleResults] = useState<string[]>([])
  const { t, language } = useTranslation()
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

  const askGemini = async (place: string) => {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("No authentication token")

    const prompt = `Find famous temples near ${place} with their distance.`

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/gemini`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) throw new Error("Gemini API Error")

    const data = await response.json()
    return data.response
  }

  const handleMicToggle = () => {
    if (!recognition) return

    setIsListening(!isListening)

    if (!isListening) {
      recognition.start()
      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        const place = event.results[0][0].transcript
        setLocationQuery(place)
        try {
          const results = await askGemini(place)
          setTempleResults([results])
          stopSpeaking()
          setTimeout(() => speak(results, language), 300)
        } catch {
          setTempleResults(["Error getting data"]) 
        }
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
    } else {
      recognition.stop()
      stopSpeaking()
    }
  }

  return (
    <main className="min-h-screen bg-orange-50 text-gray-900 p-4">
      <motion.div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="icon"><ArrowLeft size={24} /></Button>
          </Link>
          <h1 className="text-3xl font-bold">Nearby Temples</h1>
          <Button onClick={handleMicToggle} variant="outline" size="icon">
            {isListening ? <MicOff /> : <Mic />}
          </Button>
        </div>

        <div className="text-xl">{locationQuery && `You asked for: ${locationQuery}`}</div>

        <div className="space-y-2">
          {templeResults.map((r, i) => (
            <div key={i} className="p-4 bg-white rounded-xl shadow">{r}</div>
          ))}
        </div>
      </motion.div>
    </main>
  )
}

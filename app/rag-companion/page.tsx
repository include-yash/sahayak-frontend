"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mic, MicOff, Loader2, Info, Send, AlertCircle, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import axios from "axios"
// @ts-ignore
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"

export default function RagFrontend() {
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState<{ type: string; content: string }[]>([])
  const [contextVisible, setContextVisible] = useState(false)
  const [contextData, setContextData] = useState<string>("")
  const [textInput, setTextInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [micSupported, setMicSupported] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition, isMicrophoneAvailable } =
    useSpeechRecognition()

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setMicSupported(false)
      setError("Your browser doesn't support speech recognition.")
    }
    if (browserSupportsSpeechRecognition && !isMicrophoneAvailable) {
      setError("Microphone access is required for speech recognition.")
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable])

  const handleRecord = async () => {
    setError(null)
    if (!listening) {
      try {
        resetTranscript()
        await SpeechRecognition.startListening({ continuous: true })
      } catch (err) {
        setError("Failed to start speech recognition. Please check microphone permissions.")
      }
    } else {
      SpeechRecognition.stopListening()
      if (transcript) {
        await processQuery(transcript)
      }
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim()) {
      await processQuery(textInput)
      setTextInput("")
    }
  }

  const processQuery = async (query: string) => {
    if (!query.trim()) return
    setLoading(true)
    setResponses([{ type: "query", content: query }])
    setContextVisible(false)
    setError(null)

    try {
      const res = await axios.post("https://rag-backend-sqqz.onrender.com/rag", {
        query: query,
      })

      const { context, base_response, final_answer } = res.data

      setResponses([
        { type: "query", content: query },
        { type: "final", content: final_answer },
        { type: "base", content: base_response },
      ])
      setContextData(context)
    } catch (error) {
      setError("Failed to fetch data from the backend. Please try again later.")
      setResponses([{ type: "query", content: query }])
    } finally {
      setLoading(false)
      resetTranscript()
    }
  }

  const getCardTitle = (type: string) => {
    switch (type) {
      case "query":
        return "Your Question"
        case "final":
            return "Final Answer"
        case "base":
            return "Base Response"
      default:
        return ""
    }
  }

  return (
    <div className={`min-h-screen py-12 md:py-24 ${isDarkMode ? "bg-[#0f0f0f] text-orange-200" : "bg-white text-gray-800"}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hover:bg-transparent"
          >
            {isDarkMode ? <Sun className="text-orange-400" /> : <Moon className="text-yellow-500" />}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className={`mb-6 text-4xl md:text-5xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            Ask Our <span className="text-orange-400">RAG Model</span>
          </h1>
          <p className={`mx-auto max-w-2xl text-lg md:text-xl ${isDarkMode ? "text-orange-300" : "text-gray-700"}`}>
            Speak your query or type it below and let our AI find the answer.
          </p>
        </motion.div>

        <div className="flex flex-col items-center mb-8">
          {micSupported && (
            <Button
              onClick={handleRecord}
              className={`mb-6 flex items-center space-x-2 ${
                listening
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-transparent border border-orange-400 hover:bg-orange-800/30"
              }`}
              disabled={loading}
            >
              {listening ? (
                <>
                  <MicOff className="h-5 w-5 text-white animate-pulse" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 text-orange-400" />
                  <span>Start</span>
                </>
              )}
            </Button>
          )}

          {listening && transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-[#1a1a1a] border border-orange-300/30 rounded-lg max-w-2xl w-full"
            >
              <p className="text-orange-200">
                <span className="text-orange-400 font-medium">Listening: </span>
                {transcript}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleTextSubmit} className="flex w-full max-w-md gap-2 mb-6">
            <Input
              type="text"
              placeholder="Type your question..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className={`${isDarkMode ? "bg-[#1c1c1c] border-orange-400 text-orange-200 placeholder-orange-300" : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"}`}
              disabled={loading || listening}
            />
            <Button
              type="submit"
              disabled={loading || listening || !textInput.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mb-6 max-w-md bg-red-800/20 border-red-700 text-orange-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="mb-6"
            >
              <Loader2 className="h-10 w-10 text-orange-400" />
            </motion.div>
          )}
        </div>

        {responses.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.2 },
              },
            }}
            className="space-y-6 mb-8"
          >
            {responses.map((res, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                className={index === 0 ? "max-w-md mx-auto" : ""}
              >
                <Card
                  className={`p-6 border ${isDarkMode ? "border-orange-400/30 bg-[#1a1a1a]" : "border-gray-300 bg-white"} ${
                    index === 2 ? "border-orange-500/60" : ""
                  }`}
                >
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-orange-400" : "text-gray-800"}`}>{getCardTitle(res.type)}</h3>
                  <p className={`${isDarkMode ? "text-orange-200" : "text-gray-800"} whitespace-pre-line`}>{res.content}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {contextData && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setContextVisible(!contextVisible)}
              className={`flex items-center space-x-2 border hover:bg-orange-800/30 ${isDarkMode ? "border-orange-400 text-orange-200" : "border-gray-400 text-gray-800"}`}
            >
              <Info className="h-5 w-5" />
              <span>{contextVisible ? "Hide Context" : "Show Context"}</span>
            </Button>

            {contextVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`mt-4 p-6 border max-w-3xl mx-auto ${isDarkMode ? "border-orange-400/30 bg-[#1a1a1a]" : "border-gray-300 bg-white"}`}
              >
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-orange-400" : "text-gray-800"}`}>Context</h3>
                <p className={`${isDarkMode ? "text-orange-200" : "text-gray-800"}`}>{contextData}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

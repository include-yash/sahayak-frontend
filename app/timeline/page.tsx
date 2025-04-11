"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface TimelineStepProps {
  step: number
  title: string
  description: string
  darkMode: boolean
}

const TimelineStep = ({ step, title, description, darkMode }: TimelineStepProps) => (
  <motion.div
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: step * 0.2 }}
    className="relative pl-16"
  >
    <div className="absolute left-0 top-0 w-8 h-full flex items-center justify-center">
      <div className={cn(
        "w-4 h-4 rounded-full z-10",
        darkMode ? "bg-amber-400" : "bg-amber-600"
      )} />
      {step < 4 && (
        <div className={cn(
          "absolute w-0.5 h-full top-4",
          darkMode ? "bg-amber-400/30" : "bg-amber-600/30"
        )} />
      )}
    </div>
    <Card className={cn(
      "p-6 shadow-lg hover:shadow-xl transition-shadow duration-300",
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-amber-200"
    )}>
      <h3 className={cn(
        "text-xl font-semibold mb-2",
        darkMode ? "text-amber-400" : "text-amber-600"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-base",
        darkMode ? "text-gray-300" : "text-gray-600"
      )}>
        {description}
      </p>
    </Card>
  </motion.div>
)

interface AudioPlayerProps {
  src: string
  title: string
  darkMode: boolean
  onPlayStateChange: (isPlaying: boolean) => void
}

const AudioPlayer = ({ src, title, darkMode, onPlayStateChange }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current
        .play()
        .catch((err) => setError("Unable to play audio: " + err.message))
    }
    setIsPlaying(!isPlaying)
    onPlayStateChange(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100
      setProgress(progress)
    }
  }

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setError("Audio file not found or unsupported format")
    setIsPlaying(false)
    onPlayStateChange(false)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative"
    >
      <Card className={cn(
        "p-4",
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-amber-200",
        isPlaying && "ring-2 ring-amber-400"
      )}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            disabled={!!error}
            className={cn(
              darkMode ? "text-amber-400" : "text-amber-600"
            )}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
          <div className="flex-1">
            <p className={cn(
              "font-medium",
              darkMode ? "text-white" : "text-gray-800"
            )}>
              {title}
            </p>
            {error ? (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            ) : (
              <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    darkMode ? "bg-amber-400" : "bg-amber-600"
                  )}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onEnded={() => {
          setIsPlaying(false)
          setProgress(0)
          onPlayStateChange(false)
        }}
      />
      {isPlaying && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "absolute -bottom-6 left-0 right-0 text-sm text-center",
            darkMode ? "text-amber-400" : "text-amber-600"
          )}
        >
          Processing audio...
        </motion.div>
      )}
    </motion.div>
  )
}

export default function VoiceTimelinePage() {
  const [darkMode] = useState(false)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isBiographyPlaying, setIsBiographyPlaying] = useState(false)
  const biographyAudioRef = useRef<HTMLAudioElement>(null)

  const sampleRecordings = [
    { title: "Day 1 - Morning Routine", src: "/3.wav" },
    { title: "Day 2 - Favorite Memory", src: "/3.wav" },
    { title: "Day 3 - Daily Walk", src: "/3.mp3" },
  ]

  const biographyAudio = "/2.wav"

  const timelineSteps = [
    {
      title: "Record Your Voice",
      description: "Share your daily experiences using our simple recording tool - just speak naturally about your life."
    },
    {
      title: "Audio Processing",
      description: "Our advanced Wav2Vec2 technology converts your voice recordings into text with high accuracy."
    },
    {
      title: "Secure Storage",
      description: "Your stories are safely stored in our MongoDB database, ready for processing."
    },
    {
      title: "Voice Biography Creation",
      description: "Using XTTS, we create a summarized biography in your own cloned voice - a digital legacy!"
    }
  ]

  const toggleBiographyPlay = () => {
    if (!biographyAudioRef.current) return

    if (isBiographyPlaying) {
      biographyAudioRef.current.pause()
    } else {
      biographyAudioRef.current.play().catch((err) => console.error("Biography playback error:", err))
    }
    setIsBiographyPlaying(!isBiographyPlaying)
  }

  return (
    <div className={cn(
      "min-h-screen py-12 px-4 sm:px-6 lg:px-8",
      darkMode ? "bg-gray-900" : "bg-gradient-to-b from-amber-50 to-white"
    )}>
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "text-4xl font-bold mb-12 text-center",
            darkMode ? "text-amber-400" : "text-amber-600"
          )}
        >
          Your Voice, Your Legacy
        </motion.h1>

        {/* Recordings Section */}
        <section className="mb-16">
          <h2 className={cn(
            "text-2xl font-semibold mb-6",
            darkMode ? "text-white" : "text-gray-800"
          )}>
            Your Sample Recordings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sampleRecordings.map((recording, index) => (
              <AudioPlayer
                key={index}
                src={recording.src}
                title={recording.title}
                darkMode={darkMode}
                onPlayStateChange={(isPlaying) => 
                  setPlayingIndex(isPlaying ? index : null)
                }
              />
            ))}
          </div>

          {/* Biography Player */}
          <div className="mt-8">
            <Card className={cn(
              "p-6 flex items-center justify-between",
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-amber-200"
            )}>
              <p className={cn(
                "font-medium text-lg",
                darkMode ? "text-white" : "text-gray-800"
              )}>
                Your Summarized Biography
              </p>
              <Button
                onClick={toggleBiographyPlay}
                className={cn(
                  darkMode ? "bg-amber-500 hover:bg-amber-600" : "bg-amber-600 hover:bg-amber-700",
                  "text-white"
                )}
              >
                {isBiographyPlaying ? "Pause" : "Play"}
              </Button>
            </Card>
            <audio
              ref={biographyAudioRef}
              src={biographyAudio}
              onEnded={() => setIsBiographyPlaying(false)}
              className="hidden"
            />
            {isBiographyPlaying && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "text-sm text-center mt-2",
                  darkMode ? "text-amber-400" : "text-amber-600"
                )}
              >
                Playing your voice-cloned biography...
              </motion.p>
            )}
          </div>
        </section>

        {/* Process Section */}
        <section>
          <h2 className={cn(
            "text-2xl font-semibold mb-8 text-center",
            darkMode ? "text-white" : "text-gray-800"
          )}>
            Our Process
          </h2>
          <div className="relative">
            {timelineSteps.map((step, index) => (
              <TimelineStep
                key={index}
                step={index + 1}
                title={step.title}
                description={step.description}
                darkMode={darkMode}
              />
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button
            className={cn(
              "px-8 py-3 text-lg",
              darkMode 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-amber-600 hover:bg-amber-700",
              "text-white"
            )}
          >
            Start Recording Now
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic, MicOff, Moon, Sun, Settings, ArrowLeft,
  Phone, Check, Trash2, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Avatar from "@/components/avatar"
import ChatMessage from "@/components/chat-message"
import LanguageSelector from "@/components/language-selector"
import EmergencyCall from "@/components/emergency-call"
import { useTranslation } from "@/hooks/use-translation"
import { useAuth } from "@/hooks/use-auth"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Exercise data with details
const exerciseData = {
  "Neck Rolls": {
    instructions: "Sit or stand with a straight spine. Slowly roll your head in a circular motion, first clockwise for 30 seconds, then counterclockwise.",
    benefits: "Relieves neck tension, improves flexibility, reduces stiffness.",
    gif: "https://static.wixstatic.com/media/971153_c09ee3775e0b4393b731085a77cea5cb~mv2.gif"
  },
  "Shoulder Rolls": {
    instructions: "Lift your shoulders up towards your ears, then roll them back and down in a smooth circular motion. Repeat 10-15 times.",
    benefits: "Reduces shoulder stiffness, improves posture, increases blood flow.",
    gif: "https://media.post.rvohealth.io/wp-content/uploads/sites/2/2021/02/Shoulder-roll.gif"
  },
  "Torso Twists": {
    instructions: "Stand with feet shoulder-width apart. Twist your upper body side to side, keeping hips stable.",
    benefits: "Improves spinal mobility, strengthens core, enhances flexibility.",
    gif: "https://media1.popsugar-assets.com/files/thumbor/NwjbsKv2i5LjOPkkfGiAzX6U7T4/fit-in/1200x630/filters:format_auto-!!-:strip_icc-!!-:fill-!white!-/2020/09/10/713/n/1922729/17bb154d5036ca31_IMB_ljBxrG/i/Russian-Twist.GIF"
  },
  "Jumping Jacks": {
    instructions: "Start with feet together and arms at sides. Jump while spreading legs and raising arms overhead, then return to start.",
    benefits: "Boosts cardiovascular health, improves coordination, burns calories.",
    gif: "https://media2.giphy.com/media/J47Vkh2p67L0ufw0Re/source.gif"
  },
  "Bodyweight Squats": {
    instructions: "Stand with feet shoulder-width apart. Bend your knees and lower your hips as if sitting back into a chair, then return to standing. Repeat 10-15 times.",
    benefits: "Strengthens lower body muscles, improves balance, enhances mobility.",
    gif: "https://www.kettlebellkings.com/cdn/shop/articles/Sqaut_Exercises.gif?v=1694614576"
  },
  "Push-ups": {
    instructions: "Start in a plank position with hands under shoulders. Lower your chest to the ground, keeping elbows at a 45-degree angle, then push back up.",
    benefits: "Builds upper body strength, strengthens core, improves endurance.",
    gif: "https://cdn.dribbble.com/users/4678719/screenshots/14534270/media/5c5ba4523e64cb0403719c1082b88062.gif"
  },
  "Downward Dog": {
    instructions: "Start on hands and knees. Lift your hips up and back, forming an inverted V-shape with your body. Hold for 20-30 seconds.",
    benefits: "Stretches hamstrings and back, strengthens arms and shoulders, improves circulation.",
    gif: "https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2024-01/Chest-exercises-Plank-to-Downward-Facing-Dog-11024-f320ce.gif"
  },
  "Child’s Pose": {
    instructions: "Kneel on the floor, sit back on your heels, then lower your forehead to the ground with arms extended forward or by your sides. Hold for 30 seconds.",
    benefits: "Relieves stress, stretches lower back and hips, promotes relaxation.",
    gif: "https://homeworkouts.org/wp-content/uploads/anim-child-pose.gif"
  },
  "Cobra Stretch": {
    instructions: "Lie face down, place hands under shoulders, and gently lift your chest upward while keeping legs extended back. Hold for 15-20 seconds.",
    benefits: "Improves spinal flexibility, strengthens back muscles, opens chest.",
    gif: "https://www.inspireusafoundation.org/wp-content/uploads/2022/11/cobra-push-up-movement.gif"
  },
  "Light Jog in Place": {
    instructions: "Stand in place and lightly jog, lifting knees slightly and swinging arms naturally. Continue for 1-2 minutes.",
    benefits: "Lowers heart rate gradually, maintains circulation, prevents muscle stiffness.",
    gif: "https://media.giphy.com/media/xT9IgG50Fb7MiAY1gI/giphy.gif"
  },
  "Hamstring Stretch": {
    instructions: "Stand with one leg extended forward on the ground, bend the other knee slightly, and reach toward your toes. Hold for 20-30 seconds per leg.",
    benefits: "Increases flexibility in hamstrings, reduces lower back tension, aids recovery.",
    gif: "https://media.giphy.com/media/26ufcVAp3AiJJsrnK/giphy.gif"
  },
  "Breathing Exercises": {
    instructions: "Sit or stand comfortably. Inhale deeply through your nose for 4 seconds, hold for 4 seconds, then exhale slowly through your mouth for 6 seconds. Repeat 5-10 times.",
    benefits: "Calms the nervous system, improves oxygen flow, reduces stress.",
    gif: "https://media.giphy.com/media/3o7TKSKbG9aTGHsF8Q/giphy.gif"
  }
}

const stretches = ["Neck Rolls", "Shoulder Rolls", "Torso Twists"]
const workouts = ["Jumping Jacks", "Bodyweight Squats", "Push-ups"]
const yoga = ["Downward Dog", "Child’s Pose", "Cobra Stretch"]
const cooldowns = ["Light Jog in Place", "Hamstring Stretch", "Breathing Exercises"]

const sectionVideos = {
  stretching: "https://www.youtube.com/watch?v=kfjVFQWWiZw&ab_channel=yes2next",
  workout: "https://youtu.be/MXiup0LHuTc?si=8CfMKJAlV8dgJeOV",
  yoga: "https://youtu.be/5rJPwLkXzvg?si=O3oINuNq9ejvgP76",
  cooldown: "https://www.youtube.com/watch?v=kfjVFQWWiZw&ab_channel=yes2next"
}

export default function ExercisePage() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1)
  const [contrast, setContrast] = useState(1)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<keyof typeof exerciseData | null>(null)
  const { t, language, setLanguage } = useTranslation()
  const { speak } = useTextToSpeech()

  useEffect(() => {
    const welcomeMessage = t("exercise_welcome_message") || "Welcome to your daily exercise routine!"
    speak(welcomeMessage, language)
  }, [])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  return (
    <main
      className={cn(
        "min-h-screen transition-colors duration-300 p-6",
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white"
          : "bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-gray-800"
      )}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "rounded-full border-2",
                  darkMode ? "border-gray-600 hover:bg-gray-700" : "border-amber-300 hover:bg-amber-100"
                )}
              >
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1
              className="text-4xl font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent"
              style={{ fontSize: `${1.5 * fontSize}rem` }}
            >
              {t("exercise_page_title") || "Daily Exercise Routine"}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className={cn(darkMode ? "text-amber-300" : "text-gray-600")}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </Button>
        </motion.div>

        <div className="space-y-8">
          <ExerciseSection title="Stretching Exercises" list={stretches} video={sectionVideos.stretching} onVideoClick={setSelectedVideo} onExerciseClick={(exercise) => setSelectedExercise(exercise as keyof typeof exerciseData)} />
          <ExerciseSection title="Normal Exercises" list={workouts} video={sectionVideos.workout} onVideoClick={setSelectedVideo} onExerciseClick={(exercise) => setSelectedExercise(exercise as keyof typeof exerciseData)} />
          <ExerciseSection title="Yoga Poses" list={yoga} video={sectionVideos.yoga} onVideoClick={setSelectedVideo} onExerciseClick={(exercise) => setSelectedExercise(exercise as keyof typeof exerciseData)} />
          <ExerciseSection title="Cooldown Routine" list={cooldowns} video={sectionVideos.cooldown} onVideoClick={setSelectedVideo} onExerciseClick={(exercise) => setSelectedExercise(exercise as keyof typeof exerciseData)} />
        </div>
      </div>

      {/* Video Dialog */}
      <AnimatePresence>
        {selectedVideo && (
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-3xl p-0 border-0 bg-transparent">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative w-full aspect-video"
              >
                <iframe
                  src={selectedVideo.replace("youtu.be/", "www.youtube.com/embed/") + "?autoplay=1"}
                  title="Exercise Video"
                  className="w-full h-full rounded-lg shadow-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-4 -right-4 rounded-full"
                  onClick={() => setSelectedVideo(null)}
                >
                  <X size={20} />
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Exercise Details Dialog */}
      <AnimatePresence>
        {selectedExercise && (
          <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
            <DialogContent className="max-w-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-amber-600">{selectedExercise}</DialogTitle>
              </DialogHeader>
              <div className="flex gap-6 mt-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">How to Do It</h3>
                  <p className="text-gray-700 dark:text-gray-300">{exerciseData[selectedExercise]?.instructions || "Instructions not available."}</p>
                  <h3 className="text-lg font-semibold mt-4 mb-2">Benefits</h3>
                  <p className="text-gray-700 dark:text-gray-300">{exerciseData[selectedExercise]?.benefits || "Benefits not available."}</p>
                </div>
                <div className="w-1/3">
                  {selectedExercise && exerciseData[selectedExercise]?.gif ? (
                    <img
                      src={exerciseData[selectedExercise].gif}
                      alt={`${selectedExercise} demonstration`}
                      className="w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <p className="text-gray-500">No GIF available</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => setSelectedExercise(null)}
              >
                Close
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </main>
  )
}

function ExerciseSection({
  title,
  list,
  video,
  onVideoClick,
  onExerciseClick
}: {
  title: string
  list: string[]
  video: string
  onVideoClick: (video: string) => void
  onExerciseClick: (exercise: string) => void
}) {
  return (
    <motion.div
      className={cn(
        "rounded-xl p-6 shadow-lg",
        "bg-opacity-80 backdrop-blur-sm",
        "border border-opacity-20",
        "dark:bg-gray-800 dark:border-gray-700",
        "bg-white border-amber-200"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-amber-600 dark:text-amber-300">{title}</h2>
        <Button
          variant="outline"
          size="sm"
          className="border-amber-400 text-amber-600 hover:bg-amber-100 dark:border-amber-300 dark:text-amber-300 dark:hover:bg-gray-600"
          onClick={() => onVideoClick(video)}
        >
          Watch Video
        </Button>
      </div>
      <ul className="space-y-3">
        {list.map((item, index) => (
          <motion.li
            key={index}
            className="flex items-center p-3 rounded-lg bg-opacity-50 hover:bg-opacity-70 transition-colors dark:bg-gray-700 bg-amber-50 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => onExerciseClick(item)}
          >
            <span className="text-lg">{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}

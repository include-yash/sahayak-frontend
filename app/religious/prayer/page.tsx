"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, ArrowLeft, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { cn } from "@/lib/utils";
import Link from "next/link";
import YouTube from "react-youtube";

export default function DailyPrayersPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const { speak } = useTextToSpeech();

  const predefinedPrayers = [
  { name: "Jai Mata Di", videoId: "3uaJNvIcFUM" },
  { name: "Hanuman Chalisa", videoId: "AETFvQonfV8" },
  { name: "Morning Bhajan", videoId: "5O-NomO_4_8" },
  { name: "Shiva Tandava Stotram", videoId: "hMBKmQEPNzI" },
  { name: "Ganesh Aarti (Sukhakarta Dukhaharta)", videoId: "4ncAlDhIfTw" },
  { name: "Om Jai Jagdish Hare", videoId: "3ucCEjXS9n8" },
  { name: "Gayatri Mantra", videoId: "8lxDnvAH4tQ" },
  { name: "Krishna Bhajan (Hare Krishna Hare Rama)", videoId: "Zdcth9NndEA" },
  { name: "Durga Chalisa", videoId: "AXvmt88JLWg" },
  { name: "Saraswati Vandana", videoId: "4koR8WKxHmc" },
  { name: "Achyutam Keshavam", videoId: "5-Xoh7jKVo8" },
  { name: "Ram Dhun (Ram Siya Ram)", videoId: "XDgeALlxDk4" },
  { name: "Mahamrityunjaya Mantra", videoId: "OV9LXGOXjgs" },
  { name: "Venkateswara Suprabhatam", videoId: "P-4OtWtwOig" },
  { name: "Sai Baba Aarti", videoId: "k8W64L0xU_c" },
  { name: "Radha Krishna Bhajan (Yashomati Maiya Se)", videoId: "8e7e0RArZq8" },
  { name: "Lakshmi Mata Aarti", videoId: "oec7CXRAfeE" },
  { name: "Vishnu Sahasranamam", videoId: "zKC17254flc" },
];


  useEffect(() => {
    speak("Welcome to Daily Prayers. Choose a prayer to begin.");
  }, [speak]);

  const handlePrayerClick = (videoId: string) => {
    setCurrentVideo(videoId);
    speak("Playing selected prayer.");
  };

  return (
    <main
      className={cn(
        "min-h-screen transition-colors duration-300 pb-32",
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
              Daily Prayers
            </h1>
          </div>
        </motion.div>

        {/* Prayer Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {predefinedPrayers.map((prayer) => (
            <motion.button
              key={prayer.videoId}
              onClick={() => handlePrayerClick(prayer.videoId)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full p-4 rounded-xl shadow-md bg-white hover:bg-amber-100 transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{prayer.name}</span>
                <PlayCircle className="text-amber-500" size={28} />
              </div>
            </motion.button>
          ))}
        </div>

        {/* YouTube Player */}
        {currentVideo && (
          <motion.div
            className="aspect-video rounded-xl overflow-hidden shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <YouTube
              videoId={currentVideo}
              opts={{
                width: "100%",
                height: "400",
                playerVars: {
                  autoplay: 1,
                },
              }}
            />
          </motion.div>
        )}
      </div>
    </main>
  );
}

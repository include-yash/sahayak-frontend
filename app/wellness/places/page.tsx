"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface Place {
  properties: {
    name: string
    address_line1: string
    city: string
    categories: string[]
  }
}

const categoryMap: { [key: string]: string } = {
  Hospitals: "healthcare.hospital",
  Pharmacies: "healthcare.pharmacy",
}

export default function HealthPlaces() {
  const [places, setPlaces] = useState<Place[]>([])
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("Hospitals")
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  // const { speak, stop } = useTextToSpeech()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) =>
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    )
  }, [])

  useEffect(() => {
    if (!coords) return

    const fetchPlaces = async () => {
      setLoading(true)
      const category = categoryMap[selectedCategory]
      const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${coords.lon},${coords.lat},1000&limit=20&apiKey=8656ecc3ee2b493cabcfd1d628d9a4be`
      const res = await fetch(url)
      const data = await res.json()
      setPlaces(data.features)
      setLoading(false)
    }

    fetchPlaces()
    return () => {
      if (typeof stop === "function") stop()
    }
  }, [coords, selectedCategory])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div
      className={cn(
        "min-h-screen p-6 transition-colors duration-300",
        darkMode
          ? "bg-black text-white"
          : "bg-gradient-to-br from-amber-50 via-orange-100 to-amber-100 text-orange-900"
      )}
    >
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-amber-200")}
        >
          {darkMode ? <Sun size={24} className="text-white" /> : <Moon size={24} />}
        </Button>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={cn(
              "w-full appearance-none p-3 pr-10 text-lg font-medium rounded-xl border shadow focus:outline-none transition-colors",
              darkMode
                ? "bg-gray-900 text-white border-gray-600"
                : "bg-white text-orange-800 border-orange-300 focus:ring-2 focus:ring-orange-400"
            )}
          >
            {Object.keys(categoryMap).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className={cn("h-5 w-5", darkMode ? "text-white" : "text-orange-500")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </motion.div>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            <span className={cn(darkMode ? "text-white" : "text-gray-700")}>Nearby </span>
            <span className="text-orange-600">{selectedCategory}</span>
          </motion.div>

          {loading ? (
            <p className="text-gray-400">Loading places...</p>
          ) : places.length === 0 ? (
            <p className="text-gray-400">No places found nearby.</p>
          ) : (
            <ul className="space-y-4">
              {places.map((place, idx) => (
                <motion.li
                  key={idx}
                  className={cn(
                    "rounded-2xl shadow p-4 border",
                    darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-orange-200"
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-lg font-semibold">{place.properties.name}</p>
                  <p>{place.properties.address_line1}</p>
                  <p className="text-sm text-gray-500">{place.properties.city}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.section>
      </div>
    </div>
  )
}

"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface Place {
  properties: {
    name: string
    address_line1: string
    city: string
    categories: string[]
  }
}

const categoryMap: { [key: string]: string } = {
  Hinduism: "religion.place_of_worship.hinduism",
  Islam: "religion.place_of_worship.islam",
  Christianity: "religion.place_of_worship.christianity",
}

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([])
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [selectedReligion, setSelectedReligion] = useState("Hinduism")
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) =>
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    )
  }, [])

  useEffect(() => {
    if (!coords) return

    const fetchPlaces = async () => {
      setLoading(true)
      const category = categoryMap[selectedReligion]
      const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${coords.lon},${coords.lat},5000&limit=10&apiKey=8656ecc3ee2b493cabcfd1d628d9a4be`
      const res = await fetch(url)
      const data = await res.json()
      setPlaces(data.features)
      setLoading(false)
    }

    fetchPlaces()
  }, [coords, selectedReligion])

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
          {darkMode ? (
            <Sun size={24} className="text-white" />
          ) : (
            <Moon size={24} />
          )}
        </Button>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <motion.select
          value={selectedReligion}
          onChange={(e) => setSelectedReligion(e.target.value)}
          className={cn(
            "p-3 text-lg rounded-xl border shadow w-full",
            darkMode ? "bg-gray-900 text-white border-gray-600" : "bg-white"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {Object.keys(categoryMap).map((religion) => (
            <option key={religion} value={religion}>
              {religion}
            </option>
          ))}
        </motion.select>

        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold"
          >
            <span className={cn(darkMode ? "text-white" : "text-gray-700")}>Nearby </span>
            <span className="text-orange-600">{selectedReligion} Places</span>
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

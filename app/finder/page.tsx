"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import "leaflet/dist/leaflet.css"

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
})

export default function InteractiveMapPage() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) =>
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    )
  }, [])

  const toggleDarkMode = () => setDarkMode(!darkMode)

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center p-4 gap-4", darkMode ? "bg-black text-white" : "bg-orange-50 text-orange-900")}>
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-orange-200")}>
          {darkMode ? <Sun size={24} className="text-white" /> : <Moon size={24} />}
        </Button>
      </div>

      <div className={cn("flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg", darkMode ? "bg-white/10 border border-orange-500" : "bg-black/5 border border-orange-500")}>
        <MapPin size={28} className="text-orange-500" />
        <h2 className={cn("text-2xl font-bold", darkMode ? "text-white" : "text-black")}>Your Location</h2>
      </div>

      {coords && <MapWrapper lat={coords.lat} lon={coords.lon} />}
    </div>
  )
}

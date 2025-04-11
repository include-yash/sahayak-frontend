"use client"

import React, { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Moon, Sun, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
})

export default function InteractiveMapPage() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) =>
      setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
    )
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 gap-4",
        darkMode ? "bg-black text-white" : "bg-orange-50 text-orange-900"
      )}
    >
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className={cn("rounded-full", darkMode ? "hover:bg-gray-700" : "hover:bg-orange-200")}
        >
          {darkMode ? <Sun size={24} className="text-white" /> : <Moon size={24} />}
        </Button>
      </div>

      <div
        className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-xl shadow-lg",
          darkMode ? "bg-white/10 border border-orange-500" : "bg-black/5 border border-orange-500"
        )}
      >
        <MapPin size={28} className="text-orange-500" />
        <h2
          className={cn(
            "text-2xl font-bold",
            darkMode ? "text-white" : "text-black"
          )}
        >
          Your Location
        </h2>
      </div>

      {coords && (
        <MapContainer
          center={[coords.lat, coords.lon]}
          zoom={14}
          scrollWheelZoom={true}
          style={{
            height: "80vh",
            width: "100%",
            maxWidth: "1000px",
            borderRadius: "1rem",
          }}
        >
          <TileLayer
            url="https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=8656ecc3ee2b493cabcfd1d628d9a4be"
            attribution='&copy; <a href="https://www.geoapify.com/">Geoapify</a>'
          />
          <Marker position={[coords.lat, coords.lon]} icon={customIcon}>
            <Popup>You are here</Popup>
          </Marker>
        </MapContainer>
      )}
    </div>
  )
}
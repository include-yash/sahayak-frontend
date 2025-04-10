"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { useRouter } from "next/navigation"

interface NearbyModeProps {
  darkMode: boolean
  fontSize: number
  location?: { latitude: number; longitude: number } | null
}

interface Place {
  id: string
  name: string
  category: string
  distance: string
  address: string
}

export default function CafeMode({ darkMode, fontSize, location }: NearbyModeProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [places, setPlaces] = useState<Place[]>([])

  const { t } = useTranslation()
  const router = useRouter()

  const handleSearch = async () => {
    setIsSearching(true)
    try {
      setPlaces([])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const topics = [
    { icon: "🥗", title: t("Grocery & Cafe"), description: t("Finds nearby malls & grocery"), path: "shopping/grocery" },
    { icon: "🍲", title: t("Restaurants & Cafe"), description: t("Finds nearby Cafe and restaurant"), path: "shopping/cafe" },
    { icon: "💊", title: t("Pharmacy"), description: t("Finds nearby pharmacy"), path: "shopping/pharmacy" },
  ]

  return (
    <div className="space-y-4">
      <motion.h2
        className={cn("text-2xl font-bold mb-4", darkMode ? "text-orange-400" : "text-orange-600")}
        style={{ fontSize: `${1.3 * fontSize}rem` }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t("shopping_companion")}
      </motion.h2>

      <motion.p
        className={darkMode ? "text-gray-300" : "text-gray-700"}
        style={{ fontSize: `${fontSize}rem` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {t("shopping_welcome_message")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className={cn("p-4", darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-orange-100")}>
          <h3 className="font-medium mb-3" style={{ fontSize: `${1.1 * fontSize}rem` }}>
            {t("find_places")}
          </h3>

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full bg-orange-500 hover:bg-orange-600 flex gap-2"
            >
              <MapPin size={18} />
              {location ? t("find_places_near_me") : t("find_places_nearby")}
            </Button>
          </div>

          {isSearching && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          )}

          {places.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-medium" style={{ fontSize: `${1 * fontSize}rem` }}>
                {t("nearby_places")}
              </h4>

              {places.map((place) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("p-3 rounded-lg", darkMode ? "bg-gray-700" : "bg-orange-50")}
                >
                  <div className="flex justify-between">
                    <h5 className="font-medium" style={{ fontSize: `${1 * fontSize}rem` }}>
                      {place.name}
                    </h5>
                    <span className="text-sm">{place.distance}</span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontSize: `${0.85 * fontSize}rem` }}>
                    {place.category}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400" style={{ fontSize: `${0.85 * fontSize}rem` }}>
                    {place.address}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {topics.map((topic, index) => (
          <motion.div
            key={topic.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Card
              className={cn(
                "p-4 cursor-pointer flex items-center gap-3",
                darkMode
                  ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
                  : "bg-white hover:bg-orange-50 border-orange-100",
              )}
              onClick={() => topic.path && router.push(topic.path)}
            >
              <div className="text-3xl">{topic.icon}</div>
              <div>
                <h3 className="font-medium" style={{ fontSize: `${1.1 * fontSize}rem` }}>
                  {topic.title}
                </h3>
                <p
                  className={darkMode ? "text-gray-400" : "text-gray-600"}
                  style={{ fontSize: `${0.9 * fontSize}rem` }}
                >
                  {topic.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

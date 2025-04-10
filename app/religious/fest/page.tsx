"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"
import { Sun, Moon } from "lucide-react"

interface Festival {
  name: string
  date: string
  description: string
}

interface CalendarData {
  [religion: string]: {
    [month: string]: Festival[]
  }
}

const calendarData: CalendarData = {
  "🕉️ Hindu": {
    January: [
      { name: "Makar Sankranti", date: "Jan 14", description: "Harvest festival celebrated across India" },
      { name: "Pongal", date: "Jan 14-17", description: "Tamil harvest festival" },
    ],
    February: [
      { name: "Vasant Panchami", date: "Feb 2", description: "Celebrates arrival of spring and goddess Saraswati" },
    ],
    March: [
      { name: "Maha Shivratri", date: "Mar 11", description: "Night-long vigils in honor of Lord Shiva" },
      { name: "Holi", date: "Mar 29", description: "Festival of colors celebrating good over evil" },
    ],
    August: [
      { name: "Raksha Bandhan", date: "Aug 19", description: "Celebrates the bond between brothers and sisters" },
      { name: "Janmashtami", date: "Aug 26", description: "Celebrates the birth of Lord Krishna" },
    ],
    October: [
      { name: "Navratri Begins", date: "Oct 3", description: "Nine nights dedicated to the goddess Durga" },
      { name: "Dussehra", date: "Oct 12", description: "Celebrates the victory of good over evil" },
    ],
    November: [
      { name: "Diwali", date: "Nov 1", description: "Festival of lights celebrating new beginnings" },
      { name: "Bhai Dooj", date: "Nov 3", description: "Celebration of the sibling bond" },
    ],
  },
  "☪️ Islam": {
    March: [
      { name: "Shab-e-Barat", date: "Mar 17", description: "Night of forgiveness and blessings" },
    ],
    April: [
      { name: "Ramadan Begins", date: "Apr 2", description: "Start of the fasting month" },
      { name: "Eid al-Fitr", date: "Apr 10", description: "Celebration marking the end of Ramadan" },
    ],
    June: [
      { name: "Eid al-Adha", date: "Jun 8", description: "Festival of Sacrifice commemorating Prophet Ibrahim" },
    ],
    July: [
      { name: "Islamic New Year", date: "Jul 7", description: "The start of a new Islamic lunar year" },
    ],
    September: [
      { name: "Milad-un-Nabi", date: "Sep 15", description: "Celebration of the Prophet's birthday" },
    ],
  },
  "✝️ Christian": {
    January: [
      { name: "Epiphany", date: "Jan 6", description: "Celebration of the manifestation of Christ to the Gentiles" },
    ],
    March: [
      { name: "Palm Sunday", date: "Mar 24", description: "Commemorates Jesus' triumphant entry into Jerusalem" },
      { name: "Good Friday", date: "Mar 29", description: "Observes the crucifixion of Jesus" },
      { name: "Easter Sunday", date: "Mar 31", description: "Celebrates the resurrection of Jesus" },
    ],
    November: [
      { name: "All Saints' Day", date: "Nov 1", description: "Honors all saints, known and unknown" },
    ],
    December: [
      { name: "Advent", date: "Dec 1", description: "Period of expectant waiting for the celebration of Christ's birth" },
      { name: "Christmas", date: "Dec 25", description: "Celebrates the birth of Jesus Christ" },
    ],
  },
}

export default function FestivalCalendarWrapper() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(1.2)

  return (
    <div className={cn("min-h-screen px-4 py-6 transition-colors duration-300", darkMode ? "bg-black text-white" : "bg-[#fff9f3] text-black")}>
      <div className="flex justify-end mb-4">
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <FestivalCalendar darkMode={darkMode} fontSize={fontSize} />
    </div>
  )
}

interface FestivalCalendarProps {
  darkMode: boolean
  fontSize: number
}

function FestivalCalendar({ darkMode, fontSize }: FestivalCalendarProps) {
  const [selectedReligion, setSelectedReligion] = useState<keyof typeof calendarData>("🕉️ Hindu")
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const { t } = useTranslation()
  const religions = Object.keys(calendarData) as (keyof typeof calendarData)[]
  const months = Object.keys(calendarData[selectedReligion])

  return (
    <div className="space-y-6 text-center">
      <motion.h2
        className={cn("text-3xl font-bold mb-4", darkMode ? "text-orange-400" : "text-orange-600")}
        style={{ fontSize: `${1.5 * fontSize}rem` }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {t("Festival Calendar")}
      </motion.h2>

      <div className="flex justify-center flex-wrap gap-3">
        {religions.map((religion) => (
          <button
            key={religion}
            onClick={() => setSelectedReligion(religion)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium focus:outline-none transition-all shadow hover:scale-105",
              selectedReligion === religion
                ? darkMode
                  ? "bg-orange-500 text-white"
                  : "bg-orange-600 text-white"
                : darkMode
                ? "bg-gray-700 text-gray-300"
                : "bg-orange-100 text-orange-700"
            )}
            style={{ fontSize: `${1.1 * fontSize}rem` }}
          >
            {religion}
          </button>
        ))}
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-8 justify-center px-4">
        {months.map((month, index) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card
              onClick={() => setActiveCard(activeCard === month ? null : month)}
              className={cn(
                "p-6 cursor-pointer rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl backdrop-blur-md border border-white/10",
                darkMode
                  ? "bg-black/30 text-white"
                  : "bg-orange-50/70 text-black",
                activeCard === month ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full shadow-2xl" : ""
              )}
              style={{ fontSize: activeCard === month ? `${1.3 * fontSize}rem` : `${fontSize}rem` }}
            >
              <h3 className="font-semibold mb-3 text-xl">{month}</h3>
              <ul className="space-y-3">
                {calendarData[selectedReligion][month].map((festival) => (
                  <li
                    key={festival.name}
                    className={cn("text-left space-y-1 transition-all", darkMode ? "text-gray-300" : "text-gray-700")}
                  >
                    <span className="font-semibold block">{festival.name}</span>
                    <span className="text-sm block">{festival.date}</span>
                    {activeCard === month && (
                      <motion.p
                        className="text-base mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {festival.description}
                      </motion.p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
            {activeCard === month && (
              <div
                className={cn(
                  "fixed inset-0 z-40 backdrop-blur-sm",
                  darkMode
                    ? "bg-black/60"
                    : "bg-orange-100/70"
                )}
                onClick={() => setActiveCard(null)}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

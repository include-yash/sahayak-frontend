// components/restaurant-card.tsx
import React from "react"

type Restaurant = {
  name: string
  rating: number
  cuisine: string
  description: string
}

export default function RestaurantCard({ restaurant, darkMode, fontSize }: { restaurant: Restaurant; darkMode: boolean; fontSize: number }) {
  return (
    <div className={`rounded-lg p-4 shadow-md ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`} style={{ fontSize: `${1 * fontSize}rem` }}>
      {/* <h3 className="text-xl font-semibold">{restaurant.name}</h3> */}
      <p className="text-sm mb-1">⭐ {restaurant.rating} · {restaurant.cuisine}</p>
      <p className="text-sm">{restaurant.description}</p>
    </div>
  )
}

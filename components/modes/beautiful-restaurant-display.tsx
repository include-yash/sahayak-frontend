import React from "react"

interface Restaurant {
  name: string
  rating: number
  cuisine: string
  description: string
}

interface Props {
  data: Restaurant[]
  darkMode: boolean
  fontSize: number
}

const BeautifulRestaurantDisplay: React.FC<Props> = ({ data, darkMode, fontSize }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {data.map((restaurant, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}`}
          style={{ fontSize: `${1 * fontSize}rem` }}
        >
          <h3 className="text-xl font-bold mb-1">{restaurant.name}</h3>
          <p className="text-sm mb-1">⭐ {restaurant.rating} | {restaurant.cuisine}</p>
          <p className="text-sm">{restaurant.description}</p>
        </div>
      ))}
    </div>
  )
}

export default BeautifulRestaurantDisplay

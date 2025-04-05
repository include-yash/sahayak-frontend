"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Diet data for elderly people
const dietData = {
  vegetarian: {
    // Breakfast
    "Oatmeal with Berries": {
      instructions: "Cook 1/2 cup of oats with water or milk. Top with a handful of mixed berries (blueberries, strawberries) and a drizzle of honey.",
      benefits: "High in fiber for digestion, antioxidants for heart health, and gentle on the stomach.",
      image: "https://images.unsplash.com/photo-15226313145-ffa9d77f368c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Greek Yogurt with Fruit": {
      instructions: "Mix 1 cup of Greek yogurt with sliced bananas and a handful of walnuts.",
      benefits: "Probiotics for gut health, protein for muscle maintenance.",
      image: "https://images.unsplash.com/photo-1501949997128-2fdb9f6428f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Vegetable Upma": {
      instructions: "Roast 1/2 cup semolina, sauté with diced carrots, peas, and spices in 1 tsp oil. Add water and cook until soft.",
      benefits: "Light yet filling, good source of carbs and vitamins.",
      image: "https://images.unsplash.com/photo-1606493061425-1dbfdbb66b5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    // Lunch
    "Lentil Soup": {
      instructions: "Simmer 1 cup of lentils with diced carrots, celery, and onions in vegetable broth for 30-40 minutes. Season with salt and pepper.",
      benefits: "Rich in protein and iron, supports muscle maintenance, and easy to digest.",
      image: "https://images.unsplash.com/photo-1600275669283-4bf2f0560b5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Quinoa and Veggie Salad": {
      instructions: "Cook 1/2 cup quinoa, mix with cherry tomatoes, cucumber, and a lemon-olive oil dressing.",
      benefits: "High in fiber and protein, promotes heart health.",
      image: "https://images.unsplash.com/photo-1519996409144-96c88c862b4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Spinach and Paneer Curry": {
      instructions: "Sauté 2 cups spinach with 100g paneer cubes, garlic, and mild spices. Simmer with a splash of cream.",
      benefits: "Calcium for bones, protein for strength.",
      image: "https://images.unsplash.com/photo-1589301771356-6a4e0d46723c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    // Dinner
    "Steamed Spinach with Almonds": {
      instructions: "Steam 2 cups of fresh spinach for 3-5 minutes. Sprinkle with a tablespoon of slivered almonds.",
      benefits: "High in calcium and vitamin K for bone health, low calorie for weight management.",
      image: "https://images.unsplash.com/photo-1518779572-866c66c94ab1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Vegetable Stir-Fry": {
      instructions: "Stir-fry broccoli, bell peppers, and zucchini in 1 tbsp olive oil with light soy sauce.",
      benefits: "Rich in vitamins, supports immunity.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Chickpea Stew": {
      instructions: "Cook 1 cup chickpeas with tomatoes, onions, and mild spices in broth for 30 minutes.",
      benefits: "Fiber and protein for digestion and satiety.",
      image: "https://images.unsplash.com/photo-1572449043416-2409e5b4d6fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    // Snack
    "Fruit and Nut Mix": {
      instructions: "Combine a handful of almonds, walnuts, and dried apricots.",
      benefits: "Healthy fats and energy boost.",
      image: "https://images.unsplash.com/photo-1542849187-88bfab1069e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    }
  },
  nonVegetarian: {
    // Breakfast
    "Egg and Veggie Scramble": {
      instructions: "Scramble 2 eggs with diced bell peppers, spinach, and a sprinkle of cheese. Cook on low heat.",
      benefits: "High-quality protein, vitamins for eye health, supports cognitive function.",
      image: "https://images.unsplash.com/photo-1509440159596-024908877058?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Turkey Sausage Patties": {
      instructions: "Grill 2 small turkey sausage patties, serve with a side of sliced avocado.",
      benefits: "Lean protein, healthy fats for heart health.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Smoked Salmon Toast": {
      instructions: "Spread cream cheese on whole-grain toast, top with 2 oz smoked salmon and dill.",
      benefits: "Omega-3s for brain health, protein for muscle.",
      image: "https://images.unsplash.com/photo-1509477880819-a401458bf82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    // Lunch
    "Grilled Salmon with Veggies": {
      instructions: "Grill a 4 oz salmon fillet seasoned with lemon and herbs. Serve with steamed broccoli and carrots.",
      benefits: "Omega-3 fatty acids for heart and brain health, protein for muscle strength.",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b250?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Chicken and Quinoa Bowl": {
      instructions: "Cook 1/2 cup quinoa. Sauté 3 oz chicken breast with garlic and olive oil, mix with quinoa and steamed greens.",
      benefits: "Lean protein for muscle repair, fiber for digestion, balanced energy source.",
      image: "https://images.unsplash.com/photo-1627662055591-4b1d72d75b18?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Turkey Wrap": {
      instructions: "Wrap 3 oz turkey slices, lettuce, and tomato in a whole-grain tortilla with a light mayo spread.",
      benefits: "Low-fat protein, fiber for fullness.",
      image: "https://images.unsplash.com/photo-1567234667369-c3d6e71161a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    // Dinner
    "Baked Cod with Asparagus": {
      instructions: "Bake a 4 oz cod fillet with lemon and herbs at 375°F for 15-20 minutes. Serve with roasted asparagus.",
      benefits: "Lean protein, vitamin B12 for energy.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Chicken Stir-Fry": {
      instructions: "Sauté 3 oz chicken strips with mixed veggies (broccoli, peppers) in 1 tbsp sesame oil.",
      benefits: "Protein and vitamins for overall health.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    "Beef and Barley Soup": {
      instructions: "Simmer 3 oz lean beef with 1/2 cup barley, carrots, and celery in broth for 40 minutes.",
      benefits: "Iron for blood health, fiber for digestion.",
      image: "https://images.unsplash.com/photo-1608501128461-6c3e6ce152e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    },
    // Snack
    "Cheese and Turkey Roll": {
      instructions: "Roll 1 oz turkey slice with a slice of low-fat cheese.",
      benefits: "Quick protein boost.",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
    }
  }
}

const dietSections = {
  vegetarian: {
    breakfast: ["Oatmeal with Berries", "Greek Yogurt with Fruit", "Vegetable Upma"],
    lunch: ["Lentil Soup", "Quinoa and Veggie Salad", "Spinach and Paneer Curry"],
    dinner: ["Steamed Spinach with Almonds", "Vegetable Stir-Fry", "Chickpea Stew"],
    snack: ["Fruit and Nut Mix"]
  },
  nonVegetarian: {
    breakfast: ["Egg and Veggie Scramble", "Turkey Sausage Patties", "Smoked Salmon Toast"],
    lunch: ["Grilled Salmon with Veggies", "Chicken and Quinoa Bowl", "Turkey Wrap"],
    dinner: ["Baked Cod with Asparagus", "Chicken Stir-Fry", "Beef and Barley Soup"],
    snack: ["Cheese and Turkey Roll"]
  }
}

export default function DietPage() {
  const [isVegetarian, setIsVegetarian] = useState(true)
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => setDarkMode(!darkMode)
  const currentDiet = isVegetarian ? "vegetarian" : "nonVegetarian"

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
            >
              Diet for Seniors
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md">
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-amber-100 dark:bg-gray-700">
              🥗 Veg
            </span>
            <Switch
              checked={!isVegetarian}
              onCheckedChange={() => setIsVegetarian(!isVegetarian)}
              className="data-[state=checked]:bg-rose-500 data-[state=unchecked]:bg-green-500"
            />
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-rose-100 dark:bg-gray-700">
              🍗 Non-Veg
            </span>
          </div>
        </motion.div>

        <div className="space-y-8">
          <DietSection
            title="Breakfast"
            list={dietSections[currentDiet].breakfast}
            onMealClick={setSelectedMeal}
            emoji={isVegetarian ? "🥗" : "🍗"}
          />
          <DietSection
            title="Lunch"
            list={dietSections[currentDiet].lunch}
            onMealClick={setSelectedMeal}
            emoji={isVegetarian ? "🥗" : "🍗"}
          />
          <DietSection
            title="Dinner"
            list={dietSections[currentDiet].dinner}
            onMealClick={setSelectedMeal}
            emoji={isVegetarian ? "🥗" : "🍗"}
          />
          <DietSection
            title="Snack"
            list={dietSections[currentDiet].snack}
            onMealClick={setSelectedMeal}
            emoji={isVegetarian ? "🥗" : "🍗"}
          />
        </div>
      </div>

      {/* Meal Details Dialog */}
      <AnimatePresence>
        {selectedMeal && (
          <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
            <DialogContent className="max-w-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-amber-600">{selectedMeal}</DialogTitle>
              </DialogHeader>
              <div className="flex gap-6 mt-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">How to Prepare</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {dietData[currentDiet][selectedMeal]?.instructions || "Instructions not available."}
                  </p>
                  <h3 className="text-lg font-semibold mt-4 mb-2">Benefits</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {dietData[currentDiet][selectedMeal]?.benefits || "Benefits not available."}
                  </p>
                </div>
                <div className="w-1/3">
                  {dietData[currentDiet][selectedMeal]?.image ? (
                    <img
                      src={dietData[currentDiet][selectedMeal].image}
                      alt={`${selectedMeal} image`}
                      className="w-full rounded-lg shadow-md"
                    />
                  ) : (
                    <p className="text-gray-500">No image available</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => setSelectedMeal(null)}
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

function DietSection({
  title,
  list,
  onMealClick,
  emoji
}: {
  title: string
  list: string[]
  onMealClick: (meal: string) => void
  emoji: string
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
      <h2 className="text-2xl font-semibold text-amber-600 dark:text-amber-300 mb-4">{title}</h2>
      <ul className="space-y-3">
        {list.map((item, index) => (
          <motion.li
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-opacity-50 hover:bg-opacity-70 transition-colors dark:bg-gray-700 bg-amber-50 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => onMealClick(item)}
          >
            <span className="text-lg">{item}</span>
            <span>{emoji}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
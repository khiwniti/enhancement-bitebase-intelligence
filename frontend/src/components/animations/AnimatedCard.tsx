'use client'

import React, { forwardRef } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { 
  menuCardVariants, 
  restaurantCardVariants, 
  dashboardWidgetVariants,
  plateServingVariants 
} from '@/lib/animations'
import { cn } from '@/lib/utils'

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'menu' | 'restaurant' | 'dashboard' | 'plate'
  index?: number
  isHoverable?: boolean
  customVariants?: any
  motionProps?: MotionProps
  children: React.ReactNode
  foodCategory?: 'pizza' | 'burger' | 'healthy' | 'asian' | 'dessert'
  showFoodIcon?: boolean
  onCardClick?: () => void
}

const cardVariants = {
  default: 'bg-white rounded-xl shadow-md border border-gray-200',
  menu: 'bg-white rounded-lg shadow-sm border-l-4 border-bitebase-primary p-6',
  restaurant: 'bg-white rounded-xl shadow-md overflow-hidden',
  dashboard: 'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
  plate: 'bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-4',
}

const foodCategoryColors = {
  pizza: 'border-category-pizza',
  burger: 'border-category-burger',
  healthy: 'border-category-healthy',
  asian: 'border-category-asian',
  dessert: 'border-category-dessert',
}

const foodIcons = {
  pizza: '🍕',
  burger: '🍔',
  healthy: '🥗',
  asian: '🍜',
  dessert: '🍰',
}

const variantMotions = {
  default: dashboardWidgetVariants,
  menu: menuCardVariants,
  restaurant: restaurantCardVariants,
  dashboard: dashboardWidgetVariants,
  plate: plateServingVariants,
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({
    className,
    variant = 'default',
    index = 0,
    isHoverable = true,
    customVariants,
    motionProps = {},
    children,
    foodCategory,
    showFoodIcon = false,
    onCardClick,
    ...props
  }, ref) => {
    const variants = customVariants || variantMotions[variant]
    
    const baseClasses = cn(
      cardVariants[variant],
      foodCategory && foodCategoryColors[foodCategory],
      isHoverable && 'cursor-pointer transition-shadow duration-300',
      onCardClick && 'cursor-pointer',
      className
    )

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        variants={variants}
        custom={index}
        initial="hidden"
        animate="visible"
        whileHover={isHoverable ? "hover" : undefined}
        whileTap={onCardClick ? "tap" : undefined}
        onClick={onCardClick}
        layout
        {...motionProps}
        {...props}
      >
        {/* Food Category Icon */}
        {showFoodIcon && foodCategory && (
          <motion.div
            className="absolute top-2 right-2 text-2xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {foodIcons[foodCategory]}
          </motion.div>
        )}

        {/* Card Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>

        {/* Hover Overlay for interactive cards */}
        {isHoverable && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-bitebase-primary/5 to-food-orange/5 rounded-xl opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

// Specialized Card Components
export const MenuCard = forwardRef<HTMLDivElement, Omit<AnimatedCardProps, 'variant'>>(
  (props, ref) => (
    <AnimatedCard ref={ref} {...props} variant="menu" />
  )
)

MenuCard.displayName = 'MenuCard'

export const RestaurantCard = forwardRef<HTMLDivElement, Omit<AnimatedCardProps, 'variant'>>(
  (props, ref) => (
    <AnimatedCard ref={ref} {...props} variant="restaurant" />
  )
)

RestaurantCard.displayName = 'RestaurantCard'

export const DashboardCard = forwardRef<HTMLDivElement, Omit<AnimatedCardProps, 'variant'>>(
  (props, ref) => (
    <AnimatedCard ref={ref} {...props} variant="dashboard" />
  )
)

DashboardCard.displayName = 'DashboardCard'

export const PlateCard = forwardRef<HTMLDivElement, Omit<AnimatedCardProps, 'variant'>>(
  (props, ref) => (
    <AnimatedCard ref={ref} {...props} variant="plate" />
  )
)

PlateCard.displayName = 'PlateCard'

// Food Category Cards
export const PizzaCard = forwardRef<HTMLDivElement, Omit<AnimatedCardProps, 'foodCategory'>>(
  (props, ref) => (
    <AnimatedCard ref={ref} {...props} foodCategory="pizza" showFoodIcon />
  )
)

PizzaCard.displayName = 'PizzaCard'

export const BurgerCard = forwardRef<HTMLDivElement, Omit<AnimatedCardProps, 'foodCategory'>>(
  (props, ref) => (
    <AnimatedCard ref={ref} {...props} foodCategory="burger" showFoodIcon />
  )
)

BurgerCard.displayName = 'BurgerCard'

export const HealthyCard = forwardRef<HTMLDivElement, Omit<AnimatedCardProps, 'foodCategory'>>(
  (props, ref) => (
    <AnimatedCard ref={ref} {...props} foodCategory="healthy" showFoodIcon />
  )
)

HealthyCard.displayName = 'HealthyCard'

// Interactive Food Grid Component
interface FoodGridProps {
  items: Array<{
    id: string
    title: string
    description: string
    category: 'pizza' | 'burger' | 'healthy' | 'asian' | 'dessert'
    price?: number
    image?: string
  }>
  onItemClick?: (item: any) => void
  className?: string
}

export function FoodGrid({ items, onItemClick, className }: FoodGridProps) {
  return (
    <motion.div
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <AnimatedCard
          key={item.id}
          variant="menu"
          index={index}
          foodCategory={item.category}
          showFoodIcon
          onCardClick={() => onItemClick?.(item)}
          className="relative overflow-hidden"
        >
          {item.image && (
            <motion.div
              className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
            {item.price && (
              <motion.div
                className="text-xl font-bold text-bitebase-primary"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                ${item.price.toFixed(2)}
              </motion.div>
            )}
          </div>
        </AnimatedCard>
      ))}
    </motion.div>
  )
}

export default AnimatedCard
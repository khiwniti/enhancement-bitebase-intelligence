/**
 * Enhanced Animation Framework with Food-Themed Elements
 * Built on Framer Motion for BiteBase Intelligence Platform
 */

import { Variants, Transition, MotionProps } from 'framer-motion'

// Animation Constants
export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  very_slow: 0.8,
} as const

export const EASING = {
  ease: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: 'spring' as const, damping: 20, stiffness: 300 },
  smooth: { type: 'tween' as const, ease: [0.25, 0.1, 0.25, 1] },
} as const

// Food-Themed Entrance Animations
export const foodEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...EASING.spring,
      duration: ANIMATION_DURATION.normal,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
}

// Floating Food Animation (for background elements)
export const floatingFoodVariants: Variants = {
  float: {
    y: [-20, -10, -20],
    x: [-5, 5, -5],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
}

// Delivery Animation (for buttons and interactive elements)
export const deliveryVariants: Variants = {
  idle: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.05,
    rotate: 1,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.bounce,
    },
  },
  tap: {
    scale: 0.95,
    rotate: -1,
    transition: {
      duration: ANIMATION_DURATION.fast / 2,
    },
  },
}

// Plate Serving Animation
export const plateServingVariants: Variants = {
  hidden: {
    x: -100,
    opacity: 0,
    rotate: -15,
    scale: 0.8,
  },
  visible: {
    x: 0,
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: EASING.bounce,
      delay: 0.1,
    },
  },
  serving: {
    y: [-5, 0, -5],
    transition: {
      duration: 1,
      repeat: 3,
      ease: 'easeInOut',
    },
  },
}

// Kitchen Activity Animation (for charts and data visualization)
export const kitchenActivityVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 0.8,
  },
  active: {
    scale: [1, 1.02, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  sizzle: {
    x: [-1, 1, -1, 1, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
}

// Menu Card Animation
export const menuCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -15,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: index * 0.1,
      ...EASING.spring,
      duration: ANIMATION_DURATION.normal,
    },
  }),
  hover: {
    y: -10,
    rotateX: 5,
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.bounce,
    },
  },
}

// Restaurant Card Animation
export const restaurantCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 30,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...EASING.spring,
      duration: ANIMATION_DURATION.normal,
    },
  },
  hover: {
    scale: 1.03,
    y: -5,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.bounce,
    },
  },
  tap: {
    scale: 0.98,
  },
}

// Dashboard Widget Animation
export const dashboardWidgetVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      ...EASING.spring,
      duration: ANIMATION_DURATION.normal,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
}

// Chart Animation
export const chartVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: ANIMATION_DURATION.slow,
        ease: 'easeInOut',
      },
      opacity: {
        duration: ANIMATION_DURATION.fast,
      },
    },
  },
}

// Food Particle Animation (for background effects)
export const foodParticleVariants: Variants = {
  float: (i: number) => ({
    y: [0, -100, -200],
    x: [0, Math.sin(i) * 20, Math.sin(i * 2) * 30],
    opacity: [0, 1, 0],
    rotate: [0, 180, 360],
    scale: [0.5, 1, 0.3],
    transition: {
      duration: 8 + i * 0.5,
      repeat: Infinity,
      repeatDelay: i * 2,
      ease: 'linear',
    },
  }),
}

// Navigation Animation
export const navVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      ...EASING.spring,
      duration: ANIMATION_DURATION.normal,
      staggerChildren: 0.1,
    },
  },
}

// Page Transition Animation
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: '-100vw',
  },
  in: {
    opacity: 1,
    x: 0,
    transition: {
      ...EASING.spring,
      duration: ANIMATION_DURATION.normal,
    },
  },
  out: {
    opacity: 0,
    x: '100vw',
    transition: {
      duration: ANIMATION_DURATION.fast,
    },
  },
}

// Loading Animation
export const loadingVariants: Variants = {
  start: {
    rotate: 0,
  },
  end: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Food Icon Animations
export const foodIconVariants: Variants = {
  pizza: {
    rotate: [0, 5, -5, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 3,
    },
  },
  burger: {
    y: [0, -3, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  taco: {
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  sushi: {
    scale: [1, 1.05, 1],
    rotate: [0, 180, 360],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Stagger Animation Containers
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...EASING.spring,
      duration: ANIMATION_DURATION.normal,
    },
  },
}

// Utility Functions for Animation
export const createDelayedAnimation = (delay: number, variants: Variants) => ({
  ...variants,
  visible: {
    ...variants.visible,
    transition: {
      ...(variants.visible as any)?.transition,
      delay,
    },
  },
})

export const createStaggeredList = (itemCount: number) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ...EASING.spring,
        duration: ANIMATION_DURATION.normal,
      },
    },
  },
})

// Food Category Color Animations
export const foodCategoryAnimations = {
  pizza: {
    backgroundColor: ['#FF6B35', '#FF8A65', '#FF6B35'],
    transition: { duration: 3, repeat: Infinity },
  },
  burger: {
    backgroundColor: ['#8B4513', '#A0522D', '#8B4513'],
    transition: { duration: 3, repeat: Infinity },
  },
  healthy: {
    backgroundColor: ['#74C365', '#81C784', '#74C365'],
    transition: { duration: 3, repeat: Infinity },
  },
  asian: {
    backgroundColor: ['#E23D28', '#EF5350', '#E23D28'],
    transition: { duration: 3, repeat: Infinity },
  },
}

// Gesture Animations
export const gestureAnimations = {
  tap: {
    scale: 0.95,
    transition: { duration: ANIMATION_DURATION.fast },
  },
  hover: {
    scale: 1.05,
    y: -2,
    transition: { duration: ANIMATION_DURATION.fast, ease: EASING.bounce },
  },
  focus: {
    scale: 1.02,
    boxShadow: '0 0 0 3px rgba(116, 195, 101, 0.3)',
    transition: { duration: ANIMATION_DURATION.fast },
  },
}

// Export commonly used animation props
export const commonAnimationProps: MotionProps = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
  layout: true,
  layoutId: undefined, // Will be set by component
}

// Food delivery themed entrance animation for main content
export const heroEntranceVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: EASING.bounce,
      staggerChildren: 0.2,
    },
  },
}

export default {
  variants: {
    foodEntrance: foodEntranceVariants,
    floatingFood: floatingFoodVariants,
    delivery: deliveryVariants,
    plateServing: plateServingVariants,
    kitchenActivity: kitchenActivityVariants,
    menuCard: menuCardVariants,
    restaurantCard: restaurantCardVariants,
    dashboardWidget: dashboardWidgetVariants,
    chart: chartVariants,
    foodParticle: foodParticleVariants,
    nav: navVariants,
    page: pageVariants,
    loading: loadingVariants,
    foodIcon: foodIconVariants,
    heroEntrance: heroEntranceVariants,
    staggerContainer,
    staggerItem,
  },
  transitions: EASING,
  durations: ANIMATION_DURATION,
  gestures: gestureAnimations,
  utilities: {
    createDelayedAnimation,
    createStaggeredList,
  },
}
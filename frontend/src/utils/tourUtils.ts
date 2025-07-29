/**
 * Tour Utilities
 * Helper functions for managing the web tour state and first-time user experience
 */

// Local storage keys
export const TOUR_STORAGE_KEYS = {
  TOUR_COMPLETED: 'bitebase-tour-completed',
  TOUR_SKIPPED: 'bitebase-tour-skipped',
  DONT_SHOW_AGAIN: 'bitebase-tour-dont-show-again',
  USER_FIRST_LOGIN: 'bitebase-user-first-login',
  WELCOME_BANNER_DISMISSED: 'bitebase-welcome-banner-dismissed'
} as const

/**
 * Mark user as first-time user (called on registration/first login)
 */
export function markUserAsFirstTime(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOUR_STORAGE_KEYS.USER_FIRST_LOGIN, 'true')
  }
}

/**
 * Clear first-time user flag (called after tour completion/skip)
 */
export function clearFirstTimeUserFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOUR_STORAGE_KEYS.USER_FIRST_LOGIN)
  }
}

/**
 * Check if user is a first-time user
 */
export function isFirstTimeUser(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(TOUR_STORAGE_KEYS.USER_FIRST_LOGIN) === 'true'
}

/**
 * Check if tour should be shown
 */
export function shouldShowTour(): boolean {
  if (typeof window === 'undefined') return false

  const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEYS.TOUR_COMPLETED)
  const tourSkipped = localStorage.getItem(TOUR_STORAGE_KEYS.TOUR_SKIPPED)
  const dontShowAgain = localStorage.getItem(TOUR_STORAGE_KEYS.DONT_SHOW_AGAIN)
  const userFirstLogin = localStorage.getItem(TOUR_STORAGE_KEYS.USER_FIRST_LOGIN)

  // Show tour only if:
  // 1. User is first-time user
  // 2. Tour hasn't been completed
  // 3. Tour hasn't been skipped
  // 4. User hasn't selected "don't show again"
  return userFirstLogin === 'true' && !tourCompleted && !tourSkipped && !dontShowAgain
}

/**
 * Mark tour as completed
 */
export function markTourCompleted(dontShowAgain: boolean = false): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(TOUR_STORAGE_KEYS.TOUR_COMPLETED, 'true')
  clearFirstTimeUserFlag()

  if (dontShowAgain) {
    localStorage.setItem(TOUR_STORAGE_KEYS.DONT_SHOW_AGAIN, 'true')
  }
}

/**
 * Mark tour as skipped
 */
export function markTourSkipped(dontShowAgain: boolean = false): void {
  if (typeof window === 'undefined') return

  localStorage.setItem(TOUR_STORAGE_KEYS.TOUR_SKIPPED, 'true')
  clearFirstTimeUserFlag()

  if (dontShowAgain) {
    localStorage.setItem(TOUR_STORAGE_KEYS.DONT_SHOW_AGAIN, 'true')
  }
}

/**
 * Clear user session data (called on logout)
 */
export function clearUserSessionData(): void {
  if (typeof window === 'undefined') return

  // Clear first-time user flag but keep tour preferences
  clearFirstTimeUserFlag()
}

export const tourUtils = {
  /**
   * Disable the tour completely (useful for testing)
   */
  disableTour: () => {
    localStorage.setItem('bitebase-tour-completed', 'true')
    localStorage.setItem('bitebase-tour-skipped', 'true')
    console.log('Tour disabled - page will need to be refreshed')
  },

  /**
   * Enable the tour (reset tour state)
   */
  enableTour: () => {
    localStorage.removeItem('bitebase-tour-completed')
    localStorage.removeItem('bitebase-tour-skipped')
    localStorage.removeItem('bitebase-tour-dont-show-again')
    localStorage.setItem('bitebase-user-first-login', 'true')
    console.log('Tour enabled - page will need to be refreshed')
  },

  /**
   * Check if tour is disabled
   */
  isTourDisabled: () => {
    const tourCompleted = localStorage.getItem('bitebase-tour-completed')
    const tourSkipped = localStorage.getItem('bitebase-tour-skipped')
    const dontShowAgain = localStorage.getItem('bitebase-tour-dont-show-again')
    return !!(tourCompleted || tourSkipped || dontShowAgain)
  },

  /**
   * Reset all tour preferences (useful for testing)
   */
  resetTourPreferences: () => {
    Object.values(TOUR_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('All tour preferences reset')
  },

  /**
   * Get tour state for debugging
   */
  getTourState: () => {
    return {
      completed: localStorage.getItem('bitebase-tour-completed'),
      skipped: localStorage.getItem('bitebase-tour-skipped'),
      dontShowAgain: localStorage.getItem('bitebase-tour-dont-show-again'),
      userFirstLogin: localStorage.getItem('bitebase-user-first-login'),
      welcomeBannerDismissed: localStorage.getItem('bitebase-welcome-banner-dismissed'),
      shouldShowTour: shouldShowTour(),
      isFirstTimeUser: isFirstTimeUser(),
      disabled: tourUtils.isTourDisabled()
    }
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).tourUtils = tourUtils
}
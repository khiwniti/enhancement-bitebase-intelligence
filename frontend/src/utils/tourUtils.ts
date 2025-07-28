// Tour utilities for managing user onboarding experience

export const markUserAsFirstTime = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('isFirstTimeUser', 'true');
  }
};

export const clearUserSessionData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('isFirstTimeUser');
    localStorage.removeItem('tourCompleted');
    localStorage.removeItem('userPreferences');
  }
};

export const isFirstTimeUser = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('isFirstTimeUser') === 'true';
  }
  return false;
};

export const markTourCompleted = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tourCompleted', 'true');
    localStorage.removeItem('isFirstTimeUser');
  }
};

export const isTourCompleted = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tourCompleted') === 'true';
  }
  return false;
};
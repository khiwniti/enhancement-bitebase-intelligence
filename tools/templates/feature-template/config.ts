import { [FeatureName]Config } from './types'

/**
 * Configuration for [FeatureName] feature
 * 
 * This file contains all configurable settings for the feature,
 * including API endpoints, caching, refresh intervals, and defaults.
 */
export const [featureName]Config: [FeatureName]Config = {
  // API Configuration
  apiEndpoint: process.env.NEXT_PUBLIC_API_URL || '/api/[featureName]',
  
  // Performance Settings
  refreshInterval: 30 * 1000, // 30 seconds
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // UI Defaults
  defaultView: 'grid',
  defaultFilters: {
    status: undefined,
    category: undefined,
    search: '',
    limit: 50,
  },
  
  // Feature Flags
  enableRealTime: true,
  enableCaching: true,
}

/**
 * Environment-specific configuration overrides
 */
const environmentOverrides = {
  development: {
    refreshInterval: 10 * 1000, // Faster refresh in dev
    enableCaching: false, // Disable caching in dev for fresh data
  },
  production: {
    refreshInterval: 60 * 1000, // Slower refresh in prod
    cacheTimeout: 10 * 60 * 1000, // Longer cache in prod
  },
  test: {
    refreshInterval: 0, // No auto-refresh in tests
    enableRealTime: false,
    enableCaching: false,
  },
}

/**
 * Get configuration with environment overrides applied
 */
export function get[FeatureName]Config(): [FeatureName]Config {
  const env = process.env.NODE_ENV || 'development'
  const overrides = environmentOverrides[env as keyof typeof environmentOverrides] || {}
  
  return {
    ...[featureName]Config,
    ...overrides,
  }
}

/**
 * Feature permissions and access control
 */
export const [featureName]Permissions = {
  read: ['user', 'admin', 'manager'],
  create: ['admin', 'manager'],
  update: ['admin', 'manager'],
  delete: ['admin'],
  export: ['admin', 'manager'],
  bulk: ['admin'],
}

/**
 * Feature metadata
 */
export const [featureName]Metadata = {
  name: '[FeatureName]',
  version: '1.0.0',
  description: 'Feature description goes here',
  author: 'BiteBase Intelligence Team',
  tags: ['feature', '[featureName]', 'analytics'],
  dependencies: [
    '@tanstack/react-query',
    'framer-motion',
    'firebase',
  ],
  routes: [
    '/[featureName]',
    '/[featureName]/[id]',
    '/api/[featureName]',
  ],
}
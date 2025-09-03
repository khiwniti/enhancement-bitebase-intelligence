/**
 * [FeatureName] Feature
 * 
 * This feature provides [brief description of what the feature does].
 * 
 * @version 1.0.0
 * @author BiteBase Intelligence Team
 */

// Core Components
export * from './components'

// Custom Hooks
export * from './hooks'

// API Services
export * from './services'

// Type Definitions
export * from './types'

// Utilities
export * from './utils'

// Configuration
export { get[FeatureName]Config, [featureName]Config, [featureName]Permissions, [featureName]Metadata } from './config'

// Feature Metadata for Dynamic Loading
export const featureMetadata = {
  name: '[FeatureName]',
  id: '[featureName]',
  version: '1.0.0',
  description: 'Feature description goes here',
  category: 'analytics', // or 'operations', 'management', etc.
  routes: [
    {
      path: '/[featureName]',
      component: '[FeatureName]Page',
      title: '[FeatureName]',
      description: 'Main [featureName] dashboard',
    },
  ],
  permissions: {
    view: ['user', 'admin', 'manager'],
    edit: ['admin', 'manager'],
    delete: ['admin'],
  },
  dependencies: [
    '@tanstack/react-query',
    'framer-motion',
    'firebase',
  ],
}
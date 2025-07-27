/**
 * BiteBase Intelligence Natural Language Query Components
 * Export all NL query related components and utilities
 */

// Main interface component
export { default as NaturalLanguageQueryInterface } from './NaturalLanguageQueryInterface'

// Sub-components
export { default as QuerySuggestions } from './components/QuerySuggestions'
export { default as QueryResults } from './components/QueryResults'
export { default as QueryHistory } from './components/QueryHistory'
export { default as ConfidenceIndicator } from './components/ConfidenceIndicator'
export { default as VoiceInput } from './components/VoiceInput'

// Hooks
export { default as useNLQuery } from './hooks/useNLQuery'

// Types
export type * from './types/nlQueryTypes'

// Re-export main component as named export for convenience
export { default as NLQueryInterface } from './NaturalLanguageQueryInterface'
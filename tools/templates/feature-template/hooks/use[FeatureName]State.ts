import { useState, useCallback, useReducer } from 'react'
import type { [FeatureName]Filters, [FeatureName]ViewMode, [FeatureName]SortConfig } from '../types'

/**
 * State interface for [FeatureName] feature
 */
interface [FeatureName]State {
  filters: [FeatureName]Filters
  view: [FeatureName]ViewMode
  sortConfig: [FeatureName]SortConfig
  selectedItems: string[]
  searchQuery: string
}

/**
 * Action types for state management
 */
type [FeatureName]Action =
  | { type: 'SET_FILTERS'; payload: [FeatureName]Filters }
  | { type: 'SET_VIEW'; payload: [FeatureName]ViewMode }
  | { type: 'SET_SORT'; payload: [FeatureName]SortConfig }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SELECTED_ITEMS'; payload: string[] }
  | { type: 'TOGGLE_ITEM_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'RESET_STATE' }

/**
 * Initial state for [FeatureName] feature
 */
const initial[FeatureName]State: [FeatureName]State = {
  filters: {},
  view: 'grid',
  sortConfig: { field: 'name', direction: 'asc' },
  selectedItems: [],
  searchQuery: '',
}

/**
 * State reducer for [FeatureName] feature
 */
function [featureName]StateReducer(
  state: [FeatureName]State,
  action: [FeatureName]Action
): [FeatureName]State {
  switch (action.type) {
    case 'SET_FILTERS':
      return { ...state, filters: action.payload }
    
    case 'SET_VIEW':
      return { ...state, view: action.payload }
    
    case 'SET_SORT':
      return { ...state, sortConfig: action.payload }
    
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }
    
    case 'SET_SELECTED_ITEMS':
      return { ...state, selectedItems: action.payload }
    
    case 'TOGGLE_ITEM_SELECTION':
      const itemId = action.payload
      const isSelected = state.selectedItems.includes(itemId)
      const selectedItems = isSelected
        ? state.selectedItems.filter(id => id !== itemId)
        : [...state.selectedItems, itemId]
      return { ...state, selectedItems }
    
    case 'CLEAR_SELECTION':
      return { ...state, selectedItems: [] }
    
    case 'RESET_STATE':
      return initial[FeatureName]State
    
    default:
      return state
  }
}

/**
 * Custom hook for managing [FeatureName] state
 * 
 * This hook provides a centralized state management solution for the feature,
 * including filters, view modes, selection, and search functionality.
 */
export function use[FeatureName]State(initialState?: Partial<[FeatureName]State>) {
  const [state, dispatch] = useReducer(
    [featureName]StateReducer,
    { ...initial[FeatureName]State, ...initialState }
  )

  // Memoized action creators
  const setFilters = useCallback((filters: [FeatureName]Filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }, [])

  const updateFilter = useCallback((key: keyof [FeatureName]Filters, value: any) => {
    dispatch({ 
      type: 'SET_FILTERS', 
      payload: { ...state.filters, [key]: value }
    })
  }, [state.filters])

  const clearFilters = useCallback(() => {
    dispatch({ type: 'SET_FILTERS', payload: {} })
  }, [])

  const setView = useCallback((view: [FeatureName]ViewMode) => {
    dispatch({ type: 'SET_VIEW', payload: view })
  }, [])

  const setSortConfig = useCallback((sortConfig: [FeatureName]SortConfig) => {
    dispatch({ type: 'SET_SORT', payload: sortConfig })
  }, [])

  const toggleSort = useCallback((field: string) => {
    const newDirection = 
      state.sortConfig.field === field && state.sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc'
    
    dispatch({ 
      type: 'SET_SORT', 
      payload: { field, direction: newDirection }
    })
  }, [state.sortConfig])

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query })
  }, [])

  const setSelectedItems = useCallback((items: string[]) => {
    dispatch({ type: 'SET_SELECTED_ITEMS', payload: items })
  }, [])

  const toggleItemSelection = useCallback((itemId: string) => {
    dispatch({ type: 'TOGGLE_ITEM_SELECTION', payload: itemId })
  }, [])

  const selectAllItems = useCallback((itemIds: string[]) => {
    dispatch({ type: 'SET_SELECTED_ITEMS', payload: itemIds })
  }, [])

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' })
  }, [])

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' })
  }, [])

  // Computed values
  const hasActiveFilters = Object.keys(state.filters).some(
    key => state.filters[key as keyof [FeatureName]Filters] !== undefined && 
           state.filters[key as keyof [FeatureName]Filters] !== ''
  )

  const hasSelectedItems = state.selectedItems.length > 0

  const isAllSelected = (itemIds: string[]) => 
    itemIds.length > 0 && itemIds.every(id => state.selectedItems.includes(id))

  return {
    // State
    ...state,
    
    // Computed values
    hasActiveFilters,
    hasSelectedItems,
    isAllSelected,
    
    // Actions
    setFilters,
    updateFilter,
    clearFilters,
    setView,
    setSortConfig,
    toggleSort,
    setSearchQuery,
    setSelectedItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    resetState,
  }
}
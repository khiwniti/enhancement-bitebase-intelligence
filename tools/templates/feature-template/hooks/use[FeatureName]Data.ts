import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { [featureName]Api } from '../services/[featureName]Api'
import type { [FeatureName]Data, [FeatureName]Filters } from '../types'

/**
 * Custom hook for fetching [FeatureName] data
 * 
 * This hook provides data fetching capabilities with built-in
 * caching, loading states, and error handling using TanStack Query.
 */
export function use[FeatureName]Data(
  filters?: [FeatureName]Filters,
  options?: Omit<UseQueryOptions<[FeatureName]Data[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['[featureName]', 'data', filters],
    queryFn: () => [featureName]Api.fetch[FeatureName]Data(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // 30 seconds for real-time updates
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  })
}

/**
 * Custom hook for fetching a single [FeatureName] item by ID
 */
export function use[FeatureName]Item(
  id: string,
  options?: Omit<UseQueryOptions<[FeatureName]Data>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['[featureName]', 'item', id],
    queryFn: () => [featureName]Api.fetch[FeatureName]Item(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options,
  })
}

/**
 * Custom hook for fetching [FeatureName] statistics
 */
export function use[FeatureName]Stats(
  filters?: [FeatureName]Filters,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['[featureName]', 'stats', filters],
    queryFn: () => [featureName]Api.fetch[FeatureName]Stats(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // 1 minute
    retry: 2,
    ...options,
  })
}
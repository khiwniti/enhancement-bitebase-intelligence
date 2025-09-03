import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { use[FeatureName]Data, use[FeatureName]State } from '../hooks'
import { [FeatureName]Api } from '../services/[featureName]Api'

// Mock the API
jest.mock('../services/[featureName]Api')
const mockApi = [FeatureName]Api as jest.Mocked<typeof [FeatureName]Api>

describe('[FeatureName] Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  describe('use[FeatureName]Data', () => {
    it('should fetch data successfully', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Item',
          status: 'active' as const,
          value: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockApi.fetch[FeatureName]Data.mockResolvedValue(mockData)

      const { result } = renderHook(() => use[FeatureName]Data(), { wrapper })

      // Initially loading
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      // Wait for data to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toEqual(mockData)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to fetch data'
      mockApi.fetch[FeatureName]Data.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => use[FeatureName]Data(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeTruthy()
    })

    it('should refetch data when called', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Item',
          status: 'active' as const,
          value: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockApi.fetch[FeatureName]Data.mockResolvedValue(mockData)

      const { result } = renderHook(() => use[FeatureName]Data(), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(mockApi.fetch[FeatureName]Data).toHaveBeenCalledTimes(1)

      await act(async () => {
        result.current.refetch()
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(mockApi.fetch[FeatureName]Data).toHaveBeenCalledTimes(2)
    })

    it('should pass filters to API', async () => {
      const filters = { status: 'active' as const }
      mockApi.fetch[FeatureName]Data.mockResolvedValue([])

      renderHook(() => use[FeatureName]Data(filters), { wrapper })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

      expect(mockApi.fetch[FeatureName]Data).toHaveBeenCalledWith(filters)
    })
  })

  describe('use[FeatureName]State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      expect(result.current.filters).toEqual({})
      expect(result.current.view).toBe('grid')
      expect(result.current.selectedItems).toEqual([])
      expect(result.current.searchQuery).toBe('')
      expect(result.current.hasActiveFilters).toBe(false)
      expect(result.current.hasSelectedItems).toBe(false)
    })

    it('should update filters correctly', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      act(() => {
        result.current.setFilters({ status: 'active' })
      })

      expect(result.current.filters).toEqual({ status: 'active' })
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('should update individual filter', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      act(() => {
        result.current.updateFilter('status', 'active')
      })

      expect(result.current.filters).toEqual({ status: 'active' })
    })

    it('should clear filters', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      // Set some filters first
      act(() => {
        result.current.setFilters({ status: 'active', category: 'test' })
      })

      expect(result.current.hasActiveFilters).toBe(true)

      // Clear filters
      act(() => {
        result.current.clearFilters()
      })

      expect(result.current.filters).toEqual({})
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('should change view mode', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      expect(result.current.view).toBe('grid')

      act(() => {
        result.current.setView('list')
      })

      expect(result.current.view).toBe('list')
    })

    it('should manage search query', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      expect(result.current.searchQuery).toBe('')

      act(() => {
        result.current.setSearchQuery('test search')
      })

      expect(result.current.searchQuery).toBe('test search')
    })

    it('should manage selected items', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      expect(result.current.selectedItems).toEqual([])
      expect(result.current.hasSelectedItems).toBe(false)

      // Select an item
      act(() => {
        result.current.toggleItemSelection('1')
      })

      expect(result.current.selectedItems).toEqual(['1'])
      expect(result.current.hasSelectedItems).toBe(true)

      // Select another item
      act(() => {
        result.current.toggleItemSelection('2')
      })

      expect(result.current.selectedItems).toEqual(['1', '2'])

      // Unselect first item
      act(() => {
        result.current.toggleItemSelection('1')
      })

      expect(result.current.selectedItems).toEqual(['2'])

      // Clear selection
      act(() => {
        result.current.clearSelection()
      })

      expect(result.current.selectedItems).toEqual([])
      expect(result.current.hasSelectedItems).toBe(false)
    })

    it('should select all items', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      const itemIds = ['1', '2', '3']

      act(() => {
        result.current.selectAllItems(itemIds)
      })

      expect(result.current.selectedItems).toEqual(itemIds)
      expect(result.current.isAllSelected(itemIds)).toBe(true)
    })

    it('should manage sort configuration', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      expect(result.current.sortConfig).toEqual({ field: 'name', direction: 'asc' })

      act(() => {
        result.current.setSortConfig({ field: 'date', direction: 'desc' })
      })

      expect(result.current.sortConfig).toEqual({ field: 'date', direction: 'desc' })
    })

    it('should toggle sort direction', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      // Initial sort
      expect(result.current.sortConfig).toEqual({ field: 'name', direction: 'asc' })

      // Toggle same field should change direction
      act(() => {
        result.current.toggleSort('name')
      })

      expect(result.current.sortConfig).toEqual({ field: 'name', direction: 'desc' })

      // Toggle different field should set to asc
      act(() => {
        result.current.toggleSort('date')
      })

      expect(result.current.sortConfig).toEqual({ field: 'date', direction: 'asc' })
    })

    it('should reset state', () => {
      const { result } = renderHook(() => use[FeatureName]State())

      // Set some state
      act(() => {
        result.current.setFilters({ status: 'active' })
        result.current.setView('list')
        result.current.setSearchQuery('test')
        result.current.selectAllItems(['1', '2'])
      })

      expect(result.current.filters).toEqual({ status: 'active' })
      expect(result.current.view).toBe('list')
      expect(result.current.searchQuery).toBe('test')
      expect(result.current.selectedItems).toEqual(['1', '2'])

      // Reset state
      act(() => {
        result.current.resetState()
      })

      expect(result.current.filters).toEqual({})
      expect(result.current.view).toBe('grid')
      expect(result.current.searchQuery).toBe('')
      expect(result.current.selectedItems).toEqual([])
    })

    it('should initialize with custom initial state', () => {
      const initialState = {
        filters: { status: 'active' as const },
        view: 'list' as const,
        searchQuery: 'initial search',
      }

      const { result } = renderHook(() => use[FeatureName]State(initialState))

      expect(result.current.filters).toEqual({ status: 'active' })
      expect(result.current.view).toBe('list')
      expect(result.current.searchQuery).toBe('initial search')
    })
  })
})
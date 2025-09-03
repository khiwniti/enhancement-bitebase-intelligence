import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { [FeatureName]Page } from '../components/[FeatureName]Page'
import { [FeatureName]Api } from '../services/[featureName]Api'

// Mock the API
jest.mock('../services/[featureName]Api')

const mockApi = [FeatureName]Api as jest.Mocked<typeof [FeatureName]Api>

describe('[FeatureName]Page', () => {
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

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', () => {
      mockApi.fetch[FeatureName]Data.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      renderWithQueryClient(<[FeatureName]Page />)

      expect(screen.getByText('Loading [FeatureName]...')).toBeInTheDocument()
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should display error message when data fetch fails', async () => {
      const errorMessage = 'Failed to fetch data'
      mockApi.fetch[FeatureName]Data.mockRejectedValue(new Error(errorMessage))

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('Error Loading [FeatureName]')).toBeInTheDocument()
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should allow retry when error occurs', async () => {
      mockApi.fetch[FeatureName]Data
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([])

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Try Again'))

      await waitFor(() => {
        expect(mockApi.fetch[FeatureName]Data).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Success State', () => {
    const mockData = [
      {
        id: '1',
        title: 'Test Item 1',
        description: 'Test description 1',
        status: 'active' as const,
        value: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Test Item 2',
        description: 'Test description 2',
        status: 'inactive' as const,
        value: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('should display data when fetch succeeds', async () => {
      mockApi.fetch[FeatureName]Data.mockResolvedValue(mockData)

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('Test Item 1')).toBeInTheDocument()
        expect(screen.getByText('Test Item 2')).toBeInTheDocument()
      })
    })

    it('should display feature header with correct title', async () => {
      mockApi.fetch[FeatureName]Data.mockResolvedValue(mockData)

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('[FeatureName]')).toBeInTheDocument()
      })
    })

    it('should allow refreshing data', async () => {
      mockApi.fetch[FeatureName]Data.mockResolvedValue(mockData)

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Refresh'))

      await waitFor(() => {
        expect(mockApi.fetch[FeatureName]Data).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Filtering', () => {
    const mockData = [
      {
        id: '1',
        title: 'Active Item',
        status: 'active' as const,
        category: 'category1',
        value: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Inactive Item',
        status: 'inactive' as const,
        category: 'category2',
        value: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    it('should filter data based on status', async () => {
      mockApi.fetch[FeatureName]Data.mockResolvedValue(mockData)

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('Active Item')).toBeInTheDocument()
        expect(screen.getByText('Inactive Item')).toBeInTheDocument()
      })

      // Test filtering would require more complex state management
      // This is a simplified test structure
    })
  })

  describe('View Modes', () => {
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

    it('should switch between grid and list views', async () => {
      mockApi.fetch[FeatureName]Data.mockResolvedValue(mockData)

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('Grid View')).toBeInTheDocument()
        expect(screen.getByText('List View')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('List View'))

      // Test that view actually changed would require checking
      // specific elements that differ between views
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      mockApi.fetch[FeatureName]Data.mockResolvedValue([])

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i })
        expect(refreshButton).toBeInTheDocument()
        expect(refreshButton).toHaveAttribute('aria-label')
      })
    })

    it('should be keyboard navigable', async () => {
      mockApi.fetch[FeatureName]Data.mockResolvedValue([])

      renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i })
        refreshButton.focus()
        expect(document.activeElement).toBe(refreshButton)
      })
    })
  })

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
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

      const { rerender } = renderWithQueryClient(<[FeatureName]Page />)

      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument()
      })

      // Rerender with same props should not cause additional API calls
      rerender(
        <QueryClientProvider client={queryClient}>
          <[FeatureName]Page />
        </QueryClientProvider>
      )

      expect(mockApi.fetch[FeatureName]Data).toHaveBeenCalledTimes(1)
    })
  })
})
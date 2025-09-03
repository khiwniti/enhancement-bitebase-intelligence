import { [FeatureName]Api } from '../services/[featureName]Api'
import { [featureName]Cache } from '../services/[featureName]Cache'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toDate: () => new Date() })),
  },
}))

describe('[FeatureName]Api', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    [featureName]Cache.clear()
  })

  describe('fetch[FeatureName]Data', () => {
    it('should fetch data without filters', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Item',
          status: 'active',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        },
      ]

      const mockSnapshot = {
        docs: mockData.map(item => ({
          id: item.id,
          data: () => item,
        })),
      }

      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValue(mockSnapshot)

      const result = await [FeatureName]Api.fetch[FeatureName]Data()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
      expect(result[0].title).toBe('Test Item')
    })

    it('should apply status filter', async () => {
      const { where, query } = require('firebase/firestore')
      where.mockReturnValue({})
      query.mockReturnValue({})

      const mockSnapshot = { docs: [] }
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValue(mockSnapshot)

      await [FeatureName]Api.fetch[FeatureName]Data({ status: 'active' })

      expect(where).toHaveBeenCalledWith('status', '==', 'active')
    })

    it('should handle API errors gracefully', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockRejectedValue(new Error('Network error'))

      await expect([FeatureName]Api.fetch[FeatureName]Data()).rejects.toThrow(
        'Failed to fetch [featureName] data'
      )
    })

    it('should use cache when available', async () => {
      const cachedData = [{ id: '1', title: 'Cached Item' }]
      [featureName]Cache.set('[featureName]_data_{}', cachedData)

      const result = await [FeatureName]Api.fetch[FeatureName]Data()

      expect(result).toEqual(cachedData)
    })
  })

  describe('fetch[FeatureName]Item', () => {
    it('should fetch single item by ID', async () => {
      const mockDoc = {
        exists: () => true,
        id: '1',
        data: () => ({
          title: 'Test Item',
          status: 'active',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      }

      const { getDoc } = require('firebase/firestore')
      getDoc.mockResolvedValue(mockDoc)

      const result = await [FeatureName]Api.fetch[FeatureName]Item('1')

      expect(result.id).toBe('1')
      expect(result.title).toBe('Test Item')
    })

    it('should throw error when item not found', async () => {
      const mockDoc = {
        exists: () => false,
      }

      const { getDoc } = require('firebase/firestore')
      getDoc.mockResolvedValue(mockDoc)

      await expect([FeatureName]Api.fetch[FeatureName]Item('nonexistent')).rejects.toThrow(
        '[FeatureName] item not found'
      )
    })
  })

  describe('create[FeatureName]Item', () => {
    it('should create new item successfully', async () => {
      const newItemData = {
        title: 'New Item',
        description: 'Test description',
        status: 'active' as const,
      }

      const mockDocRef = { id: 'new-id' }
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValue(mockDocRef)

      // Mock the fetch call that happens after creation
      const mockCreatedItem = { id: 'new-id', ...newItemData }
      jest.spyOn([FeatureName]Api, 'fetch[FeatureName]Item').mockResolvedValue(mockCreatedItem)

      const result = await [FeatureName]Api.create[FeatureName]Item(newItemData)

      expect(addDoc).toHaveBeenCalled()
      expect(result.id).toBe('new-id')
      expect(result.title).toBe('New Item')
    })

    it('should clear cache after creation', async () => {
      const newItemData = {
        title: 'New Item',
        status: 'active' as const,
      }

      // Set up cache
      [featureName]Cache.set('[featureName]_data_test', ['cached'])
      [featureName]Cache.set('[featureName]_stats_test', { total: 1 })

      const mockDocRef = { id: 'new-id' }
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValue(mockDocRef)

      jest.spyOn([FeatureName]Api, 'fetch[FeatureName]Item').mockResolvedValue({
        id: 'new-id',
        ...newItemData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await [FeatureName]Api.create[FeatureName]Item(newItemData)

      // Cache should be cleared
      expect([featureName]Cache.get('[featureName]_data_test')).toBeNull()
      expect([featureName]Cache.get('[featureName]_stats_test')).toBeNull()
    })
  })

  describe('update[FeatureName]Item', () => {
    it('should update existing item', async () => {
      const updateData = { title: 'Updated Title' }

      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValue(undefined)

      const mockUpdatedItem = { id: '1', title: 'Updated Title' }
      jest.spyOn([FeatureName]Api, 'fetch[FeatureName]Item').mockResolvedValue(mockUpdatedItem)

      const result = await [FeatureName]Api.update[FeatureName]Item('1', updateData)

      expect(updateDoc).toHaveBeenCalled()
      expect(result.title).toBe('Updated Title')
    })
  })

  describe('delete[FeatureName]Item', () => {
    it('should delete item successfully', async () => {
      const { deleteDoc } = require('firebase/firestore')
      deleteDoc.mockResolvedValue(undefined)

      await [FeatureName]Api.delete[FeatureName]Item('1')

      expect(deleteDoc).toHaveBeenCalled()
    })

    it('should clear cache after deletion', async () => {
      // Set up cache
      [featureName]Cache.set('[featureName]_item_1', { id: '1' })
      [featureName]Cache.set('[featureName]_data_test', ['cached'])

      const { deleteDoc } = require('firebase/firestore')
      deleteDoc.mockResolvedValue(undefined)

      await [FeatureName]Api.delete[FeatureName]Item('1')

      // Cache should be cleared
      expect([featureName]Cache.get('[featureName]_item_1')).toBeNull()
      expect([featureName]Cache.get('[featureName]_data_test')).toBeNull()
    })
  })

  describe('fetch[FeatureName]Stats', () => {
    it('should calculate basic statistics', async () => {
      const mockData = [
        { id: '1', status: 'active', value: 100 },
        { id: '2', status: 'inactive', value: 200 },
        { id: '3', status: 'active', value: 150 },
      ]

      jest.spyOn([FeatureName]Api, 'fetch[FeatureName]Data').mockResolvedValue(mockData)

      const stats = await [FeatureName]Api.fetch[FeatureName]Stats()

      expect(stats.total).toBe(3)
      expect(stats.active).toBe(2)
      expect(stats.inactive).toBe(1)
      expect(stats.averageValue).toBe(150)
    })
  })
})
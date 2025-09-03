import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { [featureName]Cache } from './[featureName]Cache'
import type { [FeatureName]Data, [FeatureName]Filters, [FeatureName]CreateData, [FeatureName]UpdateData } from '../types'

/**
 * API client for [FeatureName] feature
 * 
 * This service handles all API interactions for the feature,
 * including data fetching, caching, and CRUD operations.
 */
export class [FeatureName]Api {
  private static readonly COLLECTION_NAME = '[featureName]'
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch [FeatureName] data with optional filtering
   */
  static async fetch[FeatureName]Data(filters?: [FeatureName]Filters): Promise<[FeatureName]Data[]> {
    const cacheKey = `[featureName]_data_${JSON.stringify(filters || {})}`
    
    // Check cache first
    const cachedData = [featureName]Cache.get<[FeatureName]Data[]>(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      let firestoreQuery = collection(db, this.COLLECTION_NAME)
      let queryRef = query(firestoreQuery)

      // Apply filters
      if (filters?.status) {
        queryRef = query(queryRef, where('status', '==', filters.status))
      }
      
      if (filters?.category) {
        queryRef = query(queryRef, where('category', '==', filters.category))
      }

      if (filters?.dateRange?.start) {
        queryRef = query(queryRef, where('createdAt', '>=', filters.dateRange.start))
      }

      if (filters?.dateRange?.end) {
        queryRef = query(queryRef, where('createdAt', '<=', filters.dateRange.end))
      }

      // Apply sorting
      if (filters?.sortBy) {
        const direction = filters.sortDirection || 'asc'
        queryRef = query(queryRef, orderBy(filters.sortBy, direction))
      } else {
        queryRef = query(queryRef, orderBy('createdAt', 'desc'))
      }

      // Apply limit
      if (filters?.limit) {
        queryRef = query(queryRef, limit(filters.limit))
      }

      const snapshot = await getDocs(queryRef)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as [FeatureName]Data[]

      // Cache the results
      [featureName]Cache.set(cacheKey, data, this.CACHE_TTL)

      return data
    } catch (error) {
      console.error('Error fetching [featureName] data:', error)
      throw new Error('Failed to fetch [featureName] data')
    }
  }

  /**
   * Fetch a single [FeatureName] item by ID
   */
  static async fetch[FeatureName]Item(id: string): Promise<[FeatureName]Data> {
    const cacheKey = `[featureName]_item_${id}`
    
    // Check cache first
    const cachedItem = [featureName]Cache.get<[FeatureName]Data>(cacheKey)
    if (cachedItem) {
      return cachedItem
    }

    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('[FeatureName] item not found')
      }

      const data = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
      } as [FeatureName]Data

      // Cache the result
      [featureName]Cache.set(cacheKey, data, this.CACHE_TTL)

      return data
    } catch (error) {
      console.error('Error fetching [featureName] item:', error)
      throw error
    }
  }

  /**
   * Fetch [FeatureName] statistics
   */
  static async fetch[FeatureName]Stats(filters?: [FeatureName]Filters): Promise<any> {
    const cacheKey = `[featureName]_stats_${JSON.stringify(filters || {})}`
    
    // Check cache first
    const cachedStats = [featureName]Cache.get<any>(cacheKey)
    if (cachedStats) {
      return cachedStats
    }

    try {
      // This would typically be a separate aggregation endpoint
      // For now, we'll calculate basic stats from the main data
      const data = await this.fetch[FeatureName]Data(filters)
      
      const stats = {
        total: data.length,
        active: data.filter(item => item.status === 'active').length,
        inactive: data.filter(item => item.status === 'inactive').length,
        averageValue: data.reduce((sum, item) => sum + (item.value || 0), 0) / data.length || 0,
        lastUpdated: new Date().toISOString(),
      }

      // Cache the results
      [featureName]Cache.set(cacheKey, stats, this.CACHE_TTL)

      return stats
    } catch (error) {
      console.error('Error fetching [featureName] stats:', error)
      throw new Error('Failed to fetch [featureName] statistics')
    }
  }

  /**
   * Create a new [FeatureName] item
   */
  static async create[FeatureName]Item(data: [FeatureName]CreateData): Promise<[FeatureName]Data> {
    try {
      const now = Timestamp.now()
      const itemData = {
        ...data,
        createdAt: now,
        updatedAt: now,
        status: data.status || 'active',
      }

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), itemData)
      
      // Clear related cache
      [featureName]Cache.clear('[featureName]_data')
      [featureName]Cache.clear('[featureName]_stats')

      // Return the created item
      return this.fetch[FeatureName]Item(docRef.id)
    } catch (error) {
      console.error('Error creating [featureName] item:', error)
      throw new Error('Failed to create [featureName] item')
    }
  }

  /**
   * Update an existing [FeatureName] item
   */
  static async update[FeatureName]Item(id: string, data: [FeatureName]UpdateData): Promise<[FeatureName]Data> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      const updateData = {
        ...data,
        updatedAt: Timestamp.now(),
      }

      await updateDoc(docRef, updateData)
      
      // Clear related cache
      [featureName]Cache.delete(`[featureName]_item_${id}`)
      [featureName]Cache.clear('[featureName]_data')
      [featureName]Cache.clear('[featureName]_stats')

      // Return the updated item
      return this.fetch[FeatureName]Item(id)
    } catch (error) {
      console.error('Error updating [featureName] item:', error)
      throw new Error('Failed to update [featureName] item')
    }
  }

  /**
   * Delete a [FeatureName] item
   */
  static async delete[FeatureName]Item(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id)
      await deleteDoc(docRef)
      
      // Clear related cache
      [featureName]Cache.delete(`[featureName]_item_${id}`)
      [featureName]Cache.clear('[featureName]_data')
      [featureName]Cache.clear('[featureName]_stats')
    } catch (error) {
      console.error('Error deleting [featureName] item:', error)
      throw new Error('Failed to delete [featureName] item')
    }
  }

  /**
   * Bulk operations
   */
  static async bulk[FeatureName]Operation(
    operation: 'create' | 'update' | 'delete',
    items: any[]
  ): Promise<void> {
    try {
      // This would typically use Firebase batch operations
      // For simplicity, we'll process items sequentially
      for (const item of items) {
        switch (operation) {
          case 'create':
            await this.create[FeatureName]Item(item)
            break
          case 'update':
            await this.update[FeatureName]Item(item.id, item)
            break
          case 'delete':
            await this.delete[FeatureName]Item(item.id)
            break
        }
      }
    } catch (error) {
      console.error('Error in bulk [featureName] operation:', error)
      throw new Error(`Failed to perform bulk ${operation} operation`)
    }
  }
}
'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { apiClient } from '@/lib/api-client'
import { 
  Database,
  Plus,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Activity,
  BarChart3,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Key,
  Shield,
  Zap,
  Globe,
  Server,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'syncing' | 'error'
  lastSync: string
  recordCount: number
  description: string
  logo: string
  apiEndpoint?: string
  authType?: 'api_key' | 'oauth' | 'basic' | 'none'
  isActive: boolean
  syncFrequency: string
  dataTypes: string[]
  lastError?: string
  metrics: {
    totalRequests: number
    successRate: number
    avgResponseTime: number
    dataVolume: string
  }
}

interface NewDataSourceForm {
  name: string
  type: string
  description: string
  apiEndpoint: string
  authType: 'api_key' | 'oauth' | 'basic' | 'none'
  apiKey: string
  username: string
  password: string
  syncFrequency: string
}

export function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: '1',
      name: 'Wongnai',
      type: 'Restaurant Reviews',
      status: 'connected',
      lastSync: '2 minutes ago',
      recordCount: 45678,
      description: 'Restaurant reviews and ratings data from Thailand\'s leading food platform',
      logo: '🍽️',
      apiEndpoint: 'https://api.wongnai.com/v1',
      authType: 'api_key',
      isActive: true,
      syncFrequency: 'Every 15 minutes',
      dataTypes: ['Reviews', 'Ratings', 'Restaurant Info', 'Menu Items'],
      metrics: {
        totalRequests: 12450,
        successRate: 98.5,
        avgResponseTime: 245,
        dataVolume: '2.3 GB'
      }
    },
    {
      id: '2',
      name: 'FoodPanda',
      type: 'Delivery Platform',
      status: 'connected',
      lastSync: '5 minutes ago',
      recordCount: 23456,
      description: 'Food delivery orders, restaurant partnerships, and customer behavior data',
      logo: '🐼',
      apiEndpoint: 'https://api.foodpanda.com/v2',
      authType: 'oauth',
      isActive: true,
      syncFrequency: 'Every 10 minutes',
      dataTypes: ['Orders', 'Delivery Times', 'Restaurant Partners', 'Customer Data'],
      metrics: {
        totalRequests: 8920,
        successRate: 97.2,
        avgResponseTime: 312,
        dataVolume: '1.8 GB'
      }
    },
    {
      id: '3',
      name: 'GrabFood',
      type: 'Delivery Platform',
      status: 'syncing',
      lastSync: '1 hour ago',
      recordCount: 34567,
      description: 'Grab food delivery platform data with market share analytics',
      logo: '🚗',
      apiEndpoint: 'https://api.grab.com/food/v1',
      authType: 'api_key',
      isActive: true,
      syncFrequency: 'Every 20 minutes',
      dataTypes: ['Market Share', 'Delivery Zones', 'Order Volume', 'Driver Analytics'],
      metrics: {
        totalRequests: 15670,
        successRate: 94.8,
        avgResponseTime: 428,
        dataVolume: '3.1 GB'
      }
    },
    {
      id: '4',
      name: 'LINE MAN',
      type: 'Delivery Platform',
      status: 'connected',
      lastSync: '10 minutes ago',
      recordCount: 18765,
      description: 'LINE MAN delivery service data with customer insights',
      logo: '💚',
      apiEndpoint: 'https://api.lineman.co.th/v1',
      authType: 'oauth',
      isActive: true,
      syncFrequency: 'Every 30 minutes',
      dataTypes: ['Delivery Data', 'Customer Behavior', 'Service Areas', 'Peak Hours'],
      metrics: {
        totalRequests: 6540,
        successRate: 96.7,
        avgResponseTime: 198,
        dataVolume: '1.2 GB'
      }
    },
    {
      id: '5',
      name: 'Google Maps',
      type: 'Location Data',
      status: 'error',
      lastSync: '2 hours ago',
      recordCount: 12345,
      description: 'Location and business information with Places API integration',
      logo: '🗺️',
      apiEndpoint: 'https://maps.googleapis.com/maps/api',
      authType: 'api_key',
      isActive: false,
      syncFrequency: 'Every hour',
      dataTypes: ['Business Listings', 'Reviews', 'Photos', 'Operating Hours'],
      lastError: 'API quota exceeded',
      metrics: {
        totalRequests: 3210,
        successRate: 89.2,
        avgResponseTime: 567,
        dataVolume: '890 MB'
      }
    },
    {
      id: '6',
      name: 'Thai Government Data',
      type: 'Demographics',
      status: 'disconnected',
      lastSync: 'Never',
      recordCount: 0,
      description: 'Population and economic statistics from official sources',
      logo: '🏛️',
      apiEndpoint: 'https://data.go.th/api/v1',
      authType: 'none',
      isActive: false,
      syncFrequency: 'Daily',
      dataTypes: ['Demographics', 'Economic Data', 'Business Licenses', 'Census Data'],
      metrics: {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        dataVolume: '0 MB'
      }
    }
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [newDataSourceForm, setNewDataSourceForm] = useState<NewDataSourceForm>({
    name: '',
    type: '',
    description: '',
    apiEndpoint: '',
    authType: 'api_key',
    apiKey: '',
    username: '',
    password: '',
    syncFrequency: 'Every 15 minutes'
  })

  // Filter data sources based on search and status
  const filteredDataSources = dataSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || source.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Sync all data sources
  const handleSyncAll = async () => {
    setIsLoading(true)
    try {
      await apiClient.dataSources.syncAll()

      // Update last sync times
      setDataSources(prev => prev.map(source => ({
        ...source,
        lastSync: 'Just now',
        status: source.status === 'error' ? 'connected' : source.status
      })))
    } catch (error) {
      console.error('Failed to sync data sources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add new data source
  const handleAddDataSource = async () => {
    setIsLoading(true)
    try {
      const credentials: Record<string, string> = {}
      if (newDataSourceForm.authType === 'api_key') {
        credentials.apiKey = newDataSourceForm.apiKey
      } else if (newDataSourceForm.authType === 'basic') {
        credentials.username = newDataSourceForm.username
        credentials.password = newDataSourceForm.password
      }

      const response = await apiClient.dataSources.create({
        name: newDataSourceForm.name,
        type: newDataSourceForm.type,
        description: newDataSourceForm.description,
        apiEndpoint: newDataSourceForm.apiEndpoint,
        authType: newDataSourceForm.authType,
        credentials,
        syncFrequency: newDataSourceForm.syncFrequency
      })

      const newSource: DataSource = {
        id: (response as any)?.id || Date.now().toString(),
        name: newDataSourceForm.name,
        type: newDataSourceForm.type,
        status: 'connected',
        lastSync: 'Just now',
        recordCount: 0,
        description: newDataSourceForm.description,
        logo: '🔗',
        apiEndpoint: newDataSourceForm.apiEndpoint,
        authType: newDataSourceForm.authType,
        isActive: true,
        syncFrequency: newDataSourceForm.syncFrequency,
        dataTypes: ['Custom Data'],
        metrics: {
          totalRequests: 0,
          successRate: 100,
          avgResponseTime: 0,
          dataVolume: '0 MB'
        }
      }

      setDataSources(prev => [...prev, newSource])
      setIsAddDialogOpen(false)
      setNewDataSourceForm({
        name: '',
        type: '',
        description: '',
        apiEndpoint: '',
        authType: 'api_key',
        apiKey: '',
        username: '',
        password: '',
        syncFrequency: 'Every 15 minutes'
      })
    } catch (error) {
      console.error('Failed to add data source:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-700'
      case 'syncing':
        return 'bg-blue-100 text-blue-700'
      case 'error':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  // Sync individual data source
  const handleSyncDataSource = async (sourceId: string) => {
    setDataSources(prev => prev.map(source =>
      source.id === sourceId
        ? { ...source, status: 'syncing' as const }
        : source
    ))

    try {
      await apiClient.dataSources.sync(sourceId)

      setDataSources(prev => prev.map(source =>
        source.id === sourceId
          ? { ...source, status: 'connected' as const, lastSync: 'Just now' }
          : source
      ))
    } catch (error) {
      console.error('Failed to sync data source:', error)
      setDataSources(prev => prev.map(source =>
        source.id === sourceId
          ? { ...source, status: 'error' as const, lastError: 'Sync failed' }
          : source
      ))
    }
  }

  // Test data source connection
  const handleTestConnection = async (sourceId: string) => {
    try {
      const result = await apiClient.dataSources.testConnection(sourceId)

      if ((result as any)?.success) {
        setDataSources(prev => prev.map(source =>
          source.id === sourceId
            ? { ...source, status: 'connected' as const, lastError: undefined }
            : source
        ))
      } else {
        setDataSources(prev => prev.map(source =>
          source.id === sourceId
            ? { ...source, status: 'error' as const, lastError: (result as any)?.error || 'Connection test failed' }
            : source
        ))
      }
    } catch (error) {
      console.error('Failed to test connection:', error)
      setDataSources(prev => prev.map(source =>
        source.id === sourceId
          ? { ...source, status: 'error' as const, lastError: 'Connection test failed' }
          : source
      ))
    }
  }

  const stats = [
    {
      title: 'Total Sources',
      value: '6',
      icon: Database,
      color: 'text-blue-600'
    },
    {
      title: 'Active Connections',
      value: '4',
      icon: Wifi,
      color: 'text-green-600'
    },
    {
      title: 'Total Records',
      value: '134.8K',
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      title: 'Last Updated',
      value: '2 min ago',
      icon: RefreshCw,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center">
            <Database className="w-8 h-8 mr-3 text-blue-600" />
            Data Sources
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your data connections and integrations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAll}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Data Source</DialogTitle>
                <DialogDescription>
                  Connect a new data source to expand your analytics capabilities
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newDataSourceForm.name}
                      onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Shopee Food"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Input
                      value={newDataSourceForm.type}
                      onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="e.g., Delivery Platform"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newDataSourceForm.description}
                    onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what data this source provides..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">API Endpoint</label>
                  <Input
                    value={newDataSourceForm.apiEndpoint}
                    onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                    placeholder="https://api.example.com/v1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Authentication Type</label>
                    <select
                      value={newDataSourceForm.authType}
                      onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, authType: e.target.value as any }))}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    >
                      <option value="api_key">API Key</option>
                      <option value="oauth">OAuth</option>
                      <option value="basic">Basic Auth</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sync Frequency</label>
                    <select
                      value={newDataSourceForm.syncFrequency}
                      onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, syncFrequency: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded-md"
                    >
                      <option value="Every 5 minutes">Every 5 minutes</option>
                      <option value="Every 15 minutes">Every 15 minutes</option>
                      <option value="Every 30 minutes">Every 30 minutes</option>
                      <option value="Every hour">Every hour</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                </div>
                {newDataSourceForm.authType === 'api_key' && (
                  <div>
                    <label className="text-sm font-medium">API Key</label>
                    <Input
                      type="password"
                      value={newDataSourceForm.apiKey}
                      onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your API key"
                    />
                  </div>
                )}
                {newDataSourceForm.authType === 'basic' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={newDataSourceForm.username}
                        onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Username"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <Input
                        type="password"
                        value={newDataSourceForm.password}
                        onChange={(e) => setNewDataSourceForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Password"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDataSource}
                  disabled={!newDataSourceForm.name || !newDataSourceForm.type || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {isLoading ? 'Adding...' : 'Add Source'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-4">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search data sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-slate-200 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="syncing">Syncing</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          {filteredDataSources.length} of {dataSources.length} sources
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDataSources.map((source) => (
          <Card key={source.id} className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{source.logo}</div>
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription>{source.type}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(source.status)}
                  <Badge className={getStatusColor(source.status)}>
                    {source.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">{source.description}</p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-blue-600" />
                    <span className="text-slate-600">Success Rate</span>
                  </div>
                  <div className="font-medium text-slate-900">{source.metrics.successRate}%</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-green-600" />
                    <span className="text-slate-600">Avg Response</span>
                  </div>
                  <div className="font-medium text-slate-900">{source.metrics.avgResponseTime}ms</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3 text-purple-600" />
                    <span className="text-slate-600">Requests</span>
                  </div>
                  <div className="font-medium text-slate-900">{source.metrics.totalRequests.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <div className="flex items-center space-x-1">
                    <Database className="w-3 h-3 text-orange-600" />
                    <span className="text-slate-600">Data Volume</span>
                  </div>
                  <div className="font-medium text-slate-900">{source.metrics.dataVolume}</div>
                </div>
              </div>

              {/* Data Types */}
              <div>
                <div className="text-xs text-slate-600 mb-2">Data Types:</div>
                <div className="flex flex-wrap gap-1">
                  {source.dataTypes.map((type, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Records:</span>
                  <span className="font-medium">{source.recordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Last Sync:</span>
                  <span className="font-medium">{source.lastSync}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Sync Frequency:</span>
                  <span className="font-medium">{source.syncFrequency}</span>
                </div>
              </div>

              {source.lastError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{source.lastError}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDataSource(source)
                    setIsDetailsDialogOpen(true)
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Config
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={source.status === 'syncing'}
                  onClick={() => handleSyncDataSource(source.id)}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${source.status === 'syncing' ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Integrations */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Shopee Food', logo: '🛒', type: 'Delivery Platform' },
            { name: 'Robinhood', logo: '🤖', type: 'Delivery Platform' },
            { name: 'Lalamove', logo: '🚚', type: 'Logistics' },
            { name: 'TrueYou', logo: '📱', type: 'Loyalty Program' }
          ].map((integration, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/50 border-dashed hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{integration.logo}</div>
                <h3 className="font-medium text-slate-900">{integration.name}</h3>
                <p className="text-xs text-slate-500">{integration.type}</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  Connect
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Flow */}
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Data Flow Overview
          </CardTitle>
          <CardDescription>Real-time data synchronization status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Data Ingestion</h3>
              <p className="text-sm text-slate-600">Collecting data from external sources</p>
              <Badge className="bg-green-100 text-green-700 mt-2">Active</Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Data Processing</h3>
              <p className="text-sm text-slate-600">Cleaning and transforming data</p>
              <Badge className="bg-blue-100 text-blue-700 mt-2">Processing</Badge>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900">Analytics Ready</h3>
              <p className="text-sm text-slate-600">Data available for analysis</p>
              <Badge className="bg-green-100 text-green-700 mt-2">Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Source Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <span className="text-2xl">{selectedDataSource?.logo}</span>
              <div>
                <div className="text-xl">{selectedDataSource?.name}</div>
                <div className="text-sm text-slate-600 font-normal">{selectedDataSource?.type}</div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Detailed information and configuration for this data source
            </DialogDescription>
          </DialogHeader>

          {selectedDataSource && (
            <div className="space-y-6 py-4">
              {/* Connection Status */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Connection Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Status:</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedDataSource.status)}
                        <Badge className={getStatusColor(selectedDataSource.status)}>
                          {selectedDataSource.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Last Sync:</span>
                      <span className="text-sm font-medium">{selectedDataSource.lastSync}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Sync Frequency:</span>
                      <span className="text-sm font-medium">{selectedDataSource.syncFrequency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Active:</span>
                      <Badge variant={selectedDataSource.isActive ? "default" : "secondary"}>
                        {selectedDataSource.isActive ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">API Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Endpoint:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">
                          {selectedDataSource.apiEndpoint}
                        </span>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Auth Type:</span>
                      <Badge variant="outline">{selectedDataSource.authType}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Records:</span>
                      <span className="text-sm font-medium">{selectedDataSource.recordCount.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedDataSource.metrics.successRate}%</div>
                      <div className="text-sm text-blue-700">Success Rate</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedDataSource.metrics.avgResponseTime}ms</div>
                      <div className="text-sm text-green-700">Avg Response</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedDataSource.metrics.totalRequests.toLocaleString()}</div>
                      <div className="text-sm text-purple-700">Total Requests</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{selectedDataSource.metrics.dataVolume}</div>
                      <div className="text-sm text-orange-700">Data Volume</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Available Data Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedDataSource.dataTypes.map((type, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                        <Database className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium">{type}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Error Information */}
              {selectedDataSource.lastError && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Error Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{selectedDataSource.lastError}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => selectedDataSource && handleTestConnection(selectedDataSource.id)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
                <Button
                  variant="outline"
                  disabled={selectedDataSource.status === 'syncing'}
                  onClick={() => selectedDataSource && handleSyncDataSource(selectedDataSource.id)}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${selectedDataSource.status === 'syncing' ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  Database,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Filter,
  Settings,
  RefreshCw
} from 'lucide-react'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf'
  dateRange: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'all_time' | 'custom'
  includeAnalytics: boolean
  includeLocations: boolean
  includeReports: boolean
  includeCustomers: boolean
  includeCompetitors: boolean
  customStartDate?: string
  customEndDate?: string
}

interface ExportJob {
  id: string
  type: 'export' | 'import'
  format: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  startTime: Date
  endTime?: Date
  fileSize?: number
  recordCount?: number
  downloadUrl?: string
  error?: string
}

interface DataStats {
  totalRecords: number
  analyticsRecords: number
  locationRecords: number
  reportRecords: number
  customerRecords: number
  competitorRecords: number
  lastUpdated: Date
  dataSize: number // in MB
}

interface DataExportImportProps {
  className?: string
}

export function DataExportImport({ className = '' }: DataExportImportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    dateRange: 'last_30_days',
    includeAnalytics: true,
    includeLocations: true,
    includeReports: true,
    includeCustomers: false,
    includeCompetitors: true
  })

  const [exportJobs, setExportJobs] = useState<ExportJob[]>([])
  const [dataStats, setDataStats] = useState<DataStats>({
    totalRecords: 15420,
    analyticsRecords: 8500,
    locationRecords: 2300,
    reportRecords: 1200,
    customerRecords: 2800,
    competitorRecords: 620,
    lastUpdated: new Date(),
    dataSize: 45.2
  })

  const [activeTab, setActiveTab] = useState('export')
  const [isProcessing, setIsProcessing] = useState(false)

  const startExport = useCallback(async () => {
    setIsProcessing(true)
    
    const newJob: ExportJob = {
      id: `export_${Date.now()}`,
      type: 'export',
      format: exportOptions.format,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    }
    
    setExportJobs(prev => [newJob, ...prev])
    
    // Simulate export process
    const jobId = newJob.id
    let progress = 0
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15
      if (progress > 100) progress = 100
      
      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              progress,
              status: progress === 100 ? 'completed' : 'processing',
              endTime: progress === 100 ? new Date() : undefined,
              fileSize: progress === 100 ? Math.floor(Math.random() * 50 + 10) : undefined,
              recordCount: progress === 100 ? Math.floor(Math.random() * 10000 + 5000) : undefined,
              downloadUrl: progress === 100 ? `/downloads/${jobId}.${exportOptions.format}` : undefined
            }
          : job
      ))
      
      if (progress >= 100) {
        clearInterval(progressInterval)
        setIsProcessing(false)
      }
    }, 500)
    
  }, [exportOptions])

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    
    const newJob: ExportJob = {
      id: `import_${Date.now()}`,
      type: 'import',
      format: file.name.split('.').pop() || 'unknown',
      status: 'pending',
      progress: 0,
      startTime: new Date(),
      fileSize: Math.round(file.size / 1024 / 1024 * 100) / 100 // MB
    }
    
    setExportJobs(prev => [newJob, ...prev])
    
    // Simulate import process
    const jobId = newJob.id
    let progress = 0
    
    const progressInterval = setInterval(() => {
      progress += Math.random() * 12
      if (progress > 100) progress = 100
      
      setExportJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              progress,
              status: progress === 100 ? 'completed' : 'processing',
              endTime: progress === 100 ? new Date() : undefined,
              recordCount: progress === 100 ? Math.floor(Math.random() * 5000 + 1000) : undefined
            }
          : job
      ))
      
      if (progress >= 100) {
        clearInterval(progressInterval)
        setIsProcessing(false)
      }
    }, 600)
    
    // Reset file input
    event.target.value = ''
  }, [])

  const downloadFile = (job: ExportJob) => {
    // In a real app, this would trigger the actual download
    console.log(`Downloading ${job.downloadUrl}`)
    alert(`Download started for ${job.format.toUpperCase()} file`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/50'
      case 'processing':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50'
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500/50'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'json':
        return <Database className="h-4 w-4" />
      case 'csv':
        return <FileText className="h-4 w-4" />
      case 'excel':
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'pdf':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const calculateEstimatedSize = () => {
    let size = 0
    if (exportOptions.includeAnalytics) size += 15.2
    if (exportOptions.includeLocations) size += 8.5
    if (exportOptions.includeReports) size += 12.3
    if (exportOptions.includeCustomers) size += 6.8
    if (exportOptions.includeCompetitors) size += 2.4
    
    // Adjust for date range
    const multipliers = {
      'last_7_days': 0.1,
      'last_30_days': 0.4,
      'last_90_days': 0.8,
      'last_year': 1.0,
      'all_time': 1.2,
      'custom': 1.0
    }
    
    return Math.round(size * (multipliers[exportOptions.dateRange] || 1) * 100) / 100
  }

  const renderExportTab = () => (
    <div className="space-y-6">
      {/* Export Configuration */}
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            Export Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure your data export preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Export Format</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { format: 'json', label: 'JSON', description: 'Structured data' },
                { format: 'csv', label: 'CSV', description: 'Spreadsheet compatible' },
                { format: 'excel', label: 'Excel', description: 'Microsoft Excel' },
                { format: 'pdf', label: 'PDF', description: 'Report format' }
              ].map((option) => (
                <Button
                  key={option.format}
                  variant="outline"
                  onClick={() => setExportOptions(prev => ({ ...prev, format: option.format as any }))}
                  className={`h-auto p-4 flex flex-col items-center gap-2 ${
                    exportOptions.format === option.format
                      ? 'bg-green-500/20 text-green-400 border-green-500/50'
                      : 'border-gray-600 text-gray-400 hover:text-white'
                  }`}
                >
                  {getFormatIcon(option.format)}
                  <div className="text-center">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs opacity-70">{option.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Date Range</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: 'last_7_days', label: 'Last 7 Days' },
                { value: 'last_30_days', label: 'Last 30 Days' },
                { value: 'last_90_days', label: 'Last 90 Days' },
                { value: 'last_year', label: 'Last Year' },
                { value: 'all_time', label: 'All Time' },
                { value: 'custom', label: 'Custom Range' }
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setExportOptions(prev => ({ ...prev, dateRange: option.value as any }))}
                  className={`${
                    exportOptions.dateRange === option.value
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                      : 'border-gray-600 text-gray-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Data Types */}
          <div className="space-y-3">
            <h4 className="text-white font-medium">Include Data Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'includeAnalytics', label: 'Analytics Data', icon: <TrendingUp className="h-4 w-4" />, records: dataStats.analyticsRecords },
                { key: 'includeLocations', label: 'Location Data', icon: <MapPin className="h-4 w-4" />, records: dataStats.locationRecords },
                { key: 'includeReports', label: 'Reports', icon: <FileText className="h-4 w-4" />, records: dataStats.reportRecords },
                { key: 'includeCustomers', label: 'Customer Data', icon: <Users className="h-4 w-4" />, records: dataStats.customerRecords },
                { key: 'includeCompetitors', label: 'Competitor Data', icon: <Zap className="h-4 w-4" />, records: dataStats.competitorRecords }
              ].map((option) => (
                <div
                  key={option.key}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    exportOptions[option.key as keyof ExportOptions]
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setExportOptions(prev => ({ 
                    ...prev, 
                    [option.key]: !prev[option.key as keyof ExportOptions] 
                  }))}
                >
                  <div className="flex items-center gap-3">
                    {option.icon}
                    <div>
                      <div className="text-white font-medium">{option.label}</div>
                      <div className="text-gray-400 text-sm">{formatNumber(option.records)} records</div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    exportOptions[option.key as keyof ExportOptions]
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-600'
                  }`}>
                    {exportOptions[option.key as keyof ExportOptions] && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Export Summary</span>
              <Badge variant="outline" className="text-green-400 border-green-400">
                ~{calculateEstimatedSize()} MB
              </Badge>
            </div>
            <div className="text-gray-400 text-sm">
              Format: {exportOptions.format.toUpperCase()} • 
              Range: {exportOptions.dateRange.replace('_', ' ')} • 
              Types: {Object.values(exportOptions).filter(v => typeof v === 'boolean' && v).length} selected
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={startExport}
            disabled={isProcessing}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processing Export...' : 'Start Export'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderImportTab = () => (
    <div className="space-y-6">
      {/* Import Area */}
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-400" />
            Import Data
          </CardTitle>
          <CardDescription className="text-gray-400">
            Upload data files to import into your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
            <div className="relative">
              <input
                type="file"
                accept=".json,.csv,.xlsx,.xls"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <div className="space-y-3">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-white font-medium">Drop files here or click to browse</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Supports JSON, CSV, and Excel files (max 100MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-white font-medium">JSON</div>
              <div className="text-gray-400 text-sm">Structured data format</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <FileText className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-white font-medium">CSV</div>
              <div className="text-gray-400 text-sm">Comma-separated values</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-white font-medium">Excel</div>
              <div className="text-gray-400 text-sm">Microsoft Excel files</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      {/* Job History */}
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            Recent Jobs
          </CardTitle>
          <CardDescription className="text-gray-400">
            Track your export and import operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exportJobs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400">No jobs yet</p>
                <p className="text-gray-500 text-sm">Your export and import history will appear here</p>
              </div>
            ) : (
              exportJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                      {job.type === 'export' ? (
                        <Download className="h-5 w-5 text-blue-400" />
                      ) : (
                        <Upload className="h-5 w-5 text-purple-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium capitalize">
                          {job.type} - {job.format.toUpperCase()}
                        </span>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="text-gray-400 text-sm">
                        Started: {job.startTime.toLocaleString()}
                        {job.endTime && ` • Completed: ${job.endTime.toLocaleString()}`}
                        {job.recordCount && ` • ${formatNumber(job.recordCount)} records`}
                        {job.fileSize && ` • ${job.fileSize} MB`}
                      </div>
                      
                      {job.status === 'processing' && (
                        <div className="mt-2">
                          <Progress value={job.progress} className="h-2" />
                          <div className="text-xs text-gray-400 mt-1">{Math.round(job.progress)}% complete</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && job.downloadUrl && job.type === 'export' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(job)}
                        className="border-gray-600 text-gray-400 hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                    
                    {job.status === 'failed' && (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                    
                    {job.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Statistics */}
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-green-400" />
            Data Statistics
          </CardTitle>
          <CardDescription className="text-gray-400">
            Overview of your dashboard data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{formatNumber(dataStats.totalRecords)}</div>
              <div className="text-gray-400 text-sm">Total Records</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{dataStats.dataSize} MB</div>
              <div className="text-gray-400 text-sm">Data Size</div>
            </div>
            <div className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{exportJobs.length}</div>
              <div className="text-gray-400 text-sm">Total Jobs</div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-gray-400 text-sm">
            Last updated: {dataStats.lastUpdated.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Data Management</h2>
          <p className="text-gray-400 mt-1">Export and import your dashboard data</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            {formatNumber(dataStats.totalRecords)} records
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400">
            {dataStats.dataSize} MB
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
          <TabsTrigger 
            value="export" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger 
            value="import" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Upload className="h-4 w-4" />
            Import
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          {renderExportTab()}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          {renderImportTab()}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {renderHistoryTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
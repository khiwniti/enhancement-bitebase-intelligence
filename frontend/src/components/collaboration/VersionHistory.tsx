"use client"

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface Operation {
  id: string
  type: string
  dashboard_id: string
  user_id: string
  timestamp: string
  path: string[]
  data: any
  version: number
  dependencies: string[]
}

interface VersionHistoryProps {
  operations: Operation[]
  currentVersion: number
  onClose: () => void
  onRestoreVersion?: (version: number) => void
  onViewDiff?: (fromVersion: number, toVersion: number) => void
  className?: string
}

interface VersionGroup {
  version: number
  operations: Operation[]
  timestamp: string
  users: string[]
  summary: string
}

const OperationIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type.toLowerCase()) {
    case 'insert':
      return <span className="text-green-600">➕</span>
    case 'delete':
      return <span className="text-red-600">🗑️</span>
    case 'update':
      return <span className="text-blue-600">✏️</span>
    case 'move':
      return <span className="text-purple-600">↔️</span>
    case 'style':
      return <span className="text-yellow-600">🎨</span>
    default:
      return <span className="text-gray-600">📝</span>
  }
}

const OperationDetails: React.FC<{ operation: Operation; isExpanded: boolean }> = ({ 
  operation, 
  isExpanded 
}) => {
  const formatPath = (path: string[]) => {
    if (path.length === 0) return 'Root'
    return path.join(' → ')
  }

  const getOperationDescription = () => {
    const pathStr = formatPath(operation.path)
    
    switch (operation.type.toLowerCase()) {
      case 'insert':
        return `Added element at ${pathStr}`
      case 'delete':
        return `Removed element from ${pathStr}`
      case 'update':
        return `Modified ${pathStr}`
      case 'move':
        return `Moved element in ${pathStr}`
      case 'style':
        return `Styled element at ${pathStr}`
      default:
        return `${operation.type} operation on ${pathStr}`
    }
  }

  return (
    <div className="text-xs text-gray-600 space-y-1">
      <div className="flex items-center gap-2">
        <OperationIcon type={operation.type} />
        <span>{getOperationDescription()}</span>
      </div>
      
      {isExpanded && (
        <div className="ml-4 space-y-1 bg-gray-50 rounded p-2">
          <div><strong>ID:</strong> {operation.id}</div>
          <div><strong>Path:</strong> {formatPath(operation.path)}</div>
          <div><strong>Type:</strong> {operation.type}</div>
          {operation.data && Object.keys(operation.data).length > 0 && (
            <div>
              <strong>Data:</strong>
              <pre className="text-xs bg-white p-1 rounded mt-1 overflow-x-auto">
                {JSON.stringify(operation.data, null, 2)}
              </pre>
            </div>
          )}
          {operation.dependencies.length > 0 && (
            <div>
              <strong>Dependencies:</strong> {operation.dependencies.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const VersionGroupComponent: React.FC<{
  versionGroup: VersionGroup
  currentVersion: number
  onRestore?: (version: number) => void
  onViewDiff?: (version: number) => void
}> = ({ versionGroup, currentVersion, onRestore, onViewDiff }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedOperations, setExpandedOperations] = useState<Set<string>>(new Set())
  
  const isCurrent = versionGroup.version === currentVersion
  const isNewer = versionGroup.version > currentVersion

  const toggleOperationExpansion = (operationId: string) => {
    setExpandedOperations(prev => {
      const next = new Set(prev)
      if (next.has(operationId)) {
        next.delete(operationId)
      } else {
        next.add(operationId)
      }
      return next
    })
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className={cn(
      "border rounded-lg p-3 transition-all",
      isCurrent ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white",
      isNewer && "opacity-60"
    )}>
      {/* Version Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
            isCurrent ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-700"
          )}>
            {versionGroup.version}
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-900">
              Version {versionGroup.version}
              {isCurrent && <span className="ml-2 text-xs text-blue-600">(Current)</span>}
            </div>
            <div className="text-xs text-gray-500">
              {formatTimestamp(versionGroup.timestamp)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? 'Hide' : 'Show'} details
          </button>
          
          {!isCurrent && onRestore && !isNewer && (
            <button
              onClick={() => onRestore(versionGroup.version)}
              className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Restore
            </button>
          )}
          
          {onViewDiff && versionGroup.version > 1 && (
            <button
              onClick={() => onViewDiff(versionGroup.version)}
              className="ml-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Diff
            </button>
          )}
        </div>
      </div>

      {/* Version Summary */}
      <div className="text-sm text-gray-700 mb-2">
        {versionGroup.summary}
      </div>

      {/* Contributors */}
      {versionGroup.users.length > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs text-gray-500">Contributors:</span>
          {versionGroup.users.map((user, index) => (
            <span key={user} className="text-xs text-gray-700">
              {user}{index < versionGroup.users.length - 1 && ', '}
            </span>
          ))}
        </div>
      )}

      {/* Operations List */}
      {isExpanded && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-600">
            Operations ({versionGroup.operations.length})
          </div>
          
          {versionGroup.operations.map((operation) => (
            <div key={operation.id} className="border border-gray-100 rounded p-2">
              <div 
                className="cursor-pointer"
                onClick={() => toggleOperationExpansion(operation.id)}
              >
                <OperationDetails 
                  operation={operation} 
                  isExpanded={expandedOperations.has(operation.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  operations,
  currentVersion,
  onClose,
  onRestoreVersion,
  onViewDiff,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Group operations by version
  const versionGroups = useMemo(() => {
    const groups: Record<number, VersionGroup> = {}
    
    operations.forEach(operation => {
      const version = operation.version
      
      if (!groups[version]) {
        groups[version] = {
          version,
          operations: [],
          timestamp: operation.timestamp,
          users: [],
          summary: ''
        }
      }
      
      groups[version].operations.push(operation)
      
      // Track unique users
      if (!groups[version].users.includes(operation.user_id)) {
        groups[version].users.push(operation.user_id)
      }
      
      // Update timestamp to latest
      if (new Date(operation.timestamp) > new Date(groups[version].timestamp)) {
        groups[version].timestamp = operation.timestamp
      }
    })
    
    // Generate summaries
    Object.values(groups).forEach(group => {
      const operationTypes = group.operations.reduce((acc, op) => {
        acc[op.type] = (acc[op.type] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const summaryParts = Object.entries(operationTypes).map(([type, count]) => 
        `${count} ${type}${count > 1 ? 's' : ''}`
      )
      
      group.summary = summaryParts.join(', ')
    })
    
    return Object.values(groups)
  }, [operations])

  // Filter and sort version groups
  const filteredAndSortedGroups = useMemo(() => {
    let filtered = versionGroups

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(group => 
        group.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.users.some(user => user.toLowerCase().includes(searchTerm.toLowerCase())) ||
        group.operations.some(op => 
          op.path.join(' ').toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filter by operation type
    if (filterType !== 'all') {
      filtered = filtered.filter(group =>
        group.operations.some(op => op.type.toLowerCase() === filterType.toLowerCase())
      )
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.version - a.version
      } else {
        return a.version - b.version
      }
    })
  }, [versionGroups, searchTerm, filterType, sortOrder])

  const operationTypes = useMemo(() => {
    const types = new Set(operations.map(op => op.type))
    return Array.from(types)
  }, [operations])

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 shadow-lg h-full flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Version History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search operations..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All types</option>
              {operationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-3 text-xs text-gray-500">
          Showing {filteredAndSortedGroups.length} of {versionGroups.length} versions
          {currentVersion > 0 && (
            <span className="ml-2">• Current: v{currentVersion}</span>
          )}
        </div>
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredAndSortedGroups.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">
              {searchTerm || filterType !== 'all' ? 'No matching versions found' : 'No version history available'}
            </p>
            <p className="text-xs mt-1">
              {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Start making changes to see version history'}
            </p>
          </div>
        ) : (
          filteredAndSortedGroups.map((group) => (
            <VersionGroupComponent
              key={group.version}
              versionGroup={group}
              currentVersion={currentVersion}
              onRestore={onRestoreVersion}
              onViewDiff={(version) => onViewDiff?.(version - 1, version)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 space-y-1">
          <div>💡 <strong>Tip:</strong> Click on version numbers to expand details</div>
          <div>🔄 Use "Restore" to revert to a previous version</div>
          <div>📊 Use "Diff" to compare changes between versions</div>
        </div>
      </div>
    </div>
  )
}

export default VersionHistory
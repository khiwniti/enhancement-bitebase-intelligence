'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Settings, 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Edit,
  TestTube
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface POSIntegration {
  id: string;
  restaurantId: string;
  provider: string;
  providerName: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error' | 'pending';
  lastSync: string | null;
  syncInterval: number;
  enabledDataTypes: string[];
  errorCount: number;
  totalSyncs: number;
  successfulSyncs: number;
  averageSyncDuration: number;
  createdAt: string;
}

interface POSIntegrationListProps {
  onUpdate: () => void;
}

export default function POSIntegrationList({ onUpdate }: POSIntegrationListProps) {
  const [integrations, setIntegrations] = useState<POSIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockIntegrations: POSIntegration[] = [
        {
          id: '1',
          restaurantId: 'rest-1',
          provider: 'square',
          providerName: 'Square POS',
          status: 'connected',
          lastSync: '2024-01-15T10:30:00Z',
          syncInterval: 15,
          enabledDataTypes: ['sales', 'menu_items', 'inventory', 'customers'],
          errorCount: 0,
          totalSyncs: 245,
          successfulSyncs: 242,
          averageSyncDuration: 42.5,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          restaurantId: 'rest-1',
          provider: 'toast',
          providerName: 'Toast POS',
          status: 'syncing',
          lastSync: '2024-01-15T10:25:00Z',
          syncInterval: 30,
          enabledDataTypes: ['sales', 'orders', 'staff'],
          errorCount: 2,
          totalSyncs: 156,
          successfulSyncs: 154,
          averageSyncDuration: 38.2,
          createdAt: '2024-01-05T00:00:00Z'
        },
        {
          id: '3',
          restaurantId: 'rest-2',
          provider: 'clover',
          providerName: 'Clover',
          status: 'error',
          lastSync: '2024-01-14T15:20:00Z',
          syncInterval: 60,
          enabledDataTypes: ['sales', 'inventory', 'payments'],
          errorCount: 5,
          totalSyncs: 89,
          successfulSyncs: 84,
          averageSyncDuration: 55.1,
          createdAt: '2024-01-10T00:00:00Z'
        },
        {
          id: '4',
          restaurantId: 'rest-1',
          provider: 'lightspeed',
          providerName: 'Lightspeed',
          status: 'disconnected',
          lastSync: null,
          syncInterval: 15,
          enabledDataTypes: ['sales', 'menu_items'],
          errorCount: 0,
          totalSyncs: 0,
          successfulSyncs: 0,
          averageSyncDuration: 0,
          createdAt: '2024-01-14T00:00:00Z'
        }
      ];
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { color: 'border-[#74C365] text-[#74C365] bg-[#74C365]/10', icon: CheckCircle },
      syncing: { color: 'border-[#F4C431] text-[#F4C431] bg-[#F4C431]/10', icon: RefreshCw },
      error: { color: 'border-[#E23D28] text-[#E23D28] bg-[#E23D28]/10', icon: AlertTriangle },
      disconnected: { color: 'border-gray-400 text-gray-400 bg-gray-100', icon: WifiOff },
      pending: { color: 'border-blue-400 text-blue-400 bg-blue-50', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} capitalize`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getProviderLogo = (provider: string) => {
    const logos: { [key: string]: string } = {
      square: '🟦',
      toast: '🍞',
      clover: '🍀',
      lightspeed: '⚡',
      revel: '🎯'
    };
    return logos[provider] || '📱';
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const handleTestConnection = async (integrationId: string) => {
    try {
      // Simulate API call
      console.log('Testing connection for integration:', integrationId);
      // Update integration status to show testing
      setIntegrations(prev => prev.map(int =>
        int.id === integrationId
          ? { ...int, status: 'syncing' as const }
          : int
      ));

      // Simulate test delay
      setTimeout(() => {
        setIntegrations(prev => prev.map(int =>
          int.id === integrationId
            ? { ...int, status: 'connected' as const }
            : int
        ));
      }, 2000);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const handleSync = async (integrationId: string) => {
    try {
      console.log('Starting sync for integration:', integrationId);
      setIntegrations(prev => prev.map(int =>
        int.id === integrationId
          ? { ...int, status: 'syncing' as const }
          : int
      ));

      // Simulate sync delay
      setTimeout(() => {
        setIntegrations(prev => prev.map(int =>
          int.id === integrationId
            ? {
                ...int,
                status: 'connected' as const,
                lastSync: new Date().toISOString(),
                totalSyncs: int.totalSyncs + 1,
                successfulSyncs: int.successfulSyncs + 1
              }
            : int
        ));
        onUpdate();
      }, 3000);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleToggleSync = async (integrationId: string, enabled: boolean) => {
    console.log('Toggling sync for integration:', integrationId, enabled);
    // Implement sync toggle
  };

  const handleDelete = async (integrationId: string) => {
    if (confirm('Are you sure you want to delete this integration?')) {
      setIntegrations(prev => prev.filter(int => int.id !== integrationId));
      onUpdate();
    }
  };

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-[#74C365]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search integrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#74C365] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="connected">Connected</option>
          <option value="syncing">Syncing</option>
          <option value="error">Error</option>
          <option value="disconnected">Disconnected</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getProviderLogo(integration.provider)}</span>
                  <div>
                    <CardTitle className="text-lg font-mono">{integration.providerName}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.provider.toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTestConnection(integration.id)}>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Connection
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSync(integration.id)}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(integration.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Status</span>
                {getStatusBadge(integration.status)}
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Last Sync</span>
                <span className="text-sm text-gray-900 font-mono">
                  {formatLastSync(integration.lastSync)}
                </span>
              </div>

              {/* Sync Interval */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sync Interval</span>
                <span className="text-sm text-gray-900 font-mono">
                  {integration.syncInterval}m
                </span>
              </div>

              {/* Success Rate */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Success Rate</span>
                <span className="text-sm text-gray-900 font-mono">
                  {integration.totalSyncs > 0 
                    ? `${((integration.successfulSyncs / integration.totalSyncs) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>

              {/* Data Types */}
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Data Types</span>
                <div className="flex flex-wrap gap-1">
                  {integration.enabledDataTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Error Count */}
              {integration.errorCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Errors</span>
                  <Badge variant="outline" className="border-[#E23D28] text-[#E23D28]">
                    {integration.errorCount}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first POS integration to get started.'
            }
          </p>
        </div>
      )}
    </div>
  );
}

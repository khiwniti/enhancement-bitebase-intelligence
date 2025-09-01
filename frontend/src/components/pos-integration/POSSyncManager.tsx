'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Activity,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

interface SyncJob {
  id: string;
  integrationId: string;
  providerName: string;
  provider: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  dataTypes: string[];
  startedAt: string;
  completedAt?: string;
  progress: number;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorMessage?: string;
}

export default function POSSyncManager() {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchSyncJobs();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchSyncJobs, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchSyncJobs = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockJobs: SyncJob[] = [
        {
          id: '1',
          integrationId: 'int-1',
          providerName: 'Square POS',
          provider: 'square',
          status: 'running',
          dataTypes: ['sales', 'menu_items'],
          startedAt: '2024-01-15T10:30:00Z',
          progress: 65,
          recordsProcessed: 650,
          recordsCreated: 45,
          recordsUpdated: 580,
          recordsFailed: 25
        },
        {
          id: '2',
          integrationId: 'int-2',
          providerName: 'Toast POS',
          provider: 'toast',
          status: 'completed',
          dataTypes: ['sales', 'orders', 'staff'],
          startedAt: '2024-01-15T10:25:00Z',
          completedAt: '2024-01-15T10:28:00Z',
          progress: 100,
          recordsProcessed: 234,
          recordsCreated: 12,
          recordsUpdated: 220,
          recordsFailed: 2
        },
        {
          id: '3',
          integrationId: 'int-3',
          providerName: 'Clover',
          provider: 'clover',
          status: 'failed',
          dataTypes: ['inventory', 'payments'],
          startedAt: '2024-01-15T10:20:00Z',
          completedAt: '2024-01-15T10:22:00Z',
          progress: 30,
          recordsProcessed: 89,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsFailed: 89,
          errorMessage: 'API authentication failed'
        },
        {
          id: '4',
          integrationId: 'int-4',
          providerName: 'Lightspeed',
          provider: 'lightspeed',
          status: 'queued',
          dataTypes: ['sales', 'customers'],
          startedAt: '2024-01-15T10:35:00Z',
          progress: 0,
          recordsProcessed: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsFailed: 0
        }
      ];
      setSyncJobs(mockJobs);
    } catch (error) {
      console.error('Error fetching sync jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      running: { color: 'border-[#F4C431] text-[#F4C431] bg-[#F4C431]/10', icon: RefreshCw },
      completed: { color: 'border-[#74C365] text-[#74C365] bg-[#74C365]/10', icon: CheckCircle },
      failed: { color: 'border-[#E23D28] text-[#E23D28] bg-[#E23D28]/10', icon: AlertTriangle },
      queued: { color: 'border-blue-400 text-blue-400 bg-blue-50', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.queued;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} capitalize`}>
        <Icon className={`w-3 h-3 mr-1 ${status === 'running' ? 'animate-spin' : ''}`} />
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

  const formatDuration = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s`;
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ${diffSecs % 60}s`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  const handleBulkSync = async () => {
    console.log('Starting bulk sync...');
    // Implement bulk sync
  };

  const handleRetrySync = async (jobId: string) => {
    console.log('Retrying sync job:', jobId);
    // Implement retry logic
  };

  const handleCancelSync = async (jobId: string) => {
    console.log('Cancelling sync job:', jobId);
    // Implement cancel logic
  };

  const runningJobs = syncJobs.filter(job => job.status === 'running').length;
  const queuedJobs = syncJobs.filter(job => job.status === 'queued').length;
  const completedToday = syncJobs.filter(job => 
    job.status === 'completed' && 
    new Date(job.startedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      {/* Sync Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#F4C431]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{runningJobs}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-[#F4C431] animate-spin" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Queued</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{queuedJobs}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#74C365]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{completedToday}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-[#74C365]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#E23D28]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto Refresh</p>
                <p className="text-sm text-gray-900">{autoRefresh ? 'Enabled' : 'Disabled'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'text-[#74C365]' : 'text-gray-400'}
              >
                <Activity className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-3">
          <Button 
            onClick={handleBulkSync}
            className="bg-[#74C365] hover:bg-[#74C365]/90"
          >
            <Play className="w-4 h-4 mr-2" />
            Bulk Sync All
          </Button>
          <Button 
            variant="outline"
            onClick={fetchSyncJobs}
            className="border-[#74C365] text-[#74C365] hover:bg-[#74C365] hover:text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#74C365] focus:border-transparent">
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
        </div>
      </div>

      {/* Sync Jobs List */}
      <div className="space-y-4">
        {syncJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getProviderLogo(job.provider)}</span>
                  <div>
                    <CardTitle className="text-lg font-mono">{job.providerName}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>Sync Job #{job.id}</span>
                      <span>•</span>
                      <span>{formatDuration(job.startedAt, job.completedAt)}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(job.status)}
                  {job.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetrySync(job.id)}
                      className="border-[#E23D28] text-[#E23D28] hover:bg-[#E23D28] hover:text-white"
                    >
                      Retry
                    </Button>
                  )}
                  {job.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelSync(job.id)}
                      className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              {job.status === 'running' && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
              )}

              {/* Data Types */}
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Data Types</span>
                <div className="flex flex-wrap gap-2">
                  {job.dataTypes.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Processed</span>
                  <p className="font-mono font-semibold text-gray-900">{job.recordsProcessed.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Created</span>
                  <p className="font-mono font-semibold text-[#74C365]">{job.recordsCreated.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Updated</span>
                  <p className="font-mono font-semibold text-[#F4C431]">{job.recordsUpdated.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Failed</span>
                  <p className="font-mono font-semibold text-[#E23D28]">{job.recordsFailed.toLocaleString()}</p>
                </div>
              </div>

              {/* Error Message */}
              {job.errorMessage && (
                <div className="p-3 bg-[#E23D28]/10 border border-[#E23D28]/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#E23D28]" />
                    <span className="text-sm font-medium text-[#E23D28]">Error</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{job.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {syncJobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sync jobs found</h3>
          <p className="text-gray-600">
            Sync jobs will appear here when data synchronization is in progress.
          </p>
        </div>
      )}
    </div>
  );
}

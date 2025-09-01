'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
  Plus, 
  Settings, 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  BarChart3,
  MapPin,
  Zap,
  Shield
} from 'lucide-react';

// Import POS integration components
import POSIntegrationList from '@/components/pos-integration/POSIntegrationList';
import POSIntegrationCreator from '@/components/pos-integration/POSIntegrationCreator';
import POSSyncManager from '@/components/pos-integration/POSSyncManager';
import POSLocationManager from '@/components/pos-integration/POSLocationManager';
import POSAnalytics from '@/components/pos-integration/POSAnalytics';

interface POSIntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalSyncsToday: number;
  successfulSyncsToday: number;
  averageSyncDuration: number;
  providersUsed: string[];
}

export default function POSIntegrationPage() {
  const [stats, setStats] = useState<POSIntegrationStats>({
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalSyncsToday: 0,
    successfulSyncsToday: 0,
    averageSyncDuration: 0,
    providersUsed: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      setStats({
        totalIntegrations: 8,
        activeIntegrations: 7,
        totalSyncsToday: 156,
        successfulSyncsToday: 148,
        averageSyncDuration: 45.2,
        providersUsed: ['Square', 'Toast', 'Clover', 'Lightspeed']
      });
    } catch (error) {
      console.error('Error fetching POS integration stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const successRate = stats.totalSyncsToday > 0 
    ? ((stats.successfulSyncsToday / stats.totalSyncsToday) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-mono">
              POS Integration Management
            </h1>
            <p className="text-gray-600 mt-2">
              Advanced connector management with real-time sync and multi-location support
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={fetchStats}
              variant="outline"
              className="border-[#74C365] text-[#74C365] hover:bg-[#74C365] hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#74C365]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Database className="w-4 h-4 mr-2 text-[#74C365]" />
                Total Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {stats.totalIntegrations}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.activeIntegrations} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#F4C431]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-[#F4C431]" />
                Today's Syncs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {stats.totalSyncsToday}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.successfulSyncsToday} successful
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#E23D28]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-[#E23D28]" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {successRate}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                Avg Sync Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {stats.averageSyncDuration}s
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Per sync operation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-5 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#74C365] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Database className="w-4 h-4 mr-2" />
              Integrations
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'sync'
                  ? 'bg-[#74C365] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Manager
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'locations'
                  ? 'bg-[#74C365] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Locations
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-[#74C365] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#74C365] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 font-mono">
                  POS Integrations
                </h2>
                <POSIntegrationCreator onIntegrationCreated={fetchStats} />
              </div>
              <POSIntegrationList onUpdate={fetchStats} />
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 font-mono">
                  Synchronization Manager
                </h2>
                <Badge variant="outline" className="border-[#74C365] text-[#74C365]">
                  Real-time Monitoring
                </Badge>
              </div>
              <POSSyncManager />
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 font-mono">
                  Multi-Location Management
                </h2>
                <Badge variant="outline" className="border-[#F4C431] text-[#F4C431]">
                  {stats.providersUsed.length} Providers
                </Badge>
              </div>
              <POSLocationManager />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 font-mono">
                  Integration Analytics
                </h2>
                <Badge variant="outline" className="border-[#E23D28] text-[#E23D28]">
                  Performance Insights
                </Badge>
              </div>
              <POSAnalytics />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 font-mono">
                  Integration Settings
                </h2>
                <Badge variant="outline" className="border-gray-500 text-gray-500">
                  Global Configuration
                </Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 font-mono">
                      <Shield className="w-5 h-5 mr-2 text-[#74C365]" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Configure security and authentication settings for POS integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Key Rotation</span>
                      <Badge variant="outline" className="border-[#74C365] text-[#74C365]">
                        Enabled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Webhook Verification</span>
                      <Badge variant="outline" className="border-[#74C365] text-[#74C365]">
                        Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900 font-mono">
                      <Settings className="w-5 h-5 mr-2 text-[#F4C431]" />
                      Connection Settings
                    </CardTitle>
                    <CardDescription>
                      Configure connection and retry settings for POS integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Retry Attempts</span>
                      <Badge variant="outline" className="border-[#F4C431] text-[#F4C431]">
                        3 Times
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Timeout Duration</span>
                      <Badge variant="outline" className="border-[#F4C431] text-[#F4C431]">
                        30s
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

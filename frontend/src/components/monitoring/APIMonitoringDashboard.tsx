'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Server,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Globe,
  Users
} from 'lucide-react'

interface APIMetrics {
  period_hours: number
  total_requests: number
  error_rate: number
  avg_response_time: number
  throughput: number
  top_endpoints: Record<string, number>
  status_code_distribution: Record<string, number>
  error_endpoints: Record<string, number>
  generated_at: string
}

interface RateLimitStats {
  total_requests: number
  blocked_requests: number
  block_rate: number
  top_blocked_endpoints: Record<string, number>
  top_blocked_ips: Record<string, number>
  rule_violations: Record<string, number>
}

interface MonitoringAlert {
  id: string
  timestamp: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  metric_type: string
  threshold_value: number
  current_value: number
  endpoint?: string
  message: string
  resolved: boolean
  resolved_at?: string
}

const APIMonitoringDashboard: React.FC = () => {
  const [apiMetrics, setApiMetrics] = useState<APIMetrics | null>(null)
  const [rateLimitStats, setRateLimitStats] = useState<RateLimitStats | null>(null)
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('1')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMonitoringData()
    const interval = setInterval(fetchMonitoringData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const fetchMonitoringData = async () => {
    try {
      setLoading(true)
      
      // Fetch API metrics
      const metricsResponse = await fetch(`/api/v1/security/enterprise/monitoring/metrics?hours=${selectedPeriod}`)
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setApiMetrics(metricsData.data)
      }

      // Fetch rate limiting stats
      const rateLimitResponse = await fetch(`/api/v1/security/enterprise/rate-limiting/stats?hours=${selectedPeriod}`)
      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json()
        setRateLimitStats(rateLimitData.data)
      }

      // Fetch alerts
      const alertsResponse = await fetch('/api/v1/security/enterprise/monitoring/alerts')
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        setAlerts(alertsData.data.alerts)
      }

      setError(null)
    } catch (err) {
      setError('Failed to fetch monitoring data')
      console.error('Error fetching monitoring data:', err)
    } finally {
      setLoading(false)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/v1/security/enterprise/monitoring/alerts/${alertId}/resolve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setAlerts(alerts.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true, resolved_at: new Date().toISOString() } : alert
        ))
      }
    } catch (err) {
      console.error('Error resolving alert:', err)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'error': return 'bg-red-400'
      case 'warning': return 'bg-yellow-400'
      case 'info': return 'bg-blue-400'
      default: return 'bg-gray-400'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'info': return <CheckCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading && !apiMetrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Monitoring</h1>
          <p className="text-gray-600">Real-time API performance and security monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last Hour</SelectItem>
              <SelectItem value="6">Last 6 Hours</SelectItem>
              <SelectItem value="24">Last 24 Hours</SelectItem>
              <SelectItem value="168">Last Week</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchMonitoringData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="rate-limiting">Rate Limiting</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(apiMetrics?.total_requests || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Last {selectedPeriod} hour{selectedPeriod !== '1' ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apiMetrics?.error_rate.toFixed(1) || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    {apiMetrics?.error_rate && apiMetrics.error_rate < 5 ? 'Healthy' : 'Needs attention'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apiMetrics?.avg_response_time.toFixed(0) || 0}ms</div>
                  <p className="text-xs text-muted-foreground">
                    {apiMetrics?.avg_response_time && apiMetrics.avg_response_time < 1000 ? 'Fast' : 'Slow'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{apiMetrics?.throughput.toFixed(1) || 0}</div>
                  <p className="text-xs text-muted-foreground">requests/hour</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Top Endpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
                <CardDescription>Most frequently accessed endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(apiMetrics?.top_endpoints || {}).slice(0, 5).map(([endpoint, count]) => (
                    <div key={endpoint} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 mr-2">{endpoint}</span>
                      <Badge variant="secondary">{formatNumber(count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Code Distribution</CardTitle>
                <CardDescription>HTTP response status codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(apiMetrics?.status_code_distribution || {}).map(([code, count]) => (
                    <div key={code} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{code}</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`h-2 rounded-full ${
                            code.startsWith('2') ? 'bg-green-500' :
                            code.startsWith('3') ? 'bg-blue-500' :
                            code.startsWith('4') ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.max(10, (count / (apiMetrics?.total_requests || 1)) * 100)}px` 
                          }}
                        />
                        <Badge variant="outline">{formatNumber(count)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Performance charts and detailed metrics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rate-limiting" className="space-y-6">
          {/* Rate Limiting Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(rateLimitStats?.blocked_requests || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {rateLimitStats?.block_rate.toFixed(1) || 0}% block rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(rateLimitStats?.total_requests || 0)}</div>
                <p className="text-xs text-muted-foreground">Rate limit checks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rule Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.values(rateLimitStats?.rule_violations || {}).reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Across all rules</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Blocked */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Blocked Endpoints</CardTitle>
                <CardDescription>Endpoints with most rate limit violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(rateLimitStats?.top_blocked_endpoints || {}).slice(0, 5).map(([endpoint, count]) => (
                    <div key={endpoint} className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 mr-2">{endpoint}</span>
                      <Badge variant="destructive">{formatNumber(count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Blocked IPs</CardTitle>
                <CardDescription>IP addresses with most violations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(rateLimitStats?.top_blocked_ips || {}).slice(0, 5).map(([ip, count]) => (
                    <div key={ip} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{ip}</span>
                      <Badge variant="destructive">{formatNumber(count)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Current monitoring alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.filter(alert => !alert.resolved).map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)} text-white`}>
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(alert.timestamp).toLocaleString()}
                            {alert.endpoint && ` • ${alert.endpoint}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => resolveAlert(alert.id)}
                        variant="outline"
                        size="sm"
                      >
                        Resolve
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default APIMonitoringDashboard

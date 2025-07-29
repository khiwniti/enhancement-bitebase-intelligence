"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Users,
  AlertTriangle,
  Activity,
  Lock,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface SecurityOverview {
  rbac_overview: {
    user_statistics: {
      total_users: number;
      active_users: number;
      locked_users: number;
      inactive_users: number;
    };
    access_statistics: {
      recent_attempts: number;
      failed_attempts: number;
      success_rate: number;
    };
    security_alerts: Array<{
      type: string;
      severity: string;
      message: string;
      count?: number;
    }>;
    role_distribution: Record<string, number>;
  };
  audit_metrics: {
    period_days: number;
    total_events: number;
    failed_events: number;
    critical_events: number;
    success_rate: number;
    event_type_distribution: Record<string, number>;
    top_users: Record<string, number>;
    geographic_distribution: Record<string, number>;
  };
  recent_anomalies: Array<{
    type: string;
    severity: string;
    description: string;
    user_id?: string;
    ip_address?: string;
    count?: number;
  }>;
  security_score: number;
  last_updated: string;
}

interface AuditEvent {
  id: string;
  event_type: string;
  severity: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  resource_type?: string;
  resource_id?: string;
  action?: string;
  outcome: string;
  ip_address?: string;
  location?: {
    country?: string;
    city?: string;
  };
  metadata?: Record<string, any>;
}

export default function EnterpriseSecurityDashboard() {
  const [securityData, setSecurityData] = useState<SecurityOverview | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSecurityData();
    fetchRecentAuditEvents();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/v1/security/enterprise/security/overview');
      const result = await response.json();
      
      if (result.status === 'success') {
        setSecurityData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchRecentAuditEvents = async () => {
    try {
      const queryData = {
        limit: 50,
        offset: 0
      };
      
      const response = await fetch('/api/v1/security/enterprise/audit/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryData),
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        setAuditEvents(result.data.events);
      }
    } catch (error) {
      console.error('Failed to fetch audit events:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!securityData) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <p className="text-lg font-medium">Failed to load security data</p>
        <Button onClick={fetchSecurityData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Security</h1>
          <p className="text-muted-foreground">
            Comprehensive security monitoring and access control
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            Score: {securityData.security_score}/100
          </Badge>
          <Button
            onClick={fetchSecurityData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Score
          </CardTitle>
          <CardDescription>
            Overall security posture based on multiple factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Progress value={securityData.security_score} className="h-3" />
            </div>
            <div className="text-2xl font-bold">
              {securityData.security_score}/100
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Access Success</div>
              <div className="text-2xl font-bold text-green-600">
                {securityData.rbac_overview.access_statistics.success_rate}%
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Active Users</div>
              <div className="text-2xl font-bold text-blue-600">
                {securityData.rbac_overview.user_statistics.active_users}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Security Alerts</div>
              <div className="text-2xl font-bold text-yellow-600">
                {securityData.rbac_overview.security_alerts.length}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Anomalies</div>
              <div className="text-2xl font-bold text-red-600">
                {securityData.recent_anomalies.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rbac">Access Control</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Users</span>
                  <span className="font-medium">
                    {securityData.rbac_overview.user_statistics.total_users}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Active Users</span>
                  <span className="font-medium text-green-600">
                    {securityData.rbac_overview.user_statistics.active_users}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Locked Users</span>
                  <span className="font-medium text-red-600">
                    {securityData.rbac_overview.user_statistics.locked_users}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Inactive Users</span>
                  <span className="font-medium text-yellow-600">
                    {securityData.rbac_overview.user_statistics.inactive_users}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Access Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Access Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Recent Attempts</span>
                  <span className="font-medium">
                    {securityData.rbac_overview.access_statistics.recent_attempts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Failed Attempts</span>
                  <span className="font-medium text-red-600">
                    {securityData.rbac_overview.access_statistics.failed_attempts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate</span>
                  <span className="font-medium text-green-600">
                    {securityData.rbac_overview.access_statistics.success_rate}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Audit Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Audit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Events</span>
                  <span className="font-medium">
                    {securityData.audit_metrics.total_events}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Failed Events</span>
                  <span className="font-medium text-red-600">
                    {securityData.audit_metrics.failed_events}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Events</span>
                  <span className="font-medium text-orange-600">
                    {securityData.audit_metrics.critical_events}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Period</span>
                  <span className="font-medium">
                    {securityData.audit_metrics.period_days} days
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Alerts */}
          {securityData.rbac_overview.security_alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {securityData.rbac_overview.security_alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span>{alert.message}</span>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rbac" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(securityData.rbac_overview.role_distribution).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm">{role}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(securityData.rbac_overview.role_distribution))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(securityData.audit_metrics.geographic_distribution)
                    .slice(0, 5)
                    .map(([country, count]) => (
                      <div key={country} className="flex justify-between">
                        <span className="text-sm">{country}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
              <CardDescription>
                Latest security and access events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditEvents.slice(0, 10).map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getOutcomeIcon(event.outcome)}
                      <div>
                        <div className="font-medium text-sm">
                          {formatEventType(event.event_type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.user_email || event.user_id} • {event.ip_address}
                          {event.location?.country && ` • ${event.location.country}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor(event.severity)} className="text-xs">
                        {event.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Security Anomalies
              </CardTitle>
              <CardDescription>
                Detected unusual patterns and potential security threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityData.recent_anomalies.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium">No anomalies detected</p>
                  <p className="text-muted-foreground">
                    Your system appears to be operating normally
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityData.recent_anomalies.map((anomaly, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">{anomaly.type.replace('_', ' ').toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            {anomaly.description}
                          </div>
                          {anomaly.user_id && (
                            <div className="text-xs text-muted-foreground mt-1">
                              User: {anomaly.user_id}
                            </div>
                          )}
                          {anomaly.ip_address && (
                            <div className="text-xs text-muted-foreground">
                              IP: {anomaly.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

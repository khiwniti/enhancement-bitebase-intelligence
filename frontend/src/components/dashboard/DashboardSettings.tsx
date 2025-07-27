'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings,
  Bell,
  Palette,
  Database,
  Shield,
  Globe,
  Clock,
  Zap,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Tablet,
  User,
  Key,
  Mail,
  Lock
} from 'lucide-react'

interface DashboardPreferences {
  theme: 'dark' | 'light' | 'auto'
  accentColor: 'green' | 'blue' | 'purple' | 'orange'
  layout: 'tabs' | 'grid' | 'sidebar'
  realTimeUpdates: boolean
  updateInterval: number // seconds
  soundNotifications: boolean
  emailNotifications: boolean
  autoRefresh: boolean
  compactMode: boolean
  showTooltips: boolean
  animationsEnabled: boolean
}

interface NotificationSettings {
  criticalAlerts: boolean
  marketChanges: boolean
  competitorUpdates: boolean
  revenueThresholds: boolean
  customerMilestones: boolean
  systemUpdates: boolean
  emailDigest: 'daily' | 'weekly' | 'monthly' | 'never'
  pushNotifications: boolean
}

interface DataSettings {
  cacheEnabled: boolean
  cacheDuration: number // hours
  autoBackup: boolean
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  dataRetention: number // days
  exportFormat: 'json' | 'csv' | 'excel'
  apiTimeout: number // seconds
}

interface DashboardSettingsProps {
  className?: string
  onSettingsChange?: (settings: any) => void
}

export function DashboardSettings({ className = '', onSettingsChange }: DashboardSettingsProps) {
  const [preferences, setPreferences] = useState<DashboardPreferences>({
    theme: 'dark',
    accentColor: 'green',
    layout: 'tabs',
    realTimeUpdates: true,
    updateInterval: 30,
    soundNotifications: false,
    emailNotifications: true,
    autoRefresh: true,
    compactMode: false,
    showTooltips: true,
    animationsEnabled: true
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    criticalAlerts: true,
    marketChanges: true,
    competitorUpdates: true,
    revenueThresholds: true,
    customerMilestones: false,
    systemUpdates: true,
    emailDigest: 'weekly',
    pushNotifications: true
  })

  const [dataSettings, setDataSettings] = useState<DataSettings>({
    cacheEnabled: true,
    cacheDuration: 24,
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 90,
    exportFormat: 'json',
    apiTimeout: 30
  })

  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('dashboard-preferences')
    const savedNotifications = localStorage.getItem('dashboard-notifications')
    const savedDataSettings = localStorage.getItem('dashboard-data-settings')

    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences))
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
    if (savedDataSettings) {
      setDataSettings(JSON.parse(savedDataSettings))
    }
  }, [])

  const saveSettings = async () => {
    setIsSaving(true)
    
    try {
      // Save to localStorage
      localStorage.setItem('dashboard-preferences', JSON.stringify(preferences))
      localStorage.setItem('dashboard-notifications', JSON.stringify(notifications))
      localStorage.setItem('dashboard-data-settings', JSON.stringify(dataSettings))
      
      // Notify parent component
      if (onSettingsChange) {
        onSettingsChange({
          preferences,
          notifications,
          dataSettings
        })
      }
      
      setLastSaved(new Date())
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const resetSettings = () => {
    setPreferences({
      theme: 'dark',
      accentColor: 'green',
      layout: 'tabs',
      realTimeUpdates: true,
      updateInterval: 30,
      soundNotifications: false,
      emailNotifications: true,
      autoRefresh: true,
      compactMode: false,
      showTooltips: true,
      animationsEnabled: true
    })
    
    setNotifications({
      criticalAlerts: true,
      marketChanges: true,
      competitorUpdates: true,
      revenueThresholds: true,
      customerMilestones: false,
      systemUpdates: true,
      emailDigest: 'weekly',
      pushNotifications: true
    })
    
    setDataSettings({
      cacheEnabled: true,
      cacheDuration: 24,
      autoBackup: true,
      backupFrequency: 'daily',
      dataRetention: 90,
      exportFormat: 'json',
      apiTimeout: 30
    })
  }

  const exportSettings = () => {
    const settings = {
      preferences,
      notifications,
      dataSettings,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bitebase-dashboard-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)
        if (settings.preferences) setPreferences(settings.preferences)
        if (settings.notifications) setNotifications(settings.notifications)
        if (settings.dataSettings) setDataSettings(settings.dataSettings)
      } catch (error) {
        console.error('Failed to import settings:', error)
        alert('Invalid settings file')
      }
    }
    reader.readAsText(file)
  }

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-400" />
            Appearance
          </CardTitle>
          <CardDescription className="text-gray-400">
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Theme</Label>
              <div className="flex gap-2">
                {['dark', 'light', 'auto'].map((theme) => (
                  <Button
                    key={theme}
                    variant="outline"
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, theme: theme as any }))}
                    className={`capitalize ${
                      preferences.theme === theme
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'border-gray-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    {theme === 'dark' && <Monitor className="h-4 w-4 mr-1" />}
                    {theme === 'light' && <Eye className="h-4 w-4 mr-1" />}
                    {theme === 'auto' && <Zap className="h-4 w-4 mr-1" />}
                    {theme}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Accent Color</Label>
              <div className="flex gap-2">
                {[
                  { name: 'green', color: 'bg-green-500' },
                  { name: 'blue', color: 'bg-blue-500' },
                  { name: 'purple', color: 'bg-purple-500' },
                  { name: 'orange', color: 'bg-orange-500' }
                ].map((color) => (
                  <Button
                    key={color.name}
                    variant="outline"
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, accentColor: color.name as any }))}
                    className={`${
                      preferences.accentColor === color.name
                        ? 'border-white'
                        : 'border-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.color}`} />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Compact Mode</Label>
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, compactMode: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-white">Show Tooltips</Label>
              <Switch
                checked={preferences.showTooltips}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, showTooltips: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-white">Animations</Label>
              <Switch
                checked={preferences.animationsEnabled}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, animationsEnabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-white">Auto Refresh</Label>
              <Switch
                checked={preferences.autoRefresh}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, autoRefresh: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-400" />
            Real-time Updates
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure how often data is refreshed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Enable Real-time Updates</Label>
            <Switch
              checked={preferences.realTimeUpdates}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, realTimeUpdates: checked }))
              }
            />
          </div>
          
          {preferences.realTimeUpdates && (
            <div className="space-y-2">
              <Label className="text-white">Update Interval (seconds)</Label>
              <div className="flex gap-2">
                {[10, 30, 60, 300].map((interval) => (
                  <Button
                    key={interval}
                    variant="outline"
                    size="sm"
                    onClick={() => setPreferences(prev => ({ ...prev, updateInterval: interval }))}
                    className={`${
                      preferences.updateInterval === interval
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : 'border-gray-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    {interval}s
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            Alert Preferences
          </CardTitle>
          <CardDescription className="text-gray-400">
            Choose which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'criticalAlerts', label: 'Critical System Alerts', icon: '🚨' },
              { key: 'marketChanges', label: 'Market Changes', icon: '📈' },
              { key: 'competitorUpdates', label: 'Competitor Updates', icon: '👁️' },
              { key: 'revenueThresholds', label: 'Revenue Thresholds', icon: '💰' },
              { key: 'customerMilestones', label: 'Customer Milestones', icon: '🎯' },
              { key: 'systemUpdates', label: 'System Updates', icon: '🔧' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <Label className="text-white">{item.label}</Label>
                </div>
                <Switch
                  checked={notifications[item.key as keyof NotificationSettings] as boolean}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-400" />
            Delivery Methods
          </CardTitle>
          <CardDescription className="text-gray-400">
            How you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-gray-400" />
              <Label className="text-white">Sound Notifications</Label>
            </div>
            <Switch
              checked={preferences.soundNotifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, soundNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-gray-400" />
              <Label className="text-white">Push Notifications</Label>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => 
                setNotifications(prev => ({ ...prev, pushNotifications: checked }))
              }
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <Label className="text-white">Email Notifications</Label>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>
          
          {preferences.emailNotifications && (
            <div className="space-y-2">
              <Label className="text-white">Email Digest Frequency</Label>
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly', 'never'].map((freq) => (
                  <Button
                    key={freq}
                    variant="outline"
                    size="sm"
                    onClick={() => setNotifications(prev => ({ ...prev, emailDigest: freq as any }))}
                    className={`capitalize ${
                      notifications.emailDigest === freq
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                        : 'border-gray-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    {freq}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderDataTab = () => (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            Data Management
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure data caching and storage preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-white">Enable Data Caching</Label>
            <Switch
              checked={dataSettings.cacheEnabled}
              onCheckedChange={(checked) => 
                setDataSettings(prev => ({ ...prev, cacheEnabled: checked }))
              }
            />
          </div>
          
          {dataSettings.cacheEnabled && (
            <div className="space-y-2">
              <Label className="text-white">Cache Duration (hours)</Label>
              <Input
                type="number"
                value={dataSettings.cacheDuration}
                onChange={(e) => 
                  setDataSettings(prev => ({ ...prev, cacheDuration: parseInt(e.target.value) || 24 }))
                }
                className="bg-gray-800 border-gray-600 text-white"
                min="1"
                max="168"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <Label className="text-white">Auto Backup</Label>
            <Switch
              checked={dataSettings.autoBackup}
              onCheckedChange={(checked) => 
                setDataSettings(prev => ({ ...prev, autoBackup: checked }))
              }
            />
          </div>
          
          {dataSettings.autoBackup && (
            <div className="space-y-2">
              <Label className="text-white">Backup Frequency</Label>
              <div className="flex gap-2">
                {['daily', 'weekly', 'monthly'].map((freq) => (
                  <Button
                    key={freq}
                    variant="outline"
                    size="sm"
                    onClick={() => setDataSettings(prev => ({ ...prev, backupFrequency: freq as any }))}
                    className={`capitalize ${
                      dataSettings.backupFrequency === freq
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                        : 'border-gray-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    {freq}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label className="text-white">Data Retention (days)</Label>
            <Input
              type="number"
              value={dataSettings.dataRetention}
              onChange={(e) => 
                setDataSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) || 90 }))
              }
              className="bg-gray-800 border-gray-600 text-white"
              min="30"
              max="365"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-green-400" />
            Export & Import
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your dashboard settings and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={exportSettings}
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button
                variant="outline"
                className="border-gray-600 text-gray-400 hover:text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Settings
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={resetSettings}
              className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
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
          <h2 className="text-2xl font-bold text-white">Dashboard Settings</h2>
          <p className="text-gray-400 mt-1">Customize your dashboard experience</p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="text-sm text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1 rounded-lg backdrop-blur-sm">
          <TabsTrigger 
            value="general" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="data" 
            className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {renderGeneralTab()}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {renderNotificationsTab()}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {renderDataTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
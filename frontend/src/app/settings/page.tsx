'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/AppLayout'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Check,
  X,
  Settings as SettingsIcon,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  Users,
  Server,
  HardDrive,
  Cpu,
  Activity
} from 'lucide-react'

interface UserSettings {
  profile: {
    name: string
    email: string
    avatar: string
    timezone: string
    language: string
    dateFormat: string
  }
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    reports: boolean
    alerts: boolean
    marketing: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    colorScheme: 'blue' | 'purple' | 'green' | 'orange'
    fontSize: 'small' | 'medium' | 'large'
    sidebarCollapsed: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'team'
    dataSharing: boolean
    analytics: boolean
    cookies: boolean
  }
  api: {
    keys: Array<{
      id: string
      name: string
      key: string
      permissions: string[]
      lastUsed: string
      isActive: boolean
    }>
  }
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: 'John Doe',
      email: 'john.doe@bitebase.app',
      avatar: '',
      timezone: 'Asia/Bangkok',
      language: 'en',
      dateFormat: 'DD/MM/YYYY'
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      reports: true,
      alerts: true,
      marketing: false
    },
    appearance: {
      theme: 'light',
      colorScheme: 'blue',
      fontSize: 'medium',
      sidebarCollapsed: false
    },
    privacy: {
      profileVisibility: 'team',
      dataSharing: true,
      analytics: true,
      cookies: true
    },
    api: {
      keys: [
        {
          id: '1',
          name: 'Production API Key',
          key: 'bb_live_1234567890abcdef',
          permissions: ['read', 'write'],
          lastUsed: '2025-01-27 14:30',
          isActive: true
        },
        {
          id: '2',
          name: 'Development API Key',
          key: 'bb_test_abcdef1234567890',
          permissions: ['read'],
          lastUsed: '2025-01-26 09:15',
          isActive: true
        }
      ]
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [showNewApiKeyForm, setShowNewApiKeyForm] = useState(false)

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <SettingsIcon className="w-4 h-4" /> }
  ]

  const saveSettings = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    console.log('Settings saved:', settings)
  }

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const generateApiKey = () => {
    if (!newApiKeyName.trim()) return

    const newKey = {
      id: Date.now().toString(),
      name: newApiKeyName,
      key: `bb_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['read'],
      lastUsed: 'Never',
      isActive: true
    }

    setSettings(prev => ({
      ...prev,
      api: {
        keys: [...prev.api.keys, newKey]
      }
    }))

    setNewApiKeyName('')
    setShowNewApiKeyForm(false)
  }

  const deleteApiKey = (keyId: string) => {
    setSettings(prev => ({
      ...prev,
      api: {
        keys: prev.api.keys.filter(key => key.id !== keyId)
      }
    }))
  }

  const toggleApiKey = (keyId: string) => {
    setSettings(prev => ({
      ...prev,
      api: {
        keys: prev.api.keys.map(key =>
          key.id === keyId ? { ...key, isActive: !key.isActive } : key
        )
      }
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-1">Configure your platform preferences and settings</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-lg">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Profile Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                        <select
                          value={settings.profile.timezone}
                          onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                          <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                          <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                          <option value="UTC">UTC (GMT+0)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                        <select
                          value={settings.profile.language}
                          onChange={(e) => updateSetting('profile', 'language', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="en">English</option>
                          <option value="th">ไทย (Thai)</option>
                          <option value="zh">中文 (Chinese)</option>
                          <option value="ja">日本語 (Japanese)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Notification Preferences</h2>

                    <div className="space-y-4">
                      {Object.entries(settings.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-3 border-b border-slate-200/50 last:border-b-0">
                          <div>
                            <h3 className="font-medium text-slate-900 capitalize">
                              {key === 'sms' ? 'SMS' : key} Notifications
                            </h3>
                            <p className="text-sm text-slate-600">
                              {key === 'email' && 'Receive notifications via email'}
                              {key === 'push' && 'Browser push notifications'}
                              {key === 'sms' && 'SMS notifications for critical alerts'}
                              {key === 'reports' && 'Report generation and completion alerts'}
                              {key === 'alerts' && 'System alerts and warnings'}
                              {key === 'marketing' && 'Product updates and marketing communications'}
                            </p>
                          </div>
                          <button
                            onClick={() => updateSetting('notifications', key, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-blue-600' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Appearance Settings</h2>

                    <div className="space-y-6">
                      {/* Theme */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['light', 'dark', 'auto'].map((theme) => (
                            <button
                              key={theme}
                              onClick={() => updateSetting('appearance', 'theme', theme)}
                              className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                                settings.appearance.theme === theme
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-center mb-2">
                                {theme === 'light' && <Sun className="w-5 h-5" />}
                                {theme === 'dark' && <Moon className="w-5 h-5" />}
                                {theme === 'auto' && <Monitor className="w-5 h-5" />}
                              </div>
                              <span className="text-sm font-medium capitalize">{theme}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Scheme */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Color Scheme</label>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { name: 'blue', color: 'bg-blue-500' },
                            { name: 'purple', color: 'bg-purple-500' },
                            { name: 'green', color: 'bg-green-500' },
                            { name: 'orange', color: 'bg-orange-500' }
                          ].map((scheme) => (
                            <button
                              key={scheme.name}
                              onClick={() => updateSetting('appearance', 'colorScheme', scheme.name)}
                              className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                                settings.appearance.colorScheme === scheme.name
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <div className={`w-6 h-6 ${scheme.color} rounded-full mx-auto mb-2`} />
                              <span className="text-sm font-medium capitalize">{scheme.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Privacy & Security</h2>

                    <div className="space-y-6">
                      {/* Profile Visibility */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Profile Visibility</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'public', label: 'Public', icon: <Globe className="w-4 h-4" /> },
                            { value: 'team', label: 'Team Only', icon: <Users className="w-4 h-4" /> },
                            { value: 'private', label: 'Private', icon: <Lock className="w-4 h-4" /> }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => updateSetting('privacy', 'profileVisibility', option.value)}
                              className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                                settings.privacy.profileVisibility === option.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-center mb-2">
                                {option.icon}
                              </div>
                              <span className="text-sm font-medium">{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="space-y-4">
                        {[
                          { key: 'dataSharing', label: 'Data Sharing', description: 'Allow sharing anonymized data for platform improvements' },
                          { key: 'analytics', label: 'Analytics', description: 'Enable usage analytics to help improve the platform' },
                          { key: 'cookies', label: 'Cookies', description: 'Allow cookies for enhanced user experience' }
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-200/50 last:border-b-0">
                            <div>
                              <h3 className="font-medium text-slate-900">{setting.label}</h3>
                              <p className="text-sm text-slate-600">{setting.description}</p>
                            </div>
                            <button
                              onClick={() => updateSetting('privacy', setting.key, !settings.privacy[setting.key as keyof typeof settings.privacy])}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.privacy[setting.key as keyof typeof settings.privacy] ? 'bg-blue-600' : 'bg-slate-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.privacy[setting.key as keyof typeof settings.privacy] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">API Keys</h2>
                    <button
                      onClick={() => setShowNewApiKeyForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Generate New Key
                    </button>
                  </div>

                  {/* New API Key Form */}
                  {showNewApiKeyForm && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="API Key Name"
                          value={newApiKeyName}
                          onChange={(e) => setNewApiKeyName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={generateApiKey}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Generate
                        </button>
                        <button
                          onClick={() => {
                            setShowNewApiKeyForm(false)
                            setNewApiKeyName('')
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* API Keys List */}
                  <div className="space-y-4">
                    {settings.api.keys.map((apiKey) => (
                      <div key={apiKey.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-slate-900">{apiKey.name}</h3>
                            <p className="text-sm text-slate-600">Last used: {apiKey.lastUsed}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {apiKey.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => toggleApiKey(apiKey.id)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              {apiKey.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded text-sm font-mono">
                            {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                          </code>
                          <button
                            onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showApiKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-slate-600">
                            Permissions: {apiKey.permissions.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">System Administration</h2>

                    <div className="space-y-6">
                      {/* System Status */}
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 mb-4">System Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <Server className="w-8 h-8 text-green-600" />
                              <div>
                                <div className="text-sm font-medium text-green-900">API Server</div>
                                <div className="text-xs text-green-700">Online</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <Database className="w-8 h-8 text-blue-600" />
                              <div>
                                <div className="text-sm font-medium text-blue-900">Database</div>
                                <div className="text-xs text-blue-700">Connected</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <Activity className="w-8 h-8 text-purple-600" />
                              <div>
                                <div className="text-sm font-medium text-purple-900">Analytics</div>
                                <div className="text-xs text-purple-700">Active</div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                              <Cpu className="w-8 h-8 text-orange-600" />
                              <div>
                                <div className="text-sm font-medium text-orange-900">CPU Usage</div>
                                <div className="text-xs text-orange-700">23%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* System Actions */}
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 mb-4">System Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                            <Download className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-medium text-slate-900">Export Data</div>
                              <div className="text-sm text-slate-600">Download all your data</div>
                            </div>
                          </button>

                          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                            <Upload className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-medium text-slate-900">Import Data</div>
                              <div className="text-sm text-slate-600">Upload data from file</div>
                            </div>
                          </button>

                          <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                            <RefreshCw className="w-5 h-5 text-purple-600" />
                            <div>
                              <div className="font-medium text-slate-900">Clear Cache</div>
                              <div className="text-sm text-slate-600">Clear system cache</div>
                            </div>
                          </button>

                          <button className="flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <div>
                              <div className="font-medium text-red-900">Reset Settings</div>
                              <div className="text-sm text-red-600">Reset to defaults</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* System Information */}
                      <div>
                        <h3 className="text-lg font-medium text-slate-900 mb-4">System Information</h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Version:</span>
                              <span className="ml-2 text-slate-600">v2.1.0</span>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Build:</span>
                              <span className="ml-2 text-slate-600">#1234</span>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Environment:</span>
                              <span className="ml-2 text-slate-600">Production</span>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Last Updated:</span>
                              <span className="ml-2 text-slate-600">2025-01-27</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

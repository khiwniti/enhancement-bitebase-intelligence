// Widget Configuration Panel - Chart Configuration Interface
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Settings, 
  X, 
  Save, 
  RotateCcw, 
  Palette, 
  Type, 
  Layout,
  Database,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Info,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { DashboardWidget, WidgetConfig } from '../types/dashboardTypes'
import { ChartType } from '@/components/charts/types/chartTypes'
import { cn } from '@/lib/utils'

interface WidgetConfigPanelProps {
  widget: DashboardWidget | null
  isOpen: boolean
  onClose: () => void
  onSave: (widgetId: string, config: Partial<DashboardWidget>) => void
  className?: string
}

interface ConfigSection {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  collapsed: boolean
}

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label: string
}

// Simple color picker component
function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const presetColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-xs"
          placeholder="#000000"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {presetColors.map(color => (
          <button
            key={color}
            className="w-6 h-6 rounded border-2 border-transparent hover:border-gray-300"
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}

// Number input with validation
function NumberInput({ 
  value, 
  onChange, 
  label, 
  min, 
  max, 
  step = 1,
  unit 
}: {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  max?: number
  step?: number
  unit?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}

// Toggle switch component
function Toggle({ 
  checked, 
  onChange, 
  label, 
  description 
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted'
        )}
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}

// Configuration section component
function ConfigSectionComponent({
  section,
  children,
  onToggle
}: {
  section: ConfigSection
  children: React.ReactNode
  onToggle: (sectionId: string) => void
}) {
  return (
    <div className="border rounded-lg">
      <button
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
        onClick={() => onToggle(section.id)}
      >
        <div className="flex items-center gap-2">
          {section.icon}
          <div className="text-left">
            <div className="font-medium text-sm">{section.title}</div>
            <div className="text-xs text-muted-foreground">{section.description}</div>
          </div>
        </div>
        {section.collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {!section.collapsed && (
        <div className="p-3 border-t bg-muted/25">
          {children}
        </div>
      )}
    </div>
  )
}

export function WidgetConfigPanel({
  widget,
  isOpen,
  onClose,
  onSave,
  className = ''
}: WidgetConfigPanelProps) {
  // Local state for configuration
  const [localConfig, setLocalConfig] = useState<Partial<DashboardWidget>>(widget || {})
  const [hasChanges, setHasChanges] = useState(false)
  const [sections, setSections] = useState<ConfigSection[]>([
    {
      id: 'general',
      title: 'General Settings',
      description: 'Basic widget configuration',
      icon: <Settings className="h-4 w-4" />,
      collapsed: false
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Visual styling options',
      icon: <Palette className="h-4 w-4" />,
      collapsed: false
    },
    {
      id: 'data',
      title: 'Data Configuration',
      description: 'Data source and refresh settings',
      icon: <Database className="h-4 w-4" />,
      collapsed: true
    },
    {
      id: 'advanced',
      title: 'Advanced Options',
      description: 'Performance and interaction settings',
      icon: <Type className="h-4 w-4" />,
      collapsed: true
    }
  ])

  // Update local config when widget changes
  React.useEffect(() => {
    if (widget) {
      setLocalConfig(widget)
      setHasChanges(false)
    }
  }, [widget])

  // Handle configuration changes
  const updateConfig = useCallback((path: string, value: any) => {
    setLocalConfig(prev => {
      const newConfig = { ...prev }
      const keys = path.split('.')
      let current: any = newConfig
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newConfig
    })
    setHasChanges(true)
  }, [])

  // Toggle section collapse
  const toggleSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId 
        ? { ...section, collapsed: !section.collapsed }
        : section
    ))
  }, [])

  // Save configuration
  const handleSave = useCallback(() => {
    if (widget && hasChanges) {
      onSave(widget.id, localConfig)
      setHasChanges(false)
    }
  }, [widget, localConfig, hasChanges, onSave])

  // Reset configuration
  const handleReset = useCallback(() => {
    if (widget) {
      setLocalConfig(widget)
      setHasChanges(false)
    }
  }, [widget])

  // Get chart type specific options
  const chartTypeOptions = useMemo(() => {
    if (!localConfig.chartType) return []

    const commonOptions = [
      { key: 'responsive', label: 'Responsive', type: 'boolean' },
      { key: 'maintainAspectRatio', label: 'Maintain Aspect Ratio', type: 'boolean' },
      { key: 'animation', label: 'Enable Animations', type: 'boolean' }
    ]

    const typeSpecificOptions: Partial<Record<ChartType, any[]>> = {
      line: [
        { key: 'tension', label: 'Line Tension', type: 'number', min: 0, max: 1, step: 0.1 },
        { key: 'fill', label: 'Fill Area', type: 'boolean' }
      ],
      bar: [
        { key: 'indexAxis', label: 'Horizontal Bars', type: 'boolean' },
        { key: 'barThickness', label: 'Bar Thickness', type: 'number', min: 1, max: 100 }
      ],
      stackedBar: [
        { key: 'indexAxis', label: 'Horizontal Bars', type: 'boolean' },
        { key: 'barThickness', label: 'Bar Thickness', type: 'number', min: 1, max: 100 }
      ],
      groupedBar: [
        { key: 'indexAxis', label: 'Horizontal Bars', type: 'boolean' },
        { key: 'barThickness', label: 'Bar Thickness', type: 'number', min: 1, max: 100 }
      ],
      pie: [
        { key: 'cutout', label: 'Cutout Percentage', type: 'number', min: 0, max: 90, unit: '%' }
      ],
      doughnut: [
        { key: 'cutout', label: 'Cutout Percentage', type: 'number', min: 10, max: 90, unit: '%' }
      ]
    }

    return [...commonOptions, ...(typeSpecificOptions[localConfig.chartType] || [])]
  }, [localConfig.chartType])

  if (!isOpen || !widget) {
    return null
  }

  return (
    <div className={cn(
      'fixed inset-y-0 right-0 z-50 w-96 bg-background border-l shadow-lg transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : 'translate-x-full',
      className
    )}>
      <Card className="h-full rounded-none border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Widget Configuration
              </CardTitle>
              <CardDescription>
                Configure {localConfig.title || 'widget'} settings
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Widget Info */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {localConfig.chartType || localConfig.type}
            </Badge>
            {hasChanges && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Unsaved
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* General Settings */}
          <ConfigSectionComponent
            section={sections.find(s => s.id === 'general')!}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Widget Title</label>
                <Input
                  value={localConfig.title || ''}
                  onChange={(e) => updateConfig('title', e.target.value)}
                  placeholder="Enter widget title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={localConfig.description || ''}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  placeholder="Enter widget description"
                />
              </div>

              <Toggle
                checked={localConfig.config?.exportable ?? true}
                onChange={(checked) => updateConfig('config.exportable', checked)}
                label="Exportable"
                description="Allow this widget to be exported"
              />

              <Toggle
                checked={localConfig.config?.clickable ?? true}
                onChange={(checked) => updateConfig('config.clickable', checked)}
                label="Interactive"
                description="Enable click interactions"
              />
            </div>
          </ConfigSectionComponent>

          {/* Appearance Settings */}
          <ConfigSectionComponent
            section={sections.find(s => s.id === 'appearance')!}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <ColorPicker
                value={localConfig.config?.backgroundColor || '#ffffff'}
                onChange={(color) => updateConfig('config.backgroundColor', color)}
                label="Background Color"
              />

              <ColorPicker
                value={localConfig.config?.borderColor || '#e5e7eb'}
                onChange={(color) => updateConfig('config.borderColor', color)}
                label="Border Color"
              />

              <NumberInput
                value={localConfig.config?.borderWidth || 1}
                onChange={(value) => updateConfig('config.borderWidth', value)}
                label="Border Width"
                min={0}
                max={10}
                unit="px"
              />

              <NumberInput
                value={localConfig.config?.borderRadius || 8}
                onChange={(value) => updateConfig('config.borderRadius', value)}
                label="Border Radius"
                min={0}
                max={50}
                unit="px"
              />

              <NumberInput
                value={localConfig.config?.padding || 16}
                onChange={(value) => updateConfig('config.padding', value)}
                label="Padding"
                min={0}
                max={50}
                unit="px"
              />
            </div>
          </ConfigSectionComponent>

          {/* Data Configuration */}
          <ConfigSectionComponent
            section={sections.find(s => s.id === 'data')!}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Source</label>
                <Input
                  value={localConfig.config?.dataSource || ''}
                  onChange={(e) => updateConfig('config.dataSource', e.target.value)}
                  placeholder="Enter data source URL or identifier"
                />
              </div>

              <NumberInput
                value={localConfig.config?.refreshInterval || 30000}
                onChange={(value) => updateConfig('config.refreshInterval', value)}
                label="Refresh Interval"
                min={1000}
                max={3600000}
                step={1000}
                unit="ms"
              />

              <Toggle
                checked={localConfig.config?.hoverable ?? true}
                onChange={(checked) => updateConfig('config.hoverable', checked)}
                label="Hover Effects"
                description="Show hover interactions"
              />
            </div>
          </ConfigSectionComponent>

          {/* Advanced Options */}
          <ConfigSectionComponent
            section={sections.find(s => s.id === 'advanced')!}
            onToggle={toggleSection}
          >
            <div className="space-y-4">
              {/* Chart-specific options */}
              {chartTypeOptions.map(option => (
                <div key={option.key}>
                  {option.type === 'boolean' ? (
                    <Toggle
                      checked={(localConfig.config?.chartProps?.options as any)?.[option.key] ?? true}
                      onChange={(checked) => updateConfig(`config.chartProps.options.${option.key}`, checked)}
                      label={option.label}
                    />
                  ) : option.type === 'number' ? (
                    <NumberInput
                      value={(localConfig.config?.chartProps?.options as any)?.[option.key] || option.min || 0}
                      onChange={(value) => updateConfig(`config.chartProps.options.${option.key}`, value)}
                      label={option.label}
                      min={option.min}
                      max={option.max}
                      step={option.step}
                      unit={option.unit}
                    />
                  ) : null}
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Advanced performance and rendering options
                </p>
                
                <div className="space-y-3">
                  <Toggle
                    checked={localConfig.config?.customProps?.enableWebGL ?? false}
                    onChange={(checked) => updateConfig('config.customProps.enableWebGL', checked)}
                    label="Hardware Acceleration"
                    description="Use WebGL for better performance"
                  />
                  
                  <Toggle
                    checked={localConfig.config?.customProps?.enableVirtualization ?? false}
                    onChange={(checked) => updateConfig('config.customProps.enableVirtualization', checked)}
                    label="Data Virtualization"
                    description="Optimize for large datasets"
                  />
                </div>
              </div>
            </div>
          </ConfigSectionComponent>
        </CardContent>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/25">
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          {hasChanges && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              You have unsaved changes
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
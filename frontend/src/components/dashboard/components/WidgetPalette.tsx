// Widget Palette Component - Drag and Drop Chart Types
// BiteBase Intelligence 2.0 - Enhanced Dashboard Builder

'use client'

import React, { useState, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  ScatterChart, 
  AreaChart,
  TrendingUp,
  Activity,
  Target,
  Layers,
  GitBranch,
  Calendar,
  Zap,
  Grid3X3,
  Network,
  TreePine,
  Workflow,
  BarChart2,
  Radar,
  Circle,
  Gauge,
  Search,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Crown,
  Info
} from 'lucide-react'
import { ChartType } from '@/components/charts/types/chartTypes'
import { WidgetPaletteItem, WidgetCategory } from '../types/dashboardTypes'

interface WidgetPaletteProps {
  className?: string
  onWidgetSelect?: (chartType: ChartType) => void
  disabled?: boolean
}

// Chart type definitions with icons and metadata
const CHART_DEFINITIONS: WidgetPaletteItem[] = [
  // Basic Charts
  {
    id: 'line',
    type: 'line',
    name: 'Line Chart',
    description: 'Show trends over time with connected data points',
    icon: <LineChart className="h-4 w-4" />,
    category: 'basic',
    tags: ['time-series', 'trends', 'continuous'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 1
  },
  {
    id: 'bar',
    type: 'bar',
    name: 'Bar Chart',
    description: 'Compare values across categories with vertical bars',
    icon: <BarChart3 className="h-4 w-4" />,
    category: 'basic',
    tags: ['comparison', 'categorical', 'vertical'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 1
  },
  {
    id: 'pie',
    type: 'pie',
    name: 'Pie Chart',
    description: 'Show proportions of a whole with circular segments',
    icon: <PieChart className="h-4 w-4" />,
    category: 'basic',
    tags: ['proportions', 'parts-to-whole', 'circular'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 1
  },
  {
    id: 'doughnut',
    type: 'doughnut',
    name: 'Doughnut Chart',
    description: 'Pie chart with a hollow center for additional information',
    icon: <Circle className="h-4 w-4" />,
    category: 'basic',
    tags: ['proportions', 'parts-to-whole', 'hollow'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 1
  },
  {
    id: 'area',
    type: 'area',
    name: 'Area Chart',
    description: 'Line chart with filled areas to emphasize volume',
    icon: <AreaChart className="h-4 w-4" />,
    category: 'basic',
    tags: ['time-series', 'volume', 'filled'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 2
  },
  {
    id: 'scatter',
    type: 'scatter',
    name: 'Scatter Plot',
    description: 'Show correlation between two variables with dots',
    icon: <ScatterChart className="h-4 w-4" />,
    category: 'basic',
    tags: ['correlation', 'two-variables', 'dots'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 2
  },
  {
    id: 'bubble',
    type: 'bubble',
    name: 'Bubble Chart',
    description: 'Scatter plot with bubble size representing a third dimension',
    icon: <Target className="h-4 w-4" />,
    category: 'basic',
    tags: ['three-dimensional', 'correlation', 'size'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 3
  },
  {
    id: 'radar',
    type: 'radar',
    name: 'Radar Chart',
    description: 'Multi-variable data displayed on axes from a center point',
    icon: <Radar className="h-4 w-4" />,
    category: 'basic',
    tags: ['multi-variable', 'radial', 'comparison'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 2
  },
  {
    id: 'polarArea',
    type: 'polarArea',
    name: 'Polar Area Chart',
    description: 'Circular chart with segments of varying radius',
    icon: <Activity className="h-4 w-4" />,
    category: 'basic',
    tags: ['circular', 'radius', 'segments'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: false,
    performanceWeight: 2
  },

  // Advanced Charts
  {
    id: 'treemap',
    type: 'treemap',
    name: 'TreeMap Chart',
    description: 'Hierarchical data displayed as nested rectangles',
    icon: <Grid3X3 className="h-4 w-4" />,
    category: 'advanced',
    tags: ['hierarchical', 'nested', 'rectangles'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 4
  },
  {
    id: 'sankey',
    type: 'sankey',
    name: 'Sankey Diagram',
    description: 'Flow diagram showing quantities moving between nodes',
    icon: <Workflow className="h-4 w-4" />,
    category: 'advanced',
    tags: ['flow', 'nodes', 'quantities'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 5
  },
  {
    id: 'gantt',
    type: 'gantt',
    name: 'Gantt Chart',
    description: 'Project timeline with tasks and dependencies',
    icon: <Calendar className="h-4 w-4" />,
    category: 'advanced',
    tags: ['timeline', 'project', 'dependencies'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 4
  },
  {
    id: 'heatmap',
    type: 'heatmap',
    name: 'Heatmap',
    description: 'Data visualization using colors to represent values',
    icon: <Layers className="h-4 w-4" />,
    category: 'advanced',
    tags: ['colors', 'matrix', 'intensity'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 3
  },
  {
    id: 'network',
    type: 'network',
    name: 'Network Graph',
    description: 'Nodes and edges showing relationships and connections',
    icon: <Network className="h-4 w-4" />,
    category: 'advanced',
    tags: ['nodes', 'edges', 'relationships'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 5
  },
  {
    id: 'funnel',
    type: 'funnel',
    name: 'Funnel Chart',
    description: 'Progressive reduction of data through process stages',
    icon: <TrendingUp className="h-4 w-4" />,
    category: 'advanced',
    tags: ['process', 'stages', 'conversion'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 3
  },
  {
    id: 'waterfall',
    type: 'waterfall',
    name: 'Waterfall Chart',
    description: 'Cumulative effect of sequential positive/negative values',
    icon: <BarChart2 className="h-4 w-4" />,
    category: 'advanced',
    tags: ['cumulative', 'sequential', 'positive-negative'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 3
  },
  {
    id: 'boxplot',
    type: 'boxplot',
    name: 'Box Plot',
    description: 'Statistical distribution with quartiles and outliers',
    icon: <Target className="h-4 w-4" />,
    category: 'advanced',
    tags: ['statistical', 'quartiles', 'outliers'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 3
  },
  {
    id: 'violin',
    type: 'violin',
    name: 'Violin Plot',
    description: 'Combination of box plot and kernel density estimation',
    icon: <Activity className="h-4 w-4" />,
    category: 'advanced',
    tags: ['statistical', 'density', 'distribution'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 4
  },
  {
    id: 'sunburst',
    type: 'sunburst',
    name: 'Sunburst Chart',
    description: 'Hierarchical data in concentric circles',
    icon: <TreePine className="h-4 w-4" />,
    category: 'advanced',
    tags: ['hierarchical', 'concentric', 'radial'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 4
  },
  {
    id: 'chord',
    type: 'chord',
    name: 'Chord Diagram',
    description: 'Relationships between entities in a circular layout',
    icon: <GitBranch className="h-4 w-4" />,
    category: 'advanced',
    tags: ['relationships', 'circular', 'connections'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 5
  },
  {
    id: 'timeline',
    type: 'timeline',
    name: 'Timeline Chart',
    description: 'Events plotted chronologically along a time axis',
    icon: <Calendar className="h-4 w-4" />,
    category: 'advanced',
    tags: ['chronological', 'events', 'time-axis'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 3
  },
  {
    id: 'candlestick',
    type: 'candlestick',
    name: 'Candlestick Chart',
    description: 'Financial data with open, high, low, close values',
    icon: <Zap className="h-4 w-4" />,
    category: 'advanced',
    tags: ['financial', 'ohlc', 'trading'],
    defaultConfig: { chartProps: { options: { responsive: true } } },
    isAdvanced: true,
    performanceWeight: 3
  }
]

// Group charts by category
const CHART_CATEGORIES: WidgetCategory[] = [
  {
    id: 'basic',
    name: 'Basic Charts',
    description: 'Essential chart types for common data visualization needs',
    icon: <BarChart3 className="h-4 w-4" />,
    items: CHART_DEFINITIONS.filter(chart => chart.category === 'basic'),
    collapsed: false
  },
  {
    id: 'advanced',
    name: 'Advanced Charts',
    description: 'Specialized charts for complex data analysis',
    icon: <Sparkles className="h-4 w-4" />,
    items: CHART_DEFINITIONS.filter(chart => chart.category === 'advanced'),
    collapsed: false
  }
]

// Draggable chart item component
function DraggableChartItem({ 
  item, 
  onSelect, 
  disabled 
}: { 
  item: WidgetPaletteItem
  onSelect?: (chartType: ChartType) => void
  disabled?: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `chart-${item.id}`,
    data: {
      type: 'chart-type',
      chartType: item.type,
      item
    },
    disabled
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative p-3 border rounded-lg cursor-grab active:cursor-grabbing
        transition-all duration-200 hover:shadow-md hover:border-primary/50
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${item.isAdvanced ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200 bg-white'}
      `}
      onClick={() => !disabled && onSelect?.(item.type)}
    >
      <div className="flex items-start gap-3">
        <div className={`
          p-2 rounded-md flex-shrink-0
          ${item.isAdvanced ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}
        `}>
          {item.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-foreground truncate">
              {item.name}
            </h4>
            {item.isAdvanced && (
              <Crown className="h-3 w-3 text-orange-500 flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs px-1 py-0 h-4"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Performance indicator */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={`
          w-2 h-2 rounded-full
          ${item.performanceWeight <= 2 ? 'bg-green-400' : 
            item.performanceWeight <= 4 ? 'bg-yellow-400' : 'bg-red-400'}
        `} />
      </div>
    </div>
  )
}

// Category section component
function CategorySection({ 
  category, 
  onToggle, 
  onSelect, 
  disabled 
}: {
  category: WidgetCategory
  onToggle: (categoryId: string) => void
  onSelect?: (chartType: ChartType) => void
  disabled?: boolean
}) {
  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        className="w-full justify-between p-2 h-auto"
        onClick={() => onToggle(category.id)}
      >
        <div className="flex items-center gap-2">
          {category.icon}
          <div className="text-left">
            <div className="font-medium text-sm">{category.name}</div>
            <div className="text-xs text-muted-foreground">
              {category.items.length} charts
            </div>
          </div>
        </div>
        {category.collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
      
      {!category.collapsed && (
        <div className="grid grid-cols-1 gap-2 pl-2">
          {category.items.map(item => (
            <DraggableChartItem
              key={item.id}
              item={item}
              onSelect={onSelect}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function WidgetPalette({ 
  className = '', 
  onWidgetSelect, 
  disabled = false 
}: WidgetPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState(CHART_CATEGORIES)

  // Filter charts based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories

    const query = searchQuery.toLowerCase()
    return categories.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })).filter(category => category.items.length > 0)
  }, [categories, searchQuery])

  const toggleCategory = (categoryId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, collapsed: !cat.collapsed } : cat
    ))
  }

  const totalCharts = CHART_DEFINITIONS.length
  const basicCharts = CHART_DEFINITIONS.filter(c => !c.isAdvanced).length
  const advancedCharts = CHART_DEFINITIONS.filter(c => c.isAdvanced).length

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Widget Palette
        </CardTitle>
        <CardDescription>
          Drag charts to add them to your dashboard
        </CardDescription>
        
        {/* Stats */}
        <div className="flex gap-2 text-xs">
          <Badge variant="outline" className="bg-blue-50">
            {basicCharts} Basic
          </Badge>
          <Badge variant="outline" className="bg-orange-50">
            {advancedCharts} Advanced
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 p-4 pt-0">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search charts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={disabled}
          />
        </div>
        
        {/* Performance Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Fast
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            Medium
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            Heavy
          </div>
          <Info className="h-3 w-3" />
        </div>
        
        {/* Categories */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {filteredCategories.length > 0 ? (
            filteredCategories.map(category => (
              <CategorySection
                key={category.id}
                category={category}
                onToggle={toggleCategory}
                onSelect={onWidgetSelect}
                disabled={disabled}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No charts found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}
        </div>
        
        {/* Help Text */}
        {!disabled && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            💡 <strong>Tip:</strong> Drag charts directly onto the dashboard or click to add at the default position.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { CHART_DEFINITIONS, CHART_CATEGORIES }
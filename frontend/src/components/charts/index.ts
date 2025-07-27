// Advanced Chart Library - Main Exports
// BiteBase Intelligence 2.0 - Chart.js 4.5.0 Extension

// Core Components
export { ChartProvider } from './providers/ChartProvider'
export { CrossFilterProvider } from './providers/CrossFilterProvider'
export { ThemeProvider } from './providers/ThemeProvider'

// Base Components
export { BaseChart } from './core/BaseChart'
export { ChartContainer } from './core/ChartContainer'
export { ChartRegistry } from './core/ChartRegistry'

// Basic Charts (Chart.js Native)
export { LineChart } from './basic/LineChart'
export { BarChart } from './basic/BarChart'
export { PieChart } from './basic/PieChart'
export { AreaChart } from './basic/AreaChart'
export { ScatterChart } from './basic/ScatterChart'
export { BubbleChart } from './basic/BubbleChart'
export { RadarChart } from './basic/RadarChart'
export { PolarAreaChart } from './basic/PolarAreaChart'
export { DoughnutChart } from './basic/DoughnutChart'

// Advanced Charts (Extended/Custom)
export { TreeMapChart } from './advanced/TreeMapChart'
export { SankeyChart } from './advanced/SankeyChart'
export { GanttChart } from './advanced/GanttChart'
export { HeatmapChart } from './advanced/HeatmapChart'
export { NetworkGraph } from './advanced/NetworkGraph'
export { FunnelChart } from './advanced/FunnelChart'
export { WaterfallChart } from './advanced/WaterfallChart'
export { BoxPlotChart } from './advanced/BoxPlotChart'
export { ViolinPlotChart } from './advanced/ViolinPlotChart'
export { SunburstChart } from './advanced/SunburstChart'
export { ChordDiagram } from './advanced/ChordDiagram'
export { TimelineChart } from './advanced/TimelineChart'
export { CandlestickChart } from './advanced/CandlestickChart'

// Filtering Components
export { CrossFilterManager } from './filtering/CrossFilterManager'
export { FilterBridge } from './filtering/FilterBridge'

// Hooks
export { useChart } from './hooks/useChart'
export { useCrossFilter } from './hooks/useCrossFilter'
export { useChartTheme } from './hooks/useChartTheme'
export { useChartPerformance } from './hooks/useChartPerformance'

// Types
export * from './types/chartTypes'
export * from './types/filterTypes'
export * from './types/themeTypes'

// Utils
export * from './utils/chartHelpers'
export * from './utils/dataTransformers'
export * from './utils/performanceUtils'
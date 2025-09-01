// Chart Registry - Manages chart type registration and loading
// BiteBase Intelligence 2.0 - Advanced Chart Library

import { ChartType, ChartRegistryEntry } from '../types/chartTypes'

// Chart Registry Class
export class ChartRegistry {
  private static instance: ChartRegistry
  private registry: Map<ChartType, ChartRegistryEntry> = new Map()
  private loadedModules: Map<ChartType, Record<string, unknown>> = new Map()
  private loadingPromises: Map<ChartType, Promise<Record<string, unknown>>> = new Map()

  private constructor() {
    this.initializeBasicCharts()
  }

  // Singleton pattern
  public static getInstance(): ChartRegistry {
    if (!ChartRegistry.instance) {
      ChartRegistry.instance = new ChartRegistry()
    }
    return ChartRegistry.instance
  }

  // Initialize basic Chart.js charts
  private initializeBasicCharts() {
    // Basic Chart.js types
    const basicCharts: Array<{ type: ChartType; weight: number }> = [
      { type: 'line', weight: 1 },
      { type: 'bar', weight: 1 },
      { type: 'pie', weight: 1 },
      { type: 'doughnut', weight: 1 },
      { type: 'area', weight: 1 },
      { type: 'scatter', weight: 2 },
      { type: 'bubble', weight: 2 },
      { type: 'radar', weight: 2 },
      { type: 'polarArea', weight: 2 }
    ]

    basicCharts.forEach(({ type, weight }) => {
      this.registry.set(type, {
        type,
        component: null, // Will be loaded dynamically
        isAdvanced: false,
        dependencies: ['chart.js'],
        performanceWeight: weight
      })
    })

    // Advanced chart types
    const advancedCharts: Array<{ type: ChartType; deps: string[]; weight: number }> = [
      { type: 'treemap', deps: ['chartjs-chart-treemap'], weight: 3 },
      { type: 'sankey', deps: ['chartjs-chart-sankey'], weight: 4 },
      { type: 'gantt', deps: ['chartjs-adapter-date-fns'], weight: 5 },
      { type: 'heatmap', deps: ['chartjs-chart-matrix'], weight: 3 },
      { type: 'network', deps: ['d3'], weight: 6 },
      { type: 'funnel', deps: ['chartjs-chart-funnel'], weight: 3 },
      { type: 'waterfall', deps: ['chartjs-chart-waterfall'], weight: 4 },
      { type: 'boxplot', deps: ['chartjs-chart-box-and-violin-plot'], weight: 4 },
      { type: 'violin', deps: ['chartjs-chart-box-and-violin-plot'], weight: 4 },
      { type: 'sunburst', deps: ['d3'], weight: 5 },
      { type: 'chord', deps: ['d3'], weight: 6 },
      { type: 'timeline', deps: ['chartjs-adapter-date-fns'], weight: 4 },
      { type: 'candlestick', deps: ['chartjs-chart-financial'], weight: 3 }
    ]

    advancedCharts.forEach(({ type, deps, weight }) => {
      this.registry.set(type, {
        type,
        component: null, // Will be loaded dynamically
        isAdvanced: true,
        dependencies: deps,
        performanceWeight: weight
      })
    })
  }

  // Register a custom chart type
  public registerChart(entry: ChartRegistryEntry): void {
    this.registry.set(entry.type, entry)
  }

  // Unregister a chart type
  public unregisterChart(type: ChartType): void {
    this.registry.delete(type)
    this.loadedModules.delete(type)
    this.loadingPromises.delete(type)
  }

  // Check if chart type is registered
  public isRegistered(type: ChartType): boolean {
    return this.registry.has(type)
  }

  // Get chart registry entry
  public getEntry(type: ChartType): ChartRegistryEntry | undefined {
    return this.registry.get(type)
  }

  // Get all registered chart types
  public getRegisteredTypes(): ChartType[] {
    return Array.from(this.registry.keys())
  }

  // Get basic chart types
  public getBasicTypes(): ChartType[] {
    return Array.from(this.registry.entries())
      .filter(([, entry]) => !entry.isAdvanced)
      .map(([type]) => type)
  }

  // Get advanced chart types
  public getAdvancedTypes(): ChartType[] {
    return Array.from(this.registry.entries())
      .filter(([, entry]) => entry.isAdvanced)
      .map(([type]) => type)
  }

  // Load chart module dynamically
  public async loadChart(type: ChartType): Promise<Record<string, unknown>> {
    // Check if already loaded
    if (this.loadedModules.has(type)) {
      return this.loadedModules.get(type)!
    }

    // Check if currently loading
    if (this.loadingPromises.has(type)) {
      return this.loadingPromises.get(type)!
    }

    // Get registry entry
    const entry = this.registry.get(type)
    if (!entry) {
      throw new Error(`Chart type "${type}" is not registered`)
    }

    // Create loading promise
    const loadingPromise = this.loadChartModule(type, entry)
    this.loadingPromises.set(type, loadingPromise)

    try {
      const module = await loadingPromise
      this.loadedModules.set(type, module)
      this.loadingPromises.delete(type)
      return module
    } catch (error) {
      this.loadingPromises.delete(type)
      throw error
    }
  }

  // Load chart module based on type
  private async loadChartModule(type: ChartType, entry: ChartRegistryEntry): Promise<Record<string, unknown>> {
    try {
      switch (type) {
        // Basic Chart.js charts
        case 'line':
        case 'bar':
        case 'pie':
        case 'doughnut':
        case 'area':
        case 'scatter':
        case 'bubble':
        case 'radar':
        case 'polarArea':
          return await this.loadBasicChart()

        // Advanced charts with specific loaders
        case 'treemap':
          return await this.loadTreeMapChart()

        case 'sankey':
          return await this.loadSankeyChart()

        case 'gantt':
          return await this.loadGanttChart()

        case 'heatmap':
          return await this.loadHeatmapChart()

        case 'network':
          return await this.loadNetworkChart()

        case 'funnel':
          return await this.loadFunnelChart()

        case 'waterfall':
          return await this.loadWaterfallChart()

        case 'boxplot':
        case 'violin':
          return await this.loadBoxViolinChart()

        case 'sunburst':
          return await this.loadSunburstChart()

        case 'chord':
          return await this.loadChordChart()

        case 'timeline':
          return await this.loadTimelineChart()

        case 'candlestick':
          return await this.loadCandlestickChart()

        default:
          throw new Error(`No loader defined for chart type: ${type}`)
      }
    } catch (error) {
      console.error(`Failed to load chart module for type "${type}":`, error)
      throw new Error(`Failed to load chart type "${type}". Please ensure required dependencies are installed.`)
    }
  }

  // Chart module loaders
  private async loadBasicChart() {
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)
    return { Chart }
  }

  private async loadTreeMapChart() {
    const [chartjs, treemap] = await Promise.all([
      this.loadBasicChart(),
      import('chartjs-chart-treemap')
    ])
    return { ...chartjs, TreemapController: treemap.TreemapController }
  }

  private async loadSankeyChart() {
    const [chartjs, sankey] = await Promise.all([
      this.loadBasicChart(),
      import('chartjs-chart-sankey')
    ])
    return { ...chartjs, SankeyController: sankey.SankeyController }
  }

  private async loadGanttChart() {
    try {
      const [chartjs, adapter] = await Promise.all([
        this.loadBasicChart(),
        import('date-fns') // Use date-fns directly since it's available
      ])
      return { ...chartjs, adapter }
    } catch (error) {
      console.warn('Date adapter not available, using basic chart')
      return this.loadBasicChart()
    }
  }

  private async loadHeatmapChart() {
    try {
      const chartjs = await this.loadBasicChart()
      // Use basic chart as fallback when matrix chart is not available
      return chartjs
    } catch (error) {
      return this.loadBasicChart()
    }
  }

  private async loadNetworkChart() {
    try {
      const [chartjs, d3] = await Promise.all([
        this.loadBasicChart(),
        import('d3')
      ])
      return { ...chartjs, d3 }
    } catch (error) {
      console.warn('D3 not available for network chart, using basic chart')
      return this.loadBasicChart()
    }
  }

  private async loadFunnelChart() {
    try {
      const chartjs = await this.loadBasicChart()
      // Use basic chart as fallback when funnel chart is not available
      return chartjs
    } catch (error) {
      return this.loadBasicChart()
    }
  }

  private async loadWaterfallChart() {
    try {
      const chartjs = await this.loadBasicChart()
      // Use basic chart as fallback when waterfall chart is not available
      return chartjs
    } catch (error) {
      return this.loadBasicChart()
    }
  }

  private async loadBoxViolinChart() {
    try {
      const chartjs = await this.loadBasicChart()
      // Use basic chart as fallback when box/violin chart is not available
      return chartjs
    } catch (error) {
      return this.loadBasicChart()
    }
  }

  private async loadSunburstChart() {
    try {
      const [chartjs, d3] = await Promise.all([
        this.loadBasicChart(),
        import('d3')
      ])
      return { ...chartjs, d3 }
    } catch (error) {
      console.warn('D3 not available for sunburst chart, using basic chart')
      return this.loadBasicChart()
    }
  }

  private async loadChordChart() {
    try {
      const [chartjs, d3] = await Promise.all([
        this.loadBasicChart(),
        import('d3')
      ])
      return { ...chartjs, d3 }
    } catch (error) {
      console.warn('D3 not available for chord chart, using basic chart')
      return this.loadBasicChart()
    }
  }

  private async loadTimelineChart() {
    try {
      const [chartjs, adapter] = await Promise.all([
        this.loadBasicChart(),
        import('date-fns') // Use date-fns directly since it's available
      ])
      return { ...chartjs, adapter }
    } catch (error) {
      console.warn('Date adapter not available, using basic chart')
      return this.loadBasicChart()
    }
  }

  private async loadCandlestickChart() {
    try {
      const chartjs = await this.loadBasicChart()
      // Use basic chart as fallback when financial chart is not available
      return chartjs
    } catch (error) {
      return this.loadBasicChart()
    }
  }

  // Preload charts based on priority
  public async preloadCharts(types: ChartType[]): Promise<void> {
    const sortedTypes = types
      .map(type => ({ type, entry: this.registry.get(type) }))
      .filter(({ entry }) => entry !== undefined)
      .sort((a, b) => (a.entry!.performanceWeight || 0) - (b.entry!.performanceWeight || 0))
      .map(({ type }) => type)

    // Load charts in batches to avoid overwhelming the browser
    const batchSize = 3
    for (let i = 0; i < sortedTypes.length; i += batchSize) {
      const batch = sortedTypes.slice(i, i + batchSize)
      await Promise.allSettled(batch.map(type => this.loadChart(type)))
    }
  }

  // Get performance metrics
  public getPerformanceMetrics(): {
    totalRegistered: number
    basicCharts: number
    advancedCharts: number
    loadedCharts: number
    averageWeight: number
  } {
    const entries = Array.from(this.registry.values())
    const basicCount = entries.filter(e => !e.isAdvanced).length
    const advancedCount = entries.filter(e => e.isAdvanced).length
    const totalWeight = entries.reduce((sum, e) => sum + (e.performanceWeight || 0), 0)

    return {
      totalRegistered: entries.length,
      basicCharts: basicCount,
      advancedCharts: advancedCount,
      loadedCharts: this.loadedModules.size,
      averageWeight: entries.length > 0 ? totalWeight / entries.length : 0
    }
  }

  // Clear all loaded modules (for memory management)
  public clearLoadedModules(): void {
    this.loadedModules.clear()
    this.loadingPromises.clear()
  }
}

// Export singleton instance
export const chartRegistry = ChartRegistry.getInstance()

// Export convenience functions
export const registerChart = (entry: ChartRegistryEntry) => chartRegistry.registerChart(entry)
export const loadChart = (type: ChartType) => chartRegistry.loadChart(type)
export const isChartRegistered = (type: ChartType) => chartRegistry.isRegistered(type)
export const getRegisteredChartTypes = () => chartRegistry.getRegisteredTypes()
export const preloadCharts = (types: ChartType[]) => chartRegistry.preloadCharts(types)
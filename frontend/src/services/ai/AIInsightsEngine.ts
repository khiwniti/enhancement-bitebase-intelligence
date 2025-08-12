/**
 * Advanced AI Insights Engine for BiteBase Intelligence
 * Generates actionable business recommendations using machine learning algorithms
 */

interface BusinessMetrics {
  revenue: {
    current: number
    previous: number
    trend: 'up' | 'down' | 'stable'
    forecast: number[]
  }
  customers: {
    total: number
    new: number
    returning: number
    churn_rate: number
  }
  menu: {
    items: Array<{
      name: string
      sales: number
      profit_margin: number
      popularity_score: number
    }>
    performance: 'excellent' | 'good' | 'needs_improvement'
  }
  operations: {
    peak_hours: string[]
    staff_efficiency: number
    cost_ratios: {
      food_cost: number
      labor_cost: number
      overhead: number
    }
  }
}

interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend'
  priority: 'high' | 'medium' | 'low'
  category: 'revenue' | 'menu' | 'customers' | 'operations' | 'marketing'
  title: string
  description: string
  impact: {
    revenue_potential: number
    confidence: number
    timeframe: string
  }
  actions: Array<{
    action: string
    effort: 'low' | 'medium' | 'high'
    expected_outcome: string
  }>
  data_points: string[]
  created_at: string
}

interface InsightGenerationOptions {
  focus_areas?: string[]
  time_horizon?: 'short' | 'medium' | 'long'
  risk_tolerance?: 'conservative' | 'moderate' | 'aggressive'
  business_goals?: string[]
}

class AIInsightsEngine {
  private static instance: AIInsightsEngine
  
  static getInstance(): AIInsightsEngine {
    if (!AIInsightsEngine.instance) {
      AIInsightsEngine.instance = new AIInsightsEngine()
    }
    return AIInsightsEngine.instance
  }

  // Generate comprehensive business insights
  async generateInsights(
    metrics: BusinessMetrics,
    options: InsightGenerationOptions = {}
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []

    // Revenue optimization insights
    insights.push(...this.analyzeRevenueOpportunities(metrics))
    
    // Menu performance insights
    insights.push(...this.analyzeMenuPerformance(metrics))
    
    // Customer behavior insights
    insights.push(...this.analyzeCustomerBehavior(metrics))
    
    // Operational efficiency insights
    insights.push(...this.analyzeOperationalEfficiency(metrics))
    
    // Market trends and predictions
    insights.push(...this.analyzeTrendsAndPredictions(metrics))

    // Filter and prioritize based on options
    return this.prioritizeInsights(insights, options)
  }

  // Analyze revenue optimization opportunities
  private analyzeRevenueOpportunities(metrics: BusinessMetrics): AIInsight[] {
    const insights: AIInsight[] = []
    
    // Revenue growth opportunity
    if (metrics.revenue.trend === 'up' && metrics.revenue.forecast.length > 0) {
      const avgGrowth = this.calculateGrowthRate(metrics.revenue.forecast)
      
      if (avgGrowth > 5) {
        insights.push({
          id: `revenue_growth_${Date.now()}`,
          type: 'opportunity',
          priority: 'high',
          category: 'revenue',
          title: 'Strong Revenue Growth Momentum',
          description: `Your revenue is trending upward with ${avgGrowth.toFixed(1)}% projected growth. This is an excellent time to capitalize on this momentum.`,
          impact: {
            revenue_potential: metrics.revenue.current * (avgGrowth / 100),
            confidence: 85,
            timeframe: '3-6 months'
          },
          actions: [
            {
              action: 'Increase marketing spend during peak performance periods',
              effort: 'medium',
              expected_outcome: 'Accelerate customer acquisition by 20-30%'
            },
            {
              action: 'Introduce premium menu items to capture higher margins',
              effort: 'medium',
              expected_outcome: 'Increase average order value by 15-25%'
            },
            {
              action: 'Expand operating hours during high-demand periods',
              effort: 'low',
              expected_outcome: 'Capture additional 10-15% revenue'
            }
          ],
          data_points: ['Revenue trend analysis', 'Forecast modeling', 'Growth rate calculations'],
          created_at: new Date().toISOString()
        })
      }
    }

    // Revenue decline warning
    if (metrics.revenue.trend === 'down') {
      insights.push({
        id: `revenue_decline_${Date.now()}`,
        type: 'warning',
        priority: 'high',
        category: 'revenue',
        title: 'Revenue Decline Detected',
        description: 'Revenue is trending downward. Immediate action is recommended to reverse this trend.',
        impact: {
          revenue_potential: -metrics.revenue.current * 0.1,
          confidence: 90,
          timeframe: '1-2 months'
        },
        actions: [
          {
            action: 'Analyze customer feedback and address service issues',
            effort: 'medium',
            expected_outcome: 'Improve customer satisfaction and retention'
          },
          {
            action: 'Review and optimize pricing strategy',
            effort: 'low',
            expected_outcome: 'Balance competitiveness with profitability'
          },
          {
            action: 'Launch targeted promotional campaigns',
            effort: 'medium',
            expected_outcome: 'Stimulate demand and attract new customers'
          }
        ],
        data_points: ['Revenue trend analysis', 'Comparative performance metrics'],
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  // Analyze menu performance and optimization
  private analyzeMenuPerformance(metrics: BusinessMetrics): AIInsight[] {
    const insights: AIInsight[] = []
    
    // Identify underperforming menu items
    const underperformers = metrics.menu.items.filter(item => 
      item.popularity_score < 30 && item.profit_margin < 60
    )
    
    if (underperformers.length > 0) {
      insights.push({
        id: `menu_optimization_${Date.now()}`,
        type: 'recommendation',
        priority: 'medium',
        category: 'menu',
        title: 'Menu Optimization Opportunity',
        description: `${underperformers.length} menu items are underperforming in both popularity and profitability. Consider menu engineering strategies.`,
        impact: {
          revenue_potential: underperformers.length * 500, // Estimated monthly impact per item
          confidence: 75,
          timeframe: '2-4 weeks'
        },
        actions: [
          {
            action: 'Remove or redesign low-performing items',
            effort: 'low',
            expected_outcome: 'Streamline menu and reduce food waste'
          },
          {
            action: 'Reposition items with better descriptions and pricing',
            effort: 'low',
            expected_outcome: 'Increase item appeal and perceived value'
          },
          {
            action: 'Bundle underperformers with popular items',
            effort: 'medium',
            expected_outcome: 'Increase overall order value and item exposure'
          }
        ],
        data_points: ['Menu item performance analysis', 'Popularity vs profitability matrix'],
        created_at: new Date().toISOString()
      })
    }

    // Identify star performers
    const starPerformers = metrics.menu.items.filter(item => 
      item.popularity_score > 70 && item.profit_margin > 70
    )
    
    if (starPerformers.length > 0) {
      insights.push({
        id: `star_items_${Date.now()}`,
        type: 'opportunity',
        priority: 'high',
        category: 'menu',
        title: 'Leverage Star Menu Items',
        description: `${starPerformers.length} items are performing exceptionally well. Maximize their potential.`,
        impact: {
          revenue_potential: starPerformers.length * 800,
          confidence: 90,
          timeframe: '2-6 weeks'
        },
        actions: [
          {
            action: 'Feature star items prominently in marketing materials',
            effort: 'low',
            expected_outcome: 'Increase sales of high-margin items by 25%'
          },
          {
            action: 'Create variations or upsells for popular items',
            effort: 'medium',
            expected_outcome: 'Expand revenue from successful concepts'
          },
          {
            action: 'Train staff to recommend these items',
            effort: 'low',
            expected_outcome: 'Increase average order value through suggestive selling'
          }
        ],
        data_points: ['Star item identification', 'Performance metrics analysis'],
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  // Analyze customer behavior patterns
  private analyzeCustomerBehavior(metrics: BusinessMetrics): AIInsight[] {
    const insights: AIInsight[] = []
    
    // High churn rate warning
    if (metrics.customers.churn_rate > 15) {
      insights.push({
        id: `churn_warning_${Date.now()}`,
        type: 'warning',
        priority: 'high',
        category: 'customers',
        title: 'High Customer Churn Rate',
        description: `Customer churn rate of ${metrics.customers.churn_rate.toFixed(1)}% is above industry average. Focus on retention strategies.`,
        impact: {
          revenue_potential: -metrics.customers.total * metrics.customers.churn_rate * 45, // Avg customer value
          confidence: 85,
          timeframe: '1-3 months'
        },
        actions: [
          {
            action: 'Implement customer feedback system',
            effort: 'medium',
            expected_outcome: 'Identify and address service issues'
          },
          {
            action: 'Launch loyalty program for returning customers',
            effort: 'high',
            expected_outcome: 'Increase retention rate by 20-30%'
          },
          {
            action: 'Personalize customer communications',
            effort: 'medium',
            expected_outcome: 'Improve customer engagement and satisfaction'
          }
        ],
        data_points: ['Churn rate analysis', 'Customer lifecycle tracking'],
        created_at: new Date().toISOString()
      })
    }

    // New customer acquisition opportunity
    const newCustomerRatio = metrics.customers.new / metrics.customers.total
    if (newCustomerRatio > 0.3) {
      insights.push({
        id: `acquisition_success_${Date.now()}`,
        type: 'opportunity',
        priority: 'medium',
        category: 'customers',
        title: 'Strong New Customer Acquisition',
        description: `${(newCustomerRatio * 100).toFixed(1)}% of customers are new. Focus on converting them to loyal customers.`,
        impact: {
          revenue_potential: metrics.customers.new * 200, // Estimated lifetime value increase
          confidence: 80,
          timeframe: '2-4 months'
        },
        actions: [
          {
            action: 'Create onboarding experience for new customers',
            effort: 'medium',
            expected_outcome: 'Increase new customer retention by 40%'
          },
          {
            action: 'Offer first-time customer incentives',
            effort: 'low',
            expected_outcome: 'Encourage repeat visits within 30 days'
          },
          {
            action: 'Collect contact information for follow-up marketing',
            effort: 'low',
            expected_outcome: 'Build customer database for targeted campaigns'
          }
        ],
        data_points: ['New customer acquisition metrics', 'Conversion rate analysis'],
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  // Analyze operational efficiency
  private analyzeOperationalEfficiency(metrics: BusinessMetrics): AIInsight[] {
    const insights: AIInsight[] = []
    
    // High food cost warning
    if (metrics.operations.cost_ratios.food_cost > 35) {
      insights.push({
        id: `food_cost_warning_${Date.now()}`,
        type: 'warning',
        priority: 'high',
        category: 'operations',
        title: 'Food Cost Above Target',
        description: `Food cost ratio of ${metrics.operations.cost_ratios.food_cost.toFixed(1)}% exceeds the recommended 28-32% range.`,
        impact: {
          revenue_potential: -metrics.revenue.current * 0.05,
          confidence: 90,
          timeframe: '1-2 months'
        },
        actions: [
          {
            action: 'Review supplier contracts and negotiate better rates',
            effort: 'medium',
            expected_outcome: 'Reduce food costs by 3-5%'
          },
          {
            action: 'Implement portion control and waste reduction measures',
            effort: 'medium',
            expected_outcome: 'Decrease food waste by 15-20%'
          },
          {
            action: 'Optimize menu pricing based on true food costs',
            effort: 'low',
            expected_outcome: 'Improve profit margins by 2-4%'
          }
        ],
        data_points: ['Food cost ratio analysis', 'Industry benchmarking'],
        created_at: new Date().toISOString()
      })
    }

    // Staff efficiency optimization
    if (metrics.operations.staff_efficiency < 75) {
      insights.push({
        id: `staff_efficiency_${Date.now()}`,
        type: 'recommendation',
        priority: 'medium',
        category: 'operations',
        title: 'Staff Efficiency Improvement Opportunity',
        description: `Staff efficiency at ${metrics.operations.staff_efficiency.toFixed(1)}% indicates potential for optimization.`,
        impact: {
          revenue_potential: metrics.revenue.current * 0.08,
          confidence: 70,
          timeframe: '2-3 months'
        },
        actions: [
          {
            action: 'Provide additional staff training programs',
            effort: 'medium',
            expected_outcome: 'Improve service speed and quality'
          },
          {
            action: 'Optimize staff scheduling based on peak hours',
            effort: 'low',
            expected_outcome: 'Reduce labor costs while maintaining service levels'
          },
          {
            action: 'Implement performance incentive programs',
            effort: 'medium',
            expected_outcome: 'Increase staff motivation and productivity'
          }
        ],
        data_points: ['Staff efficiency metrics', 'Performance benchmarking'],
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  // Analyze trends and make predictions
  private analyzeTrendsAndPredictions(metrics: BusinessMetrics): AIInsight[] {
    const insights: AIInsight[] = []
    
    // Seasonal trend prediction
    const currentMonth = new Date().getMonth()
    const isHolidaySeason = currentMonth === 11 || currentMonth === 0 || currentMonth === 1
    
    if (isHolidaySeason && metrics.revenue.trend === 'up') {
      insights.push({
        id: `seasonal_opportunity_${Date.now()}`,
        type: 'opportunity',
        priority: 'high',
        category: 'revenue',
        title: 'Holiday Season Revenue Opportunity',
        description: 'Holiday season presents significant revenue growth potential. Prepare for increased demand.',
        impact: {
          revenue_potential: metrics.revenue.current * 0.25,
          confidence: 85,
          timeframe: '1-3 months'
        },
        actions: [
          {
            action: 'Create holiday-themed menu items and promotions',
            effort: 'medium',
            expected_outcome: 'Capture seasonal demand and increase average order value'
          },
          {
            action: 'Increase inventory and staff for peak periods',
            effort: 'high',
            expected_outcome: 'Ensure service quality during high-demand periods'
          },
          {
            action: 'Launch targeted holiday marketing campaigns',
            effort: 'medium',
            expected_outcome: 'Attract holiday diners and increase brand visibility'
          }
        ],
        data_points: ['Seasonal trend analysis', 'Historical performance data'],
        created_at: new Date().toISOString()
      })
    }

    return insights
  }

  // Prioritize insights based on options and business impact
  private prioritizeInsights(insights: AIInsight[], options: InsightGenerationOptions): AIInsight[] {
    // Sort by priority and potential impact
    return insights
      .filter(insight => {
        if (options.focus_areas && options.focus_areas.length > 0) {
          return options.focus_areas.includes(insight.category)
        }
        return true
      })
      .sort((a, b) => {
        // Priority order: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        
        if (priorityDiff !== 0) return priorityDiff
        
        // If same priority, sort by revenue potential
        return Math.abs(b.impact.revenue_potential) - Math.abs(a.impact.revenue_potential)
      })
      .slice(0, 10) // Limit to top 10 insights
  }

  // Helper method to calculate growth rate
  private calculateGrowthRate(forecast: number[]): number {
    if (forecast.length < 2) return 0
    
    const start = forecast[0]
    const end = forecast[forecast.length - 1]
    
    return ((end - start) / start) * 100
  }

  // Generate insights for specific business scenarios
  async generateScenarioInsights(
    scenario: 'new_restaurant' | 'declining_performance' | 'expansion_ready' | 'cost_optimization',
    metrics: BusinessMetrics
  ): Promise<AIInsight[]> {
    const baseInsights = await this.generateInsights(metrics)
    
    // Filter and customize insights based on scenario
    switch (scenario) {
      case 'new_restaurant':
        return baseInsights.filter(insight => 
          insight.category === 'customers' || insight.category === 'marketing'
        )
      case 'declining_performance':
        return baseInsights.filter(insight => 
          insight.type === 'warning' || insight.priority === 'high'
        )
      case 'expansion_ready':
        return baseInsights.filter(insight => 
          insight.type === 'opportunity' && insight.impact.revenue_potential > 1000
        )
      case 'cost_optimization':
        return baseInsights.filter(insight => 
          insight.category === 'operations' || insight.category === 'menu'
        )
      default:
        return baseInsights
    }
  }
}

export const aiInsightsEngine = AIInsightsEngine.getInstance()
export type { BusinessMetrics, AIInsight, InsightGenerationOptions }

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LocationCoordinates, LocationAnalysisResponse } from '@/types'
import { apiClient } from '@/lib/api-client'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { 
  Brain, 
  MessageSquare, 
  Download, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  Users, 
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Send,
  Loader2
} from 'lucide-react'

interface MarketReport {
  id: string
  title: string
  location: LocationCoordinates
  generatedAt: Date
  confidence: number
  summary: string
  keyInsights: string[]
  recommendations: string[]
  riskFactors: string[]
  marketScore: number
  competitionLevel: 'low' | 'medium' | 'high'
  opportunityRating: number
  analysis: LocationAnalysisResponse
}

interface MarketReportAgentProps {
  selectedLocation?: LocationCoordinates
  onReportGenerated?: (report: MarketReport) => void
  className?: string
}

export function MarketReportAgent({
  selectedLocation,
  onReportGenerated,
  className = ''
}: MarketReportAgentProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentReport, setCurrentReport] = useState<MarketReport | null>(null)
  const [reportHistory, setReportHistory] = useState<MarketReport[]>([])
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('')
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'analyzing' | 'generating'>('idle')

  // Predefined query suggestions
  const querySuggestions = [
    "Analyze the best pizza restaurant locations in Manhattan",
    "Find high-potential areas for a casual dining restaurant",
    "Compare coffee shop opportunities in Brooklyn vs Queens",
    "Identify underserved markets for ethnic cuisine",
    "Evaluate expansion opportunities for fast-casual chains"
  ]

  const generateMarketReport = async (location: LocationCoordinates, query?: string) => {
    setIsGenerating(true)
    setAgentStatus('thinking')

    try {
      // Step 1: AI Agent starts thinking
      await new Promise(resolve => setTimeout(resolve, 1000))
      setAgentStatus('analyzing')

      // Step 2: Perform location analysis
      const analysisResponse = await apiClient.locations.analyze({
        latitude: location.latitude,
        longitude: location.longitude,
        radius_km: 2,
        cuisine_types: query ? extractCuisineFromQuery(query) : undefined
      })

      setAgentStatus('generating')
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Step 3: Generate AI-powered insights and recommendations
      const report: MarketReport = {
        id: `report_${Date.now()}`,
        title: query || `Market Analysis for ${location.name}`,
        location,
        generatedAt: new Date(),
        confidence: analysisResponse.analysis.location_score.confidence_level === 'high' ? 0.9 : 
                   analysisResponse.analysis.location_score.confidence_level === 'medium' ? 0.7 : 0.5,
        summary: generateAISummary(analysisResponse.analysis),
        keyInsights: generateAIInsights(analysisResponse.analysis),
        recommendations: analysisResponse.analysis.recommendations,
        riskFactors: analysisResponse.analysis.risk_assessment.risk_factors,
        marketScore: analysisResponse.analysis.location_score.overall_score,
        competitionLevel: analysisResponse.analysis.competition_analysis.market_saturation as 'low' | 'medium' | 'high',
        opportunityRating: calculateOpportunityRating(analysisResponse.analysis),
        analysis: analysisResponse
      }

      setCurrentReport(report)
      setReportHistory(prev => [report, ...prev.slice(0, 4)]) // Keep last 5 reports
      onReportGenerated?.(report)

    } catch (error) {
      console.error('Failed to generate market report:', error)
    } finally {
      setIsGenerating(false)
      setAgentStatus('idle')
    }
  }

  const handleNaturalLanguageQuery = async () => {
    if (!naturalLanguageQuery.trim()) return

    // Extract location from query or use selected location
    const location = selectedLocation || {
      latitude: 40.7589,
      longitude: -73.9851,
      name: 'New York City'
    }

    await generateMarketReport(location, naturalLanguageQuery)
    setNaturalLanguageQuery('')
  }

  const extractCuisineFromQuery = (query: string): string[] => {
    const cuisines = ['pizza', 'coffee', 'italian', 'chinese', 'mexican', 'indian', 'japanese', 'american']
    return cuisines.filter(cuisine => query.toLowerCase().includes(cuisine))
  }

  const generateAISummary = (analysis: any): string => {
    const score = analysis.location_score.overall_score
    const population = analysis.demographic_analysis.estimated_population
    const competitors = analysis.competition_analysis.total_competitors

    if (score >= 8) {
      return `Exceptional location with a ${score.toFixed(1)}/10 market score. Strong demographics (${formatNumber(population)} population) and balanced competition (${competitors} competitors) create ideal conditions for restaurant success.`
    } else if (score >= 6) {
      return `Solid location opportunity with a ${score.toFixed(1)}/10 market score. Good population density (${formatNumber(population)}) with moderate competition (${competitors} competitors) suggests viable business potential.`
    } else {
      return `Challenging location with a ${score.toFixed(1)}/10 market score. Lower population density (${formatNumber(population)}) and competition factors (${competitors} competitors) require careful consideration and strategic positioning.`
    }
  }

  const generateAIInsights = (analysis: any): string[] => {
    const insights = []
    
    if (analysis.demographic_analysis.median_income > 75000) {
      insights.push("High-income demographics support premium pricing strategies")
    }
    
    if (analysis.competition_analysis.market_saturation === 'low') {
      insights.push("Low market saturation presents first-mover advantages")
    }
    
    if (analysis.accessibility_analysis.accessibility_grade === 'A') {
      insights.push("Excellent accessibility drives higher foot traffic potential")
    }
    
    if (analysis.market_analysis.market_diversity > 0.7) {
      insights.push("Diverse market supports multiple cuisine concepts")
    }

    return insights.length > 0 ? insights : ["Market conditions require detailed strategic planning"]
  }

  const calculateOpportunityRating = (analysis: any): number => {
    const factors = [
      analysis.location_score.overall_score / 10,
      analysis.location_score.market_potential_score / 10,
      (10 - analysis.competition_analysis.competition_density) / 10,
      analysis.demographic_analysis.estimated_population / 100000
    ]
    
    return Math.min(Math.max(factors.reduce((a, b) => a + b, 0) / factors.length * 10, 0), 10)
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'json') => {
    if (!currentReport) return

    // Simulate export functionality
    const exportData = {
      report: currentReport,
      exportedAt: new Date(),
      format
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `market-report-${currentReport.id}.${format === 'json' ? 'json' : format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI Agent Interface */}
      <Card className="card-dark border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            AI Market Report Agent
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </CardTitle>
          <CardDescription>
            Generate comprehensive market reports using natural language queries and AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Natural Language Query Interface */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Ask the AI Agent</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Find the best pizza locations in Manhattan..."
                value={naturalLanguageQuery}
                onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageQuery()}
                className="flex-1"
                disabled={isGenerating}
              />
              <Button 
                onClick={handleNaturalLanguageQuery}
                disabled={isGenerating || !naturalLanguageQuery.trim()}
                className="btn-primary"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Query Suggestions */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Quick Suggestions</label>
            <div className="flex flex-wrap gap-2">
              {querySuggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setNaturalLanguageQuery(suggestion)}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Agent Status */}
          {agentStatus !== 'idle' && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-primary font-medium">
                {agentStatus === 'thinking' && 'AI Agent is processing your request...'}
                {agentStatus === 'analyzing' && 'Analyzing market data and demographics...'}
                {agentStatus === 'generating' && 'Generating comprehensive market report...'}
              </span>
            </div>
          )}

          {/* Quick Actions */}
          {selectedLocation && (
            <div className="flex gap-2">
              <Button
                onClick={() => generateMarketReport(selectedLocation)}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Analyze Current Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Report Display */}
      {currentReport && (
        <Card className="card-dark">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {currentReport.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {currentReport.generatedAt.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {(currentReport.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => exportReport('pdf')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  onClick={() => exportReport('excel')}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Executive Summary */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Executive Summary
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {currentReport.summary}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {currentReport.marketScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Market Score</div>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {currentReport.opportunityRating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Opportunity</div>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                <div className="text-2xl font-bold text-orange-400 capitalize">
                  {currentReport.competitionLevel}
                </div>
                <div className="text-xs text-muted-foreground">Competition</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {(currentReport.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            </div>

            {/* Key Insights */}
            <div>
              <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Key Insights
              </h4>
              <ul className="space-y-2">
                {currentReport.keyInsights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-green-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Recommendations */}
            <div>
              <h4 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {currentReport.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-blue-400 mt-1">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            {currentReport.riskFactors.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Factors
                </h4>
                <ul className="space-y-2">
                  {currentReport.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-orange-400 mt-1">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report History */}
      {reportHistory.length > 0 && (
        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>
              Your recent AI-generated market analysis reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportHistory.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setCurrentReport(report)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{report.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Score: {report.marketScore.toFixed(1)} • {report.generatedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`
                      ${report.marketScore >= 8 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        report.marketScore >= 6 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'}
                    `}>
                      {report.marketScore >= 8 ? 'Excellent' : 
                       report.marketScore >= 6 ? 'Good' : 'Challenging'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
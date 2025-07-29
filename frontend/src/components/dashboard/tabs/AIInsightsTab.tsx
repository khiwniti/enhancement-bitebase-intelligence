"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, BarChart3 } from 'lucide-react';

export default function AIInsightsTab() {
  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h2>
          <p className="text-gray-600 dark:text-gray-300">
            AI-powered recommendations and market intelligence
          </p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
          <Brain className="h-4 w-4 mr-2" />
          Generate Insights
        </Button>
      </div>

      {/* Insight Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">12</div>
            <p className="text-xs text-yellow-600">New insights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
            <p className="text-xs text-red-600">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
            <p className="text-xs text-blue-600">Action items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">15</div>
            <p className="text-xs text-green-600">Market trends</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Latest AI Insights</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Recent AI-generated insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                type: 'opportunity',
                title: 'Peak Hours Optimization',
                description: 'AI analysis suggests extending lunch hours from 11:30-14:30 could capture 15% more customers based on foot traffic patterns.',
                confidence: 92,
                impact: 'High',
                timeframe: '2 hours ago',
                icon: Lightbulb,
                color: 'yellow'
              },
              {
                type: 'warning',
                title: 'Competitor Price War',
                description: 'Three nearby restaurants have reduced prices by 10-15%. Consider strategic response to maintain market position.',
                confidence: 87,
                impact: 'Medium',
                timeframe: '4 hours ago',
                icon: AlertTriangle,
                color: 'red'
              },
              {
                type: 'recommendation',
                title: 'Menu Optimization',
                description: 'Thai curry dishes show 23% higher profit margins. Recommend featuring these items more prominently.',
                confidence: 94,
                impact: 'High',
                timeframe: '6 hours ago',
                icon: Target,
                color: 'blue'
              },
              {
                type: 'trend',
                title: 'Seasonal Demand Shift',
                description: 'Spicy food demand increases 18% during cool season (Nov-Feb). Plan menu adjustments accordingly.',
                confidence: 89,
                impact: 'Medium',
                timeframe: '1 day ago',
                icon: TrendingUp,
                color: 'green'
              },
              {
                type: 'opportunity',
                title: 'Delivery Market Gap',
                description: 'Analysis shows 40% increase in late-night delivery orders (22:00-01:00) with limited competition.',
                confidence: 85,
                impact: 'High',
                timeframe: '1 day ago',
                icon: Zap,
                color: 'purple'
              }
            ].map((insight, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-${insight.color}-100 dark:bg-${insight.color}-900/20`}>
                    <insight.icon className={`h-5 w-5 text-${insight.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-gray-900 dark:text-white font-medium">{insight.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{insight.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`bg-${insight.color}-100 text-${insight.color}-800 mb-1`}>
                          {insight.confidence}% confidence
                        </Badge>
                        <p className="text-xs text-gray-500">{insight.timeframe}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${insight.impact === 'High' ? 'border-red-300 text-red-700' : 'border-yellow-300 text-yellow-700'}`}
                      >
                        {insight.impact} Impact
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">AI Model Performance</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Accuracy and reliability metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Prediction Accuracy</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-sm font-bold">94%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Market Analysis Confidence</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                  <span className="text-sm font-bold">89%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Trend Detection</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                  </div>
                  <span className="text-sm font-bold">91%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Recommendation Success</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <span className="text-sm font-bold">87%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Insight Categories</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Distribution of AI insights by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Insights Distribution Chart</p>
                <p className="text-xs text-gray-400">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

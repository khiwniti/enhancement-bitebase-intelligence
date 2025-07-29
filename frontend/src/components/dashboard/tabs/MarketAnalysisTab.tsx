"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function MarketAnalysisTab() {
  return (
    <div className="space-y-6">
      {/* Market Analysis Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive market research and competitor analysis
          </p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
          <Globe className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary-500" />
              Market Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$2.4M</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total addressable market</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-500" />
              Competitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">47</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direct competitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12.5%</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Year over year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary-500" />
              Avg Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$85K</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Per restaurant/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Market Analyses</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Your latest market research reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                location: 'Sukhumvit District, Bangkok',
                score: 8.5,
                competitors: 23,
                status: 'completed',
                date: '2 hours ago'
              },
              {
                location: 'Silom District, Bangkok',
                score: 7.2,
                competitors: 31,
                status: 'completed',
                date: '1 day ago'
              },
              {
                location: 'Chatuchak District, Bangkok',
                score: 6.8,
                competitors: 18,
                status: 'processing',
                date: '2 days ago'
              }
            ].map((analysis, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-gray-900 dark:text-white font-medium">{analysis.location}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {analysis.competitors} competitors found
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={analysis.status === 'completed' ? 'default' : 'secondary'}
                      className={analysis.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                    >
                      Score: {analysis.score}/10
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{analysis.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bangkok, Thailand</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Market Opportunities</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Identified growth opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'Underserved areas in Thonglor district',
                'Growing demand for healthy Thai options',
                'Delivery market expansion opportunity',
                'Tourist area premium pricing potential'
              ].map((opportunity, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{opportunity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Market Challenges</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Key challenges to consider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'High competition in Siam Square area',
                'Rising rental costs in prime locations',
                'Seasonal fluctuations in tourist areas',
                'Delivery platform commission rates'
              ].map((challenge, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{challenge}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

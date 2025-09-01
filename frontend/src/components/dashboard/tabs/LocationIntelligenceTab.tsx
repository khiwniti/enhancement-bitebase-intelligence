"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Target, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function LocationIntelligenceTab() {
  return (
    <div className="space-y-6">
      {/* Location Intelligence Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Location Intelligence</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Interactive mapping and location analysis tools
          </p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
          <MapPin className="h-4 w-4 mr-2" />
          Analyze Location
        </Button>
      </div>

      {/* Location Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              Locations Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
            <p className="text-xs text-blue-600">+12 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              High Potential Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">23</div>
            <p className="text-xs text-green-600">Prime locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Avg Foot Traffic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">2.4K</div>
            <p className="text-xs text-purple-600">Per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-500" />
              Avg Rent Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$2,850</div>
            <p className="text-xs text-orange-600">Per sqm/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Interactive Location Map</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Explore potential restaurant locations with real-time data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interactive Map</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Interactive map with location intelligence would be displayed here
              </p>
              <Button variant="outline">
                <Navigation className="h-4 w-4 mr-2" />
                Load Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Top Recommended Locations</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Best locations based on AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: 'Sukhumvit Soi 11',
                  score: 9.2,
                  footTraffic: '3.2K/day',
                  rent: '$3,200/sqm',
                  highlights: ['High tourist traffic', 'Premium area', 'Good transport']
                },
                {
                  name: 'Thonglor District',
                  score: 8.7,
                  footTraffic: '2.8K/day',
                  rent: '$2,800/sqm',
                  highlights: ['Growing area', 'Young professionals', 'Low competition']
                },
                {
                  name: 'Silom Road',
                  score: 8.3,
                  footTraffic: '4.1K/day',
                  rent: '$3,500/sqm',
                  highlights: ['Business district', 'Lunch crowd', 'High visibility']
                }
              ].map((location, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-medium">{location.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {location.footTraffic} foot traffic
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {location.rent} rent
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Score: {location.score}/10
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {location.highlights.map((highlight, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Location Insights</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Key insights from location analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-blue-900 dark:text-blue-100 font-medium">Growth Opportunity</h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      Thonglor area shows 25% population growth and increasing disposable income
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="text-green-900 dark:text-green-100 font-medium">Market Gap</h4>
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      Limited authentic Thai restaurants in Ekkamai area despite high demand
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="text-purple-900 dark:text-purple-100 font-medium">Demographics</h4>
                    <p className="text-purple-800 dark:text-purple-200 text-sm">
                      Target area has 65% millennials with high food delivery usage
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="text-orange-900 dark:text-orange-100 font-medium">Transport Access</h4>
                    <p className="text-orange-800 dark:text-orange-200 text-sm">
                      Locations near BTS stations show 40% higher customer retention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

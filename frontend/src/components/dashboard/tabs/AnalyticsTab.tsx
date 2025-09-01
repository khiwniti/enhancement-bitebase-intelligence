"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Users, ShoppingCart, Calendar, BarChart3 } from 'lucide-react';

export default function AnalyticsTab() {
  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time performance metrics and insights
          </p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$125,430</div>
            <p className="text-xs text-green-600">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,250</div>
            <p className="text-xs text-blue-600">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-purple-500" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">3,400</div>
            <p className="text-xs text-purple-600">+15.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$36.89</div>
            <p className="text-xs text-orange-600">+3.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Revenue Trend</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Monthly revenue over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Revenue Chart</p>
                <p className="text-xs text-gray-400">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Customer Growth</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              New vs returning customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Customer Chart</p>
                <p className="text-xs text-gray-400">Chart visualization would go here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Top Performing Days</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Best days of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { day: 'Friday', revenue: '$18,450', growth: '+23%' },
                { day: 'Saturday', revenue: '$16,230', growth: '+18%' },
                { day: 'Sunday', revenue: '$14,890', growth: '+15%' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{item.day}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.revenue}</div>
                    <Badge variant="outline" className="text-xs text-green-600">
                      {item.growth}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Peak Hours</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Busiest times of day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: '12:00 - 13:00', orders: '245', percentage: '18%' },
                { time: '19:00 - 20:00', orders: '198', percentage: '15%' },
                { time: '18:00 - 19:00', orders: '167', percentage: '12%' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{item.time}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.orders} orders</div>
                    <Badge variant="outline" className="text-xs">
                      {item.percentage}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Popular Items</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Best selling menu items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { item: 'Pad Thai', orders: '342', revenue: '$4,890' },
                { item: 'Green Curry', orders: '298', revenue: '$4,170' },
                { item: 'Tom Yum Soup', orders: '256', revenue: '$3,584' }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{item.item}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{item.revenue}</div>
                    <div className="text-xs text-gray-500">{item.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { Input } from '@/components/input'
import {
  Wrench,
  Play,
  Save,
  Download,
  Code,
  Database,
  BarChart3,
  Table,
  PieChart,
  LineChart,
  Settings,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  Zap
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'

export default function AnalyticsWorkbenchPage() {
  const [activeQuery, setActiveQuery] = useState('sales-analysis')
  const [queryText, setQueryText] = useState('SELECT * FROM orders WHERE date >= "2024-01-01"')

  const savedQueries = [
    {
      id: 'sales-analysis',
      name: 'Sales Analysis',
      description: 'Monthly sales performance analysis',
      lastRun: '2 hours ago',
      status: 'completed',
      type: 'SQL'
    },
    {
      id: 'customer-segments',
      name: 'Customer Segments',
      description: 'Customer segmentation analysis',
      lastRun: '1 day ago',
      status: 'completed',
      type: 'SQL'
    },
    {
      id: 'revenue-trends',
      name: 'Revenue Trends',
      description: 'Revenue trending over time',
      lastRun: '3 hours ago',
      status: 'running',
      type: 'SQL'
    }
  ]

  const dataSources = [
    { name: 'Orders', table: 'orders', records: '125K', status: 'connected' },
    { name: 'Customers', table: 'customers', records: '45K', status: 'connected' },
    { name: 'Products', table: 'products', records: '2.3K', status: 'connected' },
    { name: 'Reviews', table: 'reviews', records: '89K', status: 'connected' }
  ]

  const chartTypes = [
    { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
    { id: 'line', name: 'Line Chart', icon: LineChart },
    { id: 'pie', name: 'Pie Chart', icon: PieChart },
    { id: 'table', name: 'Data Table', icon: Table }
  ]

  const queryResults = [
    { date: '2024-01-01', orders: 245, revenue: 12450 },
    { date: '2024-01-02', orders: 289, revenue: 14230 },
    { date: '2024-01-03', orders: 312, revenue: 15680 },
    { date: '2024-01-04', orders: 267, revenue: 13890 },
    { date: '2024-01-05', orders: 334, revenue: 16720 }
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics Workbench</h1>
                <p className="text-gray-600">
                  Build custom queries and visualizations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/analytics-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Query
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-500" asChild>
                <Link href="/analytics">
                  <Play className="w-4 h-4 mr-2" />
                  Run Query
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              className="lg:col-span-1 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Saved Queries */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Saved Queries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedQueries.map((query) => (
                      <button
                        key={query.id}
                        onClick={() => setActiveQuery(query.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activeQuery === query.id
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{query.name}</span>
                          <Badge 
                            variant={query.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {query.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{query.description}</p>
                        <p className="text-xs text-gray-500">Last run: {query.lastRun}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dataSources.map((source, index) => (
                      <div key={source.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Database className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{source.name}</p>
                            <p className="text-xs text-gray-500">{source.records} records</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chart Types */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {chartTypes.map((chart) => (
                      <button
                        key={chart.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <chart.icon className="h-6 w-6 text-gray-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">{chart.name}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <motion.div
              className="lg:col-span-3 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Query Editor */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-purple-500" />
                    <span>Query Editor</span>
                  </CardTitle>
                  <CardDescription>
                    Write and execute custom SQL queries
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <textarea
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your SQL query here..."
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Estimated runtime: ~2.3s</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/settings">
                            <Settings className="h-4 w-4 mr-2" />
                            Format
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/ai-assistant">
                            <Zap className="h-4 w-4 mr-2" />
                            Explain
                          </Link>
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-purple-500 to-indigo-500" asChild>
                          <Link href="/analytics">
                            <Play className="h-4 w-4 mr-2" />
                            Execute
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Query Results */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Table className="h-5 w-5 text-green-500" />
                      <span>Query Results</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {queryResults.length} rows
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/reports">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Link>
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-3 font-medium text-gray-600">Date</th>
                          <th className="text-left p-3 font-medium text-gray-600">Orders</th>
                          <th className="text-left p-3 font-medium text-gray-600">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queryResults.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3">{row.date}</td>
                            <td className="p-3">{row.orders}</td>
                            <td className="p-3">₿{row.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Visualization Preview */}
              <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Visualization Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Chart Preview</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Execute query to generate visualization
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

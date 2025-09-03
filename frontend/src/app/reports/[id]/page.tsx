'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import {
  FileText,
  Download,
  Share,
  ArrowLeft,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  Activity,
  Target,
  Clock
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface CustomerSegment {
  segment: string
  count: number
  percentage: string
}

interface Preference {
  cuisine: string
  preference: string
}

interface QuarterlyGrowth {
  quarter: string
  revenue: string
  profit: string
}

interface ExpenseBreakdown {
  category: string
  amount: string
  percentage: string
}

interface ReportData {
  title: string
  description: string
  category: string
  generatedAt: string
  author: string
  format: string
  size: string
  status: string
  data: {
    customerSegments?: CustomerSegment[]
    preferences?: Preference[]
    quarterlyGrowth?: QuarterlyGrowth[]
    expenseBreakdown?: ExpenseBreakdown[]
    [key: string]: any
  }
}

export default function ReportViewPage() {
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch report data from backend
  const fetchReportData = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8000/api/v1/reports/${id}`)
      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error('Error fetching report:', error)
      // Fallback to mock data
      setReport(getMockReportData(id))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData(reportId)
  }, [reportId])

  // Mock report data as fallback
  const getMockReportData = (id: string) => {
    const reports = {
      '1': {
        title: 'Monthly Sales Performance',
        description: 'Comprehensive sales analysis for January 2024',
        category: 'Sales',
        generatedAt: '2024-01-31 23:59',
        author: 'System',
        format: 'PDF',
        size: '2.4 MB',
        status: 'completed',
        data: {
          totalSales: '₿2.4M',
          growth: '+12.5%',
          orders: '15,234',
          avgOrderValue: '₿157',
          topProducts: [
            { name: 'Pad Thai', sales: '₿245K', orders: 1560 },
            { name: 'Green Curry', sales: '₿198K', orders: 1240 },
            { name: 'Tom Yum Soup', sales: '₿156K', orders: 980 }
          ],
          salesByLocation: [
            { location: 'Central Plaza', sales: '₿890K', growth: '+15%' },
            { location: 'Siam Square', sales: '₿720K', growth: '+8%' },
            { location: 'Chatuchak', sales: '₿450K', growth: '+5%' },
            { location: 'Silom', sales: '₿340K', growth: '+12%' }
          ]
        }
      },
      '2': {
        title: 'Customer Behavior Analysis',
        description: 'Deep dive into customer patterns and preferences',
        category: 'Customer',
        generatedAt: '2024-01-30 14:30',
        author: 'Analytics Team',
        format: 'Excel',
        size: '1.8 MB',
        status: 'completed',
        data: {
          totalCustomers: '45,678',
          newCustomers: '3,456',
          retention: '87.3%',
          avgVisits: '4.2/month',
          customerSegments: [
            { segment: 'Regular Diners', count: 18500, percentage: '40.5%' },
            { segment: 'Occasional Visitors', count: 15200, percentage: '33.3%' },
            { segment: 'New Customers', count: 8900, percentage: '19.5%' },
            { segment: 'VIP Members', count: 3078, percentage: '6.7%' }
          ],
          preferences: [
            { cuisine: 'Thai Traditional', preference: '68%' },
            { cuisine: 'Thai Fusion', preference: '45%' },
            { cuisine: 'Street Food', preference: '38%' },
            { cuisine: 'Vegetarian', preference: '22%' }
          ]
        }
      },
      '3': {
        title: 'Financial Summary Q4 2023',
        description: 'Quarterly financial performance and projections',
        category: 'Financial',
        generatedAt: '2024-01-15 09:00',
        author: 'Finance Team',
        format: 'PDF',
        size: '4.2 MB',
        status: 'completed',
        data: {
          revenue: '₿8.2M',
          profit: '₿1.8M',
          margin: '22.1%',
          expenses: '₿6.4M',
          quarterlyGrowth: [
            { quarter: 'Q1 2023', revenue: '₿7.1M', profit: '₿1.4M' },
            { quarter: 'Q2 2023', revenue: '₿7.6M', profit: '₿1.6M' },
            { quarter: 'Q3 2023', revenue: '₿7.9M', profit: '₿1.7M' },
            { quarter: 'Q4 2023', revenue: '₿8.2M', profit: '₿1.8M' }
          ],
          expenseBreakdown: [
            { category: 'Food Costs', amount: '₿3.2M', percentage: '50%' },
            { category: 'Staff Salaries', amount: '₿1.9M', percentage: '30%' },
            { category: 'Rent & Utilities', amount: '₿0.8M', percentage: '12%' },
            { category: 'Marketing', amount: '₿0.5M', percentage: '8%' }
          ]
        }
      }
    }
    return reports[id as keyof typeof reports] || reports['1']
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading report...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600">Report not found</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const renderSalesReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.totalSales}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">{report.data.growth} from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.orders}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.avgOrderValue}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.growth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.data.topProducts.map((product: any, index: number) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{product.sales}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sales by Location */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.data.salesByLocation.map((location: any) => (
              <div key={location.location} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium">{location.location}</p>
                  <p className="text-sm text-green-600">{location.growth} growth</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{location.sales}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCustomerReport = () => (
    <div className="space-y-6">
      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.totalCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.newCustomers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.retention}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Visits</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.avgVisits}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      {report.data.customerSegments && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.data.customerSegments.map((segment) => (
                <div key={segment.segment} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{segment.segment}</p>
                    <p className="text-sm text-gray-500">{segment.count.toLocaleString()} customers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{segment.percentage}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Preferences */}
      {report.data.preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Cuisine Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.data.preferences.map((pref) => (
              <div key={pref.cuisine} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <p className="font-medium">{pref.cuisine}</p>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: pref.preference }}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-900">{pref.preference}</span>
                </div>
              </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.revenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.profit}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.margin}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{report.data.expenses}</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Growth */}
      {report.data.quarterlyGrowth && (
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.data.quarterlyGrowth.map((quarter) => (
              <div key={quarter.quarter} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{quarter.quarter}</p>
                </div>
                <div className="flex space-x-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="font-bold text-green-600">{quarter.revenue}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Profit</p>
                    <p className="font-bold text-blue-600">{quarter.profit}</p>
                  </div>
                </div>
              </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Breakdown */}
      {report.data.expenseBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {report.data.expenseBreakdown.map((expense) => (
              <div key={expense.category} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <p className="font-medium">{expense.category}</p>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                      style={{ width: expense.percentage }}
                    ></div>
                  </div>
                  <span className="font-bold text-gray-900">{expense.amount}</span>
                  <span className="text-sm text-gray-500">({expense.percentage})</span>
                </div>
              </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderReportContent = () => {
    switch (report.category) {
      case 'Sales':
        return renderSalesReport()
      case 'Customer':
        return renderCustomerReport()
      case 'Financial':
        return renderFinancialReport()
      default:
        return renderSalesReport()
    }
  }

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
              <Button variant="outline" size="sm" asChild>
                <Link href="/reports">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Link>
              </Button>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{report.title}</h1>
                <p className="text-gray-600">{report.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <Download className="w-4 h-4 mr-2" />
                Download {report.format}
              </Button>
            </div>
          </motion.div>

          {/* Report Info */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Generated</p>
                      <p className="font-medium">{report.generatedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Author</p>
                      <p className="font-medium">{report.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Format</p>
                      <p className="font-medium">{report.format}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Size</p>
                      <p className="font-medium">{report.size}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Report Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {renderReportContent()}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  Calendar, 
  ShoppingCart, 
  DollarSign, 
  Clock,
  AlertTriangle,
  TrendingUp,
  Plus,
  Settings
} from 'lucide-react';

// Import management components
import StaffManagement from '@/components/restaurant-management/StaffManagement';
import InventoryManagement from '@/components/restaurant-management/InventoryManagement';
import TableManagement from '@/components/restaurant-management/TableManagement';
import OrderManagement from '@/components/restaurant-management/OrderManagement';
import FinancialManagement from '@/components/restaurant-management/FinancialManagement';

export default function RestaurantManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview cards
  const overviewStats = {
    activeStaff: 24,
    lowStockItems: 8,
    todayReservations: 45,
    pendingOrders: 12,
    todayRevenue: 8450.75,
    averageOrderValue: 32.50
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-primary font-bold text-foreground">
              Restaurant Management
            </h1>
            <p className="text-muted-foreground mt-1 font-secondary">
              Professional operations management for your restaurant
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              className="bg-[#74C365] hover:bg-[#65B356] text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Add
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="border-l-4 border-l-bitebase-primary bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-secondary">Active Staff</p>
                  <p className="text-2xl font-primary font-bold text-foreground">{overviewStats.activeStaff}</p>
                </div>
                <Users className="h-8 w-8 text-bitebase-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-bitebase-accent bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground font-secondary">Low Stock Items</p>
                  <p className="text-2xl font-primary font-bold text-foreground">{overviewStats.lowStockItems}</p>
                </div>
                <div className="relative">
                  <Package className="h-8 w-8 text-bitebase-accent" />
                  <AlertTriangle className="h-4 w-4 text-bitebase-accent absolute -top-1 -right-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-bitebase-secondary bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats.todayReservations}</p>
                </div>
                <Calendar className="h-8 w-8 text-[#F4C431]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#2196F3]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats.pendingOrders}</p>
                </div>
                <div className="relative">
                  <ShoppingCart className="h-8 w-8 text-[#2196F3]" />
                  <Clock className="h-4 w-4 text-[#2196F3] absolute -top-1 -right-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4CAF50]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${overviewStats.todayRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-[#4CAF50]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#FF9800]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">${overviewStats.averageOrderValue}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#FF9800]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Management Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-6 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-secondary ${
                activeTab === 'overview'
                  ? 'bg-bitebase-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-secondary ${
                activeTab === 'staff'
                  ? 'bg-bitebase-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Staff
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-secondary ${
                activeTab === 'inventory'
                  ? 'bg-bitebase-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-secondary ${
                activeTab === 'tables'
                  ? 'bg-bitebase-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tables
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-secondary ${
                activeTab === 'orders'
                  ? 'bg-bitebase-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors font-secondary ${
                activeTab === 'financial'
                  ? 'bg-bitebase-primary text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Financial
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-primary font-semibold text-foreground">
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="font-secondary">
                    Latest updates across all management areas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-[#74C365] text-white">Staff</Badge>
                      <span className="text-sm text-gray-600">John Doe clocked in for evening shift</span>
                      <span className="text-xs text-gray-400">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-[#E23D28] text-white">Inventory</Badge>
                      <span className="text-sm text-gray-600">Low stock alert: Tomatoes (5 kg remaining)</span>
                      <span className="text-xs text-gray-400">15 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-[#F4C431] text-white">Orders</Badge>
                      <span className="text-sm text-gray-600">Order #1234 completed for Table 8</span>
                      <span className="text-xs text-gray-400">23 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="bg-[#2196F3] text-white">Tables</Badge>
                      <span className="text-sm text-gray-600">Table 12 reserved for 7:30 PM (Party of 4)</span>
                      <span className="text-xs text-gray-400">1 hour ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 border-[#74C365] text-[#74C365] hover:bg-[#74C365] hover:text-white"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm">Add Staff</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 border-[#E23D28] text-[#E23D28] hover:bg-[#E23D28] hover:text-white"
                    >
                      <Package className="h-6 w-6" />
                      <span className="text-sm">Stock Update</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 border-[#F4C431] text-[#F4C431] hover:bg-[#F4C431] hover:text-white"
                    >
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">New Reservation</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3] hover:text-white"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      <span className="text-sm">Take Order</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <StaffManagement />
          )}

          {activeTab === 'inventory' && (
            <InventoryManagement />
          )}

          {activeTab === 'tables' && (
            <TableManagement />
          )}

          {activeTab === 'orders' && (
            <OrderManagement />
          )}

          {activeTab === 'financial' && (
            <FinancialManagement />
          )}
        </div>
      </div>
    </div>
  );
}

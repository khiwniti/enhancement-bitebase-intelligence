'use client';

import React, { useState } from 'react';
import { BarChart3, MapPin, DollarSign, TrendingUp, Users, ShoppingBag, Clock, Star } from 'lucide-react';

export default function FourPAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('product');

  const tabs = [
    { id: 'product', label: 'Product', icon: ShoppingBag, color: 'blue' },
    { id: 'place', label: 'Place', icon: MapPin, color: 'green' },
    { id: 'price', label: 'Price', icon: DollarSign, color: 'purple' },
    { id: 'promotion', label: 'Promotion', icon: TrendingUp, color: 'orange' }
  ];

  const MetricCard = ({ title, value, change, color, icon: Icon }) => (
    <div className={`bg-white rounded-lg shadow-lg p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}% vs last month
          </p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'product':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Top Performing Dish"
                value="Margherita Pizza"
                change={15}
                color="blue"
                icon={Star}
              />
              <MetricCard
                title="Menu Performance Score"
                value="8.4/10"
                change={5}
                color="green"
                icon={BarChart3}
              />
              <MetricCard
                title="Food Cost Ratio"
                value="28%"
                change={-2}
                color="purple"
                icon={DollarSign}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Menu Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Bestsellers</h4>
                    <p className="text-sm text-gray-600">Margherita Pizza, Caesar Salad, Tiramisu</p>
                  </div>
                  <div className="text-green-600 font-semibold">↑ 12%</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Underperformers</h4>
                    <p className="text-sm text-gray-600">Seafood Pasta, Mushroom Risotto</p>
                  </div>
                  <div className="text-red-600 font-semibold">↓ 8%</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'place':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Customer Density"
                value="85%"
                change={8}
                color="green"
                icon={Users}
              />
              <MetricCard
                title="Delivery Hotspots"
                value="12 zones"
                change={3}
                color="blue"
                icon={MapPin}
              />
              <MetricCard
                title="Foot Traffic Index"
                value="92%"
                change={12}
                color="purple"
                icon={TrendingUp}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Location Analytics</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Interactive Map Component</p>
              </div>
            </div>
          </div>
        );

      case 'price':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Average Order Value"
                value="$34.50"
                change={7}
                color="purple"
                icon={DollarSign}
              />
              <MetricCard
                title="Revenue Growth"
                value="$78,500"
                change={15}
                color="green"
                icon={TrendingUp}
              />
              <MetricCard
                title="Profit Margin"
                value="22%"
                change={3}
                color="blue"
                icon={BarChart3}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing Strategy</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800">Optimal Price Range</h4>
                  <p className="text-sm text-green-700">Main dishes: $18-$28 for maximum profitability</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800">Peak Hour Pricing</h4>
                  <p className="text-sm text-blue-700">Consider 10% premium during 7-9 PM</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'promotion':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Campaign ROI"
                value="340%"
                change={25}
                color="orange"
                icon={TrendingUp}
              />
              <MetricCard
                title="Customer Retention"
                value="68%"
                change={12}
                color="green"
                icon={Users}
              />
              <MetricCard
                title="Social Media Reach"
                value="25.4K"
                change={18}
                color="blue"
                icon={Star}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Marketing Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Campaigns</h4>
                    <p className="text-sm text-gray-600">Open rate: 24% | Click rate: 3.2%</p>
                  </div>
                  <div className="text-green-600 font-semibold">↑ 15%</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Social Media</h4>
                    <p className="text-sm text-gray-600">Engagement: 4.8% | Followers: +1.2K</p>
                  </div>
                  <div className="text-green-600 font-semibold">↑ 22%</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">4P Marketing Analytics</h1>
        <p className="text-gray-600">Product, Place, Price, and Promotion insights for restaurant success</p>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-white text-${tab.color}-600 shadow-sm`
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>

        {/* AI Recommendations */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            AI-Powered Recommendations
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Product Optimization</h4>
              <p className="text-sm text-blue-700">
                Consider adding a vegetarian pizza option - 23% of customers request it
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Location Strategy</h4>
              <p className="text-sm text-green-700">
                Expand delivery radius by 2km - potential 15% revenue increase
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Pricing Insight</h4>
              <p className="text-sm text-purple-700">
                Lunch combo pricing at $16 could increase weekday traffic by 20%
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Promotion Opportunity</h4>
              <p className="text-sm text-orange-700">
                Instagram food photography posts generate 40% more engagement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
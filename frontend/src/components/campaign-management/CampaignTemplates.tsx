"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Star, 
  Copy, 
  Edit, 
  Trash2,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Mail,
  MessageSquare,
  Share2,
  Globe,
  Store,
  Bell,
  Target,
  Gift,
  Heart,
  Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  channels: string[];
  usageCount: number;
  rating: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  estimatedBudget: {
    min: number;
    max: number;
  };
  expectedResults: {
    ctr: number;
    conversionRate: number;
    roi: number;
  };
  content: {
    subject: string;
    preview: string;
    callToAction: string;
  };
  targetAudience: string[];
}

export default function CampaignTemplates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock template data
  const templates: CampaignTemplate[] = [
    {
      id: '1',
      name: 'Summer Menu Launch',
      description: 'Perfect template for launching seasonal menu items with mouth-watering visuals and compelling offers',
      category: 'seasonal',
      type: 'product_launch',
      channels: ['email', 'social_media', 'google_ads'],
      usageCount: 45,
      rating: 4.8,
      isPublic: true,
      createdBy: 'BiteBase Team',
      createdAt: '2024-05-15',
      estimatedBudget: { min: 1000, max: 5000 },
      expectedResults: { ctr: 3.2, conversionRate: 6.5, roi: 220 },
      content: {
        subject: 'Fresh Summer Flavors Have Arrived! 🌞',
        preview: 'Discover our new seasonal menu featuring fresh, locally-sourced ingredients...',
        callToAction: 'Order Now'
      },
      targetAudience: ['Food Enthusiasts', 'Local Customers', 'Repeat Customers']
    },
    {
      id: '2',
      name: 'Weekend Special Promotion',
      description: 'Drive weekend traffic with limited-time offers and exclusive deals',
      category: 'promotion',
      type: 'promotion',
      channels: ['email', 'sms', 'push_notification'],
      usageCount: 78,
      rating: 4.6,
      isPublic: true,
      createdBy: 'BiteBase Team',
      createdAt: '2024-04-20',
      estimatedBudget: { min: 500, max: 2000 },
      expectedResults: { ctr: 4.1, conversionRate: 8.2, roi: 185 },
      content: {
        subject: 'Weekend Only: 20% Off Your Favorite Dishes!',
        preview: 'This weekend only, enjoy 20% off all menu items. Perfect for date night...',
        callToAction: 'Claim Offer'
      },
      targetAudience: ['Weekend Diners', 'Couples', 'Local Families']
    },
    {
      id: '3',
      name: 'Loyalty Program Enrollment',
      description: 'Convert one-time customers into loyal members with attractive sign-up incentives',
      category: 'loyalty',
      type: 'loyalty',
      channels: ['email', 'in_store', 'website'],
      usageCount: 32,
      rating: 4.4,
      isPublic: true,
      createdBy: 'BiteBase Team',
      createdAt: '2024-03-10',
      estimatedBudget: { min: 300, max: 1500 },
      expectedResults: { ctr: 2.8, conversionRate: 12.5, roi: 340 },
      content: {
        subject: 'Join Our VIP Club & Get 15% Off Your Next Visit',
        preview: 'Exclusive perks, birthday rewards, and member-only specials await...',
        callToAction: 'Join Now'
      },
      targetAudience: ['New Customers', 'Frequent Visitors', 'Value Seekers']
    },
    {
      id: '4',
      name: 'Holiday Celebration Campaign',
      description: 'Capitalize on holiday seasons with festive messaging and special event promotions',
      category: 'seasonal',
      type: 'seasonal',
      channels: ['email', 'social_media', 'facebook_ads', 'instagram'],
      usageCount: 23,
      rating: 4.7,
      isPublic: true,
      createdBy: 'BiteBase Team',
      createdAt: '2024-02-14',
      estimatedBudget: { min: 2000, max: 8000 },
      expectedResults: { ctr: 3.5, conversionRate: 7.8, roi: 195 },
      content: {
        subject: 'Celebrate the Holidays with Us! 🎉',
        preview: 'Special holiday menu, festive atmosphere, and memorable experiences...',
        callToAction: 'Make Reservation'
      },
      targetAudience: ['Holiday Celebrants', 'Families', 'Event Planners']
    },
    {
      id: '5',
      name: 'Customer Win-Back',
      description: 'Re-engage inactive customers with personalized offers and compelling reasons to return',
      category: 'retention',
      type: 'retention',
      channels: ['email', 'sms'],
      usageCount: 19,
      rating: 4.2,
      isPublic: false,
      createdBy: 'Restaurant Owner',
      createdAt: '2024-01-25',
      estimatedBudget: { min: 200, max: 1000 },
      expectedResults: { ctr: 2.1, conversionRate: 15.3, roi: 280 },
      content: {
        subject: 'We Miss You! Come Back for 25% Off',
        preview: 'It\'s been a while since your last visit. Here\'s a special welcome back offer...',
        callToAction: 'Welcome Back'
      },
      targetAudience: ['Inactive Customers', 'Lapsed Members', 'Previous Regulars']
    },
    {
      id: '6',
      name: 'New Customer Acquisition',
      description: 'Attract new customers with irresistible first-time visitor offers and social proof',
      category: 'acquisition',
      type: 'acquisition',
      channels: ['google_ads', 'facebook_ads', 'instagram', 'website'],
      usageCount: 56,
      rating: 4.5,
      isPublic: true,
      createdBy: 'BiteBase Team',
      createdAt: '2024-01-10',
      estimatedBudget: { min: 1500, max: 6000 },
      expectedResults: { ctr: 2.9, conversionRate: 5.4, roi: 165 },
      content: {
        subject: 'First Time? Get 30% Off Your First Order!',
        preview: 'Welcome to our restaurant family! Enjoy a special discount on your first visit...',
        callToAction: 'Get Discount'
      },
      targetAudience: ['New Residents', 'Food Explorers', 'Deal Seekers']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'loyalty', label: 'Loyalty' },
    { value: 'retention', label: 'Retention' },
    { value: 'acquisition', label: 'Acquisition' }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'promotion': return <Gift className="w-4 h-4" />;
      case 'seasonal': return <Calendar className="w-4 h-4" />;
      case 'loyalty': return <Heart className="w-4 h-4" />;
      case 'retention': return <Target className="w-4 h-4" />;
      case 'acquisition': return <Users className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'promotion': return 'bg-chili-red/10 text-chili-red border-chili-red/20';
      case 'seasonal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'loyalty': return 'bg-mantis-green/10 text-mantis-green border-mantis-green/20';
      case 'retention': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'acquisition': return 'bg-saffron/10 text-saffron border-saffron/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-3 h-3" />;
      case 'sms': return <MessageSquare className="w-3 h-3" />;
      case 'social_media': return <Share2 className="w-3 h-3" />;
      case 'google_ads': return <Globe className="w-3 h-3" />;
      case 'facebook_ads': return <Share2 className="w-3 h-3" />;
      case 'instagram': return <Share2 className="w-3 h-3" />;
      case 'in_store': return <Store className="w-3 h-3" />;
      case 'website': return <Globe className="w-3 h-3" />;
      case 'push_notification': return <Bell className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-saffron fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Campaign Templates
          </h2>
          <p className="text-gray-600 mt-1">
            Pre-built campaign templates to jumpstart your marketing efforts
          </p>
        </div>
        <Button 
          className="bg-mantis-green hover:bg-mantis-green/90 text-white"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <Badge variant="outline" className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  {!template.isPublic && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      Private
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(template.rating)}
                  <span className="text-xs text-gray-500 ml-1">({template.rating})</span>
                </div>
              </div>
              <CardTitle className="text-lg" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {template.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channels */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Channels</p>
                <div className="flex flex-wrap gap-1">
                  {template.channels.map((channel, index) => (
                    <div key={index} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                      {getChannelIcon(channel)}
                      <span>{channel.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Results */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Expected Results</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {template.expectedResults.ctr}%
                    </div>
                    <div className="text-gray-500">CTR</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {template.expectedResults.conversionRate}%
                    </div>
                    <div className="text-gray-500">CVR</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-mantis-green" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {template.expectedResults.roi}%
                    </div>
                    <div className="text-gray-500">ROI</div>
                  </div>
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Estimated Budget</p>
                <p className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  ${template.estimatedBudget.min.toLocaleString()} - ${template.estimatedBudget.max.toLocaleString()}
                </p>
              </div>

              {/* Usage Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Used {template.usageCount} times</span>
                <span>by {template.createdBy}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2">
                <Button size="sm" className="flex-1 bg-mantis-green hover:bg-mantis-green/90 text-white">
                  <Copy className="w-3 h-3 mr-1" />
                  Use Template
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or create a new template.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Send, 
  Calendar, 
  DollarSign, 
  Target, 
  Users,
  Mail,
  MessageSquare,
  Share2,
  Smartphone,
  Globe,
  Store,
  Bell,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface CampaignFormData {
  name: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  budget: string;
  channels: string[];
  targetDemographics: {
    ageRange: string;
    gender: string;
    location: string;
  };
  content: {
    subject: string;
    message: string;
    callToAction: string;
  };
  frequencyCap: string;
}

export default function CampaignCreator() {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    budget: '',
    channels: [],
    targetDemographics: {
      ageRange: '',
      gender: '',
      location: ''
    },
    content: {
      subject: '',
      message: '',
      callToAction: ''
    },
    frequencyCap: '1'
  });

  const campaignTypes = [
    { value: 'promotion', label: 'Promotion', icon: '🎯' },
    { value: 'loyalty', label: 'Loyalty Program', icon: '💎' },
    { value: 'product_launch', label: 'Product Launch', icon: '🚀' },
    { value: 'seasonal', label: 'Seasonal Campaign', icon: '🎄' },
    { value: 'retention', label: 'Customer Retention', icon: '🔄' },
    { value: 'acquisition', label: 'Customer Acquisition', icon: '📈' }
  ];

  const channels = [
    { id: 'email', label: 'Email', icon: Mail, color: 'bg-blue-100 text-blue-700' },
    { id: 'sms', label: 'SMS', icon: MessageSquare, color: 'bg-green-100 text-green-700' },
    { id: 'social_media', label: 'Social Media', icon: Share2, color: 'bg-purple-100 text-purple-700' },
    { id: 'google_ads', label: 'Google Ads', icon: Globe, color: 'bg-red-100 text-red-700' },
    { id: 'facebook_ads', label: 'Facebook Ads', icon: Share2, color: 'bg-blue-100 text-blue-700' },
    { id: 'instagram', label: 'Instagram', icon: Share2, color: 'bg-pink-100 text-pink-700' },
    { id: 'in_store', label: 'In-Store', icon: Store, color: 'bg-orange-100 text-orange-700' },
    { id: 'website', label: 'Website', icon: Globe, color: 'bg-gray-100 text-gray-700' },
    { id: 'push_notification', label: 'Push Notifications', icon: Bell, color: 'bg-yellow-100 text-yellow-700' }
  ];

  const handleChannelToggle = (channelId: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(id => id !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const handleSubmit = (action: 'save' | 'launch') => {
    console.log('Campaign action:', action, formData);
    // Here you would typically send the data to your API
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            Create New Campaign
          </h2>
          <p className="text-gray-600 mt-1">
            Design and launch your marketing campaign
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Basic Information</CardTitle>
              <CardDescription>Set up the fundamental details of your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Campaign Name</Label>
                <Input
                  id="name"
                  placeholder="Enter campaign name..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your campaign objectives and strategy..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ fontFamily: 'JetBrains Mono, monospace' }}>Campaign Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <SelectValue placeholder="Select campaign type" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaignTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center space-x-2">
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" style={{ fontFamily: 'JetBrains Mono, monospace' }}>End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequencyCap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Frequency Cap</Label>
                  <Select value={formData.frequencyCap} onValueChange={(value) => setFormData(prev => ({ ...prev, frequencyCap: value }))}>
                    <SelectTrigger style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 per day</SelectItem>
                      <SelectItem value="2">2 per day</SelectItem>
                      <SelectItem value="3">3 per day</SelectItem>
                      <SelectItem value="5">5 per day</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Marketing Channels</CardTitle>
              <CardDescription>Select the channels where your campaign will run</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const isSelected = formData.channels.includes(channel.id);
                  return (
                    <div
                      key={channel.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-mantis-green bg-mantis-green/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChannelToggle(channel.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={isSelected} disabled />
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          {channel.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Campaign Content</CardTitle>
              <CardDescription>Create the messaging for your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Subject/Headline</Label>
                <Input
                  id="subject"
                  placeholder="Enter compelling subject line..."
                  value={formData.content.subject}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    content: { ...prev.content, subject: e.target.value }
                  }))}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your campaign message..."
                  rows={4}
                  value={formData.content.message}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    content: { ...prev.content, message: e.target.value }
                  }))}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Call to Action</Label>
                <Input
                  id="cta"
                  placeholder="e.g., Order Now, Learn More, Get Discount..."
                  value={formData.content.callToAction}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    content: { ...prev.content, callToAction: e.target.value }
                  }))}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Target Audience</CardTitle>
              <CardDescription>Define who will see your campaign</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label style={{ fontFamily: 'JetBrains Mono, monospace' }}>Age Range</Label>
                <Select 
                  value={formData.targetDemographics.ageRange} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    targetDemographics: { ...prev.targetDemographics, ageRange: value }
                  }))}
                >
                  <SelectTrigger style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55-64">55-64</SelectItem>
                    <SelectItem value="65+">65+</SelectItem>
                    <SelectItem value="all">All Ages</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label style={{ fontFamily: 'JetBrains Mono, monospace' }}>Gender</Label>
                <Select 
                  value={formData.targetDemographics.gender} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    targetDemographics: { ...prev.targetDemographics, gender: value }
                  }))}
                >
                  <SelectTrigger style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, NY"
                  value={formData.targetDemographics.location}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    targetDemographics: { ...prev.targetDemographics, location: e.target.value }
                  }))}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Selected Channels */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: 'JetBrains Mono, monospace' }}>Selected Channels</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.channels.length > 0 ? (
                <div className="space-y-2">
                  {formData.channels.map((channelId) => {
                    const channel = channels.find(c => c.id === channelId);
                    if (!channel) return null;
                    const Icon = channel.icon;
                    return (
                      <div key={channelId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            {channel.label}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChannelToggle(channelId)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No channels selected</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={() => handleSubmit('save')}
                  variant="outline" 
                  className="w-full"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button 
                  onClick={() => handleSubmit('launch')}
                  className="w-full bg-mantis-green hover:bg-mantis-green/90 text-white"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Launch Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

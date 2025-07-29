"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Utensils, Star, MapPin, Clock, DollarSign, Users } from 'lucide-react';

export default function RestaurantExplorerTab() {
  return (
    <div className="space-y-6">
      {/* Restaurant Explorer Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Restaurant Explorer</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Discover and analyze restaurants in your target area
          </p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
          <Utensils className="h-4 w-4 mr-2" />
          Explore Area
        </Button>
      </div>

      {/* Explorer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-blue-500" />
              Restaurants Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">247</div>
            <p className="text-xs text-blue-600">In selected area</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">4.2</div>
            <p className="text-xs text-yellow-600">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Price Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">$15-45</div>
            <p className="text-xs text-green-600">Average per meal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              Competition Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">High</div>
            <p className="text-xs text-orange-600">Market saturation</p>
          </CardContent>
        </Card>
      </div>

      {/* Restaurant List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Nearby Restaurants</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Restaurants in your selected analysis area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: 'Thai Garden Restaurant',
                cuisine: 'Thai',
                rating: 4.5,
                reviews: 324,
                priceRange: '$20-35',
                distance: '0.3 km',
                openHours: '11:00 - 22:00',
                specialties: ['Pad Thai', 'Green Curry', 'Tom Yum'],
                status: 'Open'
              },
              {
                name: 'Spice Route Bangkok',
                cuisine: 'Thai Fusion',
                rating: 4.2,
                reviews: 189,
                priceRange: '$25-45',
                distance: '0.7 km',
                openHours: '17:00 - 23:00',
                specialties: ['Modern Thai', 'Cocktails', 'Fine Dining'],
                status: 'Open'
              },
              {
                name: 'Street Food Paradise',
                cuisine: 'Thai Street Food',
                rating: 4.7,
                reviews: 567,
                priceRange: '$8-18',
                distance: '0.5 km',
                openHours: '10:00 - 21:00',
                specialties: ['Som Tam', 'Mango Sticky Rice', 'Grilled Seafood'],
                status: 'Closed'
              },
              {
                name: 'Royal Thai Palace',
                cuisine: 'Traditional Thai',
                rating: 4.0,
                reviews: 98,
                priceRange: '$30-60',
                distance: '1.2 km',
                openHours: '12:00 - 22:30',
                specialties: ['Royal Cuisine', 'Traditional Recipes', 'Vegetarian'],
                status: 'Open'
              }
            ].map((restaurant, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-gray-900 dark:text-white font-medium">{restaurant.name}</h4>
                      <Badge 
                        variant={restaurant.status === 'Open' ? 'default' : 'secondary'}
                        className={restaurant.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {restaurant.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{restaurant.cuisine}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{restaurant.rating} ({restaurant.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span>{restaurant.priceRange}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span>{restaurant.distance}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>{restaurant.openHours}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Analyze
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {restaurant.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Cuisine Distribution</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Popular cuisine types in the area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { cuisine: 'Traditional Thai', count: 89, percentage: 36 },
                { cuisine: 'Thai Fusion', count: 54, percentage: 22 },
                { cuisine: 'Street Food', count: 47, percentage: 19 },
                { cuisine: 'International', count: 35, percentage: 14 },
                { cuisine: 'Vegetarian/Vegan', count: 22, percentage: 9 }
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Utensils className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{item.cuisine}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm font-bold">{item.count}</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Market Opportunities</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Identified gaps and opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="text-green-900 dark:text-green-100 font-medium text-sm">Healthy Options Gap</h4>
                <p className="text-green-800 dark:text-green-200 text-xs">
                  Only 9% vegetarian/vegan options despite growing demand
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-blue-900 dark:text-blue-100 font-medium text-sm">Premium Positioning</h4>
                <p className="text-blue-800 dark:text-blue-200 text-xs">
                  Limited high-end Thai restaurants in the $50+ range
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="text-purple-900 dark:text-purple-100 font-medium text-sm">Late Night Dining</h4>
                <p className="text-purple-800 dark:text-purple-200 text-xs">
                  Most restaurants close by 22:00, opportunity for late hours
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <h4 className="text-orange-900 dark:text-orange-100 font-medium text-sm">Delivery Focus</h4>
                <p className="text-orange-800 dark:text-orange-200 text-xs">
                  Growing delivery market with room for specialized concepts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

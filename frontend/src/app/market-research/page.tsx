'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, BarChart3, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';

interface Cuisine {
  id: string;
  name: string;
  popularity: number;
  avg_startup_cost: string;
}

interface Location {
  name: string;
  lat: number;
  lng: number;
  type: string;
  market_potential: string;
  competition_level: string;
  foot_traffic: number;
  rent_estimate: string;
}

export default function MarketResearchPage() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [bufferRadius, setBufferRadius] = useState(1000);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [isLoadingCuisines, setIsLoadingCuisines] = useState(true);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);

  // Fetch cuisines from API
  useEffect(() => {
    fetchCuisines();
  }, []);

  // Search locations when query changes
  useEffect(() => {
    if (locationQuery.length > 2) {
      const timeoutId = setTimeout(() => {
        searchLocations(locationQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setLocations([]);
      return undefined;
    }
  }, [locationQuery]);

  const fetchCuisines = async () => {
    try {
      setIsLoadingCuisines(true);
      const response = await fetch('http://localhost:8000/api/v1/market-research/cuisines');
      const data = await response.json();
      setCuisines(data.cuisines || []);
    } catch (error) {
      console.error('Error fetching cuisines:', error);
      // Fallback to static data
      setCuisines([
        { id: 'italian', name: 'Italian', popularity: 0.85, avg_startup_cost: '$150,000' },
        { id: 'chinese', name: 'Chinese', popularity: 0.82, avg_startup_cost: '$130,000' },
        { id: 'mexican', name: 'Mexican', popularity: 0.78, avg_startup_cost: '$120,000' },
        { id: 'american', name: 'American', popularity: 0.90, avg_startup_cost: '$180,000' },
        { id: 'japanese', name: 'Japanese', popularity: 0.72, avg_startup_cost: '$160,000' },
        { id: 'indian', name: 'Indian', popularity: 0.65, avg_startup_cost: '$110,000' },
        { id: 'thai', name: 'Thai', popularity: 0.68, avg_startup_cost: '$125,000' },
        { id: 'mediterranean', name: 'Mediterranean', popularity: 0.70, avg_startup_cost: '$140,000' }
      ]);
    } finally {
      setIsLoadingCuisines(false);
    }
  };

  const searchLocations = async (query: string) => {
    try {
      setIsSearchingLocations(true);
      const response = await fetch(`http://localhost:8000/api/v1/market-research/locations/search?query=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setLocations(data.locations || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocations([]);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  const handleStartAnalysis = () => {
    if (selectedLocation && selectedCuisine) {
      setIsAnalyzing(true);
      // Redirect to analysis dashboard
      window.location.href = `/market-analysis?location=${encodeURIComponent(selectedLocation)}&cuisine=${selectedCuisine}&radius=${bufferRadius}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            BiteBaseAI Market Research
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the perfect location for your restaurant or cafe with AI-powered market analysis, 
            competitor insights, and customer behavior predictions.
          </p>
        </div>

        {/* Research Wizard */}
        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-lg border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Start Your Market Research</h2>
            </div>
            <p className="text-gray-600">
              Set up your analysis parameters to get comprehensive market insights
            </p>
          </div>
          <div className="p-6 space-y-6">
            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter address, city, or coordinates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    if (!e.target.value) setSelectedLocation('');
                  }}
                />
                {isSearchingLocations && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />
                )}
              </div>
              
              {/* Location Search Results */}
              {locations.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {locations.map((location, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSelectedLocation(location.name);
                        setLocationQuery(location.name);
                        setLocations([]);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{location.name}</div>
                          <div className="text-sm text-gray-500">{location.type} • {location.rent_estimate}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium ${
                            location.market_potential === 'High' ? 'text-green-600' :
                            location.market_potential === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {location.market_potential} Potential
                          </div>
                          <div className="text-xs text-gray-500">Traffic: {location.foot_traffic}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cuisine Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type
                {isLoadingCuisines && <Loader2 className="inline ml-2 h-4 w-4 animate-spin" />}
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                disabled={isLoadingCuisines}
              >
                <option value="">Select cuisine type...</option>
                {cuisines.map((cuisine) => (
                  <option key={cuisine.id} value={cuisine.id}>
                    {cuisine.name} • {Math.round(cuisine.popularity * 100)}% popular • {cuisine.avg_startup_cost}
                  </option>
                ))}
              </select>
            </div>

            {/* Buffer Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Radius: {bufferRadius}m
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={bufferRadius}
                onChange={(e) => setBufferRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>500m</span>
                <span>5km</span>
              </div>
            </div>

            {/* Start Analysis Button */}
            <button
              onClick={handleStartAnalysis}
              disabled={!selectedLocation || !selectedCuisine || isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Market...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Start Market Analysis
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Research Insights Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Customer Analysis</h3>
            <p className="text-sm text-gray-600">Population density, demographics, and foot traffic patterns</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
            <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Competitor Mapping</h3>
            <p className="text-sm text-gray-600">Nearby restaurants, market saturation, and opportunity gaps</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
            <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Revenue Forecasting</h3>
            <p className="text-sm text-gray-600">AI-powered sales predictions and profitability analysis</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border p-6 text-center">
            <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Market Trends</h3>
            <p className="text-sm text-gray-600">Seasonal patterns, delivery hotspots, and growth opportunities</p>
          </div>
        </div>
      </div>
    </div>
  );
}
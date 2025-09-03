'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, Layers, ZoomIn, ZoomOut, RotateCcw, Target, Settings, Eye, EyeOff, Loader2 } from 'lucide-react';

interface MarketAnalysisData {
  request_id: string;
  location_metrics: {
    total_restaurants: number;
    competition_density: number;
    average_rating: number;
    average_price_range: string;
    foot_traffic_score: number;
    accessibility_score: number;
  };
  competitors: Array<{
    name: string;
    cuisine_type: string;
    rating: number;
    price_range: string;
    distance: number;
    estimated_revenue: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  market_opportunities: Array<{
    opportunity_type: string;
    description: string;
    potential_impact: string;
    implementation_difficulty: string;
    estimated_roi: number;
  }>;
  customer_demographics: {
    age_groups: Record<string, number>;
    income_levels: Record<string, number>;
    dining_preferences: Record<string, number>;
  };
  pricing_insights: {
    optimal_price_range: string;
    price_sensitivity: string;
    competitor_average: number;
    recommended_pricing: Record<string, string>;
  };
  marketing_recommendations: string[];
  risk_factors: string[];
  overall_market_score: number;
}

export default function MarketAnalysisPage() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [bufferRadius, setBufferRadius] = useState(1000);
  const [showPopulationDensity, setShowPopulationDensity] = useState(true);
  const [showRealEstate, setShowRealEstate] = useState(true);
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [showStrategicPoints, setShowStrategicPoints] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<MarketAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location');
    const cuisine = urlParams.get('cuisine');
    const radius = urlParams.get('radius');

    if (location) setSelectedLocation(location);
    if (cuisine) setSelectedCuisine(cuisine);
    if (radius) setBufferRadius(parseInt(radius));

    // Fetch analysis data if we have the required parameters
    if (location && cuisine) {
      fetchAnalysisData(location, cuisine, parseInt(radius) || 1000);
    }
  }, []);

  const fetchAnalysisData = async (location: string, cuisine: string, radius: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock coordinates for demo - in a real app, you'd geocode the location
      const mockCoordinates = { lat: 40.7128, lng: -74.0060 };

      const response = await fetch('http://localhost:8000/api/v1/market-research/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          latitude: mockCoordinates.lat,
          longitude: mockCoordinates.lng,
          cuisine_type: cuisine,
          radius: radius / 1000, // Convert to km
          budget_range: 'medium'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis data');
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setError('Failed to load market analysis data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const MetricCard = ({ title, value, unit, trend, color, icon: Icon }) => (
    <div className={`bg-white rounded-lg shadow-lg border-l-4 border-${color}-500 p-4 animate-fadeIn`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}{unit}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Analysis Dashboard</h1>
            <p className="text-sm text-gray-600">
              Location: {selectedLocation || 'Downtown Area'} | Cuisine: {selectedCuisine || 'Italian'} | Radius: {bufferRadius}m
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Save Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading market analysis...</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
              {/* Simulated Map */}
              <div className="absolute inset-4 bg-white rounded-lg shadow-lg border">
                <div className="h-full w-full bg-gray-50 rounded-lg relative overflow-hidden">
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-center mt-1 text-gray-600">Target Location</p>
                    </div>

                    {/* Competitor Markers */}
                    <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-orange-500 rounded-full"></div>
                    <div className="absolute top-2/3 left-2/3 w-4 h-4 bg-orange-500 rounded-full"></div>
                    <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-orange-500 rounded-full"></div>

                    {/* Buffer Circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-64 h-64 border-2 border-blue-400 border-dashed rounded-full opacity-50"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border p-2 space-y-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <Search className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <Target className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Layer Controls */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Map Layers
            </h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPopulationDensity}
                  onChange={(e) => setShowPopulationDensity(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Population Density</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showRealEstate}
                  onChange={(e) => setShowRealEstate(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Real Estate</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCompetitors}
                  onChange={(e) => setShowCompetitors(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Competitors</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showStrategicPoints}
                  onChange={(e) => setShowStrategicPoints(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Strategic Points</span>
              </label>
            </div>
          </div>

          {/* Floating Metric Cards */}
          <div className="absolute bottom-4 left-4 right-80 grid grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <div className="bg-white rounded-lg shadow-lg border-l-4 border-gray-300 p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-white rounded-lg shadow-lg border-l-4 border-gray-300 p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-white rounded-lg shadow-lg border-l-4 border-gray-300 p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </>
            ) : error ? (
              <div className="col-span-3 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : analysisData ? (
              <>
                <MetricCard
                  title="Foot Traffic Score"
                  value={analysisData.location_metrics.foot_traffic_score}
                  unit=""
                  trend={12}
                  color="blue"
                  icon={Search}
                />
                <MetricCard
                  title="Total Restaurants"
                  value={analysisData.location_metrics.total_restaurants}
                  unit=""
                  trend={-5}
                  color="orange"
                  icon={MapPin}
                />
                <MetricCard
                  title="Market Score"
                  value={Math.round(analysisData.overall_market_score)}
                  unit="/100"
                  trend={8}
                  color="purple"
                  icon={Settings}
                />
              </>
            ) : (
              <div className="col-span-3 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">No analysis data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Analytics */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Market Insights</h2>

            {isLoading ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            ) : analysisData ? (
              <>
                {/* Market Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Market Viability Score</span>
                    <span className="text-lg font-bold text-green-600">
                      {(analysisData.overall_market_score / 10).toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analysisData.overall_market_score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Average Rating</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {analysisData.location_metrics.average_rating.toFixed(1)}/5
                    </p>
                    <p className="text-sm text-gray-600">Competitor average</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Competition Density</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {(analysisData.location_metrics.competition_density * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-600">Market saturation</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Foot Traffic Score</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {analysisData.location_metrics.foot_traffic_score}
                    </p>
                    <p className="text-sm text-gray-600">Accessibility index</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">AI Recommendations</h3>
                  <div className="space-y-3">
                    {analysisData.marketing_recommendations?.slice(0, 3).map((recommendation, index) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Strategy:</strong> {recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Opportunities */}
                {analysisData.market_opportunities?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Market Opportunities</h3>
                    <div className="space-y-3">
                      {analysisData.market_opportunities.slice(0, 2).map((opportunity, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>{opportunity.opportunity_type}:</strong> {opportunity.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            ROI: {(opportunity.estimated_roi * 100).toFixed(0)}% |
                            Impact: {opportunity.potential_impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {analysisData.risk_factors?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Risk Factors</h3>
                    <div className="space-y-2">
                      {analysisData.risk_factors.slice(0, 2).map((risk, index) => (
                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Risk:</strong> {risk}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">No analysis data available</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Generate Full Report
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Compare Locations
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

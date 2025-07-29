"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3, 
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu
} from 'lucide-react';

interface MLModelStatus {
  loaded: boolean;
  type: string | null;
}

interface ModelsStatus {
  pipeline_initialized: boolean;
  models: Record<string, MLModelStatus>;
  timestamp: string;
}

interface ForecastData {
  forecast_type: string;
  predictions: number[];
  confidence_intervals?: {
    lower_95: number[];
    upper_95: number[];
  };
  model_accuracy?: {
    mae: number;
    mse: number;
    rmse: number;
    mape: number;
  };
}

interface CustomerSegment {
  cluster_id: number;
  size: number;
  percentage: number;
  characteristics: Record<string, any>;
  recommended_strategies: string[];
}

interface CustomerAnalysis {
  customer_segments: CustomerSegment[];
  lifetime_value_predictions: Record<string, any>;
  churn_risk_analysis: Record<string, any>;
  total_customers_analyzed: number;
}

const AdvancedAIDashboard: React.FC = () => {
  const [modelsStatus, setModelsStatus] = useState<ModelsStatus | null>(null);
  const [revenueForecast, setRevenueForecast] = useState<ForecastData | null>(null);
  const [customerAnalysis, setCustomerAnalysis] = useState<CustomerAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchModelsStatus();
  }, []);

  const fetchModelsStatus = async () => {
    try {
      const response = await fetch('/api/v1/advanced-ai/models/status');
      if (response.ok) {
        const data = await response.json();
        setModelsStatus(data);
      }
    } catch (err) {
      console.error('Error fetching models status:', err);
    }
  };

  const initializePipeline = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/advanced-ai/initialize', {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchModelsStatus();
      } else {
        setError('Failed to initialize ML pipeline');
      }
    } catch (err) {
      setError('Error initializing pipeline');
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueForecast = async () => {
    setLoading(true);
    try {
      // Using mock restaurant ID for demo
      const response = await fetch('/api/v1/advanced-ai/forecast/revenue/550e8400-e29b-41d4-a716-446655440000?forecast_days=30');
      if (response.ok) {
        const data = await response.json();
        setRevenueForecast(data.forecast);
      }
    } catch (err) {
      setError('Error fetching revenue forecast');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerAnalysis = async () => {
    setLoading(true);
    try {
      // Using mock restaurant ID for demo
      const response = await fetch('/api/v1/advanced-ai/analytics/customer-behavior/550e8400-e29b-41d4-a716-446655440000');
      if (response.ok) {
        const data = await response.json();
        setCustomerAnalysis(data.analysis);
      }
    } catch (err) {
      setError('Error fetching customer analysis');
    } finally {
      setLoading(false);
    }
  };

  const getModelStatusIcon = (status: MLModelStatus) => {
    if (status.loaded) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getModelStatusBadge = (status: MLModelStatus) => {
    return (
      <Badge variant={status.loaded ? "default" : "destructive"}>
        {status.loaded ? "Ready" : "Not Loaded"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced AI/ML Pipeline</h1>
          <p className="text-muted-foreground">
            Enterprise-grade machine learning and predictive analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={initializePipeline} 
            disabled={loading}
            variant="outline"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Initialize Pipeline
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="customer">Customer Analytics</TabsTrigger>
          <TabsTrigger value="models">Models Status</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modelsStatus?.pipeline_initialized ? "Active" : "Inactive"}
                </div>
                <Badge variant={modelsStatus?.pipeline_initialized ? "default" : "secondary"}>
                  {modelsStatus?.pipeline_initialized ? "Initialized" : "Not Initialized"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Models Loaded</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {modelsStatus ? Object.values(modelsStatus.models).filter(m => m.loaded).length : 0}/
                  {modelsStatus ? Object.keys(modelsStatus.models).length : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  ML models ready
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {revenueForecast?.model_accuracy ? 
                    `${(100 - revenueForecast.model_accuracy.mape).toFixed(1)}%` : 
                    "N/A"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue prediction accuracy
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers Analyzed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customerAnalysis?.total_customers_analyzed || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  In latest analysis
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Run AI/ML analysis and generate insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  onClick={fetchRevenueForecast} 
                  disabled={loading || !modelsStatus?.pipeline_initialized}
                  className="w-full"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Revenue Forecast
                </Button>
                <Button 
                  onClick={fetchCustomerAnalysis} 
                  disabled={loading || !modelsStatus?.pipeline_initialized}
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Analyze Customer Behavior
                </Button>
                <Button 
                  disabled={loading || !modelsStatus?.pipeline_initialized}
                  className="w-full"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Optimize Pricing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting</CardTitle>
              <CardDescription>
                Advanced ML-based revenue predictions with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueForecast ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Forecast Type</h4>
                      <Badge>{revenueForecast.forecast_type}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Predictions</h4>
                      <p className="text-sm text-muted-foreground">
                        {revenueForecast.predictions.length} days forecasted
                      </p>
                    </div>
                  </div>
                  
                  {revenueForecast.model_accuracy && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Model Accuracy</h4>
                      <div className="grid gap-2 md:grid-cols-4">
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-lg font-bold">
                            {revenueForecast.model_accuracy.mae.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">MAE</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-lg font-bold">
                            {revenueForecast.model_accuracy.rmse.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">RMSE</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-lg font-bold">
                            {revenueForecast.model_accuracy.mape.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">MAPE</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="text-lg font-bold">
                            {(100 - revenueForecast.model_accuracy.mape).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Generate Revenue Forecast" to see predictions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Analytics Tab */}
        <TabsContent value="customer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Behavior Analysis</CardTitle>
              <CardDescription>
                ML-powered customer segmentation and lifetime value predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customerAnalysis ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-4">Customer Segments</h4>
                    <div className="grid gap-4">
                      {customerAnalysis.customer_segments.map((segment) => (
                        <Card key={segment.cluster_id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">Cluster {segment.cluster_id}</h5>
                              <Badge variant="outline">
                                {segment.size} customers ({segment.percentage.toFixed(1)}%)
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <h6 className="text-xs font-medium text-muted-foreground mb-1">
                                  Recommended Strategies
                                </h6>
                                <div className="flex flex-wrap gap-1">
                                  {segment.recommended_strategies.map((strategy, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {strategy}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Click "Analyze Customer Behavior" to see insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Status Tab */}
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ML Models Status</CardTitle>
              <CardDescription>
                Status and health of all machine learning models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelsStatus ? (
                <div className="space-y-4">
                  <div className="grid gap-4">
                    {Object.entries(modelsStatus.models).map(([modelName, status]) => (
                      <div key={modelName} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {getModelStatusIcon(status)}
                          <div>
                            <h4 className="font-medium">{modelName.replace('_', ' ').toUpperCase()}</h4>
                            <p className="text-sm text-muted-foreground">
                              {status.type || 'Unknown type'}
                            </p>
                          </div>
                        </div>
                        {getModelStatusBadge(status)}
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span>{new Date(modelsStatus.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Loading models status...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAIDashboard;

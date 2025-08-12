# BiteBase CopilotKit Integration - Implementation Plan

## 1. Technical Setup Guide

### 1.1 Installation and Dependencies

```bash
# Frontend packages
cd beta-bitebase-app
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime

# Backend packages for LangGraph integration
cd ../bitebase-backend-express
npm install @copilotkit/runtime langchain @langchain/langgraph

# Python environment for agents
cd ../agents
pip install langgraph langchain copilotkit-py openai tavily-python
```

### 1.2 Environment Configuration

```env
# .env.local
NEXT_PUBLIC_COPILOT_CLOUD_API_KEY=your_copilot_api_key
LANGCHAIN_AGENT_URL=http://localhost:8000/analytics-agent
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
TAVILY_API_KEY=your_tavily_key
```

## 2. Core Implementation Steps

### Step 1: Base CopilotKit Integration

```typescript
// app/layout.tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit">
          <CopilotSidebar
            defaultOpen={false}
            labels={{
              title: "BiteBase AI Assistant",
              initial: "👋 Hi! I can help you analyze your restaurant data, track performance, and discover insights. What would you like to know?"
            }}
            clickOutsideToClose={false}
          >
            {children}
          </CopilotSidebar>
        </CopilotKit>
      </body>
    </html>
  );
}
```

### Step 2: Define Readable State

```typescript
// hooks/useBiteBaseReadableState.ts
import { useCopilotReadable } from "@copilotkit/react-core";

export function useBiteBaseReadableState() {
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: fetchDashboardData
  });

  // Make current dashboard state readable to AI
  useCopilotReadable({
    description: "Current dashboard metrics and filters",
    value: {
      currentPeriod: dashboardData?.period,
      selectedLocations: dashboardData?.locations,
      metrics: {
        revenue: dashboardData?.revenue,
        customerCount: dashboardData?.customers,
        averageOrderValue: dashboardData?.aov,
        topSellingItems: dashboardData?.topItems
      },
      alerts: dashboardData?.alerts
    }
  });

  // Make user preferences readable
  useCopilotReadable({
    description: "User preferences and settings",
    value: {
      preferredCurrency: user?.preferences?.currency || "USD",
      dateFormat: user?.preferences?.dateFormat || "MM/DD/YYYY",
      businessType: user?.businessType || "restaurant"
    }
  });
}
```

### Step 3: Implement Core Actions

```typescript
// actions/analyticsActions.ts
import { useCopilotAction } from "@copilotkit/react-core";

export function useAnalyticsActions() {
  // Revenue Analysis Action
  useCopilotAction({
    name: "analyzeRevenue",
    description: "Analyze revenue trends with detailed breakdowns",
    parameters: [
      {
        name: "timeframe",
        type: "string",
        description: "Time period (e.g., 'last 30 days', 'Q4 2024', 'year-to-date')",
        required: true
      },
      {
        name: "groupBy",
        type: "string",
        description: "Group by dimension (location, category, day-of-week)",
        enum: ["location", "category", "day", "hour"],
      }
    ],
    handler: async ({ timeframe, groupBy }) => {
      const analysis = await api.analyzeRevenue({ timeframe, groupBy });
      return {
        summary: analysis.summary,
        data: analysis.data,
        insights: analysis.insights
      };
    },
    render: ({ status, args, result }) => {
      if (status === "executing") {
        return <AnalysisLoader message={`Analyzing revenue for ${args.timeframe}...`} />;
      }
      
      if (status === "complete" && result) {
        return (
          <RevenueAnalysisCard
            timeframe={args.timeframe}
            groupBy={args.groupBy}
            data={result.data}
            insights={result.insights}
            onDrillDown={(dimension) => {
              // Allow further exploration
              console.log("Drill down into", dimension);
            }}
          />
        );
      }
    }
  });

  // Customer Insights Action
  useCopilotAction({
    name: "analyzeCustomers",
    description: "Get insights about customer behavior and preferences",
    parameters: [
      {
        name: "analysisType",
        type: "string",
        description: "Type of customer analysis",
        enum: ["segments", "lifetime-value", "churn-risk", "preferences"]
      },
      {
        name: "location",
        type: "string",
        description: "Specific location or 'all'"
      }
    ],
    handler: async ({ analysisType, location }) => {
      const insights = await api.getCustomerInsights({ 
        type: analysisType, 
        location 
      });
      return insights;
    },
    render: ({ args, result }) => {
      switch(args.analysisType) {
        case "segments":
          return <CustomerSegmentationView data={result} />;
        case "lifetime-value":
          return <CLVAnalysisChart data={result} />;
        case "churn-risk":
          return <ChurnRiskMatrix data={result} />;
        case "preferences":
          return <PreferencesHeatmap data={result} />;
      }
    }
  });

  // Predictive Forecasting Action
  useCopilotAction({
    name: "generateForecast",
    description: "Generate AI-powered forecasts for business metrics",
    parameters: [
      {
        name: "metric",
        type: "string",
        description: "Metric to forecast",
        enum: ["revenue", "customers", "inventory", "staffing-needs"]
      },
      {
        name: "horizon",
        type: "number",
        description: "Forecast horizon in days"
      }
    ],
    handler: async ({ metric, horizon }) => {
      const forecast = await api.generateForecast({ metric, horizon });
      return forecast;
    },
    render: ({ args, result }) => (
      <ForecastVisualization
        metric={args.metric}
        horizon={args.horizon}
        forecast={result?.forecast}
        confidence={result?.confidence}
        factors={result?.influencingFactors}
      />
    )
  });
}
```

### Step 4: Human-in-the-Loop Implementation

```typescript
// actions/approvalActions.ts
export function useApprovalActions() {
  // Price Optimization with Approval
  useCopilotAction({
    name: "optimizeMenuPrices",
    description: "AI-driven menu price optimization with approval workflow",
    parameters: [
      {
        name: "targetMargin",
        type: "number",
        description: "Target profit margin percentage"
      },
      {
        name: "constraints",
        type: "object",
        description: "Pricing constraints and rules"
      }
    ],
    renderAndWaitForResponse: async ({ args, respond }) => {
      // Generate pricing suggestions
      const suggestions = await api.generatePricingSuggestions({
        targetMargin: args.targetMargin,
        constraints: args.constraints
      });

      return (
        <PriceOptimizationApproval
          currentPrices={suggestions.current}
          suggestedPrices={suggestions.suggested}
          impactAnalysis={suggestions.impact}
          onApprove={(approvedItems) => {
            respond({
              approved: true,
              items: approvedItems,
              expectedRevenue: suggestions.projectedRevenue
            });
          }}
          onReject={(reason) => {
            respond({
              approved: false,
              reason,
              alternativeAction: "manual-review"
            });
          }}
          onModify={(modifications) => {
            respond({
              approved: true,
              items: modifications,
              modified: true
            });
          }}
        />
      );
    }
  });

  // Inventory Order Approval
  useCopilotAction({
    name: "generateInventoryOrder",
    description: "Generate inventory orders based on predictive analysis",
    parameters: [
      {
        name: "forecastDays",
        type: "number",
        description: "Days to forecast ahead"
      }
    ],
    renderAndWaitForResponse: async ({ args, respond }) => {
      const orderSuggestion = await api.generateInventoryOrder({
        forecastDays: args.forecastDays
      });

      return (
        <InventoryOrderApproval
          items={orderSuggestion.items}
          totalCost={orderSuggestion.totalCost}
          reasoning={orderSuggestion.reasoning}
          alternatives={orderSuggestion.alternatives}
          onApprove={() => {
            respond({
              approved: true,
              orderId: orderSuggestion.id,
              scheduledDelivery: orderSuggestion.deliveryDate
            });
          }}
          onModify={(modifications) => {
            respond({
              approved: true,
              orderId: orderSuggestion.id,
              modifications
            });
          }}
        />
      );
    }
  });
}
```

### Step 5: LangGraph Agent Integration

```python
# agents/bitebase_analytics_agent.py
from langgraph.graph import StateGraph, END
from langgraph.checkpoint import MemorySaver
from typing import TypedDict, List, Dict, Any
import json

class AnalyticsState(TypedDict):
    query: str
    context: Dict[str, Any]
    data_sources: List[str]
    analysis_results: Dict[str, Any]
    visualizations: List[Dict[str, Any]]
    insights: List[str]
    recommendations: List[Dict[str, Any]]
    requires_approval: bool
    user_feedback: str

class BiteBaseAnalyticsAgent:
    def __init__(self):
        self.workflow = StateGraph(AnalyticsState)
        self.setup_nodes()
        self.setup_edges()
        
    def setup_nodes(self):
        # Query understanding node
        self.workflow.add_node("understand_query", self.understand_query)
        
        # Data collection node
        self.workflow.add_node("collect_data", self.collect_data)
        
        # Analysis node
        self.workflow.add_node("analyze", self.perform_analysis)
        
        # Insight generation node
        self.workflow.add_node("generate_insights", self.generate_insights)
        
        # Visualization creation node
        self.workflow.add_node("create_visualizations", self.create_visualizations)
        
        # Human approval node
        self.workflow.add_node("human_approval", self.human_approval)
        
        # Action execution node
        self.workflow.add_node("execute_actions", self.execute_actions)
        
    def understand_query(self, state: AnalyticsState) -> AnalyticsState:
        """Parse user query and determine analysis type"""
        # Use LLM to understand intent
        intent = self.llm.extract_intent(state["query"])
        
        # Determine required data sources
        data_sources = self.determine_data_sources(intent)
        
        return {
            **state,
            "data_sources": data_sources,
            "analysis_type": intent["type"]
        }
    
    def collect_data(self, state: AnalyticsState) -> AnalyticsState:
        """Collect data from identified sources"""
        data = {}
        
        for source in state["data_sources"]:
            if source == "revenue":
                data["revenue"] = self.fetch_revenue_data(state["context"])
            elif source == "customers":
                data["customers"] = self.fetch_customer_data(state["context"])
            elif source == "inventory":
                data["inventory"] = self.fetch_inventory_data(state["context"])
            elif source == "competitors":
                data["competitors"] = self.fetch_competitor_data(state["context"])
                
        return {
            **state,
            "collected_data": data
        }
    
    def perform_analysis(self, state: AnalyticsState) -> AnalyticsState:
        """Perform requested analysis on collected data"""
        analysis_type = state.get("analysis_type", "general")
        data = state.get("collected_data", {})
        
        results = {}
        
        if analysis_type == "trend":
            results = self.analyze_trends(data)
        elif analysis_type == "comparison":
            results = self.perform_comparison(data)
        elif analysis_type == "forecast":
            results = self.generate_forecast(data)
        elif analysis_type == "anomaly":
            results = self.detect_anomalies(data)
            
        return {
            **state,
            "analysis_results": results
        }
    
    def generate_insights(self, state: AnalyticsState) -> AnalyticsState:
        """Generate business insights from analysis"""
        insights = []
        recommendations = []
        
        # Use LLM to generate insights
        analysis_summary = self.llm.summarize_analysis(state["analysis_results"])
        
        # Extract key insights
        insights = self.extract_insights(analysis_summary)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(
            insights, 
            state["context"]
        )
        
        # Determine if human approval needed
        requires_approval = any(
            rec["impact"] == "high" or rec["cost"] > 10000 
            for rec in recommendations
        )
        
        return {
            **state,
            "insights": insights,
            "recommendations": recommendations,
            "requires_approval": requires_approval
        }
    
    def create_visualizations(self, state: AnalyticsState) -> AnalyticsState:
        """Create appropriate visualizations for the analysis"""
        visualizations = []
        
        # Determine best visualization types
        viz_types = self.determine_visualizations(
            state["analysis_type"],
            state["analysis_results"]
        )
        
        for viz_type in viz_types:
            viz = {
                "type": viz_type,
                "data": self.prepare_viz_data(
                    viz_type, 
                    state["analysis_results"]
                ),
                "config": self.get_viz_config(viz_type),
                "insights": self.get_viz_insights(
                    viz_type, 
                    state["insights"]
                )
            }
            visualizations.append(viz)
            
        return {
            **state,
            "visualizations": visualizations
        }
    
    def compile(self):
        """Compile the workflow"""
        # Set up conditional edges
        self.workflow.add_conditional_edges(
            "generate_insights",
            lambda x: "human_approval" if x["requires_approval"] else "create_visualizations"
        )
        
        # Set entry point
        self.workflow.set_entry_point("understand_query")
        
        # Add edges
        self.workflow.add_edge("understand_query", "collect_data")
        self.workflow.add_edge("collect_data", "analyze")
        self.workflow.add_edge("analyze", "generate_insights")
        self.workflow.add_edge("human_approval", "execute_actions")
        self.workflow.add_edge("execute_actions", "create_visualizations")
        self.workflow.add_edge("create_visualizations", END)
        
        # Compile with memory
        memory = MemorySaver()
        return self.workflow.compile(checkpointer=memory)
```

### Step 6: Runtime Configuration

```typescript
// app/api/copilotkit/[...copilotkit]/route.ts
import {
  CopilotRuntime,
  LangGraphAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

async function createRuntime() {
  const runtime = new CopilotRuntime({
    remoteActions: [
      {
        url: process.env.LANGCHAIN_AGENT_URL + "/analytics-agent",
      },
    ],
  });

  // Configure LangGraph adapter
  const lgAdapter = new LangGraphAdapter({
    chainUrl: process.env.LANGCHAIN_AGENT_URL,
    apiKey: process.env.LANGCHAIN_API_KEY,
  });

  runtime.addAdapter(lgAdapter);

  return runtime;
}

export const POST = async (req: NextRequest) => {
  const runtime = await createRuntime();
  
  return copilotRuntimeNextJSAppRouterEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
  })(req);
};
```

### Step 7: Custom UI Components

```typescript
// components/copilot/GenerativeUIComponents.tsx

// Revenue Analysis Card
export const RevenueAnalysisCard: React.FC<{
  data: RevenueData;
  insights: string[];
  timeframe: string;
}> = ({ data, insights, timeframe }) => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Revenue Analysis</h3>
        <Badge variant="outline">{timeframe}</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          trend={data.revenueTrend}
        />
        <MetricCard
          label="Average Order"
          value={formatCurrency(data.averageOrder)}
          trend={data.aovTrend}
        />
      </div>
      
      <RevenueChart data={data.chartData} />
      
      {insights.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Key Insights</h4>
          {insights.map((insight, i) => (
            <InsightBadge key={i} insight={insight} />
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button variant="outline" size="sm">
          <TrendingUp className="w-4 h-4 mr-2" />
          Deep Dive
        </Button>
      </div>
    </Card>
  );
};

// Interactive Forecast Component
export const ForecastVisualization: React.FC<{
  metric: string;
  forecast: ForecastData;
  confidence: number;
}> = ({ metric, forecast, confidence }) => {
  const [selectedScenario, setSelectedScenario] = useState<"optimistic" | "realistic" | "pessimistic">("realistic");
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{metric} Forecast</h3>
          <ConfidenceBadge confidence={confidence} />
        </div>
        
        <ScenarioSelector
          selected={selectedScenario}
          onChange={setSelectedScenario}
        />
        
        <ForecastChart
          data={forecast[selectedScenario]}
          showConfidenceInterval={true}
        />
        
        <div className="grid grid-cols-3 gap-4">
          {forecast.keyDrivers.map((driver, i) => (
            <DriverCard key={i} driver={driver} impact={driver.impact} />
          ))}
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This forecast is based on {forecast.dataPoints} historical data points 
            with {confidence}% confidence. External factors may affect accuracy.
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
};

// Approval Component
export const PriceOptimizationApproval: React.FC<{
  currentPrices: PriceItem[];
  suggestedPrices: PriceItem[];
  impactAnalysis: ImpactAnalysis;
  onApprove: (items: PriceItem[]) => void;
  onReject: (reason: string) => void;
  onModify: (items: PriceItem[]) => void;
}> = ({ currentPrices, suggestedPrices, impactAnalysis, onApprove, onReject, onModify }) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(suggestedPrices.map(item => item.id))
  );
  const [modifiedPrices, setModifiedPrices] = useState<Map<string, number>>(new Map());
  
  return (
    <Card className="p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Price Optimization Approval</h3>
          <p className="text-sm text-muted-foreground">
            Review and approve AI-suggested price changes
          </p>
        </div>
        
        <ImpactSummary analysis={impactAnalysis} />
        
        <div className="space-y-2">
          <h4 className="font-medium">Suggested Changes</h4>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === suggestedPrices.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedItems(new Set(suggestedPrices.map(i => i.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Suggested</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Override</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestedPrices.map((item) => (
                  <PriceChangeRow
                    key={item.id}
                    item={item}
                    current={currentPrices.find(p => p.id === item.id)!}
                    selected={selectedItems.has(item.id)}
                    onSelect={(selected) => {
                      const newSelected = new Set(selectedItems);
                      if (selected) {
                        newSelected.add(item.id);
                      } else {
                        newSelected.delete(item.id);
                      }
                      setSelectedItems(newSelected);
                    }}
                    onPriceOverride={(price) => {
                      modifiedPrices.set(item.id, price);
                      setModifiedPrices(new Map(modifiedPrices));
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedItems.size} of {suggestedPrices.length} items selected
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const reason = prompt("Reason for rejection:");
                if (reason) onReject(reason);
              }}
            >
              Reject All
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const itemsToApprove = suggestedPrices
                  .filter(item => selectedItems.has(item.id))
                  .map(item => ({
                    ...item,
                    price: modifiedPrices.get(item.id) || item.price
                  }));
                onModify(itemsToApprove);
              }}
              disabled={modifiedPrices.size === 0}
            >
              Apply Modifications
            </Button>
            
            <Button
              onClick={() => {
                const itemsToApprove = suggestedPrices.filter(
                  item => selectedItems.has(item.id)
                );
                onApprove(itemsToApprove);
              }}
              disabled={selectedItems.size === 0}
            >
              Approve Selected ({selectedItems.size})
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

## 3. Testing Strategy

### 3.1 Unit Tests
```typescript
// __tests__/copilotActions.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useAnalyticsActions } from '../actions/analyticsActions';

describe('CopilotKit Actions', () => {
  test('analyzeRevenue action returns correct data structure', async () => {
    const { result } = renderHook(() => useAnalyticsActions());
    
    const action = result.current.actions.find(a => a.name === 'analyzeRevenue');
    const response = await action.handler({ 
      timeframe: 'last 30 days',
      groupBy: 'location' 
    });
    
    expect(response).toHaveProperty('summary');
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('insights');
    expect(Array.isArray(response.insights)).toBe(true);
  });
});
```

### 3.2 Integration Tests
```typescript
// __tests__/integration/copilotChat.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CopilotChat } from '../components/CopilotChat';

describe('CopilotKit Chat Integration', () => {
  test('Chat responds to revenue analysis query', async () => {
    render(<CopilotChat />);
    
    const input = screen.getByPlaceholderText('Ask about your business...');
    await userEvent.type(input, 'Show me revenue for last month');
    await userEvent.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(screen.getByText(/Revenue Analysis/)).toBeInTheDocument();
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    });
  });
});
```

## 4. Deployment Strategy

### 4.1 Phased Rollout
1. **Alpha Phase**: Internal testing with sample data
2. **Beta Phase**: Limited rollout to 10% of users
3. **GA Phase**: Full rollout with feature flags

### 4.2 Performance Monitoring
```typescript
// monitoring/copilotMetrics.ts
export const trackCopilotUsage = {
  queryExecuted: (query: string, duration: number) => {
    analytics.track('copilot_query', {
      query,
      duration,
      timestamp: new Date().toISOString()
    });
  },
  
  actionCompleted: (action: string, success: boolean) => {
    analytics.track('copilot_action', {
      action,
      success,
      timestamp: new Date().toISOString()
    });
  },
  
  approvalWorkflow: (type: string, approved: boolean) => {
    analytics.track('copilot_approval', {
      type,
      approved,
      timestamp: new Date().toISOString()
    });
  }
};
```

## 5. User Training Materials

### 5.1 Interactive Tutorial
```typescript
// components/CopilotTutorial.tsx
export const CopilotTutorial = () => {
  const steps = [
    {
      target: '.copilot-trigger',
      content: 'Click here to open your AI assistant',
      action: 'click'
    },
    {
      target: '.copilot-input',
      content: 'Try asking "Show me revenue for last month"',
      action: 'type'
    },
    {
      target: '.generative-ui-card',
      content: 'The AI creates custom visualizations for your data',
      action: 'observe'
    }
  ];
  
  return <InteractiveTour steps={steps} />;
};
```

### 5.2 Example Queries Library
```typescript
const exampleQueries = [
  {
    category: "Revenue Analysis",
    queries: [
      "What's my revenue trend for the last 3 months?",
      "Compare revenue across all locations",
      "Show me my best performing days this month"
    ]
  },
  {
    category: "Customer Insights",
    queries: [
      "Who are my top customers?",
      "What's the average customer lifetime value?",
      "Show me customer segments by order frequency"
    ]
  },
  {
    category: "Predictive Analytics",
    queries: [
      "Forecast next week's revenue",
      "Predict inventory needs for the weekend",
      "What will be my busiest hours tomorrow?"
    ]
  }
];
```

## 6. Success Monitoring

### 6.1 Key Metrics Dashboard
```typescript
// Monitor adoption and effectiveness
const CopilotMetricsDashboard = () => {
  const metrics = useCopilotMetrics();
  
  return (
    <Dashboard>
      <MetricCard
        title="Daily Active Users"
        value={metrics.dau}
        trend={metrics.dauTrend}
      />
      <MetricCard
        title="Average Queries/User"
        value={metrics.avgQueries}
        trend={metrics.queryTrend}
      />
      <MetricCard
        title="Query Success Rate"
        value={`${metrics.successRate}%`}
        target="95%"
      />
      <MetricCard
        title="Time to Insight"
        value={`${metrics.avgTimeToInsight}s`}
        target="<2s"
      />
    </Dashboard>
  );
};
```

## 7. Continuous Improvement

### 7.1 Feedback Loop
```typescript
// Collect and act on user feedback
useCopilotAction({
  name: "provideFeedback",
  description: "Collect user feedback on AI responses",
  parameters: [
    { name: "responseId", type: "string" },
    { name: "helpful", type: "boolean" },
    { name: "feedback", type: "string" }
  ],
  handler: async ({ responseId, helpful, feedback }) => {
    await api.logFeedback({ responseId, helpful, feedback });
    
    if (!helpful) {
      // Trigger retraining pipeline
      await api.flagForReview({ responseId, feedback });
    }
  }
});
```

This implementation plan provides a comprehensive roadmap for integrating CopilotKit's agentic UI features into BiteBase, creating a truly next-generation business intelligence platform that combines the power of AI with intuitive human interaction.
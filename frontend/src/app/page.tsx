'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  MapPin, 
  TrendingUp, 
  Users, 
  Building, 
  BarChart3, 
  Target, 
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Brain,
  Search,
  Activity
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">BiteBase</h1>
                <p className="text-xs text-muted-foreground">Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#analytics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/dashboard">
                <Button className="btn-primary">
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Activity className="h-3 w-3 mr-1" />
            Enhanced with Interactive Analytics
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Restaurant Intelligence
            <br />
            <span className="gradient-text">Platform</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover profitable locations, track competitors, and optimize operations with interactive maps, real-time analytics, and AI-driven insights that boost your bottom line.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="btn-primary text-lg px-8 py-3 glow-green">
                Start Interactive Analysis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              <Globe className="h-5 w-5 mr-2" />
              Explore Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">10,000+</div>
            <div className="text-muted-foreground">Locations Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">35%</div>
            <div className="text-muted-foreground">Average Revenue Increase</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">99.9%</div>
            <div className="text-muted-foreground">Platform Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">Real-time</div>
            <div className="text-muted-foreground">Interactive Analytics</div>
          </div>
        </div>
      </section>

      {/* New Interactive Features Showcase */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Interactive Research</span> & Analytics
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the next generation of restaurant intelligence with interactive maps, real-time data exploration, and AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Card className="card-dark">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Interactive Location Intelligence</CardTitle>
                <CardDescription>
                  Click anywhere on the map to instantly analyze demographics, competition, and market potential with AI-powered scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Real-time location analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Interactive competitor mapping
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    AI-powered market scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="card-dark">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle>Dynamic Market Research</CardTitle>
                <CardDescription>
                  Configure analysis parameters in real-time and watch insights update instantly as you explore different scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Configurable analysis radius
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Cuisine-specific targeting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Real-time parameter updates
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 backdrop-blur-sm border border-primary/20">
              <div className="aspect-video bg-card rounded-lg border border-border flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Interactive Dashboard Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      Real-time analytics with interactive maps, dynamic charts, and AI-powered insights
                    </p>
                  </div>
                  <Link href="/dashboard">
                    <Button className="btn-primary">
                      Launch Live Demo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive <span className="gradient-text">Intelligence Suite</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to make data-driven restaurant location and operational decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI-Powered Analysis</CardTitle>
              <CardDescription>
                Advanced machine learning algorithms analyze market conditions, demographics, and competition patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Predictive market modeling
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Risk assessment algorithms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Success probability scoring
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Live data visualization with interactive charts, maps, and comprehensive market research tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Interactive data exploration
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Dynamic chart updates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Custom dashboard creation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-orange-400" />
              </div>
              <CardTitle>Competitive Intelligence</CardTitle>
              <CardDescription>
                Track nearby restaurants, analyze market saturation, and identify opportunities in your target area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Real-time competitor tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Market saturation analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Opportunity gap identification
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <CardTitle>Demographic Intelligence</CardTitle>
              <CardDescription>
                Deep insights into population, income, lifestyle, and consumer behavior patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Population density analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Income distribution mapping
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Consumer behavior insights
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <CardTitle>Location Optimization</CardTitle>
              <CardDescription>
                Multi-location comparison, site selection scoring, and expansion planning tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Multi-location comparison
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Site selection scoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Expansion planning tools
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="card-dark">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle>Market Intelligence</CardTitle>
              <CardDescription>
                Real-time market trends, seasonal patterns, and predictive analytics for strategic planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Market trend analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Seasonal pattern detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Predictive forecasting
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your <span className="gradient-text">Restaurant Business</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of restaurant owners who use BiteBase Intelligence to make smarter location and operational decisions with interactive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="btn-primary text-lg px-12 py-4 glow-green">
                Launch Interactive Dashboard
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-12 py-4">
              <Globe className="h-5 w-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold gradient-text">BiteBase Intelligence</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 BiteBase Intelligence. Enhanced with Interactive Analytics.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

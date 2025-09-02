#!/usr/bin/env python3
"""
Simplified BiteBase Intelligence Backend Server
Using only built-in Python libraries for compatibility
"""

import json
import sqlite3
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time
from datetime import datetime, timedelta
import random
import math

# Database setup
DB_PATH = "bitebase_intelligence.db"

class DatabaseManager:
    def __init__(self):
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database with required tables"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Restaurants table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS restaurants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                cuisine_type TEXT,
                address TEXT,
                latitude REAL,
                longitude REAL,
                rating REAL,
                price_range TEXT,
                phone TEXT,
                email TEXT,
                manager TEXT,
                staff_count INTEGER,
                capacity INTEGER,
                avg_order_value REAL,
                monthly_revenue REAL,
                open_hours TEXT,
                status TEXT DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Reports table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                type TEXT,
                status TEXT DEFAULT 'completed',
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                author TEXT,
                format TEXT,
                size TEXT,
                downloads INTEGER DEFAULT 0,
                data TEXT
            )
        ''')
        
        # Analytics data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analytics_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT NOT NULL,
                metric_value REAL,
                metric_category TEXT,
                date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            )
        ''')
        
        # Research projects table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS research_projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT,
                status TEXT DEFAULT 'completed',
                progress INTEGER DEFAULT 100,
                insights INTEGER DEFAULT 0,
                sources INTEGER DEFAULT 0,
                start_date DATE,
                completed_date DATE,
                priority TEXT DEFAULT 'medium',
                agent TEXT
            )
        ''')
        
        conn.commit()
        self.seed_data(conn)
        conn.close()
    
    def seed_data(self, conn):
        """Seed database with sample data"""
        cursor = conn.cursor()
        
        # Check if data already exists
        cursor.execute("SELECT COUNT(*) FROM restaurants")
        if cursor.fetchone()[0] > 0:
            return
        
        # Sample restaurants data
        restaurants = [
            ("Bangkok Bistro Central", "Thai Fusion", "123 Sukhumvit Road, Bangkok", 13.7563, 100.5018, 4.8, "Premium", "+66 2 123 4567", "central@bangkokbistro.com", "Somchai Jaidee", 24, 120, 850, 2400000, "11:00-23:00", "active"),
            ("Street Food Paradise", "Thai Street Food", "456 Chatuchak Market, Bangkok", 13.7997, 100.5568, 4.6, "Budget", "+66 2 234 5678", "info@streetfoodparadise.com", "Niran Patel", 12, 60, 320, 890000, "10:00-22:00", "active"),
            ("Siam Spice House", "Thai Traditional", "789 Siam Square, Bangkok", 13.7460, 100.5340, 4.4, "Mid-range", "+66 2 345 6789", "contact@siamspice.com", "Apinya Wong", 18, 80, 450, 1200000, "09:00-21:00", "active"),
            ("Royal Thai Kitchen", "Royal Thai", "321 Silom Road, Bangkok", 13.7248, 100.5340, 0, "Premium", "+66 2 456 7890", "info@royalthai.com", "Kamon Srisuk", 0, 150, 1200, 0, "TBD", "planning"),
            ("Green Curry Corner", "Thai Curry", "654 Khao San Road, Bangkok", 13.7590, 100.4970, 4.2, "Budget", "+66 2 567 8901", "hello@greencurry.com", "Malee Siri", 8, 40, 280, 450000, "08:00-20:00", "active"),
            ("Pad Thai Palace", "Thai Noodles", "987 Thonglor Road, Bangkok", 13.7308, 100.5827, 4.7, "Mid-range", "+66 2 678 9012", "orders@padthaipalace.com", "Chai Wongsa", 15, 70, 380, 980000, "11:00-22:00", "active")
        ]
        
        cursor.executemany('''
            INSERT INTO restaurants (name, cuisine_type, address, latitude, longitude, rating, price_range, phone, email, manager, staff_count, capacity, avg_order_value, monthly_revenue, open_hours, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', restaurants)
        
        # Sample reports data
        reports = [
            ("Monthly Sales Performance", "Comprehensive sales analysis for January 2024", "sales", "Automated", "completed", "2024-01-31 23:59", "System", "PDF", "2.4 MB", 45, '{"totalSales": "₿2.4M", "growth": "+12.5%", "orders": "15,234", "avgOrderValue": "₿157"}'),
            ("Customer Behavior Analysis", "Deep dive into customer patterns and preferences", "customer", "Custom", "completed", "2024-01-30 14:30", "Analytics Team", "Excel", "1.8 MB", 23, '{"totalCustomers": "45,678", "newCustomers": "3,456", "retention": "87.3%", "avgVisits": "4.2/month"}'),
            ("Operational Efficiency Report", "Kitchen performance and service metrics", "operations", "Automated", "processing", "2024-01-31 18:45", "System", "PDF", "3.1 MB", 0, '{}'),
            ("Financial Summary Q4 2023", "Quarterly financial performance and projections", "financial", "Custom", "completed", "2024-01-15 09:00", "Finance Team", "PDF", "4.2 MB", 67, '{"revenue": "₿8.2M", "profit": "₿1.8M", "margin": "22.1%", "expenses": "₿6.4M"}'),
            ("Location Performance Comparison", "Multi-location analysis and benchmarking", "operations", "Automated", "scheduled", "2024-02-01 08:00", "System", "Excel", "TBD", 0, '{}'),
            ("Marketing Campaign ROI", "Campaign effectiveness and return on investment", "sales", "Custom", "completed", "2024-01-28 16:20", "Marketing Team", "PowerPoint", "1.5 MB", 34, '{"roi": "3.2x", "engagement": "+45%", "conversion": "12.8%"}')
        ]
        
        cursor.executemany('''
            INSERT INTO reports (title, description, category, type, status, generated_at, author, format, size, downloads, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', reports)
        
        # Sample research projects
        research_projects = [
            ("Thai Food Market Trends 2024", "Comprehensive analysis of emerging trends in Thai cuisine market", "market-trends", "completed", 100, 24, 156, "2024-01-15", "2024-01-28", "high", "Market Intelligence AI"),
            ("Competitor Pricing Strategy Analysis", "Deep dive into competitor pricing models and strategies", "competitor-analysis", "in-progress", 65, 18, 89, "2024-01-20", None, "high", "Competition AI"),
            ("Customer Behavior Post-Pandemic", "Analysis of changing customer preferences and behaviors", "customer-insights", "completed", 100, 31, 203, "2024-01-10", "2024-01-25", "medium", "Customer Intelligence AI"),
            ("Bangkok Restaurant Location Hotspots", "Identifying prime locations for new restaurant openings", "location-research", "scheduled", 0, 0, 0, "2024-02-01", None, "medium", "Location Intelligence AI")
        ]
        
        cursor.executemany('''
            INSERT INTO research_projects (title, description, category, status, progress, insights, sources, start_date, completed_date, priority, agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', research_projects)
        
        conn.commit()

class BiteBaseHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.db = DatabaseManager()
        super().__init__(*args, **kwargs)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        try:
            if path == '/api/v1/restaurants':
                self.handle_get_restaurants(query_params)
            elif path.startswith('/api/v1/restaurants/'):
                restaurant_id = path.split('/')[-1]
                self.handle_get_restaurant(restaurant_id)
            elif path == '/api/v1/reports':
                self.handle_get_reports(query_params)
            elif path.startswith('/api/v1/reports/'):
                report_id = path.split('/')[-1]
                self.handle_get_report(report_id)
            elif path == '/api/v1/analytics/dashboard':
                self.handle_get_dashboard_analytics(query_params)
            elif path == '/api/v1/research/projects':
                self.handle_get_research_projects(query_params)
            elif path == '/api/v1/analytics/location':
                self.handle_get_location_analytics(query_params)
            elif path == '/health':
                self.send_json_response({'status': 'healthy', 'timestamp': datetime.now().isoformat()})
            else:
                self.send_error(404, "Endpoint not found")
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_get_restaurants(self, query_params):
        """Get restaurants with optional filtering"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Base query
        query = "SELECT * FROM restaurants WHERE 1=1"
        params = []
        
        # Add filters
        if 'status' in query_params:
            query += " AND status = ?"
            params.append(query_params['status'][0])
        
        if 'cuisine_type' in query_params:
            query += " AND cuisine_type = ?"
            params.append(query_params['cuisine_type'][0])
        
        cursor.execute(query, params)
        columns = [description[0] for description in cursor.description]
        restaurants = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        self.send_json_response(restaurants)
    
    def handle_get_restaurant(self, restaurant_id):
        """Get single restaurant by ID"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM restaurants WHERE id = ?", (restaurant_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [description[0] for description in cursor.description]
            restaurant = dict(zip(columns, row))
            self.send_json_response(restaurant)
        else:
            self.send_error(404, "Restaurant not found")
        
        conn.close()
    
    def handle_get_reports(self, query_params):
        """Get reports with optional filtering"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        query = "SELECT * FROM reports ORDER BY generated_at DESC"
        cursor.execute(query)
        columns = [description[0] for description in cursor.description]
        reports = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        self.send_json_response(reports)
    
    def handle_get_report(self, report_id):
        """Get single report by ID"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [description[0] for description in cursor.description]
            report = dict(zip(columns, row))
            # Parse JSON data if available
            if report['data']:
                try:
                    report['data'] = json.loads(report['data'])
                except:
                    pass
            self.send_json_response(report)
        else:
            self.send_error(404, "Report not found")
        
        conn.close()

    def handle_get_dashboard_analytics(self, query_params):
        """Get dashboard analytics data"""
        # Generate mock analytics data
        analytics = {
            'totalRevenue': 8200000,
            'totalOrders': 15234,
            'totalCustomers': 45678,
            'avgOrderValue': 538,
            'revenueGrowth': 12.5,
            'orderGrowth': 8.3,
            'customerGrowth': 15.7,
            'topProducts': [
                {'name': 'Pad Thai', 'sales': 245000, 'orders': 1560},
                {'name': 'Green Curry', 'sales': 198000, 'orders': 1240},
                {'name': 'Tom Yum Soup', 'sales': 156000, 'orders': 980}
            ],
            'salesByLocation': [
                {'location': 'Central Plaza', 'sales': 890000, 'growth': 15},
                {'location': 'Siam Square', 'sales': 720000, 'growth': 8},
                {'location': 'Chatuchak', 'sales': 450000, 'growth': 5}
            ]
        }

        self.send_json_response(analytics)

    def handle_get_location_analytics(self, query_params):
        """Get location-based analytics"""
        # Get parameters
        lat = float(query_params.get('lat', [13.7563])[0])
        lng = float(query_params.get('lng', [100.5018])[0])
        radius = int(query_params.get('radius', [1000])[0])  # meters

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM restaurants WHERE status = 'active'")
        columns = [description[0] for description in cursor.description]
        all_restaurants = [dict(zip(columns, row)) for row in cursor.fetchall()]
        conn.close()

        # Filter restaurants within radius
        restaurants_in_radius = []
        for restaurant in all_restaurants:
            if restaurant['latitude'] and restaurant['longitude']:
                distance = self.calculate_distance(lat, lng, restaurant['latitude'], restaurant['longitude'])
                if distance <= radius:
                    restaurant['distance'] = distance
                    restaurants_in_radius.append(restaurant)

        # Calculate analytics
        total_restaurants = len(restaurants_in_radius)
        competitor_count = len([r for r in restaurants_in_radius if r['cuisine_type'] == 'Thai Fusion'])

        if total_restaurants > 0:
            avg_rating = sum(r['rating'] for r in restaurants_in_radius if r['rating']) / len([r for r in restaurants_in_radius if r['rating']])
            avg_rating = round(avg_rating, 1)
        else:
            avg_rating = 0

        # Market density
        if total_restaurants > 20:
            market_density = 'High'
        elif total_restaurants > 10:
            market_density = 'Medium'
        else:
            market_density = 'Low'

        # Top cuisines
        cuisine_count = {}
        for restaurant in restaurants_in_radius:
            cuisine = restaurant['cuisine_type']
            cuisine_count[cuisine] = cuisine_count.get(cuisine, 0) + 1

        top_cuisines = sorted(cuisine_count.items(), key=lambda x: x[1], reverse=True)[:3]
        top_cuisines = [{'cuisine': cuisine, 'count': count} for cuisine, count in top_cuisines]

        # Price analysis
        prices = [r['avg_order_value'] for r in restaurants_in_radius if r['avg_order_value']]
        if prices:
            price_range = {'min': min(prices), 'max': max(prices)}
        else:
            price_range = {'min': 0, 'max': 0}

        analytics = {
            'totalRestaurants': total_restaurants,
            'competitorCount': competitor_count,
            'averageRating': avg_rating,
            'marketDensity': market_density,
            'topCuisines': top_cuisines,
            'priceRange': price_range,
            'peakHours': ['12:00-13:00', '19:00-20:00'],
            'restaurants': restaurants_in_radius
        }

        self.send_json_response(analytics)

    def handle_get_research_projects(self, query_params):
        """Get research projects"""
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        query = "SELECT * FROM research_projects ORDER BY start_date DESC"
        cursor.execute(query)
        columns = [description[0] for description in cursor.description]
        projects = [dict(zip(columns, row)) for row in cursor.fetchall()]

        conn.close()
        self.send_json_response(projects)

    def calculate_distance(self, lat1, lng1, lat2, lng2):
        """Calculate distance between two points using Haversine formula"""
        R = 6371000  # Earth's radius in meters

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)

        a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lng / 2) * math.sin(delta_lng / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return R * c

    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_cors_headers()
        self.end_headers()
        
        json_data = json.dumps(data, indent=2, default=str)
        self.wfile.write(json_data.encode('utf-8'))
    
    def log_message(self, format, *args):
        """Override to customize logging"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

def run_server(port=8000):
    """Run the HTTP server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, BiteBaseHandler)
    print(f"🚀 BiteBase Intelligence Backend Server starting on port {port}")
    print(f"📊 API Documentation: http://localhost:{port}/health")
    print(f"🗄️  Database: {DB_PATH}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.server_close()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)

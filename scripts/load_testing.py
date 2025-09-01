#!/usr/bin/env python3
"""
Load Testing Script for BiteBase Intelligence API
Comprehensive performance testing with multiple scenarios
"""

import asyncio
import aiohttp
import time
import json
import random
import statistics
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class TestResult:
    """Individual test result"""
    endpoint: str
    method: str
    status_code: int
    response_time_ms: float
    success: bool
    error_message: Optional[str] = None
    timestamp: datetime = None

@dataclass
class LoadTestConfig:
    """Load test configuration"""
    base_url: str = "http://localhost:8000"
    concurrent_users: int = 10
    test_duration_seconds: int = 60
    ramp_up_seconds: int = 10
    endpoints: List[Dict[str, Any]] = None
    auth_token: Optional[str] = None

class LoadTester:
    """Load testing orchestrator"""
    
    def __init__(self, config: LoadTestConfig):
        self.config = config
        self.results: List[TestResult] = []
        self.session: Optional[aiohttp.ClientSession] = None
        
        # Default endpoints to test
        if not config.endpoints:
            self.config.endpoints = [
                {"path": "/api/v1/restaurants", "method": "GET", "weight": 30},
                {"path": "/api/v1/analytics/dashboard", "method": "GET", "weight": 25},
                {"path": "/api/v1/location-intelligence/density", "method": "GET", "weight": 20},
                {"path": "/api/v1/product-intelligence/menu-analysis", "method": "GET", "weight": 15},
                {"path": "/api/v1/security/enterprise/monitoring/metrics", "method": "GET", "weight": 10},
            ]
    
    async def setup_session(self):
        """Setup HTTP session with authentication"""
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "BiteBase-LoadTester/1.0"
        }
        
        if self.config.auth_token:
            headers["Authorization"] = f"Bearer {self.config.auth_token}"
        
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            headers=headers,
            timeout=timeout,
            connector=aiohttp.TCPConnector(limit=100)
        )
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    async def make_request(self, endpoint: Dict[str, Any]) -> TestResult:
        """Make a single HTTP request"""
        start_time = time.time()
        url = f"{self.config.base_url}{endpoint['path']}"
        method = endpoint['method'].upper()
        
        try:
            async with self.session.request(method, url) as response:
                await response.text()  # Read response body
                
                end_time = time.time()
                response_time_ms = (end_time - start_time) * 1000
                
                return TestResult(
                    endpoint=endpoint['path'],
                    method=method,
                    status_code=response.status,
                    response_time_ms=response_time_ms,
                    success=200 <= response.status < 400,
                    timestamp=datetime.utcnow()
                )
        
        except Exception as e:
            end_time = time.time()
            response_time_ms = (end_time - start_time) * 1000
            
            return TestResult(
                endpoint=endpoint['path'],
                method=method,
                status_code=0,
                response_time_ms=response_time_ms,
                success=False,
                error_message=str(e),
                timestamp=datetime.utcnow()
            )
    
    def select_endpoint(self) -> Dict[str, Any]:
        """Select endpoint based on weights"""
        total_weight = sum(ep['weight'] for ep in self.config.endpoints)
        random_value = random.randint(1, total_weight)
        
        current_weight = 0
        for endpoint in self.config.endpoints:
            current_weight += endpoint['weight']
            if random_value <= current_weight:
                return endpoint
        
        return self.config.endpoints[0]  # Fallback
    
    async def user_simulation(self, user_id: int, start_delay: float):
        """Simulate a single user's behavior"""
        await asyncio.sleep(start_delay)
        
        user_results = []
        end_time = time.time() + self.config.test_duration_seconds
        
        while time.time() < end_time:
            endpoint = self.select_endpoint()
            result = await self.make_request(endpoint)
            user_results.append(result)
            
            # Random think time between requests (0.1 to 2 seconds)
            think_time = random.uniform(0.1, 2.0)
            await asyncio.sleep(think_time)
        
        self.results.extend(user_results)
        logger.info(f"User {user_id} completed {len(user_results)} requests")
    
    async def run_load_test(self) -> Dict[str, Any]:
        """Execute the load test"""
        logger.info(f"Starting load test with {self.config.concurrent_users} users for {self.config.test_duration_seconds}s")
        
        await self.setup_session()
        
        try:
            # Calculate ramp-up delays
            ramp_up_delay = self.config.ramp_up_seconds / self.config.concurrent_users
            
            # Start user simulations
            tasks = []
            for user_id in range(self.config.concurrent_users):
                start_delay = user_id * ramp_up_delay
                task = asyncio.create_task(self.user_simulation(user_id, start_delay))
                tasks.append(task)
            
            # Wait for all users to complete
            await asyncio.gather(*tasks)
            
        finally:
            await self.cleanup_session()
        
        return self.analyze_results()
    
    def analyze_results(self) -> Dict[str, Any]:
        """Analyze test results and generate report"""
        if not self.results:
            return {"error": "No results to analyze"}
        
        # Basic statistics
        total_requests = len(self.results)
        successful_requests = len([r for r in self.results if r.success])
        failed_requests = total_requests - successful_requests
        success_rate = (successful_requests / total_requests) * 100
        
        # Response time statistics
        response_times = [r.response_time_ms for r in self.results]
        avg_response_time = statistics.mean(response_times)
        min_response_time = min(response_times)
        max_response_time = max(response_times)
        p95_response_time = statistics.quantiles(response_times, n=20)[18]  # 95th percentile
        p99_response_time = statistics.quantiles(response_times, n=100)[98]  # 99th percentile
        
        # Throughput calculation
        test_duration = max(r.timestamp for r in self.results) - min(r.timestamp for r in self.results)
        throughput_rps = total_requests / test_duration.total_seconds()
        
        # Status code distribution
        status_codes = {}
        for result in self.results:
            status_codes[result.status_code] = status_codes.get(result.status_code, 0) + 1
        
        # Endpoint performance
        endpoint_stats = {}
        for result in self.results:
            if result.endpoint not in endpoint_stats:
                endpoint_stats[result.endpoint] = {
                    'total_requests': 0,
                    'successful_requests': 0,
                    'response_times': []
                }
            
            endpoint_stats[result.endpoint]['total_requests'] += 1
            if result.success:
                endpoint_stats[result.endpoint]['successful_requests'] += 1
            endpoint_stats[result.endpoint]['response_times'].append(result.response_time_ms)
        
        # Calculate endpoint averages
        for endpoint, stats in endpoint_stats.items():
            stats['success_rate'] = (stats['successful_requests'] / stats['total_requests']) * 100
            stats['avg_response_time'] = statistics.mean(stats['response_times'])
            stats['p95_response_time'] = statistics.quantiles(stats['response_times'], n=20)[18] if len(stats['response_times']) >= 20 else max(stats['response_times'])
        
        # Error analysis
        errors = [r for r in self.results if not r.success]
        error_types = {}
        for error in errors:
            error_key = f"{error.status_code}: {error.error_message or 'HTTP Error'}"
            error_types[error_key] = error_types.get(error_key, 0) + 1
        
        return {
            'test_config': asdict(self.config),
            'summary': {
                'total_requests': total_requests,
                'successful_requests': successful_requests,
                'failed_requests': failed_requests,
                'success_rate': round(success_rate, 2),
                'test_duration_seconds': test_duration.total_seconds(),
                'throughput_rps': round(throughput_rps, 2)
            },
            'response_times': {
                'average_ms': round(avg_response_time, 2),
                'minimum_ms': round(min_response_time, 2),
                'maximum_ms': round(max_response_time, 2),
                'p95_ms': round(p95_response_time, 2),
                'p99_ms': round(p99_response_time, 2)
            },
            'status_codes': status_codes,
            'endpoint_performance': {
                endpoint: {
                    'total_requests': stats['total_requests'],
                    'success_rate': round(stats['success_rate'], 2),
                    'avg_response_time_ms': round(stats['avg_response_time'], 2),
                    'p95_response_time_ms': round(stats['p95_response_time'], 2)
                }
                for endpoint, stats in endpoint_stats.items()
            },
            'errors': error_types,
            'generated_at': datetime.utcnow().isoformat()
        }

async def run_performance_scenarios():
    """Run multiple performance test scenarios"""
    
    scenarios = [
        {
            'name': 'Light Load',
            'config': LoadTestConfig(
                concurrent_users=5,
                test_duration_seconds=30,
                ramp_up_seconds=5
            )
        },
        {
            'name': 'Normal Load',
            'config': LoadTestConfig(
                concurrent_users=20,
                test_duration_seconds=60,
                ramp_up_seconds=10
            )
        },
        {
            'name': 'Heavy Load',
            'config': LoadTestConfig(
                concurrent_users=50,
                test_duration_seconds=120,
                ramp_up_seconds=20
            )
        },
        {
            'name': 'Stress Test',
            'config': LoadTestConfig(
                concurrent_users=100,
                test_duration_seconds=180,
                ramp_up_seconds=30
            )
        }
    ]
    
    all_results = {}
    
    for scenario in scenarios:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running scenario: {scenario['name']}")
        logger.info(f"{'='*50}")
        
        tester = LoadTester(scenario['config'])
        results = await tester.run_load_test()
        all_results[scenario['name']] = results
        
        # Print summary
        summary = results['summary']
        response_times = results['response_times']
        
        logger.info(f"Results for {scenario['name']}:")
        logger.info(f"  Total Requests: {summary['total_requests']}")
        logger.info(f"  Success Rate: {summary['success_rate']}%")
        logger.info(f"  Throughput: {summary['throughput_rps']} RPS")
        logger.info(f"  Avg Response Time: {response_times['average_ms']}ms")
        logger.info(f"  P95 Response Time: {response_times['p95_ms']}ms")
        
        # Wait between scenarios
        await asyncio.sleep(10)
    
    # Save results to file
    with open('load_test_results.json', 'w') as f:
        json.dump(all_results, f, indent=2, default=str)
    
    logger.info(f"\nAll scenarios completed. Results saved to load_test_results.json")
    return all_results

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='BiteBase Intelligence Load Tester')
    parser.add_argument('--base-url', default='http://localhost:8000', help='Base URL for API')
    parser.add_argument('--users', type=int, default=10, help='Number of concurrent users')
    parser.add_argument('--duration', type=int, default=60, help='Test duration in seconds')
    parser.add_argument('--ramp-up', type=int, default=10, help='Ramp-up time in seconds')
    parser.add_argument('--scenarios', action='store_true', help='Run predefined scenarios')
    parser.add_argument('--auth-token', help='Authentication token')
    
    args = parser.parse_args()
    
    if args.scenarios:
        # Run predefined scenarios
        asyncio.run(run_performance_scenarios())
    else:
        # Run single test
        config = LoadTestConfig(
            base_url=args.base_url,
            concurrent_users=args.users,
            test_duration_seconds=args.duration,
            ramp_up_seconds=args.ramp_up,
            auth_token=args.auth_token
        )
        
        async def run_single_test():
            tester = LoadTester(config)
            results = await tester.run_load_test()
            
            print(json.dumps(results, indent=2, default=str))
        
        asyncio.run(run_single_test())

if __name__ == '__main__':
    main()

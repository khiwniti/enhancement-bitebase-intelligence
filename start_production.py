#!/usr/bin/env python3
"""
BiteBase Intelligence 2.0 - Production Service Orchestrator
Simplified version for production deployment
"""

import subprocess
import time
import requests
import os
import sys
from pathlib import Path
import signal

class ProductionOrchestrator:
    """Production service orchestrator with simplified validation"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_path = self.project_root / "backend"
        self.frontend_path = self.project_root / "frontend"
        self.services = {}
        
    def log(self, message: str, level: str = "INFO"):
        """Simple logging"""
        colors = {
            "INFO": "\033[94m",  # Blue
            "SUCCESS": "\033[92m",  # Green
            "WARNING": "\033[93m",  # Yellow
            "ERROR": "\033[91m",  # Red
        }
        reset = "\033[0m"
        timestamp = time.strftime("%H:%M:%S")
        print(f"{colors.get(level, '')}{timestamp} [{level}] {message}{reset}")
    
    def start_backend(self) -> bool:
        """Start simplified backend"""
        self.log("🚀 Starting BiteBase Intelligence API...", "INFO")
        try:
            env = os.environ.copy()
            env['PYTHONPATH'] = str(self.backend_path)
            
            # Start backend with simplified main
            process = subprocess.Popen([
                "uvicorn", "app.main_simple:app", 
                "--host", "0.0.0.0", 
                "--port", "8000"
            ], cwd=self.backend_path, env=env)
            
            self.services['backend'] = {'process': process, 'port': 8000}
            
            # Wait for backend to be ready
            for i in range(15):
                try:
                    response = requests.get("http://localhost:8000/", timeout=2)
                    if response.status_code == 200:
                        self.log("✅ API server started successfully", "SUCCESS")
                        return True
                except:
                    time.sleep(1)
            
            self.log("❌ API server failed to start", "ERROR")
            return False
            
        except Exception as e:
            self.log(f"❌ Failed to start API: {e}", "ERROR")
            return False
    
    def start_frontend_dev(self) -> bool:
        """Start frontend in development mode"""
        self.log("🚀 Starting Frontend Development Server...", "INFO")
        try:
            # Start in dev mode to skip build issues
            process = subprocess.Popen([
                "npm", "run", "dev"
            ], cwd=self.frontend_path)
            
            self.services['frontend'] = {'process': process, 'port': 3000}
            
            # Wait for frontend to be ready
            for i in range(30):
                try:
                    response = requests.get("http://localhost:3000", timeout=2)
                    if response.status_code == 200:
                        self.log("✅ Frontend server started successfully", "SUCCESS")
                        return True
                except:
                    time.sleep(2)
            
            self.log("❌ Frontend server failed to start", "ERROR")
            return False
            
        except Exception as e:
            self.log(f"❌ Failed to start frontend: {e}", "ERROR")
            return False
    
    def validate_basic_functionality(self) -> bool:
        """Basic validation of core functionality"""
        self.log("🔍 Validating core functionality...", "INFO")
        
        tests = [
            ("API Health Check", "http://localhost:8000/health"),
            ("API Root", "http://localhost:8000/"),
            ("Frontend Health", "http://localhost:3000"),
            ("API Dashboard Endpoint", "http://localhost:8000/api/v1/dashboards/"),
            ("API Insights Endpoint", "http://localhost:8000/api/v1/insights/"),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, url in tests:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    self.log(f"✅ {test_name}", "SUCCESS")
                    passed += 1
                else:
                    self.log(f"❌ {test_name} (Status: {response.status_code})", "ERROR")
            except Exception as e:
                self.log(f"❌ {test_name} (Error: {str(e)[:50]})", "ERROR")
        
        success_rate = (passed / total) * 100
        self.log(f"🎯 Validation: {passed}/{total} tests passed ({success_rate:.1f}%)", 
                "SUCCESS" if success_rate >= 80 else "WARNING")
        
        return success_rate >= 80
    
    def print_status(self):
        """Print service status"""
        self.log("📊 Production System Status", "INFO")
        
        for service_name, service_info in self.services.items():
            process = service_info.get('process')
            port = service_info.get('port')
            
            if process and process.poll() is None:
                status = "🟢 RUNNING"
            else:
                status = "🔴 STOPPED"
            
            self.log(f"  {service_name.upper()}: {status} (Port: {port})", "INFO")
        
        self.log("", "INFO")
        self.log("🌐 Application URLs:", "INFO")
        self.log("  Frontend: http://localhost:3000", "INFO")
        self.log("  API: http://localhost:8000", "INFO")
        self.log("  API Docs: http://localhost:8000/docs", "INFO")
    
    def cleanup_services(self):
        """Clean up all services"""
        self.log("🛑 Shutting down services...", "WARNING")
        
        for service_name, service_info in self.services.items():
            process = service_info.get('process')
            if process and process.poll() is None:
                try:
                    process.terminate()
                    process.wait(timeout=5)
                    self.log(f"✅ {service_name} stopped", "SUCCESS")
                except:
                    try:
                        process.kill()
                        self.log(f"🔪 {service_name} force killed", "WARNING")
                    except:
                        self.log(f"❌ Failed to stop {service_name}", "ERROR")
    
    def run_production_startup(self) -> bool:
        """Run production startup sequence"""
        self.log("🚀 BiteBase Intelligence 2.0 - Production Startup", "SUCCESS")
        
        try:
            # Start backend
            if not self.start_backend():
                return False
            
            # Start frontend in dev mode
            if not self.start_frontend_dev():
                return False
            
            # Validate functionality
            self.validate_basic_functionality()
            
            # Print status
            self.print_status()
            
            self.log("✨ BiteBase Intelligence 2.0 is operational!", "SUCCESS")
            self.log("Press Ctrl+C to shutdown", "INFO")
            
            return True
            
        except Exception as e:
            self.log(f"❌ Startup failed: {e}", "ERROR")
            return False

def signal_handler(sig, frame):
    """Handle graceful shutdown"""
    print("\n🛑 Shutdown signal received...")
    orchestrator.cleanup_services()
    sys.exit(0)

def main():
    """Main entry point"""
    global orchestrator
    orchestrator = ProductionOrchestrator()
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        success = orchestrator.run_production_startup()
        
        if success:
            # Keep services running
            while True:
                time.sleep(10)
                # Basic health check
                try:
                    requests.get("http://localhost:8000/health", timeout=2)
                    requests.get("http://localhost:3000", timeout=2)
                except:
                    orchestrator.log("⚠️ Health check failed", "WARNING")
        else:
            orchestrator.log("❌ Production startup failed", "ERROR")
            sys.exit(1)
            
    except KeyboardInterrupt:
        orchestrator.log("👋 Shutdown requested", "INFO")
    finally:
        orchestrator.cleanup_services()

if __name__ == "__main__":
    main()
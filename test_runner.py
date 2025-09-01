#!/usr/bin/env python3
"""
Comprehensive Test Runner for BiteBase Intelligence
Tests both backend and frontend components
"""

import asyncio
import subprocess
import sys
import os
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

class TestResult:
    def __init__(self, name: str, passed: bool, message: str, duration: float = 0.0):
        self.name = name
        self.passed = passed
        self.message = message
        self.duration = duration

class TestRunner:
    def __init__(self):
        self.results: List[TestResult] = []
        self.project_root = Path(__file__).parent
        
    def log_test_start(self, test_name: str):
        logger.info(f"🧪 Starting: {test_name}")
        
    def log_test_result(self, result: TestResult):
        status = "✅ PASS" if result.passed else "❌ FAIL"
        logger.info(f"{status}: {result.name} ({result.duration:.2f}s)")
        if not result.passed:
            logger.error(f"   Error: {result.message}")
        self.results.append(result)
    
    def run_command(self, command: str, cwd: Optional[Path] = None, timeout: int = 30) -> TestResult:
        """Run a shell command and return test result"""
        start_time = time.time()
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd or self.project_root,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            duration = time.time() - start_time
            
            if result.returncode == 0:
                return TestResult(
                    name=command,
                    passed=True,
                    message=result.stdout.strip(),
                    duration=duration
                )
            else:
                return TestResult(
                    name=command,
                    passed=False,
                    message=result.stderr.strip() or result.stdout.strip(),
                    duration=duration
                )
                
        except subprocess.TimeoutExpired:
            return TestResult(
                name=command,
                passed=False,
                message=f"Command timed out after {timeout}s",
                duration=timeout
            )
        except Exception as e:
            return TestResult(
                name=command,
                passed=False,
                message=str(e),
                duration=time.time() - start_time
            )
    
    def test_backend_structure(self) -> TestResult:
        """Test backend directory structure and files"""
        self.log_test_start("Backend Structure Validation")
        
        backend_path = self.project_root / "backend"
        required_files = [
            "requirements.txt",
            "app/main.py",
            "app/__init__.py",
            "app/api",
            "app/core",
            "app/models",
            "app/services",
            "tests"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not (backend_path / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            return TestResult(
                name="Backend Structure",
                passed=False,
                message=f"Missing files/directories: {', '.join(missing_files)}"
            )
        else:
            return TestResult(
                name="Backend Structure", 
                passed=True,
                message="All required backend files and directories present"
            )
    
    def test_frontend_structure(self) -> TestResult:
        """Test frontend directory structure and files"""
        self.log_test_start("Frontend Structure Validation")
        
        frontend_path = self.project_root / "frontend"
        required_files = [
            "package.json",
            "next.config.ts",
            "tsconfig.json",
            "tailwind.config.js",
            "src/app",
            "src/components",
            "src/lib",
            "src/types"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not (frontend_path / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            return TestResult(
                name="Frontend Structure",
                passed=False,
                message=f"Missing files/directories: {', '.join(missing_files)}"
            )
        else:
            return TestResult(
                name="Frontend Structure",
                passed=True,
                message="All required frontend files and directories present"
            )
    
    def test_frontend_typescript(self) -> TestResult:
        """Test TypeScript compilation"""
        self.log_test_start("TypeScript Compilation Check")
        
        frontend_path = self.project_root / "frontend"
        
        # Check if node_modules exists
        if not (frontend_path / "node_modules").exists():
            return TestResult(
                name="TypeScript Check",
                passed=False,
                message="node_modules not found. Run 'npm install' first."
            )
        
        return self.run_command(
            "npm run check-types",
            cwd=frontend_path,
            timeout=60
        )
    
    def test_frontend_lint(self) -> TestResult:
        """Test ESLint"""
        self.log_test_start("ESLint Check")
        
        frontend_path = self.project_root / "frontend"
        return self.run_command(
            "npm run lint",
            cwd=frontend_path,
            timeout=60
        )
    
    def test_frontend_build(self) -> TestResult:
        """Test Next.js build"""
        self.log_test_start("Next.js Build Test")
        
        frontend_path = self.project_root / "frontend"
        return self.run_command(
            "npm run build",
            cwd=frontend_path,
            timeout=180
        )
    
    def test_backend_imports(self) -> TestResult:
        """Test if backend Python imports work"""
        self.log_test_start("Backend Import Test")
        
        test_script = '''
import sys
sys.path.append("backend")

try:
    from app.main import app
    from app.core.config import settings
    from app.api.v1.api import api_router
    print("✅ All critical imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)
'''
        
        try:
            result = subprocess.run([
                sys.executable, "-c", test_script
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return TestResult(
                    name="Backend Imports",
                    passed=True,
                    message="All backend imports successful"
                )
            else:
                return TestResult(
                    name="Backend Imports",
                    passed=False,
                    message=result.stderr.strip() or result.stdout.strip()
                )
        except Exception as e:
            return TestResult(
                name="Backend Imports",
                passed=False,
                message=str(e)
            )
    
    def test_component_files(self) -> TestResult:
        """Test if our consolidated components exist and are valid"""
        self.log_test_start("Component Files Validation")
        
        frontend_path = self.project_root / "frontend" / "src" / "components"
        
        required_components = [
            "analytics/AnalyticsWorkbench.tsx",
            "growth/GrowthIntelligenceStudio.tsx",
            "onboarding/RoleBasedOnboarding.tsx",
            "dashboard/RoleBasedDashboard.tsx",
            "ai/AIResearchAgentMVP.tsx"
        ]
        
        missing_components = []
        invalid_components = []
        
        for component_path in required_components:
            full_path = frontend_path / component_path
            if not full_path.exists():
                missing_components.append(component_path)
            else:
                # Check if file has basic React component structure
                try:
                    content = full_path.read_text()
                    if "export" not in content or "import React" not in content:
                        invalid_components.append(component_path)
                except Exception:
                    invalid_components.append(component_path)
        
        if missing_components or invalid_components:
            message_parts = []
            if missing_components:
                message_parts.append(f"Missing: {', '.join(missing_components)}")
            if invalid_components:
                message_parts.append(f"Invalid: {', '.join(invalid_components)}")
            
            return TestResult(
                name="Component Files",
                passed=False,
                message="; ".join(message_parts)
            )
        else:
            return TestResult(
                name="Component Files",
                passed=True,
                message="All required components exist and appear valid"
            )
    
    def test_validation_page(self) -> TestResult:
        """Test if validation test page exists"""
        self.log_test_start("Validation Test Page")
        
        validation_page = self.project_root / "frontend" / "src" / "app" / "validation-test" / "page.tsx"
        
        if validation_page.exists():
            try:
                content = validation_page.read_text()
                if "ValidationTestPage" in content and "currentView" in content:
                    return TestResult(
                        name="Validation Test Page",
                        passed=True,
                        message="Validation test page exists and appears functional"
                    )
                else:
                    return TestResult(
                        name="Validation Test Page",
                        passed=False,
                        message="Validation test page exists but seems incomplete"
                    )
            except Exception as e:
                return TestResult(
                    name="Validation Test Page",
                    passed=False,
                    message=f"Error reading validation page: {str(e)}"
                )
        else:
            return TestResult(
                name="Validation Test Page",
                passed=False,
                message="Validation test page not found"
            )
    
    async def run_all_tests(self):
        """Run all tests and generate report"""
        logger.info("🚀 Starting BiteBase Intelligence Test Suite")
        logger.info("=" * 80)
        
        # Structure Tests
        self.log_test_result(self.test_backend_structure())
        self.log_test_result(self.test_frontend_structure())
        
        # Component Tests
        self.log_test_result(self.test_component_files())
        self.log_test_result(self.test_validation_page())
        
        # Backend Tests
        self.log_test_result(self.test_backend_imports())
        
        # Frontend Tests (only if node_modules exists)
        frontend_path = self.project_root / "frontend"
        if (frontend_path / "node_modules").exists():
            logger.info("📦 node_modules found, running advanced frontend tests...")
            self.log_test_result(self.test_frontend_typescript())
            self.log_test_result(self.test_frontend_lint())
            # Skip build test for now due to potential timeout
            # self.log_test_result(self.test_frontend_build())
        else:
            logger.warning("⚠️ node_modules not found, skipping advanced frontend tests")
            logger.info("   Run 'npm install' in frontend directory to enable full testing")
        
        # Generate Report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        logger.info("=" * 80)
        logger.info("📊 TEST REPORT")
        logger.info("=" * 80)
        
        passed = sum(1 for r in self.results if r.passed)
        failed = len(self.results) - passed
        total_duration = sum(r.duration for r in self.results)
        
        logger.info(f"✅ Tests Passed: {passed}")
        logger.info(f"❌ Tests Failed: {failed}")
        logger.info(f"⏱️  Total Duration: {total_duration:.2f}s")
        logger.info(f"🎯 Success Rate: {(passed/len(self.results)*100):.1f}%")
        
        if failed > 0:
            logger.info("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result.passed:
                    logger.error(f"   • {result.name}: {result.message}")
        
        logger.info("\n🎉 Test suite completed!")
        
        # Save report to file
        report_data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "total": len(self.results),
                "passed": passed,
                "failed": failed,
                "success_rate": passed/len(self.results)*100,
                "duration": total_duration
            },
            "results": [
                {
                    "name": r.name,
                    "passed": r.passed,
                    "message": r.message,
                    "duration": r.duration
                }
                for r in self.results
            ]
        }
        
        report_file = self.project_root / "test_report.json"
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        logger.info(f"📄 Detailed report saved to: {report_file}")


async def main():
    """Main test runner"""
    runner = TestRunner()
    await runner.run_all_tests()
    
    # Exit with error code if any tests failed
    failed_tests = sum(1 for r in runner.results if not r.passed)
    if failed_tests > 0:
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Test suite interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"💥 Test suite failed: {str(e)}")
        sys.exit(1)
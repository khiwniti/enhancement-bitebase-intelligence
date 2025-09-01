#!/usr/bin/env python3
"""
Quick Test Script for BiteBase Intelligence
Tests core functionality without requiring full dependency installation
"""

import os
import sys
from pathlib import Path
import json

def test_file_structure():
    """Test that all critical files exist"""
    print("🧪 Testing File Structure...")
    
    project_root = Path(__file__).parent
    critical_files = {
        "Backend": [
            "backend/requirements.txt",
            "backend/app/main.py",
            "backend/app/__init__.py",
            "backend/tests/test_api_endpoints.py",
            "backend/tests/test_services.py"
        ],
        "Frontend": [
            "frontend/package.json",
            "frontend/next.config.ts",
            "frontend/tsconfig.json",
            "frontend/src/app/layout.tsx",
            "frontend/src/app/page.tsx"
        ],
        "Components": [
            "frontend/src/components/analytics/AnalyticsWorkbench.tsx",
            "frontend/src/components/growth/GrowthIntelligenceStudio.tsx",
            "frontend/src/components/onboarding/RoleBasedOnboarding.tsx",
            "frontend/src/components/dashboard/RoleBasedDashboard.tsx",
            "frontend/src/components/ai/AIResearchAgentMVP.tsx"
        ],
        "Tests": [
            "frontend/src/app/validation-test/page.tsx",
            "VALIDATION_REPORT.md"
        ]
    }
    
    results = {}
    total_files = 0
    missing_files = 0
    
    for category, files in critical_files.items():
        category_missing = []
        for file_path in files:
            total_files += 1
            full_path = project_root / file_path
            if not full_path.exists():
                missing_files += 1
                category_missing.append(file_path)
        
        if category_missing:
            results[category] = f"❌ Missing {len(category_missing)} files: {', '.join(category_missing)}"
        else:
            results[category] = f"✅ All {len(files)} files present"
    
    # Print results
    for category, result in results.items():
        print(f"  {category}: {result}")
    
    print(f"\n📊 Summary: {total_files - missing_files}/{total_files} files present")
    return missing_files == 0

def test_component_content():
    """Test that components have basic React structure"""
    print("\n🧪 Testing Component Content...")
    
    project_root = Path(__file__).parent
    components = {
        "AnalyticsWorkbench": "frontend/src/components/analytics/AnalyticsWorkbench.tsx",
        "GrowthIntelligenceStudio": "frontend/src/components/growth/GrowthIntelligenceStudio.tsx", 
        "RoleBasedOnboarding": "frontend/src/components/onboarding/RoleBasedOnboarding.tsx",
        "RoleBasedDashboard": "frontend/src/components/dashboard/RoleBasedDashboard.tsx",
        "AIResearchAgentMVP": "frontend/src/components/ai/AIResearchAgentMVP.tsx"
    }
    
    valid_components = 0
    total_components = len(components)
    
    for name, path in components.items():
        full_path = project_root / path
        if full_path.exists():
            try:
                content = full_path.read_text()
                # Check for React component patterns
                has_import = "import React" in content
                has_export = "export" in content and (name in content or "export default" in content)
                has_jsx = "return" in content and ("<" in content or "jsx" in content.lower())
                
                if has_import and has_export and has_jsx:
                    print(f"  ✅ {name}: Valid React component")
                    valid_components += 1
                else:
                    missing = []
                    if not has_import: missing.append("React import")
                    if not has_export: missing.append("export")
                    if not has_jsx: missing.append("JSX/return")
                    print(f"  ⚠️ {name}: Missing {', '.join(missing)}")
            except Exception as e:
                print(f"  ❌ {name}: Error reading file - {str(e)}")
        else:
            print(f"  ❌ {name}: File not found")
    
    print(f"\n📊 Summary: {valid_components}/{total_components} components valid")
    return valid_components == total_components

def test_package_configurations():
    """Test package.json and configuration files"""
    print("\n🧪 Testing Package Configurations...")
    
    project_root = Path(__file__).parent
    
    # Test frontend package.json
    frontend_package = project_root / "frontend/package.json"
    if frontend_package.exists():
        try:
            with open(frontend_package) as f:
                package_data = json.load(f)
            
            required_scripts = ["dev", "build", "start", "test", "lint"]
            missing_scripts = [s for s in required_scripts if s not in package_data.get("scripts", {})]
            
            required_deps = ["next", "react", "typescript"]
            deps = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
            missing_deps = [d for d in required_deps if d not in deps]
            
            if missing_scripts or missing_deps:
                issues = []
                if missing_scripts: issues.append(f"scripts: {', '.join(missing_scripts)}")
                if missing_deps: issues.append(f"dependencies: {', '.join(missing_deps)}")
                print(f"  ⚠️ Frontend package.json: Missing {'; '.join(issues)}")
            else:
                print(f"  ✅ Frontend package.json: All required scripts and dependencies present")
                
        except Exception as e:
            print(f"  ❌ Frontend package.json: Error reading - {str(e)}")
    else:
        print(f"  ❌ Frontend package.json: Not found")
    
    # Test backend requirements.txt
    backend_requirements = project_root / "backend/requirements.txt"
    if backend_requirements.exists():
        try:
            content = backend_requirements.read_text()
            required_packages = ["fastapi", "uvicorn", "pydantic"]
            missing_packages = [p for p in required_packages if p not in content.lower()]
            
            if missing_packages:
                print(f"  ⚠️ Backend requirements.txt: Missing {', '.join(missing_packages)}")
            else:
                print(f"  ✅ Backend requirements.txt: All required packages present")
                
        except Exception as e:
            print(f"  ❌ Backend requirements.txt: Error reading - {str(e)}")
    else:
        print(f"  ❌ Backend requirements.txt: Not found")

def test_role_based_implementation():
    """Test that role-based features are properly implemented"""
    print("\n🧪 Testing Role-Based Implementation...")
    
    project_root = Path(__file__).parent
    
    # Check RoleBasedDashboard for role configurations
    dashboard_path = project_root / "frontend/src/components/dashboard/RoleBasedDashboard.tsx"
    if dashboard_path.exists():
        try:
            content = dashboard_path.read_text()
            roles = ["owner", "manager", "analyst"]
            role_configs = [role for role in roles if role in content.lower()]
            
            if len(role_configs) >= 3:
                print(f"  ✅ RoleBasedDashboard: Multiple role configurations found ({', '.join(role_configs)})")
            else:
                print(f"  ⚠️ RoleBasedDashboard: Limited role configurations ({', '.join(role_configs)})")
                
        except Exception as e:
            print(f"  ❌ RoleBasedDashboard: Error reading - {str(e)}")
    
    # Check RoleBasedOnboarding for persona selection
    onboarding_path = project_root / "frontend/src/components/onboarding/RoleBasedOnboarding.tsx"
    if onboarding_path.exists():
        try:
            content = onboarding_path.read_text()
            features = ["persona", "role", "step", "preference"]
            found_features = [f for f in features if f in content.lower()]
            
            if len(found_features) >= 3:
                print(f"  ✅ RoleBasedOnboarding: Multi-step role selection implemented")
            else:
                print(f"  ⚠️ RoleBasedOnboarding: Basic implementation ({', '.join(found_features)})")
                
        except Exception as e:
            print(f"  ❌ RoleBasedOnboarding: Error reading - {str(e)}")

def test_consolidation_success():
    """Test that page consolidation was successful"""
    print("\n🧪 Testing Consolidation Success...")
    
    project_root = Path(__file__).parent
    
    # Check for consolidated components
    consolidated_components = [
        "frontend/src/components/analytics/AnalyticsWorkbench.tsx",
        "frontend/src/components/growth/GrowthIntelligenceStudio.tsx"
    ]
    
    consolidation_success = True
    for component_path in consolidated_components:
        full_path = project_root / component_path
        if full_path.exists():
            try:
                content = full_path.read_text()
                # Check for features that indicate consolidation
                features = ["tool", "analytics", "dashboard", "unified", "workbench", "studio"]
                found_features = [f for f in features if f in content.lower()]
                
                if len(found_features) >= 3:
                    print(f"  ✅ {component_path.split('/')[-1]}: Consolidated features detected")
                else:
                    print(f"  ⚠️ {component_path.split('/')[-1]}: Limited consolidation features")
                    consolidation_success = False
                    
            except Exception as e:
                print(f"  ❌ {component_path.split('/')[-1]}: Error reading - {str(e)}")
                consolidation_success = False
        else:
            print(f"  ❌ {component_path.split('/')[-1]}: Component not found")
            consolidation_success = False
    
    return consolidation_success

def generate_quick_report():
    """Generate a quick test report"""
    print("\n" + "="*80)
    print("📊 QUICK TEST REPORT")
    print("="*80)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Component Content", test_component_content), 
        ("Package Configurations", test_package_configurations),
        ("Role-Based Implementation", test_role_based_implementation),
        ("Consolidation Success", test_consolidation_success)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name}: Exception - {str(e)}")
    
    success_rate = (passed / len(tests)) * 100
    print(f"\n🎯 Overall Success Rate: {success_rate:.1f}% ({passed}/{len(tests)} tests passed)")
    
    if success_rate >= 80:
        print("🎉 System appears to be in good condition!")
    elif success_rate >= 60:
        print("⚠️ System has some issues but core functionality intact")
    else:
        print("❌ System has significant issues requiring attention")
    
    return success_rate >= 80

if __name__ == "__main__":
    print("🚀 BiteBase Intelligence - Quick Test Suite")
    print("="*80)
    
    try:
        success = generate_quick_report()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test suite failed: {str(e)}")
        sys.exit(1)
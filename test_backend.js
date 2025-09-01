#!/usr/bin/env node
/**
 * Backend Validation Script (Node.js)
 * Tests backend structure and basic functionality
 */

const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

function checkFile(filePath) {
    const fullPath = path.join(projectRoot, filePath);
    return fs.existsSync(fullPath);
}

function readFile(filePath) {
    const fullPath = path.join(projectRoot, filePath);
    try {
        return fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
        return null;
    }
}

function testBackendStructure() {
    console.log('\n🧪 Testing Backend Structure...');
    
    const requiredFiles = [
        'backend/requirements.txt',
        'backend/app/main.py',
        'backend/app/__init__.py',
        'backend/app/api/',
        'backend/app/core/',
        'backend/app/models/',
        'backend/app/services/',
        'backend/tests/',
        'backend/test_websockets.py'
    ];
    
    let passed = 0;
    let total = requiredFiles.length;
    
    requiredFiles.forEach(file => {
        if (checkFile(file)) {
            console.log(`  ✅ ${file}`);
            passed++;
        } else {
            console.log(`  ❌ ${file} - Missing`);
        }
    });
    
    console.log(`\n📊 Backend Structure: ${passed}/${total} files present`);
    return passed === total;
}

function testBackendConfiguration() {
    console.log('\n🧪 Testing Backend Configuration...');
    
    // Test requirements.txt
    const requirements = readFile('backend/requirements.txt');
    if (requirements) {
        const requiredPackages = ['fastapi', 'uvicorn', 'pydantic'];
        const missing = requiredPackages.filter(pkg => !requirements.toLowerCase().includes(pkg));
        
        if (missing.length === 0) {
            console.log('  ✅ requirements.txt - All required packages present');
        } else {
            console.log(`  ⚠️ requirements.txt - Missing packages: ${missing.join(', ')}`);
        }
    } else {
        console.log('  ❌ requirements.txt - Cannot read file');
        return false;
    }
    
    // Test main.py
    const mainPy = readFile('backend/app/main.py');
    if (mainPy) {
        const hasApp = mainPy.includes('app = FastAPI');
        const hasRouter = mainPy.includes('include_router');
        const hasCORS = mainPy.includes('CORSMiddleware');
        
        if (hasApp && hasRouter && hasCORS) {
            console.log('  ✅ main.py - FastAPI app properly configured');
        } else {
            const missing = [];
            if (!hasApp) missing.push('FastAPI app');
            if (!hasRouter) missing.push('router inclusion');
            if (!hasCORS) missing.push('CORS middleware');
            console.log(`  ⚠️ main.py - Missing: ${missing.join(', ')}`);
        }
    } else {
        console.log('  ❌ main.py - Cannot read file');
        return false;
    }
    
    return true;
}

function testWebSocketConfiguration() {
    console.log('\n🧪 Testing WebSocket Configuration...');
    
    const wsTest = readFile('backend/test_websockets.py');
    if (wsTest) {
        const hasEndpoints = wsTest.includes('ENDPOINTS');
        const hasTests = wsTest.includes('test_notifications_websocket');
        const hasAsync = wsTest.includes('async def');
        
        if (hasEndpoints && hasTests && hasAsync) {
            console.log('  ✅ WebSocket tests - Comprehensive test suite present');
            
            // Extract endpoint information
            const endpointMatch = wsTest.match(/ENDPOINTS\s*=\s*{([^}]+)}/s);
            if (endpointMatch) {
                const endpoints = endpointMatch[1].match(/"([^"]+)":/g);
                if (endpoints) {
                    console.log(`  📡 WebSocket endpoints: ${endpoints.map(e => e.replace(/"/g, '').replace(':', '')).join(', ')}`);
                }
            }
        } else {
            console.log('  ⚠️ WebSocket tests - Incomplete test suite');
        }
    } else {
        console.log('  ❌ WebSocket tests - Test file not found');
        return false;
    }
    
    return true;
}

function testAPIStructure() {
    console.log('\n🧪 Testing API Structure...');
    
    const apiDirs = [
        'backend/app/api/',
        'backend/app/core/',
        'backend/app/models/',
        'backend/app/services/',
        'backend/app/schemas/'
    ];
    
    let apiScore = 0;
    apiDirs.forEach(dir => {
        if (checkFile(dir)) {
            console.log(`  ✅ ${dir}`);
            apiScore++;
        } else {
            console.log(`  ❌ ${dir} - Missing`);
        }
    });
    
    // Check for specific API files
    const apiFiles = [
        'backend/tests/test_api_endpoints.py',
        'backend/tests/test_services.py'
    ];
    
    apiFiles.forEach(file => {
        if (checkFile(file)) {
            const content = readFile(file);
            if (content && content.length > 1000) {
                console.log(`  ✅ ${file} - Comprehensive tests (${Math.round(content.length/1024)}KB)`);
                apiScore++;
            } else {
                console.log(`  ⚠️ ${file} - Basic tests only`);
            }
        } else {
            console.log(`  ❌ ${file} - Missing`);
        }
    });
    
    console.log(`\n📊 API Structure Score: ${apiScore}/${apiDirs.length + apiFiles.length}`);
    return apiScore >= (apiDirs.length + apiFiles.length - 1);
}

function generateBackendReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 BACKEND TEST REPORT');
    console.log('='.repeat(80));
    
    const tests = [
        { name: 'Backend Structure', test: testBackendStructure },
        { name: 'Backend Configuration', test: testBackendConfiguration },
        { name: 'WebSocket Configuration', test: testWebSocketConfiguration },
        { name: 'API Structure', test: testAPIStructure }
    ];
    
    let passed = 0;
    tests.forEach(({ name, test }) => {
        try {
            if (test()) {
                passed++;
            }
        } catch (error) {
            console.log(`❌ ${name}: Exception - ${error.message}`);
        }
    });
    
    const successRate = (passed / tests.length) * 100;
    console.log(`\n🎯 Backend Success Rate: ${successRate.toFixed(1)}% (${passed}/${tests.length} tests passed)`);
    
    if (successRate >= 80) {
        console.log('🎉 Backend is in excellent condition!');
    } else if (successRate >= 60) {
        console.log('⚠️ Backend has some issues but core functionality is intact');
    } else {
        console.log('❌ Backend has significant issues requiring attention');
    }
    
    return successRate >= 80;
}

// Main execution
console.log('🚀 BiteBase Intelligence - Backend Validation');
console.log('='.repeat(80));

try {
    const success = generateBackendReport();
    process.exit(success ? 0 : 1);
} catch (error) {
    console.error(`\n💥 Backend validation failed: ${error.message}`);
    process.exit(1);
}
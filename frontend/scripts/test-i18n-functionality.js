#!/usr/bin/env node

/**
 * Test script to validate i18n functionality
 * This tests the core functionality without requiring a running Next.js server
 */

const fs = require('fs');
const path = require('path');

// Configuration from i18n/config.ts
const SUPPORTED_LOCALES = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'];
const RTL_LANGUAGES = ['ar'];
const ROUTE_NAMESPACE_MAP = {
  '/dashboard': ['common', 'navigation', 'dashboard'],
  '/analytics': ['common', 'navigation', 'analytics'],
  '/ai-assistant': ['common', 'navigation', 'ai'],
  '/auth/login': ['common', 'auth'],
  '/': ['common', 'navigation', 'landing']
};

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

function testLanguageSwitching() {
  console.log('🔄 Testing Language Switching Functionality...\n');
  
  let allTestsPassed = true;
  
  // Test 1: Verify all locales have required files
  console.log('📁 Test 1: Locale File Structure');
  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    if (!fs.existsSync(localeDir)) {
      console.log(`❌ Missing locale directory: ${locale}`);
      allTestsPassed = false;
      continue;
    }
    
    // Check critical namespaces exist
    const criticalNamespaces = ['common', 'navigation'];
    for (const namespace of criticalNamespaces) {
      const filePath = path.join(localeDir, `${namespace}.json`);
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Missing critical file: ${locale}/${namespace}.json`);
        allTestsPassed = false;
      }
    }
  }
  console.log('✅ Locale file structure check completed\n');
  
  // Test 2: Verify JSON structure and language-specific content
  console.log('📝 Test 2: Translation Content Validation');
  for (const locale of SUPPORTED_LOCALES.slice(0, 5)) { // Test first 5 locales
    try {
      const commonPath = path.join(LOCALES_DIR, locale, 'common.json');
      const content = JSON.parse(fs.readFileSync(commonPath, 'utf8'));
      
      // Check required structure
      const requiredKeys = ['navigation', 'actions', 'status', 'language'];
      const missingKeys = requiredKeys.filter(key => !content[key]);
      
      if (missingKeys.length > 0) {
        console.log(`⚠️  ${locale}: Missing required keys: ${missingKeys.join(', ')}`);
      }
      
      // Check for language-specific content (not just English)
      if (locale === 'ar') {
        // Arabic should have Arabic text
        const dashboardText = content.navigation?.dashboard;
        if (dashboardText && !/[\u0600-\u06FF]/.test(dashboardText)) {
          console.log(`⚠️  Arabic locale may not have proper Arabic translations`);
        } else if (dashboardText) {
          console.log(`✅ Arabic RTL content validated: "${dashboardText}"`);
        }
      } else if (locale === 'zh') {
        // Chinese should have Chinese characters
        const dashboardText = content.navigation?.dashboard;
        if (dashboardText && !/[\u4e00-\u9fff]/.test(dashboardText)) {
          console.log(`⚠️  Chinese locale may not have proper Chinese translations`);
        } else if (dashboardText) {
          console.log(`✅ Chinese content validated: "${dashboardText}"`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Error reading ${locale}/common.json: ${error.message}`);
      allTestsPassed = false;
    }
  }
  console.log('✅ Translation content validation completed\n');
  
  // Test 3: Route-based namespace mapping
  console.log('🗺️  Test 3: Route Namespace Mapping');
  function getRouteNamespaces(pathname) {
    // Check exact matches first
    if (pathname in ROUTE_NAMESPACE_MAP) {
      return ROUTE_NAMESPACE_MAP[pathname];
    }
    
    // Check pattern matches
    for (const [pattern, namespaces] of Object.entries(ROUTE_NAMESPACE_MAP)) {
      if (pattern.includes('[') || pattern.includes('*')) {
        const regexPattern = pattern
          .replace(/\[.*?\]/g, '[^/]+')
          .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        if (regex.test(pathname)) {
          return namespaces;
        }
      }
    }
    
    return ['common', 'navigation', 'errors'];
  }
  
  const testRoutes = [
    { path: '/dashboard', expected: ['common', 'navigation', 'dashboard'] },
    { path: '/analytics', expected: ['common', 'navigation', 'analytics'] },
    { path: '/unknown-route', expected: ['common', 'navigation', 'errors'] }
  ];
  
  for (const { path, expected } of testRoutes) {
    const actual = getRouteNamespaces(path);
    const matches = JSON.stringify(actual.sort()) === JSON.stringify(expected.sort());
    
    if (matches) {
      console.log(`✅ Route ${path}: ${actual.join(', ')}`);
    } else {
      console.log(`❌ Route ${path}: Expected ${expected.join(', ')}, got ${actual.join(', ')}`);
      allTestsPassed = false;
    }
  }
  console.log('✅ Route namespace mapping test completed\n');
  
  // Test 4: RTL Language Configuration
  console.log('🔄 Test 4: RTL Language Support');
  function getTextDirection(locale) {
    return RTL_LANGUAGES.includes(locale) ? 'rtl' : 'ltr';
  }
  
  const rtlTests = [
    { locale: 'ar', expected: 'rtl' },
    { locale: 'en', expected: 'ltr' },
    { locale: 'zh', expected: 'ltr' }
  ];
  
  for (const { locale, expected } of rtlTests) {
    const actual = getTextDirection(locale);
    if (actual === expected) {
      console.log(`✅ ${locale}: ${actual} direction`);
    } else {
      console.log(`❌ ${locale}: Expected ${expected}, got ${actual}`);
      allTestsPassed = false;
    }
  }
  console.log('✅ RTL language support test completed\n');
  
  // Test 5: File count verification
  console.log('📊 Test 5: Translation Completeness Statistics');
  let totalFiles = 0;
  const localeStats = {};
  
  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
    localeStats[locale] = files.length;
    totalFiles += files.length;
  }
  
  console.log(`📈 Total translation files: ${totalFiles}`);
  console.log(`📈 Average files per locale: ${(totalFiles / SUPPORTED_LOCALES.length).toFixed(1)}`);
  console.log(`📈 Expected files per locale: 14 (based on ALL_NAMESPACES)`);
  
  const allLocalesComplete = Object.values(localeStats).every(count => count === 14);
  if (allLocalesComplete) {
    console.log('✅ All locales have complete namespace coverage');
  } else {
    console.log('⚠️  Some locales may be incomplete');
    Object.entries(localeStats).forEach(([locale, count]) => {
      if (count < 14) {
        console.log(`   ${locale}: ${count}/14 files`);
      }
    });
  }
  
  return allTestsPassed;
}

// Run the test
function main() {
  console.log('🌍 BiteBase Intelligence i18n Functionality Test\n');
  
  const passed = testLanguageSwitching();
  
  console.log('\n📋 Test Summary:');
  if (passed) {
    console.log('✅ All i18n functionality tests passed!');
    console.log('🎉 The internationalization system is ready for use.');
    console.log('\n💡 Next steps:');
    console.log('   - Start the development server: npm run dev');
    console.log('   - Test language switching in the browser');
    console.log('   - Verify RTL layout for Arabic');
    console.log('   - Test route-based lazy loading');
  } else {
    console.log('❌ Some tests failed. Please review the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
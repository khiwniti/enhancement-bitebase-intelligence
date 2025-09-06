#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration from i18n/config.ts
const SUPPORTED_LOCALES = ['en', 'th', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar'];
const ALL_NAMESPACES = [
  'common', 'navigation', 'auth', 'dashboard', 
  'analytics', 'ai', 'insights', 'location', 
  'reports', 'restaurants', 'errors',
  'landing', 'landing-new', 'landing-old'
];

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

function validateTranslationCompleteness() {
  console.log('🔍 Validating i18n translation completeness...\n');
  
  const results = {};
  
  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    const existingNamespaces = [];
    const missingNamespaces = [];
    
    for (const namespace of ALL_NAMESPACES) {
      const filePath = path.join(localeDir, `${namespace}.json`);
      if (fs.existsSync(filePath)) {
        existingNamespaces.push(namespace);
      } else {
        missingNamespaces.push(namespace);
      }
    }
    
    const completeness = (existingNamespaces.length / ALL_NAMESPACES.length) * 100;
    
    results[locale] = {
      completeness: Math.round(completeness),
      existing: existingNamespaces.length,
      total: ALL_NAMESPACES.length,
      missing: missingNamespaces
    };
    
    // Color coding based on completeness
    const status = completeness >= 95 ? '✅' : completeness >= 75 ? '⚠️' : '❌';
    
    console.log(`${status} ${locale.toUpperCase().padEnd(3)} | ${completeness.toFixed(1).padStart(5)}% | ${existingNamespaces.length}/${ALL_NAMESPACES.length} namespaces`);
    
    if (missingNamespaces.length > 0 && locale !== 'en') {
      console.log(`   Missing: ${missingNamespaces.join(', ')}`);
    }
  }
  
  console.log('\n📊 Translation Summary:');
  const avgCompleteness = Object.values(results).reduce((sum, r) => sum + r.completeness, 0) / SUPPORTED_LOCALES.length;
  console.log(`   Average Completeness: ${avgCompleteness.toFixed(1)}%`);
  
  const highPriorityLocales = ['zh', 'es', 'fr', 'de'];
  const highPriorityAvg = highPriorityLocales.reduce((sum, locale) => sum + results[locale].completeness, 0) / highPriorityLocales.length;
  console.log(`   High Priority (zh,es,fr,de): ${highPriorityAvg.toFixed(1)}%`);
  
  return results;
}

function validateJsonSyntax() {
  console.log('\n🔧 Validating JSON syntax...');
  
  let totalFiles = 0;
  let validFiles = 0;
  const errors = [];
  
  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(LOCALES_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;
    
    const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      totalFiles++;
      const filePath = path.join(localeDir, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        validFiles++;
      } catch (error) {
        errors.push({
          file: `${locale}/${file}`,
          error: error.message
        });
      }
    }
  }
  
  if (errors.length === 0) {
    console.log(`✅ All ${validFiles}/${totalFiles} JSON files are valid`);
  } else {
    console.log(`❌ ${errors.length} files have syntax errors:`);
    errors.forEach(err => {
      console.log(`   ${err.file}: ${err.error}`);
    });
  }
  
  return { totalFiles, validFiles, errors };
}

function generateMissingNamespaceFiles() {
  console.log('\n🚀 Generating missing namespace files...');
  
  let created = 0;
  
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === 'en') continue; // Skip reference language
    
    const localeDir = path.join(LOCALES_DIR, locale);
    
    // Ensure locale directory exists
    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }
    
    for (const namespace of ALL_NAMESPACES) {
      const filePath = path.join(localeDir, `${namespace}.json`);
      
      if (!fs.existsSync(filePath)) {
        // Create placeholder with English fallback structure
        const englishPath = path.join(LOCALES_DIR, 'en', `${namespace}.json`);
        
        if (fs.existsSync(englishPath)) {
          try {
            const englishContent = fs.readFileSync(englishPath, 'utf8');
            const englishData = JSON.parse(englishContent);
            
            // Create placeholder structure with keys but English values
            // This allows the app to work while translations are being completed
            fs.writeFileSync(filePath, JSON.stringify(englishData, null, 2));
            created++;
            console.log(`   Created ${locale}/${namespace}.json`);
          } catch (error) {
            console.warn(`   ⚠️  Could not create ${locale}/${namespace}.json: ${error.message}`);
          }
        } else {
          // Create minimal empty structure
          fs.writeFileSync(filePath, '{}');
          created++;
          console.log(`   Created empty ${locale}/${namespace}.json`);
        }
      }
    }
  }
  
  if (created > 0) {
    console.log(`✅ Created ${created} missing namespace files`);
  } else {
    console.log('✅ No missing files to create');
  }
}

function checkConfiguration() {
  console.log('\n⚙️  Checking i18n configuration...');
  
  const configPath = path.join(__dirname, '../src/i18n/config.ts');
  const middlewarePath = path.join(__dirname, '../src/middleware.ts');
  const requestPath = path.join(__dirname, '../src/i18n/request.ts');
  
  const checks = [
    { file: 'config.ts', path: configPath, required: true },
    { file: 'middleware.ts', path: middlewarePath, required: true },
    { file: 'request.ts', path: requestPath, required: true }
  ];
  
  let allGood = true;
  
  for (const check of checks) {
    if (fs.existsSync(check.path)) {
      console.log(`✅ ${check.file} exists`);
    } else {
      console.log(`❌ ${check.file} missing`);
      if (check.required) allGood = false;
    }
  }
  
  return allGood;
}

// Main execution
function main() {
  console.log('🌍 BiteBase Intelligence i18n Validation Tool\n');
  
  const configOK = checkConfiguration();
  if (!configOK) {
    console.log('\n❌ Configuration issues detected. Please fix them first.');
    process.exit(1);
  }
  
  const completenessResults = validateTranslationCompleteness();
  const syntaxResults = validateJsonSyntax();
  
  // Check if we should create missing files
  const missingCount = Object.values(completenessResults).reduce((sum, r) => sum + r.missing.length, 0);
  
  if (process.argv.includes('--create-missing') && missingCount > 0) {
    generateMissingNamespaceFiles();
  } else if (missingCount > 0) {
    console.log(`\n💡 Run with --create-missing to generate ${missingCount} missing namespace files`);
  }
  
  console.log('\n🎉 Validation complete!');
  
  // Exit with error if critical issues found
  if (syntaxResults.errors.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
}

const CONFIG = {
  templateDir: 'tools/templates/feature-template',
  featuresDir: 'frontend/src/features',
  scriptsDir: 'tools/scripts',
}

class FeatureGenerator {
  constructor() {
    this.projectRoot = process.cwd()
  }

  async validateFeatureName(name) {
    if (!name) {
      log.error('Feature name is required')
      console.log('Usage: yarn create-feature <feature-name>')
      console.log('Example: yarn create-feature user-management')
      process.exit(1)
    }

    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      log.error('Feature name must be in kebab-case (lowercase letters, numbers, hyphens only)')
      console.log('Valid examples: user-management, order-tracking, payment-processing')
      process.exit(1)
    }

    const featurePath = path.join(this.projectRoot, CONFIG.featuresDir, name)
    try {
      await fs.access(featurePath)
      log.error(`Feature '${name}' already exists at ${featurePath}`)
      process.exit(1)
    } catch {
      // Feature doesn't exist, which is good
    }
  }

  async checkPrerequisites() {
    log.info('Checking prerequisites...')

    try {
      await fs.access(path.join(this.projectRoot, 'package.json'))
    } catch {
      log.error('This script must be run from the project root directory')
      process.exit(1)
    }

    try {
      await fs.access(path.join(this.projectRoot, CONFIG.templateDir))
    } catch {
      log.error(`Template directory not found: ${CONFIG.templateDir}`)
      process.exit(1)
    }

    try {
      await fs.access(path.join(this.projectRoot, CONFIG.featuresDir))
    } catch {
      log.error(`Features directory not found: ${CONFIG.featuresDir}`)
      process.exit(1)
    }

    log.success('Prerequisites check passed')
  }

  convertNaming(kebabName) {
    // Convert kebab-case to camelCase
    const camelName = kebabName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    
    // Convert camelCase to PascalCase
    const pascalName = camelName.charAt(0).toUpperCase() + camelName.slice(1)

    log.info('Naming conventions:')
    console.log(`  - Kebab case: ${kebabName}`)
    console.log(`  - Camel case: ${camelName}`)
    console.log(`  - Pascal case: ${pascalName}`)

    return { kebabName, camelName, pascalName }
  }

  async copyTemplate(featureName) {
    log.info('Creating feature directory structure...')

    const templatePath = path.join(this.projectRoot, CONFIG.templateDir)
    const targetPath = path.join(this.projectRoot, CONFIG.featuresDir, featureName)

    await fs.mkdir(targetPath, { recursive: true })

    // Copy template recursively
    await this.copyRecursive(templatePath, targetPath)

    log.success(`Template files copied to ${targetPath}`)
  }

  async copyRecursive(src, dest) {
    const stat = await fs.stat(src)

    if (stat.isDirectory()) {
      await fs.mkdir(dest, { recursive: true })
      const files = await fs.readdir(src)

      for (const file of files) {
        await this.copyRecursive(
          path.join(src, file),
          path.join(dest, file)
        )
      }
    } else {
      await fs.copyFile(src, dest)
    }
  }

  async replacePlaceholders(featureName, names) {
    log.info('Replacing template placeholders...')

    const targetDir = path.join(this.projectRoot, CONFIG.featuresDir, featureName)
    const files = await this.getAllFiles(targetDir)

    for (const file of files) {
      if (file.match(/\.(ts|tsx|md)$/)) {
        let content = await fs.readFile(file, 'utf8')
        
        // Replace placeholders
        content = content
          .replace(/\[FeatureName\]/g, names.pascalName)
          .replace(/\[featureName\]/g, names.camelName)
          .replace(/\[feature-name\]/g, names.kebabName)

        await fs.writeFile(file, content)

        // Rename files with placeholders
        const dirname = path.dirname(file)
        const basename = path.basename(file)
        
        if (basename.includes('[FeatureName]')) {
          const newName = basename.replace(/\[FeatureName\]/g, names.pascalName)
          const newPath = path.join(dirname, newName)
          await fs.rename(file, newPath)
          log.info(`Renamed: ${basename} → ${newName}`)
        } else if (basename.includes('[featureName]')) {
          const newName = basename.replace(/\[featureName\]/g, names.camelName)
          const newPath = path.join(dirname, newName)
          await fs.rename(file, newPath)
          log.info(`Renamed: ${basename} → ${newName}`)
        }
      }
    }

    log.success('Placeholders replaced successfully')
  }

  async getAllFiles(dir) {
    const files = []
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...(await this.getAllFiles(fullPath)))
      } else {
        files.push(fullPath)
      }
    }

    return files
  }

  async updateFeatureExports(featureName) {
    log.info('Updating feature exports...')

    const featuresIndex = path.join(this.projectRoot, CONFIG.featuresDir, 'index.ts')

    try {
      await fs.access(featuresIndex)
    } catch {
      // Create index file if it doesn't exist
      const content = `/**
 * Feature exports
 * 
 * This file exports all features for easy importing
 */

`
      await fs.writeFile(featuresIndex, content)
    }

    // Add export for new feature
    const exportLine = `export * from './${featureName}'\n`
    await fs.appendFile(featuresIndex, exportLine)

    log.success(`Added feature export to ${featuresIndex}`)
  }

  async updatePackageScripts(featureName) {
    log.info('Updating package.json scripts...')

    const packagePath = path.join(this.projectRoot, 'package.json')
    const packageContent = await fs.readFile(packagePath, 'utf8')
    const packageJson = JSON.parse(packageContent)

    // Add feature-specific scripts
    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    packageJson.scripts[`test:${featureName}`] = `jest --testPathPattern=features/${featureName}`
    packageJson.scripts[`test:${featureName}:watch`] = `jest --testPathPattern=features/${featureName} --watch`

    await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2) + '\n')

    log.success('Package.json scripts updated')
  }

  async runPostGenerationChecks(featureName, names) {
    log.info('Running post-generation checks...')

    const targetDir = path.join(this.projectRoot, CONFIG.featuresDir, featureName)

    const expectedFiles = [
      `components/${names.pascalName}Page.tsx`,
      `components/${names.pascalName}Header.tsx`,
      `components/${names.pascalName}Content.tsx`,
      'components/index.ts',
      `hooks/use${names.pascalName}Data.ts`,
      `hooks/use${names.pascalName}State.ts`,
      'hooks/index.ts',
      `services/${names.camelName}Api.ts`,
      `services/${names.camelName}Cache.ts`,
      'services/index.ts',
      `types/${names.camelName}.types.ts`,
      'types/index.ts',
      `utils/${names.camelName}Utils.ts`,
      'utils/index.ts',
      `tests/${names.pascalName}.test.tsx`,
      `tests/${names.camelName}Api.test.ts`,
      'tests/hooks.test.ts',
      'config.ts',
      'index.ts',
      'README.md',
    ]

    const missingFiles = []
    for (const file of expectedFiles) {
      try {
        await fs.access(path.join(targetDir, file))
      } catch {
        missingFiles.push(file)
      }
    }

    if (missingFiles.length === 0) {
      log.success('All expected files created successfully')
    } else {
      log.warning('Some files might be missing:')
      missingFiles.forEach(file => console.log(`  - ${file}`))
    }

    // Check for remaining placeholders
    const files = await this.getAllFiles(targetDir)
    const filesWithPlaceholders = []

    for (const file of files) {
      if (file.match(/\.(ts|tsx|md)$/)) {
        const content = await fs.readFile(file, 'utf8')
        // Check specifically for template placeholders, not array syntax
        if (content.includes('[FeatureName]') || content.includes('[featureName]') || content.includes('[feature-name]')) {
          filesWithPlaceholders.push(path.relative(targetDir, file))
        }
      }
    }

    if (filesWithPlaceholders.length === 0) {
      log.success('No remaining placeholders found')
    } else {
      log.warning('Found files with remaining placeholders:')
      filesWithPlaceholders.forEach(file => console.log(`  - ${file}`))
    }
  }

  printCompletionMessage(featureName, names) {
    console.log()
    log.header('╔══════════════════════════════════════════════════════════════╗')
    log.header('║                   Feature Created Successfully!              ║')
    log.header('╚══════════════════════════════════════════════════════════════╝')
    console.log()
    log.success(`Feature '${featureName}' has been created successfully!`)
    console.log()
    log.info(`Feature location: ${CONFIG.featuresDir}/${featureName}`)
    log.info('Feature components:')
    console.log(`  - ${names.pascalName}Page: Main feature page component`)
    console.log(`  - ${names.pascalName}Header: Feature header with controls`)
    console.log(`  - ${names.pascalName}Content: Main content area`)
    console.log(`  - use${names.pascalName}Data: Data fetching hook`)
    console.log(`  - use${names.pascalName}State: State management hook`)
    console.log(`  - ${names.pascalName}Api: API service layer`)
    console.log()
    log.info('Next steps:')
    console.log(`  1. Customize data types in types/${names.camelName}.types.ts`)
    console.log(`  2. Update API endpoints in services/${names.camelName}Api.ts`)
    console.log('  3. Modify components to match your requirements')
    console.log(`  4. Run tests: yarn test:${featureName}`)
    console.log('  5. Start development: make dev')
    console.log()
    log.info(`Documentation: ${CONFIG.featuresDir}/${featureName}/README.md`)
    console.log()
  }

  async generate(featureName) {
    console.log()
    log.header('╔══════════════════════════════════════════════════════════════╗')
    log.header('║                BiteBase Intelligence                          ║')
    log.header('║                  Feature Generator                           ║')
    log.header('╚══════════════════════════════════════════════════════════════╝')
    console.log()

    // Validate input
    await this.validateFeatureName(featureName)

    // Check prerequisites
    await this.checkPrerequisites()

    // Convert naming conventions
    const names = this.convertNaming(featureName)

    // Create feature
    await this.copyTemplate(featureName)
    await this.replacePlaceholders(featureName, names)
    await this.updateFeatureExports(featureName)
    await this.updatePackageScripts(featureName)

    // Verify creation
    await this.runPostGenerationChecks(featureName, names)

    // Show completion message
    this.printCompletionMessage(featureName, names)
  }
}

// Main execution
async function main() {
  const featureName = process.argv[2]
  const generator = new FeatureGenerator()
  
  try {
    await generator.generate(featureName)
  } catch (error) {
    log.error(`Failed to create feature: ${error.message}`)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = FeatureGenerator
#!/usr/bin/env node
/**
 * Validate Storybook Coverage
 * 
 * Ensures all component files have corresponding story files.
 * Run: npm run storybook:validate
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');

// Files to ignore
const IGNORE_PATTERNS = [
  /\.stories\.tsx$/,       // Story files themselves
  /index\.tsx?$/,          // Index files
  /types\.tsx?$/,          // Type definitions
  /\.d\.ts$/,              // Declaration files
  /^use[A-Z]/,             // Hook files
  /\.test\.tsx?$/,         // Test files
  /\.spec\.tsx?$/,         // Spec files
];

// Directories to ignore
const IGNORE_DIRS = [
  'ui',                    // shadcn/ui primitives
  '__tests__',
  '__mocks__',
];

function shouldIgnore(filename, dirName) {
  if (IGNORE_DIRS.includes(dirName)) return true;
  return IGNORE_PATTERNS.some(pattern => pattern.test(filename));
}

function findComponentsWithoutStories(dir, basePath = '') {
  const missing = [];
  
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return missing;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.join(basePath, item.name);
    
    if (item.isDirectory()) {
      if (!IGNORE_DIRS.includes(item.name)) {
        missing.push(...findComponentsWithoutStories(fullPath, relativePath));
      }
    } else if (item.isFile() && item.name.endsWith('.tsx')) {
      if (!shouldIgnore(item.name, path.basename(dir))) {
        // Check if story file exists
        const storyPath = fullPath.replace(/\.tsx$/, '.stories.tsx');
        
        if (!fs.existsSync(storyPath)) {
          missing.push({
            component: relativePath,
            expectedStory: relativePath.replace(/\.tsx$/, '.stories.tsx'),
          });
        }
      }
    }
  }
  
  return missing;
}

function main() {
  console.log('🔍 Validating Storybook coverage...\n');
  
  const missing = findComponentsWithoutStories(COMPONENTS_DIR);
  
  if (missing.length === 0) {
    console.log('✅ All components have stories!\n');
    console.log('📚 Storybook coverage: 100%');
    process.exit(0);
  }
  
  console.log('❌ Components missing stories:\n');
  
  missing.forEach(({ component, expectedStory }) => {
    console.log(`  📦 ${component}`);
    console.log(`     → Expected: ${expectedStory}\n`);
  });
  
  console.log(`\n📊 Missing: ${missing.length} component(s)\n`);
  console.log('💡 To fix, create story files for each component.');
  console.log('   Use the Storybook template from .cursor/rules/storybook-standards.mdc\n');
  
  process.exit(1);
}

main();

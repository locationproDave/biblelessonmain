#!/usr/bin/env node
/**
 * i18n Validation Script
 * Checks that all translation keys used in code exist in i18n.tsx
 * Run: node scripts/validate-i18n.cjs
 */

const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, '../src/routes');
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const LIB_DIR = path.join(__dirname, '../src/lib');
const I18N_FILE = path.join(__dirname, '../src/i18n.tsx');

// Extract all t('key') calls from source files
function extractUsedKeys(dir) {
  const keys = new Set();
  
  function scanFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    if (filePath.includes('i18n.tsx')) return; // Skip i18n file itself
    
    const content = fs.readFileSync(filePath, 'utf8');
    // Match t('key') or t("key")
    const regex = /\bt\(\s*['"]([a-zA-Z][a-zA-Z0-9_.]+)['"]\s*\)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }
  
  function scanDir(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else {
        scanFile(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return keys;
}

// Extract all defined keys from i18n.tsx
function extractDefinedKeys() {
  const content = fs.readFileSync(I18N_FILE, 'utf8');
  const keys = new Set();
  
  // Match all 'key.subkey': patterns
  const keyRegex = /'([a-zA-Z][a-zA-Z0-9_.]+)':\s*['"]/g;
  let match;
  
  while ((match = keyRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  return keys;
}

// Main validation
function validate() {
  console.log('🔍 Validating i18n keys...\n');
  
  // Get all used keys
  const usedKeys = new Set();
  [ROUTES_DIR, COMPONENTS_DIR, LIB_DIR].forEach(dir => {
    extractUsedKeys(dir).forEach(key => usedKeys.add(key));
  });
  
  // Get all defined keys
  const definedKeys = extractDefinedKeys();
  
  // Find missing keys
  const missingKeys = [];
  usedKeys.forEach(key => {
    if (!definedKeys.has(key)) {
      missingKeys.push(key);
    }
  });
  
  console.log(`📊 Summary:`);
  console.log(`   Keys used in code: ${usedKeys.size}`);
  console.log(`   Keys defined in i18n: ${definedKeys.size}`);
  console.log('');
  
  if (missingKeys.length > 0) {
    console.log(`❌ Missing keys (${missingKeys.length}):\n`);
    missingKeys.sort().forEach(key => console.log(`   '${key}': '',`));
    console.log('\n❌ Validation FAILED - Add these keys to i18n.tsx!');
    process.exit(1);
  } else {
    console.log('✅ All translation keys are defined!');
    process.exit(0);
  }
}

validate();

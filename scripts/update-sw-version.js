#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate version based on current timestamp
const version = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const buildTimestamp = Date.now();

// Path to service worker file
const swPath = path.join(__dirname, '../public/sw.js');

// Read service worker file
let swContent = fs.readFileSync(swPath, 'utf8');

// Update cache version
swContent = swContent.replace(
  /const CACHE_VERSION = '[^']+'/,
  `const CACHE_VERSION = '${version}'`
);

// Update build timestamp
swContent = swContent.replace(
  /const BUILD_TIMESTAMP = [^;]+/,
  `const BUILD_TIMESTAMP = ${buildTimestamp}`
);

// Write updated service worker
fs.writeFileSync(swPath, swContent);

// Also update package.json version if it exists
const packagePath = path.join(__dirname, '../package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  const [major, minor, patch] = currentVersion.split('.');
  const newVersion = `${major}.${minor}.${parseInt(patch) + 1}`;
  
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  
  console.log(`✅ Package version updated: ${currentVersion} → ${newVersion}`);
}

console.log(`✅ Service worker updated with version: ${version}`);
console.log(`✅ Build timestamp: ${buildTimestamp}`);
console.log(`✅ Deployment ready!`);

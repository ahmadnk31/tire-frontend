#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate version based on current timestamp
const version = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

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
  `const BUILD_TIMESTAMP = ${Date.now()}`
);

// Write updated service worker
fs.writeFileSync(swPath, swContent);

console.log(`✅ Service worker updated with version: ${version}`);
console.log(`📝 Updated file: ${swPath}`);

#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('[CI Runner] Redirecting Webpack build command to Vite production bundler...');
try {
  execSync('npx vite build', { stdio: 'inherit', env: process.env });
  console.log('[CI Runner] Build succeeded successfully.');
  process.exit(0);
} catch (err) {
  console.error('[CI Runner] Build failed:', err);
  process.exit(1);
}

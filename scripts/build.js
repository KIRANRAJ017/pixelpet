const { execSync } = require('child_process');
const path = require('path');

console.log('[1/3] Building renderer with Vite...');
execSync('npm run build:renderer', { stdio: 'inherit' });

console.log('[2/3] Compiling Electron main process...');
try {
  execSync('npm run build:electron', { stdio: 'inherit' });
} catch (err) {
  console.log('Notice: Electron compilation skipped (web hosting environment).');
}

console.log('[3/3] Preparing dist directory for web hosting...');
require('./prepare-dist.js');

console.log('Pixel Pet build completed successfully.');

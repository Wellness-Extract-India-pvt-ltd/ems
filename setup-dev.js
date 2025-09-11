#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up Wellness Extract EMS Development Environment...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Node.js 18+ is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Create necessary directories
const dirs = [
  'backend/uploads',
  'backend/logs',
  'frontend/public/assets'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Copy environment files if they don't exist
const envFiles = [
  { src: 'backend/env.example', dest: 'backend/.env' },
  { src: 'frontend/env.example', dest: 'frontend/.env' }
];

envFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src) && !fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log(`📄 Created ${dest} from template`);
  }
});

// Install dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Create package.json scripts
const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
if (!backendPackage.scripts.dev) {
  backendPackage.scripts.dev = 'nodemon index.js';
  backendPackage.scripts.start = 'node index.js';
  fs.writeFileSync('backend/package.json', JSON.stringify(backendPackage, null, 2));
  console.log('📝 Updated backend package.json scripts');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Configure your .env files in backend/ and frontend/');
console.log('2. Start MongoDB and Redis services');
console.log('3. Run "npm run dev" in backend/ to start the server');
console.log('4. Run "npm run dev" in frontend/ to start the client');
console.log('\n🌐 Access points:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend API: http://localhost:5000/api/v1');
console.log('   Health Check: http://localhost:5000/api/v1/health');

#!/usr/bin/env node

const { existsSync } = require('fs');
const { config } = require('dotenv');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting AGInterface server...');

// Load environment variables from .env files
if (existsSync(path.join(process.cwd(), '.env.local'))) {
  console.log('📄 Loading .env.local');
  config({ path: '.env.local' });
} else if (existsSync(path.join(process.cwd(), '.env'))) {
  console.log('📄 Loading .env');
  config({ path: '.env' });
}

// Set up runtime environment variables with fallbacks
const APP_URI = process.env.APP_URI || 'http://localhost:1109';
const AUTH_URI = process.env.AUTH_URI || `${APP_URI}/user`;
const API_URI = process.env.API_URI || 'https://api.ai.zephyrex.dev';

// Extract domain from APP_URI for cookie configuration
const extractDomain = (uri) => {
  const domain = ((uri ?? '').split('://')[1] ?? '').split(':')[0];
  const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  
  // Handle localhost specifically
  if (domain === 'localhost' || domain === '127.0.0.1') {
    return 'localhost';
  }
  
  // Handle IP addresses
  if (ipPattern.test(domain)) {
    return domain;
  }
  
  // Handle regular domains (extract root domain)
  return domain.split('.').reverse().slice(0, 2).reverse().join('.');
};

const COOKIE_DOMAIN = extractDomain(APP_URI);

// Override environment variables to ensure consistency
process.env.APP_URI = APP_URI;
process.env.AUTH_URI = AUTH_URI;
process.env.API_URI = API_URI;
process.env.NEXT_PUBLIC_APP_URI = APP_URI;
process.env.NEXT_PUBLIC_AUTH_URI = AUTH_URI;
process.env.NEXT_PUBLIC_API_URI = API_URI;
process.env.NEXT_PUBLIC_COOKIE_DOMAIN = COOKIE_DOMAIN;

// Set other important environment variables
process.env.NEXT_PUBLIC_APP_NAME = process.env.APP_NAME || 'AGInteractive';
process.env.SERVERSIDE_API_URI = process.env.SERVERSIDE_API_URI || 'http://aginfrastructure';

console.log('🔧 Environment configured:');
console.log(`   APP_URI: ${APP_URI}`);
console.log(`   AUTH_URI: ${AUTH_URI}`);
console.log(`   API_URI: ${API_URI}`);
console.log(`   COOKIE_DOMAIN: ${COOKIE_DOMAIN}`);

// Determine the path to the standalone server
const standaloneServerPath = path.join(process.cwd(), '.next', 'standalone', 'server.js');

if (!existsSync(standaloneServerPath)) {
  console.error('❌ Standalone server not found at:', standaloneServerPath);
  console.error('   Make sure you have built the project with: npm run build');
  process.exit(1);
}

console.log('🎯 Starting standalone server...');

// Start the standalone Next.js server
const serverProcess = spawn('node', [standaloneServerPath], {
  stdio: 'inherit', // Pass through stdin, stdout, stderr
  env: process.env, // Pass all environment variables
  cwd: path.join(process.cwd(), '.next', 'standalone') // Run from standalone directory
});

// Handle server process events
serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code, signal) => {
  if (signal) {
    console.log(`🛑 Server terminated by signal: ${signal}`);
  } else {
    console.log(`🛑 Server exited with code: ${code}`);
  }
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  serverProcess.kill('SIGTERM');
}); 
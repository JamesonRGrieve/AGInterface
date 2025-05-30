// server-wrapper.js
const { existsSync } = require('fs');
const { config } = require('dotenv');
const path = require('path');

// Load environment variables from .env files or environment
if (existsSync(path.join(process.cwd(), '.env.local'))) {
  config({ path: '.env.local' });
} else if (existsSync(path.join(process.cwd(), '.env'))) {
  config({ path: '.env' });
}

// Create a global runtime config object
global.__RUNTIME_CONFIG__ = {
  // Add your runtime variables here
  API_URI: process.env.API_URI,
  APP_URI: process.env.APP_URI,
  AUTH_URI: process.env.AUTH_URI,
  // Add other variables you want to be available at runtime
};

// Now load and run the original Next.js server
require('./server');

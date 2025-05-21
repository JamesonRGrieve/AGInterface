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

// Create global runtime config that Next.js will use
global.__NEXT_RUNTIME_CONFIG__ = {
  serverRuntimeConfig: {
    SERVERSIDE_API_URI: process.env.SERVERSIDE_API_URI,
    API_KEY: process.env.AGINTERACTIVE_API_KEY,
    // Add other server-only variables here
  },
  publicRuntimeConfig: {
    APP_NAME: process.env.APP_NAME || 'AGInteractive',
    APP_URI: process.env.APP_URI || 'http://localhost:1109',
    AUTH_URI: process.env.AUTH_URI || (process.env.APP_URI ? `${process.env.APP_URI}/user` : 'http://localhost:1109/user'),
    API_URI: process.env.API_URI || 'https://api.ai.zephyrex.dev',
    // Add other public variables here
  }
};

// Override process.env with our runtime values to ensure consistency
process.env.APP_URI = global.__NEXT_RUNTIME_CONFIG__.publicRuntimeConfig.APP_URI;
process.env.AUTH_URI = global.__NEXT_RUNTIME_CONFIG__.publicRuntimeConfig.AUTH_URI;
process.env.API_URI = global.__NEXT_RUNTIME_CONFIG__.publicRuntimeConfig.API_URI;

// Now load and run the original Next.js server
require('./server');
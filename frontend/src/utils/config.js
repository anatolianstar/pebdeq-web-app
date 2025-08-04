// Environment-based API configuration
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5005',
    FRONTEND_URL: 'http://localhost:3000',
    IS_PRODUCTION: false
  },
  production: {
    API_BASE_URL: '',  // Empty string for relative URLs in production
    FRONTEND_URL: window.location.origin,
    IS_PRODUCTION: true
  }
};

// Determine environment
const getEnvironment = () => {
  // Check if we're in production (deployed environment)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'production';
  }
  return 'development';
};

const currentEnvironment = getEnvironment();
const currentConfig = config[currentEnvironment];

// API URL helper function
export const createApiUrl = (endpoint) => {
  const baseUrl = currentConfig.API_BASE_URL;
  // Remove leading slash from endpoint to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (baseUrl) {
    return `${baseUrl}/${cleanEndpoint}`;
  } else {
    // Production mode - use relative URLs
    return `/${cleanEndpoint}`;
  }
};

// Export configuration
export const {
  API_BASE_URL,
  FRONTEND_URL,
  IS_PRODUCTION
} = currentConfig;

const configExport = {
  ...currentConfig,
  createApiUrl,
  currentEnvironment
};

export default configExport; 
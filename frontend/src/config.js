// API Configuration for PEBDEQ Frontend
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// API Base URL configuration
export const API_BASE_URL = isDevelopment || isLocalhost 
  ? 'http://localhost:5005'
  : ''; // Use relative URLs in production (proxy through Nginx)

// Full API URL helper
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Image URL helper
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

export default {
  API_BASE_URL,
  getApiUrl,
  getImageUrl
}; 
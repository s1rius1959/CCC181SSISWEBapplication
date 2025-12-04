// API configuration
// This defines the base URL for all API calls to the Flask backend
// Using "/api" as a relative URL works because:
// 1. In production: Flask serves the React build and handles /api routes
// 2. In development: package.json should have a proxy to http://localhost:5000
export const API_URL = "/api";

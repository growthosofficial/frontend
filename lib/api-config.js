// lib/api-config.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://web-production-bab90.up.railway.app' // Replace with your actual backend URL
  : 'http://localhost:8000';

export const API_ENDPOINTS = {
  PROCESS_TEXT: `${API_BASE_URL}/api/process-text`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  STATS: `${API_BASE_URL}/api/stats`,
  HEALTH: `${API_BASE_URL}/health`,
};

// Helper function for API calls with proper error handling
export async function apiCall(endpoint, options = {}) {
  try {
    console.log(`API Call to: ${endpoint}`);
    console.log(`Options:`, options);

    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`API Success:`, data);
    return data;
  } catch (error) {
    console.error(`API Call failed:`, error);
    throw error;
  }
}
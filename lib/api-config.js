// lib/api-config.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || 'https://web-production-bab90.up.railway.app'
  : 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Core processing
  PROCESS_TEXT: `${API_BASE_URL}/api/process-text`,
  
  // Data retrieval
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  ACADEMIC_SUBJECTS: `${API_BASE_URL}/api/academic-subjects`,
  KNOWLEDGE_ALL: `${API_BASE_URL}/api/knowledge`,
  KNOWLEDGE_BY_CATEGORY: `${API_BASE_URL}/api/knowledge/category`,
  SEARCH: `${API_BASE_URL}/api/search`,
  
  // Analytics
  STATS: `${API_BASE_URL}/api/stats`,
  STRENGTH_DISTRIBUTION: `${API_BASE_URL}/api/analytics/strength-distribution`,
  CATEGORY_STRENGTH: `${API_BASE_URL}/api/analytics/category-strength`,
  ITEMS_DUE: `${API_BASE_URL}/api/analytics/items-due`,
  
  // Self-test endpoints
  SELF_TEST_FREE_TEXT_GENERATE: `${API_BASE_URL}/api/self-test/free-text/generate`,
  SELF_TEST_FREE_TEXT_EVALUATE: `${API_BASE_URL}/api/self-test/free-text/evaluate`,
  SELF_TEST_MULTIPLE_CHOICE_GENERATE: `${API_BASE_URL}/api/self-test/multiple-choice/generate`,
  SELF_TEST_MULTIPLE_CHOICE_EVALUATE: `${API_BASE_URL}/api/self-test/multiple-choice/evaluate`,
  SELF_TEST_EVALUATIONS: `${API_BASE_URL}/api/self-test/evaluations`,
  
  // Health
  HEALTH: `${API_BASE_URL}/health`,
  ROOT: `${API_BASE_URL}/`,
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
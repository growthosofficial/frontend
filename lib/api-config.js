// lib/api-config.js - Enhanced with Next.js standards
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
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
  SELF_TEST_TESTS: `${API_BASE_URL}/api/self-test/tests`,
  MAIN_CATEGORY_DISTRIBUTION: `${API_BASE_URL}/api/analytics/main-category-distribution`,
  GOALS: `${API_BASE_URL}/api/goals`,
  AVERAGE_MASTERY: `${API_BASE_URL}/api/analytics/average-mastery`,
  
  ROOT: `${API_BASE_URL}/`,
};

// Enhanced API call function with Next.js standards
export async function apiCall(endpoint, options = {}) {
  try {
    console.log(`🚀 API Call to: ${endpoint}`);
    console.log(`📋 Options:`, options);

    // Enhanced fetch configuration following Next.js standards
    const fetchConfig = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add cache control headers for Next.js
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
      // Next.js specific: Add cache configuration
      cache: options.cache || 'no-store',
      // Next.js specific: Add revalidation
      next: {
        revalidate: options.revalidate || 0,
        tags: options.tags || [],
      },
      ...options,
    };

    // Remove Next.js specific options from the fetch call
    const { cache, next, revalidate, tags, ...cleanOptions } = fetchConfig;
    
    const response = await fetch(endpoint, {
      ...cleanOptions,
      // Re-add Next.js specific options if in Next.js environment
      ...(typeof window === 'undefined' && { cache, next }),
    });

    console.log(`📊 Response status: ${response.status}`);
    console.log(`✅ Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      
      // Enhanced error handling with specific error types
      const error = new Error(`API call failed: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      error.details = errorText;
      
      throw error;
    }

    const data = await response.json();
    console.log(`🎉 API Success:`, data);
    return data;
  } catch (error) {
    console.error(`💥 API Call failed:`, error);
    
    // Enhanced error handling for different error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server');
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: The request took too long to complete');
    }
    
    throw error;
  }
}

// Helper function for client-side API calls with loading states
export async function apiCallWithLoading(endpoint, options = {}, setLoading = null) {
  if (setLoading) setLoading(true);
  
  try {
    const result = await apiCall(endpoint, options);
    return result;
  } catch (error) {
    console.error('API call with loading failed:', error);
    throw error;
  } finally {
    if (setLoading) setLoading(false);
  }
}

// Helper function for paginated API calls
export async function paginatedApiCall(baseEndpoint, page = 1, limit = 10, additionalParams = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...additionalParams,
  });
  
  return await apiCall(`${baseEndpoint}?${params}`);
}
// lib/api.js - Fixed version
import { API_ENDPOINTS, apiCall } from './api-config';

export async function processText(text, similarityThreshold = 0.8) {
  console.log('Starting processText...');
  console.log('Text length:', text.length);
  console.log('Text preview:', text.substring(0, 100) + '...');
  console.log('Similarity threshold:', similarityThreshold);
  console.log('API endpoint:', API_ENDPOINTS.PROCESS_TEXT);

  try {
    const requestBody = {
      text: text,
      threshold: similarityThreshold,
    };

    console.log('Request body:', requestBody);

    const response = await apiCall(API_ENDPOINTS.PROCESS_TEXT, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('Processing response received:', response);

    // Validate response structure
    if (!response.recommendations) {
      console.warn('No recommendations in response');
    }

    // ✅ FIX: Correct field mapping to match backend response
    const result = {
      recommendations: response.recommendations || [],
      similar_main_category: response.similar_main_category,     // ✅ CORRECT
      similar_sub_category: response.similar_sub_category,       // ✅ CORRECT  
      similarity_score: response.similarity_score,
      status: response.status || 'success',
    };

    // 🐛 Debug logging to verify the mapping
    console.log('🔍 Field mapping verification:');
    console.log('Backend similar_main_category:', response.similar_main_category);
    console.log('Backend similar_sub_category:', response.similar_sub_category);
    console.log('Backend similarity_score:', response.similarity_score);
    console.log('Mapped result:', result);

    return result;
  } catch (error) {
    console.error('processText error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });

    // Provide a user-friendly error message
    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'Network error: Unable to connect to the backend service. Please check your internet connection.'
      );
    } else if (error.message.includes('CORS')) {
      throw new Error('CORS error: Backend is not allowing requests from this domain.');
    } else {
      throw new Error(`API Error: ${error.message}`);
    }
  }
}
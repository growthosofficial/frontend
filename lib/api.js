// lib/api.js - Fixed version
import { API_ENDPOINTS, apiCall } from './api-config';

export async function processText(text, similarityThreshold = 0.8, goal = null) {
  console.log('Starting enhanced processText...');
  console.log('Text length:', text.length);
  console.log('Goal provided:', !!goal);
  console.log('Similarity threshold:', similarityThreshold);

  try {
    const requestBody = {
      text: text,
      threshold: similarityThreshold,
      goal: goal // Add goal parameter
    };

    console.log('Request body:', requestBody);

    const response = await apiCall(API_ENDPOINTS.PROCESS_TEXT, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('Enhanced processing response:', response);

    // Map response to include new fields with correct structure
    const result = {
      recommendations: response.recommendations || [],
      similar_main_category: response.similar_main_category,
      similar_sub_category: response.similar_sub_category,
      similarity_score: response.similarity_score,
      goal_provided: response.goal_provided || false,
      goal_relevance_score: response.goal_relevance_score || null,
      goal_relevance_explanation: response.goal_relevance_explanation || null,
      status: response.status || 'success',
    };

    console.log('🎯 Goal-aware result:', result);
    return result;
  } catch (error) {
    console.error('Enhanced processText error:', error);
    throw error;
  }
}
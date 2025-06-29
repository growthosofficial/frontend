// lib/api.js - Comprehensive API service with corrected schemas
import { API_ENDPOINTS, apiCall } from './api-config';

// Core text processing
export async function processText(text, similarityThreshold = 0.8, goal = null) {
  console.log('Starting enhanced processText...');
  console.log('Text length:', text.length);
  console.log('Goal provided:', !!goal);
  console.log('Similarity threshold:', similarityThreshold);

  try {
    const requestBody = {
      text: text,
      threshold: similarityThreshold,
      goal: goal
    };

    console.log('Request body:', requestBody);

    const response = await apiCall(API_ENDPOINTS.PROCESS_TEXT, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    console.log('Enhanced processing response:', response);

    const result = {
      recommendations: response.recommendations || [],
      similar_main_category: response.similar_main_category,
      similar_sub_category: response.similar_sub_category,
      similarity_score: response.similarity_score,
      goal_provided: response.goal_provided || false,
      goal_summary: response.goal_summary || null,
      status: response.status || 'success',
    };

    console.log('🎯 Goal-aware result:', result);
    return result;
  } catch (error) {
    console.error('Enhanced processText error:', error);
    throw error;
  }
}

// Data retrieval functions
export async function getCategories() {
  return await apiCall(API_ENDPOINTS.CATEGORIES);
}

export async function getAcademicSubjects() {
  return await apiCall(API_ENDPOINTS.ACADEMIC_SUBJECTS);
}

export async function getAllKnowledge() {
  return await apiCall(API_ENDPOINTS.KNOWLEDGE_ALL);
}

export async function getKnowledgeByCategory(mainCategory) {
  return await apiCall(`${API_ENDPOINTS.KNOWLEDGE_BY_CATEGORY}/${encodeURIComponent(mainCategory)}`);
}

export async function searchKnowledge(query, limit = 50) {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString()
  });
  return await apiCall(`${API_ENDPOINTS.SEARCH}?${params}`);
}

// Analytics functions
export async function getStats() {
  return await apiCall(API_ENDPOINTS.STATS);
}

export async function getStrengthDistribution() {
  return await apiCall(API_ENDPOINTS.STRENGTH_DISTRIBUTION);
}

export async function getCategoryStrength() {
  return await apiCall(API_ENDPOINTS.CATEGORY_STRENGTH);
}

export async function getItemsDue(limit = 50) {
  const params = new URLSearchParams({
    limit: limit.toString()
  });
  return await apiCall(`${API_ENDPOINTS.ITEMS_DUE}?${params}`);
}

// Self-test functions - FIXED HTTP METHODS
export async function generateFreeTextQuestions(numQuestions = 3, mainCategory = null) {
  const params = new URLSearchParams({
    num_questions: numQuestions.toString()
  });
  
  if (mainCategory) {
    params.append('main_category', mainCategory);
  }
  
  // FIXED: Use POST method with query parameters
  return await apiCall(`${API_ENDPOINTS.SELF_TEST_FREE_TEXT_GENERATE}?${params}`, {
    method: 'POST'
  });
}

export async function evaluateFreeTextAnswers(answers) {
  // Schema: BatchAnswerRequest { answers: AnswerRequest[] }
  // AnswerRequest: { knowledge_id: number, question_text: string, answer: string }
  return await apiCall(API_ENDPOINTS.SELF_TEST_FREE_TEXT_EVALUATE, {
    method: 'POST',
    body: JSON.stringify({ answers })
  });
}

export async function generateMultipleChoiceQuestions(numQuestions = 3, mainCategory = null) {
  const params = new URLSearchParams({
    num_questions: numQuestions.toString()
  });
  
  if (mainCategory) {
    params.append('main_category', mainCategory);
  }
  
  // FIXED: Use POST method with query parameters
  return await apiCall(`${API_ENDPOINTS.SELF_TEST_MULTIPLE_CHOICE_GENERATE}?${params}`, {
    method: 'POST'
  });
}

export async function evaluateMultipleChoiceAnswers(answers) {
  // Schema: MultipleChoiceBatchAnswerRequest { answers: MultipleChoiceAnswerRequest[] }
  // MultipleChoiceAnswerRequest: { question_id: number, selected_answer_index: number }
  return await apiCall(API_ENDPOINTS.SELF_TEST_MULTIPLE_CHOICE_EVALUATE, {
    method: 'POST',
    body: JSON.stringify({ answers })
  });
}

export async function getEvaluationsByKnowledgeId(knowledgeId, limit = 50) {
  const params = new URLSearchParams({
    limit: limit.toString()
  });
  return await apiCall(`${API_ENDPOINTS.SELF_TEST_EVALUATIONS}/${knowledgeId}?${params}`);
}

// Health check
export async function healthCheck() {
  return await apiCall(API_ENDPOINTS.HEALTH);
}

// Helper function to check if backend is available
export async function checkBackendStatus() {
  try {
    const health = await healthCheck();
    return {
      status: 'connected',
      data: health
    };
  } catch (error) {
    console.error('Backend connection failed:', error);
    return {
      status: 'disconnected',
      error: error.message
    };
  }
}
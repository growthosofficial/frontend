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


    // Map response to include new fields with correct structure
    const result = {
      recommendations: response.recommendations || [],
      similar_main_category: response.similar_main_category,
      similar_sub_category: response.similar_sub_category,
      similarity_score: response.similarity_score,
      goal_provided: response.goal_provided || false,
      goal_relevance_score: response.goal_relevance_score != null ? response.goal_relevance_score : null,
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

export async function evaluateFreeTextAnswers(answers, test_id) {
  // Schema: BatchAnswerRequest { answers: AnswerRequest[], test_id: string }
  // AnswerRequest: { knowledge_id: number, question_text: string, answer: string }
  return await apiCall(API_ENDPOINTS.SELF_TEST_FREE_TEXT_EVALUATE, {
    method: 'POST',
    body: JSON.stringify({ answers, test_id })
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

export async function evaluateMultipleChoiceAnswers(answers, test_id) {
  // Schema: MultipleChoiceBatchAnswerRequest { answers: MultipleChoiceAnswerRequest[], test_id: string }
  // MultipleChoiceAnswerRequest: { question_id: number, selected_answer_index: number }
  return await apiCall(API_ENDPOINTS.SELF_TEST_MULTIPLE_CHOICE_EVALUATE, {
    method: 'POST',
    body: JSON.stringify({ answers, test_id })
  });
}

export async function getEvaluationsByKnowledgeId(knowledgeId, limit = 50) {
  const params = new URLSearchParams({
    limit: limit.toString()
  });
  return await apiCall(`${API_ENDPOINTS.SELF_TEST_EVALUATIONS}/${knowledgeId}?${params}`);
}

export async function getTests(query) {
  const queryString = query ? `?${query}` : '';
  return await apiCall(`${API_ENDPOINTS.SELF_TEST_TESTS}${queryString}`);
}

export async function getMainCategoryDistribution() {
  return await apiCall(API_ENDPOINTS.MAIN_CATEGORY_DISTRIBUTION);
}

export async function getGoals() {
  return await apiCall(API_ENDPOINTS.GOALS);
}

// Health check
export async function healthCheck() {
  return await apiCall(API_ENDPOINTS.HEALTH);
}

export function getDateRangeForTimeRange(selectedTimeRange) {
  const now = new Date();
  let startDate;
  if (selectedTimeRange === 'Past Week') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (selectedTimeRange === 'Past Month') {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
  } else if (selectedTimeRange === 'Past Year') {
    startDate = new Date(now);
    startDate.setFullYear(now.getFullYear() - 1);
  } else {
    startDate = null;
  }
  return {
    start: startDate ? startDate.toISOString() : undefined,
    end: now.toISOString(),
  };
}

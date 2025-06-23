const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(
        errorData.detail || errorData.error || `HTTP ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    console.error('API request failed:', error);
    throw new ApiError('Failed to connect to the knowledge processing service');
  }
}

// Process text and get AI recommendations
export async function processText(text, similarityThreshold = 0.8) {
  const response = await apiRequest('/api/process-text', {
    method: 'POST',
    body: JSON.stringify({
      text,
      threshold: similarityThreshold,
    }),
  });

  return response;
}

// Get all knowledge categories - use your backend endpoint
export async function getCategories() {
  const response = await apiRequest('/api/categories');
  return response;
}

// Get database statistics - use your backend endpoint
export async function getDatabaseStats() {
  const response = await apiRequest('/api/stats');
  return response;
}

// Health check
export async function healthCheck() {
  return apiRequest('/health');
}

// Supabase integration for direct database access
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate embedding using Next.js API route
async function generateEmbedding(text) {
  try {
    const response = await fetch('/api/generate-embedding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

// UPDATED API functions for knowledge items with new schema
export const knowledgeAPI = {
  // Get all knowledge items with new schema support
  async getAll() {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('id, main_category, sub_category, category, content, tags, source, strength_score, created_at, last_updated')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge items:', error);
      throw error;
    }

    // Process data to handle both old and new schema
    const processedData = data?.map(item => ({
      ...item,
      // Ensure we have main_category and sub_category
      main_category: item.main_category || 'General Studies',
      sub_category: item.sub_category || item.category || 'unknown',
      // Handle tags properly
      tags: Array.isArray(item.tags)
        ? item.tags
        : typeof item.tags === 'string' && item.tags.trim() !== ''
          ? (() => {
              try {
                return JSON.parse(item.tags);
              } catch (e) {
                return [item.tags];
              }
            })()
          : [],
      // Ensure other fields have defaults
      source: item.source || 'text',
      strength_score: item.strength_score || null,
    })) || [];

    console.log(`📚 Loaded ${processedData.length} knowledge items`);
    return processedData;
  },

  // Create new knowledge item with new schema
  async create(knowledgeItem) {
    console.log('📝 Creating knowledge item with new schema:', knowledgeItem);

    // Validate required fields
    if (!knowledgeItem.main_category) {
      throw new Error('main_category is required');
    }
    if (!knowledgeItem.sub_category) {
      throw new Error('sub_category is required');
    }
    if (!knowledgeItem.content || !knowledgeItem.content.trim()) {
      throw new Error('content is required');
    }

    // Ensure tags is a proper array
    let tags = knowledgeItem.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = [tags];
      }
    }
    if (!Array.isArray(tags)) {
      tags = [];
    }

    // Generate embedding for the content
    console.log('🧠 Generating embedding for content...');
    let embedding = [];

    try {
      embedding = await generateEmbedding(knowledgeItem.content);
      console.log('✅ Embedding generated successfully, dimension:', embedding.length);
    } catch (error) {
      console.error('⚠️ Embedding generation failed:', error);
      console.log('📝 Proceeding without embedding...');
      // Continue without embedding rather than failing completely
    }

    // Check if sub_category already exists (NEW SCHEMA APPROACH)
    console.log('🔍 Checking if sub-category exists:', knowledgeItem.sub_category);
    const { data: existingItems, error: checkError } = await supabase
      .from('knowledge_items')
      .select('id, main_category, sub_category, content, tags')
      .eq('sub_category', knowledgeItem.sub_category)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing sub-category:', checkError);
      throw checkError;
    }

    const itemToInsert = {
      main_category: knowledgeItem.main_category,
      sub_category: knowledgeItem.sub_category,
      content: knowledgeItem.content,
      tags: tags,
      embedding: embedding,
      source: knowledgeItem.source || 'text',
      strength_score: knowledgeItem.strength_score || null,
    };

    if (existingItems && existingItems.length > 0) {
      // UPDATE existing sub-category
      const existingItem = existingItems[0];
      console.log('📝 Updating existing sub-category:', existingItem.id);

      const { data, error } = await supabase
        .from('knowledge_items')
        .update({
          ...itemToInsert,
          last_updated: new Date().toISOString(),
        })
        .eq('id', existingItem.id)
        .select('id, main_category, sub_category, content, tags, source, strength_score, created_at, last_updated');

      if (error) {
        console.error('Error updating knowledge item:', error);
        throw error;
      }

      console.log('✅ Successfully updated existing sub-category');
      const updatedItem = data[0];
      return {
        ...updatedItem,
        tags: Array.isArray(updatedItem.tags) ? updatedItem.tags : [],
      };
    } else {
      // CREATE new sub-category
      console.log('📄 Creating new sub-category');

      const { data, error } = await supabase
        .from('knowledge_items')
        .insert([itemToInsert])
        .select('id, main_category, sub_category, content, tags, source, strength_score, created_at, last_updated');

      if (error) {
        console.error('Error creating knowledge item:', error);
        throw error;
      }

      console.log('✅ Successfully created new sub-category');
      const createdItem = data[0];
      return {
        ...createdItem,
        tags: Array.isArray(createdItem.tags) ? createdItem.tags : [],
      };
    }
  },

  // Update knowledge item with new schema
  async update(id, updates) {
    console.log('📝 Updating knowledge item:', id, updates);

    // Handle tags properly
    let tags = updates.tags || [];
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = [tags];
      }
    }
    if (!Array.isArray(tags)) {
      tags = [];
    }

    // Generate new embedding if content is being updated
    let embedding = updates.embedding;
    if (updates.content && !embedding) {
      try {
        console.log('🧠 Generating new embedding for updated content...');
        embedding = await generateEmbedding(updates.content);
        console.log('✅ New embedding generated successfully');
      } catch (error) {
        console.error('⚠️ Embedding generation failed:', error);
        // Continue without updating embedding
      }
    }

    const updatesToApply = {
      ...updates,
      tags: tags,
      last_updated: new Date().toISOString(),
    };

    // Add embedding if generated
    if (embedding) {
      updatesToApply.embedding = embedding;
    }

    const { data, error } = await supabase
      .from('knowledge_items')
      .update(updatesToApply)
      .eq('id', id)
      .select('id, main_category, sub_category, content, tags, source, strength_score, created_at, last_updated');

    if (error) {
      console.error('Error updating knowledge item:', error);
      throw error;
    }

    const updatedItem = data[0];
    return {
      ...updatedItem,
      tags: Array.isArray(updatedItem.tags) ? updatedItem.tags : [],
    };
  },

  // Delete knowledge item
  async delete(id) {
    console.log('🗑️ Deleting knowledge item:', id);
    
    const { error } = await supabase
      .from('knowledge_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting knowledge item:', error);
      throw error;
    }

    console.log('✅ Knowledge item deleted successfully');
    return true;
  },

  // Get knowledge items by main category
  async getByMainCategory(mainCategory) {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('id, main_category, sub_category, content, tags, source, strength_score, created_at, last_updated')
      .eq('main_category', mainCategory)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge items by main category:', error);
      throw error;
    }

    return data?.map(item => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [],
    })) || [];
  },

  // Get knowledge items by sub category
  async getBySubCategory(subCategory) {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('id, main_category, sub_category, content, tags, source, strength_score, created_at, last_updated')
      .eq('sub_category', subCategory)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge items by sub category:', error);
      throw error;
    }

    return data?.map(item => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [],
    })) || [];
  },

  // Search knowledge items
  async search(searchTerm, limit = 20) {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('id, main_category, sub_category, content, tags, source, strength_score, created_at, last_updated')
      .or(`content.ilike.%${searchTerm}%,main_category.ilike.%${searchTerm}%,sub_category.ilike.%${searchTerm}%`)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching knowledge items:', error);
      throw error;
    }

    return data?.map(item => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [],
    })) || [];
  },

  // Get knowledge statistics with new schema
  async getStats() {
    try {
      const data = await this.getAll();
      
      const mainCategories = new Set();
      const subCategories = new Set();
      const tags = new Set();
      const sources = new Set();
      
      let totalStrengthScore = 0;
      let itemsWithScore = 0;
      let strongItems = 0;
      let weakItems = 0;

      data.forEach(item => {
        // Categories
        mainCategories.add(item.main_category);
        subCategories.add(item.sub_category);
        
        // Tags
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach(tag => tags.add(tag));
        }
        
        // Sources
        sources.add(item.source);
        
        // Strength scores
        if (item.strength_score !== null && item.strength_score !== undefined) {
          totalStrengthScore += item.strength_score;
          itemsWithScore++;
          
          if (item.strength_score >= 0.8) strongItems++;
          if (item.strength_score < 0.5) weakItems++;
        }
      });

      return {
        total_items: data.length,
        unique_main_categories: mainCategories.size,
        unique_sub_categories: subCategories.size,
        unique_tags: tags.size,
        unique_sources: sources.size,
        avg_strength_score: itemsWithScore > 0 ? totalStrengthScore / itemsWithScore : 0,
        items_with_strength_score: itemsWithScore,
        strong_items: strongItems,
        weak_items: weakItems,
        main_categories: Array.from(mainCategories),
        sub_categories: Array.from(subCategories),
        tags: Array.from(tags),
        sources: Array.from(sources),
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  },

  // Get categories grouped by main category
  async getCategoriesGrouped() {
    try {
      const data = await this.getAll();
      const grouped = {};

      data.forEach(item => {
        const mainCat = item.main_category;
        const subCat = item.sub_category;

        if (!grouped[mainCat]) {
          grouped[mainCat] = {
            main_category: mainCat,
            sub_categories: new Set(),
            total_items: 0,
            items: [],
          };
        }

        grouped[mainCat].sub_categories.add(subCat);
        grouped[mainCat].total_items++;
        grouped[mainCat].items.push(item);
      });

      // Convert sets to arrays
      Object.values(grouped).forEach(category => {
        category.sub_categories = Array.from(category.sub_categories);
      });

      return grouped;
    } catch (error) {
      console.error('Error getting grouped categories:', error);
      throw error;
    }
  },

  // Batch operations for efficiency
  async batchCreate(knowledgeItems) {
    console.log(`📦 Batch creating ${knowledgeItems.length} knowledge items`);
    
    const results = [];
    const errors = [];

    for (const item of knowledgeItems) {
      try {
        const result = await this.create(item);
        results.push(result);
      } catch (error) {
        console.error('Error in batch create:', error);
        errors.push({ item, error: error.message });
      }
    }

    console.log(`✅ Batch create completed: ${results.length} successful, ${errors.length} failed`);
    
    return {
      successful: results,
      failed: errors,
      total: knowledgeItems.length,
      success_count: results.length,
      error_count: errors.length,
    };
  },

  // Migration helper for old schema to new schema
  async migrateToNewSchema() {
    console.log('🔄 Starting migration to new schema...');
    
    try {
      // Get all items that might need migration (items without main_category)
      const { data: itemsToMigrate, error } = await supabase
        .from('knowledge_items')
        .select('id, category, content, tags')
        .is('main_category', null);

      if (error) {
        throw error;
      }

      console.log(`📋 Found ${itemsToMigrate.length} items to migrate`);

      if (itemsToMigrate.length === 0) {
        console.log('✅ No items need migration');
        return { migrated: 0, errors: [] };
      }

      const migrationResults = [];
      const migrationErrors = [];

      for (const item of itemsToMigrate) {
        try {
          // Simple mapping: use 'General Studies' as main category and old category as sub-category
          const mainCategory = 'General Studies';
          const subCategory = item.category || 'unknown';

          const { error: updateError } = await supabase
            .from('knowledge_items')
            .update({
              main_category: mainCategory,
              sub_category: subCategory,
              last_updated: new Date().toISOString(),
            })
            .eq('id', item.id);

          if (updateError) {
            throw updateError;
          }

          migrationResults.push(item.id);
          console.log(`✅ Migrated item ${item.id}: ${mainCategory} → ${subCategory}`);
        } catch (error) {
          console.error(`❌ Failed to migrate item ${item.id}:`, error);
          migrationErrors.push({ id: item.id, error: error.message });
        }
      }

      console.log(`🎉 Migration completed: ${migrationResults.length} successful, ${migrationErrors.length} failed`);
      
      return {
        migrated: migrationResults.length,
        failed: migrationErrors.length,
        errors: migrationErrors,
      };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },
};
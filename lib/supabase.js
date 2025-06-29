import { createClient } from '@supabase/supabase-js'

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
  })
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Generate embedding using Next.js API route
async function generateEmbedding(text) {
  try {
    const response = await fetch('/api/generate-embedding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error(`Failed to generate embedding: ${error.message}`)
  }
}

// UPDATED API functions for knowledge items with proper error handling
export const knowledgeAPI = {
  // Get all knowledge items with proper error handling
  async getAll() {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      console.log('📚 Fetching knowledge items from Supabase...')

      const { data, error } = await supabase
        .from('knowledge_items')
        .select('id, main_category, sub_category, content, tags, last_updated, mastery, mastery_explanation')
        .order('last_updated', { ascending: false })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw new Error(`Failed to fetch knowledge items: ${error.message}`)
      }

      if (!data) {
        console.log('⚠️ No data returned from Supabase')
        return []
      }

      console.log(`📊 Raw data from Supabase: ${data.length} items`)

      // Process data to handle both old and new schema
      const processedData = data.map((item) => {
        let processedTags = []

        // Handle tags properly - they might be stored as JSON string or array
        if (item.tags) {
          if (Array.isArray(item.tags)) {
            processedTags = item.tags
          } else if (typeof item.tags === 'string' && item.tags.trim() !== '') {
            try {
              // Try to parse as JSON first
              processedTags = JSON.parse(item.tags)
              if (!Array.isArray(processedTags)) {
                processedTags = [item.tags]
              }
            } catch (e) {
              // If JSON parse fails, treat as single tag
              processedTags = [item.tags]
            }
          }
        }

        return {
          ...item,
          // Ensure we have main_category and sub_category
          main_category: item.main_category || 'General Studies',
          sub_category: item.sub_category || 'Unknown',
          // Handle tags properly
          tags: processedTags,
        }
      })

      console.log(
        `✅ Processed ${processedData.length} knowledge items successfully`,
      )
      return processedData
    } catch (error) {
      console.error('❌ Error in knowledgeAPI.getAll():', error)
      throw error
    }
  },

  // Create new knowledge item with improved error handling
  async create(knowledgeItem) {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    console.log('📝 Creating/updating knowledge item:', knowledgeItem)

    // Validate required fields
    if (!knowledgeItem.main_category) {
      throw new Error('main_category is required')
    }
    if (!knowledgeItem.sub_category) {
      throw new Error('sub_category is required')
    }
    if (!knowledgeItem.content || !knowledgeItem.content.trim()) {
      throw new Error('content is required')
    }

    // Ensure tags is a proper array
    let tags = knowledgeItem.tags || []
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags)
      } catch (e) {
        tags = [tags]
      }
    }
    if (!Array.isArray(tags)) {
      tags = []
    }

    // STEP 1: Check if sub_category already exists
    console.log(
      '🔍 Checking if sub_category already exists:',
      knowledgeItem.sub_category,
    )

    const { data: existingItems, error: checkError } = await supabase
      .from('knowledge_items')
      .select('id, main_category, sub_category, content, tags')
      .eq('sub_category', knowledgeItem.sub_category)
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking existing items:', checkError)
      throw new Error(`Failed to check existing items: ${checkError.message}`)
    }

    const existingItem =
      existingItems && existingItems.length > 0 ? existingItems[0] : null

    if (existingItem) {
      console.log('📝 Found existing item, will UPDATE instead of CREATE')
      console.log('🔄 Existing item ID:', existingItem.id)
      return await this.updateExisting(existingItem.id, knowledgeItem, tags)
    } else {
      console.log('✨ No existing item found, will CREATE new item')
      return await this.createNew(knowledgeItem, tags)
    }
  },

  // Helper method: Create brand new knowledge item
  async createNew(knowledgeItem, tags) {
    console.log('🆕 Creating new knowledge item...')

    // Generate embedding for the content
    let embedding = []
    try {
      console.log('🧠 Generating embedding for new content...')
      embedding = await generateEmbedding(knowledgeItem.content)
      console.log(
        '✅ Embedding generated successfully, dimension:',
        embedding.length,
      )
    } catch (error) {
      console.error('⚠️ Embedding generation failed:', error)
    }

    const itemToInsert = {
      main_category: knowledgeItem.main_category,
      sub_category: knowledgeItem.sub_category,
      content: knowledgeItem.content,
      tags: tags,
      embedding: embedding,
      source: knowledgeItem.source || 'text',
      strength_score: knowledgeItem.strength_score || null,
    }

    const { data, error } = await supabase
      .from('knowledge_items')
      .insert([itemToInsert])
      .select('id, main_category, sub_category, content, tags, last_updated')

    if (error) {
      console.error('❌ Error creating new knowledge item:', error)
      throw new Error(`Failed to create knowledge item: ${error.message}`)
    }

    console.log('✅ Successfully created NEW knowledge item')
    const createdItem = data[0]
    return {
      ...createdItem,
      tags: Array.isArray(createdItem.tags) ? createdItem.tags : [],
      operation: 'created', // Indicate what operation was performed
    }
  },

  // Helper method: Update existing knowledge item
  async updateExisting(existingId, knowledgeItem, tags) {
    console.log('🔄 Updating existing knowledge item ID:', existingId)

    // Get the existing content first
    const { data: existingData, error: fetchError } = await supabase
      .from('knowledge_items')
      .select('content')
      .eq('id', existingId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching existing content:', fetchError)
      throw new Error(`Failed to fetch existing content: ${fetchError.message}`)
    }

    let finalContent = knowledgeItem.content
    const actionType = knowledgeItem.metadata?.action_type || 'update'

    // Handle different action types
    if (actionType === 'merge' && existingData.content) {
      console.log('🔗 MERGE operation: Appending new content to existing content')
      // Append new content to existing content with proper separation
      const existingContent = existingData.content.trim()
      const newContent = knowledgeItem.content.trim()
      
      // Add a separator between existing and new content
      finalContent = `${existingContent}\n\n---\n\n${newContent}`
      console.log(`📝 Combined content length: ${finalContent.length} characters`)
    } else if (actionType === 'update') {
      console.log('🔄 UPDATE operation: Using LLM-processed content (already combined and deduplicated)')
      // For UPDATE operations, the LLM has already processed and combined the content
      // Just use the processed content as-is
      finalContent = knowledgeItem.content
    } else {
      console.log('🆕 CREATE_NEW operation: Using new content')
      // Keep the new content as is
    }

    // Generate new embedding for the final content
    let embedding = []
    try {
      console.log('🧠 Generating new embedding for final content...')
      embedding = await generateEmbedding(finalContent)
      console.log(
        '✅ New embedding generated successfully, dimension:',
        embedding.length,
      )
    } catch (error) {
      console.error('⚠️ Embedding generation failed:', error)
      throw new Error(`Cannot save knowledge item: ${error.message}`)
    }

    const updateData = {
      main_category: knowledgeItem.main_category,
      sub_category: knowledgeItem.sub_category,
      content: finalContent,
      tags: tags,
      source: knowledgeItem.source || 'text',
      last_updated: new Date().toISOString(),
    }

    // Only update embedding if generation was successful
    if (embedding && embedding.length > 0) {
      updateData.embedding = embedding
    }

    const { data, error } = await supabase
      .from('knowledge_items')
      .update(updateData)
      .eq('id', existingId)
      .select('id, main_category, sub_category, content, tags, last_updated')

    if (error) {
      console.error('❌ Error updating existing knowledge item:', error)
      throw new Error(`Failed to update knowledge item: ${error.message}`)
    }

    console.log(`✅ Successfully UPDATED existing knowledge item (${actionType} operation)`)
    const updatedItem = data[0]
    return {
      ...updatedItem,
      tags: Array.isArray(updatedItem.tags) ? updatedItem.tags : [],
      operation: 'updated', // Indicate what operation was performed
    }
  },

  // Enhanced method to get all items WITH embeddings for similarity checking
  async getAllWithEmbeddings() {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      console.log('📚 Fetching knowledge items with embeddings...')

      const { data, error } = await supabase
        .from('knowledge_items')
        .select(
          'id, main_category, sub_category, content, tags, embedding, last_updated',
        )
        .not('embedding', 'is', null)
        .order('last_updated', { ascending: false })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw new Error(
          `Failed to fetch knowledge items with embeddings: ${error.message}`,
        )
      }

      console.log(`📊 Retrieved ${data?.length || 0} items with embeddings`)
      return data || []
    } catch (error) {
      console.error('❌ Error in getAllWithEmbeddings():', error)
      throw error
    }
  },

  // Get knowledge statistics with proper error handling
  async getStats() {
    try {
      const data = await this.getAll()

      const mainCategories = new Set()
      const subCategories = new Set()
      const tags = new Set()

      data.forEach((item) => {
        // Categories
        mainCategories.add(item.main_category)
        subCategories.add(item.sub_category)

        // Tags
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag) => tags.add(tag))
        }
      })

      return {
        total_items: data.length,
        unique_main_categories: mainCategories.size,
        unique_sub_categories: subCategories.size,
        unique_tags: tags.size,
        main_categories: Array.from(mainCategories),
        sub_categories: Array.from(subCategories),
        tags: Array.from(tags),
      }
    } catch (error) {
      console.error('❌ Error getting stats:', error)
      // Return default stats instead of throwing
      return {
        total_items: 0,
        unique_main_categories: 0,
        unique_sub_categories: 0,
        unique_tags: 0,
        main_categories: [],
        sub_categories: [],
        tags: [],
      }
    }
  },

  // Get categories grouped by main category
  async getCategoriesGrouped() {
    try {
      const data = await this.getAll()
      const grouped = {}

      data.forEach((item) => {
        const mainCat = item.main_category
        const subCat = item.sub_category

        if (!grouped[mainCat]) {
          grouped[mainCat] = {
            main_category: mainCat,
            sub_categories: new Set(),
            total_items: 0,
            items: [],
          }
        }

        grouped[mainCat].sub_categories.add(subCat)
        grouped[mainCat].total_items++
        grouped[mainCat].items.push(item)
      })

      // Convert sets to arrays
      Object.values(grouped).forEach((category) => {
        category.sub_categories = Array.from(category.sub_categories)
      })

      return grouped
    } catch (error) {
      console.error('❌ Error getting grouped categories:', error)
      return {}
    }
  },

  // Test connection to Supabase
  async testConnection() {
    if (!supabase) {
      return { success: false, error: 'Supabase client not initialized' }
    }

    try {
      const { data, error } = await supabase
        .from('knowledge_items')
        .select('count', { count: 'exact', head: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, message: 'Connected to Supabase successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Get knowledge content by category
  async getByCategory(mainCategory, subCategory) {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      console.log(`📚 Fetching knowledge content for: ${mainCategory} → ${subCategory}`)

      const { data, error } = await supabase
        .from('knowledge_items')
        .select('id, main_category, sub_category, content, tags, last_updated')
        .eq('main_category', mainCategory)
        .eq('sub_category', subCategory)
        .limit(1)

      if (error) {
        console.error('❌ Supabase error:', error)
        throw new Error(`Failed to fetch knowledge content: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No knowledge content found for the specified category')
        return null
      }

      const item = data[0]
      console.log(`✅ Found knowledge content: ${item.content.length} characters`)
      
      return {
        id: item.id,
        main_category: item.main_category,
        sub_category: item.sub_category,
        content: item.content,
        tags: item.tags,
        last_updated: item.last_updated
      }
    } catch (error) {
      console.error('❌ Error in knowledgeAPI.getByCategory():', error)
      throw error
    }
  },
}

/**
 * User Profile API
 * Provides methods to manage user profiles in Supabase
 */

export const userProfileAPI = {
  // Get user profile by ID
  async getProfile(userId) {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      const { data, error } = await supabase
        .from('userprofile')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        throw new Error(`Failed to fetch user profile: ${error.message}`)
      }

      return data || null
    } catch (error) {
      console.error('❌ Error in userProfileAPI.getProfile():', error)
      throw error
    }
  },

  // Get the most recent user profile from the database
  async getFirstProfile() {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      const { data, error } = await supabase
        .from('userprofile')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('❌ Error fetching most recent user profile:', error)
        return null
      }

      return data || null
    } catch (error) {
      console.error('❌ Error in userProfileAPI.getFirstProfile():', error)
      return null
    }
  },

  // Get user goals for dropdown
  async getUserGoals() {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      // Get the current profile ID from localStorage or use the first profile
      const profileId = localStorage.getItem('GOS_currentProfileId') || 'new-profile-id'
      
      const { data, error } = await supabase
        .from('userprofile')
        .select('*')
        .eq('id', profileId)
        .single()

      if (error) {
        console.error('❌ Error fetching user goals:', error)
        return []
      }

      if (!data) {
        return []
      }

      // Return the complete profile data if goal_idea exists
      if (data.goal_idea && data.goal_idea.trim()) {
        return [data] // Return array with complete profile object
      }

      return []
    } catch (error) {
      console.error('❌ Error in userProfileAPI.getUserGoals():', error)
      return []
    }
  },

  // Create a new user profile
  async createProfile(profileData) {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      const { data, error } = await supabase
        .from('userprofile')
        .insert(profileData)
        .select('*')
        .single()

      if (error) {
        console.error('❌ Error creating user profile:', error)
        throw new Error(`Failed to create user profile: ${error.message}`)
      }

      return data || null
    } catch (error) {
      console.error('❌ Error in userProfileAPI.createProfile():', error)
      throw error
    }
  },

  // Update user profile
  async updateProfile(userId, updatedField) {
    if (!supabase) {
      throw new Error(
        'Supabase client not initialized. Check environment variables.',
      )
    }

    try {
      const { data, error } = await supabase
        .from('userprofile')
        .update(updatedField)
        .eq('id', userId)
        .select('*')
        .single()

      if (error) {
        console.error('❌ Error updating user profile:', error)
        throw new Error(`Failed to update user profile: ${error.message}`)
      }

      return data || null
    } catch (error) {
      console.error('❌ Error in userProfileAPI.updateProfile():', error)
      throw error
    }
  },
}

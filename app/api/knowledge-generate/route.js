import OpenAI from 'openai';

// Create separate clients for chat and embeddings
const chatClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

const embeddingClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

// Generate embedding using Azure OpenAI
async function generateEmbedding(text) {
  try {
    const response = await embeddingClient.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
      input: text.replace(/\n/g, ' ').trim(),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

// Transform text using LLM
async function transformTextWithLLM(instructions, inputText, similarKnowledge = null, mainCategory, subCategory, tags, actionType) {
  try {
    const prompt = `You are a Text Transformation Specialist. Your role is to transform input text according to specific instructions provided by a knowledge organization strategist.

INPUT FORMAT:
- instructions: string (specific transformation steps)
- input_text: string (original text to transform)
- similar_knowledge: string (existing knowledge context, if any)
- main_category: string (academic category)
- sub_category: string (sub-category)
- tags: list (semantic tags)
- action_type: string (merge/update/create_new)

TASK:
Transform the input_text according to the provided instructions. The instructions contain specific steps for how to restructure, modify, or enhance the text.

REQUIREMENTS:
1. Follow the instructions EXACTLY as provided
2. Preserve ALL original content - never delete or summarize
3. Maintain the academic tone and accuracy
4. If action_type is "merge" and similar_knowledge is provided, incorporate relevant elements from similar_knowledge
5. If action_type is "update", enhance the existing content based on instructions
6. If action_type is "create_new", restructure the content into a new format
7. Ensure the transformed text flows naturally and maintains coherence
8. Keep the same level of detail and technical accuracy

OUTPUT:
Return ONLY the transformed text as a string. Do not include any explanations, metadata, or formatting beyond what the instructions specify.

EXAMPLE:
Input: "Transform the input text by: restructuring paragraphs to group related concepts, adding clear section headings, modifying language to be more academic."
Output: [The transformed text with restructured paragraphs, section headings, and academic language]

Remember: You are ONLY transforming the input text according to the instructions. Do not add external information, citations, or perform any operations beyond what the instructions specify.

INSTRUCTIONS: ${instructions}
INPUT_TEXT: ${inputText}
SIMILAR_KNOWLEDGE: ${similarKnowledge || 'None provided'}
MAIN_CATEGORY: ${mainCategory}
SUB_CATEGORY: ${subCategory}
TAGS: ${tags.join(', ')}
ACTION_TYPE: ${actionType}

Transformed text:`;

    const response = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a Text Transformation Specialist. Transform the input text according to the provided instructions exactly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error transforming text with LLM:', error);
    throw new Error(`Failed to transform text: ${error.message}`);
  }
}

export async function POST(request) {
  try {
    const { 
      action_type, 
      input_text, 
      instructions, 
      similar_knowledge, 
      main_category, 
      sub_category, 
      tags 
    } = await request.json();

    if (!input_text || typeof input_text !== 'string') {
      return Response.json(
        { error: 'Input text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.AZURE_OPENAI_API_KEY) {
      return Response.json(
        { error: 'Azure OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let processedText;
    let embedding;

    if (action_type === 'create_new') {
      // For create_new, just use the input text as is
      processedText = input_text;
    } else {
      // For update/merge, transform the text using LLM
      processedText = await transformTextWithLLM(
        instructions,
        input_text,
        similar_knowledge,
        main_category,
        sub_category,
        tags || [],
        action_type
      );
    }

    // Generate embedding for the processed text
    embedding = await generateEmbedding(processedText);

    return Response.json({
      processed_text: processedText,
      embedding,
      dimension: embedding.length,
      text_length: processedText.length,
      action_type,
    });

  } catch (error) {
    console.error('Error in knowledge-generate:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 
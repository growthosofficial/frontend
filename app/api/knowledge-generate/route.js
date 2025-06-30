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
    let prompt;
    
    if (actionType === 'update' && similarKnowledge) {
      // Special handling for UPDATE operations - combine existing and new content
      prompt = `You are a Text Transformation Specialist. Your role is to UPDATE existing knowledge content by combining it with new information while removing redundancy.

EXISTING KNOWLEDGE CONTENT:
${similarKnowledge}

NEW INPUT TEXT:
${inputText}

TASK:
Update the existing knowledge content by:
1. Combining the existing content with the new input text
2. Removing redundant or duplicate information
3. Maintaining all unique information from both sources
4. Organizing the combined content with clear headers
5. Following any specific transformation instructions provided

CRITICAL REQUIREMENTS:
1. Always use **bold** formatting for headers
2. Preserve ALL unique information from both existing and new content
3. Remove redundant information (same facts, duplicate explanations)
4. Maintain academic tone and technical accuracy
5. Create clear, readable paragraphs under each headers
6. Ensure logical flow and organization

TRANSFORMATION APPROACH:
- Identify overlapping topics between existing and new content
- Merge related information under appropriate headers
- Remove duplicate facts while keeping the most detailed version
- Add new information from the input text
- Maintain the existing structure where possible
- Add new headers for new topics

AVOID:
- Losing any unique information from either source
- Creating redundant content
- Poor organization or structure
- Analysis or interpretation beyond organization

OUTPUT:
Return ONLY the updated text as a string with proper markdown formatting for headers.

INSTRUCTIONS: ${instructions || 'Update existing content by combining with new information and removing redundancy'}
MAIN_CATEGORY: ${mainCategory}
SUB_CATEGORY: ${subCategory}
TAGS: ${tags.join(', ')}

Updated text:`;
    } else {
      // Standard transformation for MERGE and CREATE_NEW operations
      prompt = `You are a Text Transformation Specialist. Your role is to transform input text into well-structured, organized knowledge content.

DEFAULT TRANSFORMATION STYLE:
Transform the input text into a structured format with:
- Clear, descriptive headers in **bold** format
- Well-organized paragraphs under each header
- Logical flow and progression of ideas
- Academic tone with clear, concise language
- Proper spacing and formatting

EXAMPLE OUTPUT FORMAT:
**Washington's Presidency**

In the 1788-89 presidential election, Washington was elected the nation's first U.S. president.
Along with his Treasury Secretary, Alexander Hamilton, Washington sought to create a relatively stronger central government than that favored by other founders, including Thomas Jefferson and James Madison.
This emphasis on a stronger central government set a precedent for future governance strategies.

**The Constitution**

On March 4, 1789, the new nation debated, adopted, and ratified the U.S. Constitution.
The Constitution is now recognized as the oldest and longest-standing written and codified national constitution in the world.
In 1791, a Bill of Rights was added to guarantee inalienable rights, further solidifying the framework of governance.

INPUT FORMAT:
- instructions: string (specific transformation instructions, if provided)
- input_text: string (new text to transform)
- similar_knowledge: string (existing knowledge context, for reference only)
- main_category: string (academic category)
- sub_category: string (sub-category)
- tags: list (semantic tags)
- action_type: string (merge/update/create_new)

TASK:
Transform the input_text into well-structured knowledge content. If specific instructions are provided, follow them. Otherwise, apply the default transformation style to create organized, header-based content.

NOTE: For MERGE operations, content combination is handled at the database level. For CREATE_NEW operations, transform only the new input_text.

CRITICAL REQUIREMENTS:
1. Always use **bold** formatting for headers
2. Transform ONLY the input_text into organized content
3. Maintain all original information - never delete or summarize content
4. Preserve academic tone and technical accuracy
5. Create clear, readable paragraphs under each header
6. Focus on structure and organization of the new content

DEFAULT TRANSFORMATION APPROACH:
- Identify main topics or themes in the input text
- Create descriptive headers for each major topic
- Organize related information under appropriate headers
- Ensure logical flow between sections
- Use clear, concise language
- Maintain proper spacing between sections

AVOID:
- Adding new information not present in input
- Creating content without proper structure
- Analysis or interpretation beyond organization
- External references or citations
- Unformatted or poorly structured output

OUTPUT:
Return ONLY the transformed text as a string with proper markdown formatting for headers.

INSTRUCTIONS: ${instructions || 'Apply default transformation style with bold headers and organized structure'}
INPUT_TEXT: ${inputText}
SIMILAR_KNOWLEDGE: ${similarKnowledge || 'None provided'}
MAIN_CATEGORY: ${mainCategory}
SUB_CATEGORY: ${subCategory}
TAGS: ${tags.join(', ')}
ACTION_TYPE: ${actionType}

Transformed text:`;
    }

    const response = await chatClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: actionType === 'update' 
            ? 'You are a Text Transformation Specialist. For UPDATE operations, combine existing and new content while removing redundancy. For other operations, transform input text into well-structured content with bold headers.'
            : 'You are a Text Transformation Specialist. Transform input text into well-structured knowledge content with bold headers and organized paragraphs. Always preserve all original information while improving structure and readability.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 10000,
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

    // Always transform the text using LLM regardless of action type
    const processedText = await transformTextWithLLM(
      instructions,
      input_text,
      similar_knowledge,
      main_category,
      sub_category,
      tags || [],
      action_type
    );

    // Generate embedding for the processed text
    const embedding = await generateEmbedding(processedText);

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
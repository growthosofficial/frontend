// app/api/generate-embedding/route.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return Response.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.AZURE_OPENAI_API_KEY) {
      return Response.json(
        { error: 'Azure OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Clean the text
    const cleanText = text.replace(/\n/g, ' ').trim();

    // Generate embedding using Azure OpenAI
    const response = await openai.embeddings.create({
      model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002',
      input: cleanText,
    });

    const embedding = response.data[0].embedding;

    return Response.json({
      embedding,
      dimension: embedding.length,
      text_length: cleanText.length,
    });

} catch (error) {
  console.error('Embedding generation error:', {
    message: error.message,
    code: error.code,
    type: error.type,
    status: error.status,
    stack: error.stack
  });
  
  // More specific error handling
  if (error.message?.includes('404')) {
    return Response.json(
      { error: 'Azure OpenAI deployment not found. Check AZURE_OPENAI_EMBEDDING_DEPLOYMENT' },
      { status: 404 }
    );
  }
  
  if (error.message?.includes('401') || error.message?.includes('403')) {
    return Response.json(
      { error: 'Azure OpenAI authentication failed. Check AZURE_OPENAI_API_KEY' },
      { status: 401 }
    );
  }

  return Response.json(
    { error: 'Failed to generate embedding', details: error.message, code: error.code },
    { status: 500 }
  );
}
}
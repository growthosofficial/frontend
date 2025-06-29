import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

export async function POST(request) {
  try {
    const { input_text } = await request.json();

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

    // Simple prompt to extract main ideas
    const prompt = `Extract the main ideas and key concepts from the following text. Present them in 2-3 concise sentences that capture the core content.

Text: ${input_text}

Main ideas:`;

    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a content summarizer. Extract and present main ideas from text in 2-3 concise sentences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 150,
    });

    const preview = response.choices[0].message.content.trim();

    return Response.json({
      preview,
      text_length: preview.length,
    });

  } catch (error) {
    console.error('Error in generate-preview:', error);
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 
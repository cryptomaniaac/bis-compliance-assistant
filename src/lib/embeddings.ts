import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function generateQueryEmbedding(text: string): Promise<number[] | null> {
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not configured. Falling back to keyword search mode.');
    return null;
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Failed to generate embedding via Gemini:', error);
    return null;
  }
}

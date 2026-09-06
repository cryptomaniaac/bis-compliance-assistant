import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { retrieveRelevantContext } from '@/lib/retrieval';
import { generateComplianceResponse, translateInputAndCheckAmbiguity, StructuredBISResponse } from '@/lib/llm';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Defense-in-depth API route authentication check
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required. Please log in.' }, { status: 401 });
    }

    const { conversationId, message, targetLanguage = 'en' } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const activeConversationId = conversationId || `conv_${Date.now()}`;

    // 1. Fetch recent conversation history from DB if available
    let history: { role: string; content: string }[] = [];
    if (isSupabaseConfigured && supabaseAdmin && conversationId) {
      const { data: pastMessages } = await supabaseAdmin
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(6);

      if (pastMessages) {
        history = pastMessages.reverse();
      }

      // Save user message to database
      await supabaseAdmin.from('messages').insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: message
      });
    }

    // 2. Multilingual Input handling: Translate non-English input & check for ambiguity
    let englishQuery = message;
    let isAmbiguous = false;
    let clarifyingQuestion: string | undefined = undefined;

    if (targetLanguage && targetLanguage !== 'en') {
      const translationRes = await translateInputAndCheckAmbiguity(message, targetLanguage);
      englishQuery = translationRes.englishQuery || message;
      isAmbiguous = translationRes.isAmbiguous;
      clarifyingQuestion = translationRes.clarifyingQuestion;
    }

    // If non-English query is ambiguous/unclear, respond directly with a clarifying question in the target language
    if (isAmbiguous && clarifyingQuestion) {
      const ambiguousResponse: StructuredBISResponse = {
        responseType: 'conversational',
        summary: clarifyingQuestion,
        applicable_standards: [],
        certification_required: '',
        testing_requirements: [],
        action_checklist: [],
        follow_up_questions: [],
        sources: [],
        found_in_context: false,
      };

      if (isSupabaseConfigured && supabaseAdmin && conversationId) {
        await supabaseAdmin.from('messages').insert({
          conversation_id: activeConversationId,
          role: 'assistant',
          content: clarifyingQuestion,
          structured_response: ambiguousResponse,
        });
      }

      return NextResponse.json({
        conversationId: activeConversationId,
        message: clarifyingQuestion,
        structuredResponse: ambiguousResponse,
        retrievedContext: { standards: [], schemes: [] },
      });
    }

    // 3. Perform RAG Retrieval against pgvector / standards DB using English query
    const retrievedContext = await retrieveRelevantContext(englishQuery);

    // 4. Generate grounded response using LLM in targetLanguage
    const structuredResult = await generateComplianceResponse(
      message,
      retrievedContext,
      history,
      targetLanguage
    );

    // 5. Save assistant response to DB
    if (isSupabaseConfigured && supabaseAdmin && conversationId) {
      await supabaseAdmin.from('messages').insert({
        conversation_id: activeConversationId,
        role: 'assistant',
        content: structuredResult.summary,
        structured_response: structuredResult
      });
    }

    // 6. Return complete response
    return NextResponse.json({
      conversationId: activeConversationId,
      message: structuredResult.summary,
      structuredResponse: structuredResult,
      retrievedContext
    });
  } catch (error: any) {
    console.error('POST /api/chat error:', error);
    return NextResponse.json(
      {
        error: 'Error processing compliance request',
        details: error.message
      },
      { status: 500 }
    );
  }
}

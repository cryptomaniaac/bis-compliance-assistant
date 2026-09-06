import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { crypto } from 'next/dist/compiled/@edge-runtime/primitives';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const userSessionId = body.userSessionId || `anon_${Date.now()}`;

    if (isSupabaseConfigured && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .insert({ user_session_id: userSessionId })
        .select('id')
        .single();

      if (!error && data) {
        return NextResponse.json({ conversationId: data.id, status: 'created' });
      }
    }

    // In-memory fallback ID if Supabase is not yet connected
    const fallbackId = globalThis.crypto?.randomUUID() || `conv_${Date.now()}`;
    return NextResponse.json({ conversationId: fallbackId, status: 'local_fallback' });
  } catch (error: any) {
    console.error('POST /api/conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation', details: error.message },
      { status: 500 }
    );
  }
}

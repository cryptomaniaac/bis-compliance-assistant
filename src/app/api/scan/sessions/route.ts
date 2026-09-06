import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    let conversationId: string | undefined;
    let scanType: string | undefined;
    try {
      const body = await request.json();
      conversationId = body?.conversationId;
      scanType = body?.scanType || body?.scan_type;
    } catch {
      // JSON body is optional
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      // Graceful degradation: return a mock session ID if Supabase not configured
      return NextResponse.json(
        { error: 'Scan sessions require Supabase to be configured.' },
        { status: 503 }
      );
    }

    const isValidUuid = typeof conversationId === 'string' &&
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(conversationId);

    const insertPayload: any = {
      conversation_id: isValidUuid ? conversationId : null,
      status: 'waiting',
      scan_type: scanType || 'product',
    };

    let { data, error } = await supabaseAdmin
      .from('scan_sessions')
      .insert(insertPayload)
      .select('id')
      .single();

    // Fallback: If scan_type column is missing from older DB schema, retry without scan_type field
    if (error && (error.message?.includes('scan_type') || error.code === 'PGRST204')) {
      delete insertPayload.scan_type;
      const fallbackRes = await supabaseAdmin
        .from('scan_sessions')
        .insert(insertPayload)
        .select('id')
        .single();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error || !data) {
      console.warn('DB insert issue, returning fallback UUID for QR code:', error?.message);
      const fallbackId = crypto.randomUUID();
      return NextResponse.json({ sessionId: fallbackId, scanType: scanType || 'product' });
    }

    return NextResponse.json({ sessionId: data.id, scanType: scanType || 'product' });
  } catch (err: any) {
    console.error('POST /api/scan/sessions error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId query parameter required' }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    let data: any = null;
    let error: any = null;

    const resWithScanType = await supabaseAdmin
      .from('scan_sessions')
      .select('status, image_url, scan_type')
      .eq('id', sessionId)
      .maybeSingle();

    if (resWithScanType.error && resWithScanType.error.message?.includes('scan_type')) {
      const fallbackRes = await supabaseAdmin
        .from('scan_sessions')
        .select('status, image_url')
        .eq('id', sessionId)
        .maybeSingle();
      data = fallbackRes.data;
      error = fallbackRes.error;
    } else {
      data = resWithScanType.data;
      error = resWithScanType.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ status: 'waiting', image_url: null, scanType: 'product' });
    }

    return NextResponse.json({
      status: data.status,
      imageUrl: data.image_url,
      scanType: data.scan_type || 'product',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

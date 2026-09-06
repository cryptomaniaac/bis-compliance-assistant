import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// Status value allowed by the scan_sessions_status_check DB constraint.
// The identify route uses 'processed'; the phone page checks for 'processed', 'done', and 'completed'.
// We use 'processed' here to satisfy the constraint while the phone page already handles it.
const DONE_STATUS = 'processed';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      // Update the existing row to signal desktop analysis is complete
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('scan_sessions')
        .update({ status: DONE_STATUS })
        .eq('id', sessionId)
        .select('id');

      if (updateError) {
        console.error('Error updating scan_session to processed:', JSON.stringify(updateError));
      }

      const updatedCount = updateData ? updateData.length : 0;

      // Upsert fallback if no row was matched (e.g. session created with fallback UUID not in DB)
      if (updatedCount === 0) {
        console.warn(`No rows updated for sessionId=${sessionId}, attempting upsert with status=${DONE_STATUS}...`);
        const { error: upsertError } = await supabaseAdmin
          .from('scan_sessions')
          .upsert({ id: sessionId, status: DONE_STATUS }, { onConflict: 'id' });
        if (upsertError) {
          console.error('Error upserting scan_session processed status:', JSON.stringify(upsertError));
        } else {
          console.log(`scan_session upserted as ${DONE_STATUS} for sessionId=${sessionId}`);
        }
      } else {
        console.log(`scan_session updated to ${DONE_STATUS} for sessionId=${sessionId} (${updatedCount} rows)`);
      }
    }

    return NextResponse.json({ success: true, sessionId, status: DONE_STATUS });
  } catch (err: any) {
    console.error('POST /api/scan/complete error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

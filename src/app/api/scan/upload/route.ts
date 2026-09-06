import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;

    if (!file || !sessionId) {
      return NextResponse.json(
        { error: 'file and sessionId form data are required' },
        { status: 400 }
      );
    }

    console.log(`[upload] sessionId=${sessionId} file=${file.name} type=${file.type} size=${file.size}`);

    if (!isSupabaseConfigured || !supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase is not configured on the server.' },
        { status: 503 }
      );
    }

    // 1. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Upload to Supabase Storage using admin client
    // Derive extension from MIME type first (more reliable for phone camera shots)
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/heic': 'heic',
      'image/heif': 'heif',
      'image/gif': 'gif',
    };
    const mimeType = file.type || 'image/jpeg';
    const extFromMime = mimeToExt[mimeType.toLowerCase()];
    const extFromName = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined;
    const ext = extFromMime || extFromName || 'jpg';
    const filePath = `${sessionId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-scans')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      console.error('Server storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload photo to storage', details: uploadError.message },
        { status: 500 }
      );
    }

    // 3. Get Public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-scans')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // 4. Upsert scan session row
    const { error: upsertError } = await supabaseAdmin
      .from('scan_sessions')
      .upsert(
        {
          id: sessionId,
          image_url: publicUrl,
          status: 'uploaded',
        },
        { onConflict: 'id' }
      );

    if (upsertError) {
      console.error('Server scan_sessions upsert error:', upsertError);
      return NextResponse.json(
        { error: 'Failed to update scan session', details: upsertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      imageUrl: publicUrl,
    });
  } catch (err: any) {
    console.error('POST /api/scan/upload error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

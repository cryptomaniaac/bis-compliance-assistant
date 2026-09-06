import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    if (!genAI) {
      console.error('[Voice Transcribe] GEMINI_API_KEY is missing.');
      return NextResponse.json({ error: 'Server configuration error: GEMINI_API_KEY missing.' }, { status: 500 });
    }

    const body = await req.json();
    const { audioBase64, mimeType } = body;

    if (!audioBase64 || audioBase64.length < 50) {
      return NextResponse.json({ error: 'Audio recording was empty. Please speak clearly and try again.' }, { status: 400 });
    }

    // Sanitize mimeType — strip codec params, keep only base type
    let cleanMime = 'audio/webm';
    if (mimeType) {
      const base = mimeType.split(';')[0].trim().toLowerCase();
      if (base.includes('mp4') || base.includes('m4a') || base.includes('aac')) cleanMime = 'audio/mp4';
      else if (base.includes('ogg')) cleanMime = 'audio/ogg';
      else if (base.includes('wav')) cleanMime = 'audio/wav';
      else cleanMime = 'audio/webm';
    }

    // Use same models as the rest of the project (gemini-3.5-transcribe is the
    // dedicated STT model; gemini-3.6-flash / gemini-3.5-flash are multimodal
    // fallbacks already confirmed to work in this API key)
    const modelCandidates = [
      'gemini-3.5-transcribe',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
    ];

    let transcribedText = '';
    let lastErrorMsg = '';

    for (const modelName of modelCandidates) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Voice Transcribe] Trying ${modelName} (attempt ${attempt}), mimeType=${cleanMime}, base64Length=${audioBase64.length}`);

          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([
            'Transcribe this spoken audio recording accurately into plain English text. Return ONLY the verbatim transcribed query text with no commentary, quotes, or markdown.',
            {
              inlineData: {
                mimeType: cleanMime,
                data: audioBase64,
              },
            },
          ]);

          const txt = result.response.text().trim();
          if (txt) {
            transcribedText = txt;
            console.log(`[Voice Transcribe] SUCCESS via ${modelName}: "${transcribedText}"`);
            break;
          }
        } catch (err: any) {
          lastErrorMsg = err?.message || String(err);
          console.error(`[Voice Transcribe] ${modelName} attempt ${attempt} FAILED:`, lastErrorMsg);

          if (
            lastErrorMsg.toLowerCase().includes('overloaded') ||
            lastErrorMsg.includes('503') ||
            lastErrorMsg.includes('429')
          ) {
            await sleep(600 * attempt);
          } else {
            // Non-transient error — try next model immediately
            break;
          }
        }
      }
      if (transcribedText) break;
    }

    if (transcribedText) {
      return NextResponse.json({ text: transcribedText });
    }

    const isOverloaded =
      lastErrorMsg.toLowerCase().includes('overloaded') ||
      lastErrorMsg.includes('503');

    return NextResponse.json(
      {
        error: isOverloaded
          ? 'Speech service is busy right now. Please try again in a moment.'
          : `Transcription failed: ${lastErrorMsg}`,
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('[Voice Transcribe] Unhandled exception:', error);
    return NextResponse.json(
      { error: error.message || 'Voice transcription server error.' },
      { status: 500 }
    );
  }
}

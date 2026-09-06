import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { StructuredBISResponse } from '@/lib/llm';
import { retrieveRelevantContext } from '@/lib/retrieval';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { imageUrl, sessionId, conversationId, scanType: requestedScanType, targetLanguage = 'en' } = await request.json();

    if (!imageUrl || !sessionId) {
      return NextResponse.json(
        { error: 'imageUrl and sessionId are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 503 }
      );
    }

    // Determine effective scan_type from request body or DB
    let scanType = requestedScanType || 'product';
    if (!requestedScanType && isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: dbSession } = await supabaseAdmin
          .from('scan_sessions')
          .select('scan_type')
          .eq('id', sessionId)
          .maybeSingle();
        if (dbSession?.scan_type) {
          scanType = dbSession.scan_type;
        }
      } catch (_) {}
    }

    // 1. Fetch image from public Supabase Storage URL
    let imageData: string;
    let mimeType: string = 'image/jpeg';

    try {
      const imgResponse = await fetch(imageUrl);
      if (!imgResponse.ok) {
        throw new Error(`Failed to fetch image: ${imgResponse.status} ${imgResponse.statusText}`);
      }
      const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
      let rawMime = contentType.split(';')[0].trim().toLowerCase();
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      mimeType = validMimes.includes(rawMime) ? rawMime : 'image/jpeg';

      const arrayBuffer = await imgResponse.arrayBuffer();
      imageData = Buffer.from(arrayBuffer).toString('base64');
    } catch (fetchErr: any) {
      console.error('Image fetch error:', fetchErr);
      return NextResponse.json(
        { error: 'Could not retrieve uploaded image', details: fetchErr.message },
        { status: 502 }
      );
    }

    const ai = new GoogleGenerativeAI(apiKey);
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash'];
    const imagePart: Part = {
      inlineData: {
        data: imageData,
        mimeType: mimeType as any,
      },
    };

    // ──────────────────────────────────────────────────────────────────────────
    // BRANCH A: LABEL / PACKAGING VISUAL AUDIT (scanType === 'label')
    // ──────────────────────────────────────────────────────────────────────────
    if (scanType === 'label') {
      // ── STEP 0: Quick product identification for BIS scope-check ────────────
      const quickIdPrompt = `You are a product identification expert. Look at this product label or packaging image and identify exactly what type of product it is.
Respond with ONLY the product name — 1 to 5 words maximum. No explanation. No punctuation. Just the product name.
Examples: "LED bulb", "electric fan", "pressure cooker", "pulse oximeter", "apple juice", "cosmetic moisturizer"`;

      let identifiedProductName = '';
      for (const modelName of candidateModels) {
        try {
          const quickModel = ai.getGenerativeModel({ model: modelName });
          const quickResult = await quickModel.generateContent([quickIdPrompt, imagePart]);
          identifiedProductName = quickResult.response.text().trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
          if (identifiedProductName) break;
        } catch (_) {}
      }

      // ── STEP 1: BIS Jurisdiction Check via RAG ───────────────────────────────
      // If we couldn't identify the product at all, fall through to the label prompt.
      // If we DID identify it, check whether BIS regulates this product.
      let isBisRegulated = true; // default: assume regulated if check fails
      let nonBisRegulator = '';

      if (identifiedProductName) {
        try {
          console.log(`[identify-label] Scope check for: "${identifiedProductName}"`);
          const ragResult = await retrieveRelevantContext(identifiedProductName);
          if (ragResult.standards.length === 0) {
            // No BIS standard found — product is outside BIS mandate
            isBisRegulated = false;
            // Suggest alternate regulator based on common patterns
            const name = identifiedProductName;
            if (/pulse oximeter|thermometer|blood pressure|glucometer|medical|surgical|diagnostic/.test(name)) {
              nonBisRegulator = 'CDSCO (Central Drugs Standard Control Organisation) under the Medical Devices Rules, 2017';
            } else if (/food|drink|juice|biscuit|chocolate|snack|beverage|milk|water bottle|packaged food/.test(name)) {
              nonBisRegulator = 'FSSAI (Food Safety and Standards Authority of India) under the Food Safety and Standards Act, 2006';
            } else if (/cosmetic|cream|moisturizer|shampoo|soap|lotion|perfume|deodorant/.test(name)) {
              nonBisRegulator = 'CDSCO (under Cosmetics Rules) or State Licensing Authority';
            } else if (/drug|medicine|tablet|capsule|syrup|pharmaceutical/.test(name)) {
              nonBisRegulator = 'CDSCO (Central Drugs Standard Control Organisation)';
            } else if (/pesticide|fertilizer|agrochemical/.test(name)) {
              nonBisRegulator = 'Central Insecticides Board & Registration Committee (CIBRC) or Department of Agriculture';
            }
          } else {
            console.log(`[identify-label] BIS regulated — found ${ragResult.standards.length} standard(s) for "${identifiedProductName}"`);
          }
        } catch (ragErr) {
          console.warn('[identify-label] RAG scope-check failed, proceeding with label audit:', ragErr);
          // On failure, default to running the full label audit (safe fallback)
          isBisRegulated = true;
        }
      }

      // ── STEP 2a: NOT BIS-regulated — return informational response ──────────
      if (!isBisRegulated) {
        const productLabel = identifiedProductName
          ? identifiedProductName.replace(/\b\w/g, c => c.toUpperCase())
          : 'This product';
        const regulatorNote = nonBisRegulator
          ? `This product is regulated by **${nonBisRegulator}**, not BIS. Please check the applicable authority's labeling requirements.`
          : 'This product does not appear to fall under any mandatory BIS Quality Control Order. BIS ISI/CRS marks are not required for this product category.';

        const nonBisResponse: StructuredBISResponse = {
          responseType: 'non_bis_regulated',
          identified_product: productLabel,
          summary: `**${productLabel}** is not regulated under any mandatory BIS Quality Control Order (QCO). ${regulatorNote}\n\nNo ISI mark, CRS mark, or BIS license number is required on the label for this product. Running a BIS compliance checklist on this product would generate false compliance failures.`,
          label_checklist: [],
          applicable_standards: [],
          certification_required: 'None (Not BIS-regulated)',
          testing_requirements: [],
          action_checklist: nonBisRegulator
            ? [{ step: 1, action: `Consult ${nonBisRegulator} for applicable labeling and certification requirements.`, detail: '' }]
            : [{ step: 1, action: 'Verify with the appropriate Indian regulatory authority for this product category.', detail: '' }],
          sources: ['https://www.bis.gov.in', 'https://www.india.gov.in'],
          found_in_context: false,
        };

        if (isSupabaseConfigured && supabaseAdmin) {
          await supabaseAdmin.from('scan_sessions').update({ status: 'processed' }).eq('id', sessionId);
        }

        return NextResponse.json({
          confident: true,
          scanType: 'label',
          productDescription: productLabel,
          structuredResponse: nonBisResponse,
          conversationId: conversationId || null,
        });
      }

      // ── STEP 2b: BIS-regulated — run the full label audit prompt ─────────────
      const labelPrompt = `You are an expert Indian BIS (Bureau of Indian Standards) packaging and label compliance auditor.
Analyze this packaging / product label image thoroughly to conduct a visual compliance check against mandatory BIS labeling rules and Quality Control Orders.

Evaluate these 4 specific key checklist items:
1. ISI Mark or CRS Registration Mark presence on the packaging
2. BIS License / Registration Number format (e.g., CM/L-XXXXXXXXXX for ISI or R-XXXXXXXX for CRS)
3. IS Standard Code marking (e.g. IS 16102, IS 302, IS 14543 printed on package)
4. Manufacturer / Importer details & Country of Origin declaration

EVALUATION RULES:
- If a required item is clearly visible and valid, set status: "pass".
- If a required item is missing or clearly invalid/fake, set status: "fail".
- If the image is blurry, poorly lit, cropped, unreadable, or missing required label text, DO NOT GUESS — set status: "uncertain" and state in detail why the image quality/framing prevents confident verification.

Respond strictly with valid JSON conforming to this schema:
{
  "responseType": "label_analysis",
  "identified_product": "Clean name of product/packaging label (e.g. LED Bulb Packaging Label)",
  "summary": "Executive summary of visual label compliance check findings",
  "label_checklist": [
    { "item": "ISI / CRS Standard Mark", "status": "pass", "detail": "Detailed explanation of visual detection" },
    { "item": "BIS License / Registration Number", "status": "fail", "detail": "Detailed explanation" },
    { "item": "IS Standard Code Marking", "status": "uncertain", "detail": "Detailed explanation" },
    { "item": "Manufacturer / Importer Declaration", "status": "pass", "detail": "Detailed explanation" }
  ],
  "applicable_standards": [],
  "certification_required": "BIS Packaging & Label Verification",
  "testing_requirements": [],
  "action_checklist": [],
  "sources": ["https://www.bis.gov.in"],
  "found_in_context": true
}

Multilingual Note: Translate summary and checklist items/details into target language if non-English, but KEEP IS code designations (e.g. IS 16102) and scheme terms ("ISI Mark", "CRS", "CM/L-...", "R-...") strictly verbatim in English script.`;

      let labelResultText = '';
      let lastErr: any = null;

      for (const modelName of candidateModels) {
        try {
          console.log(`[identify-label] Trying model ${modelName} for session ${sessionId}...`);
          const visionModel = ai.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
          });
          const result = await visionModel.generateContent([labelPrompt, imagePart]);
          labelResultText = result.response.text().trim();
          if (labelResultText) break;
        } catch (err: any) {
          console.warn(`[identify-label] Model ${modelName} failed:`, err?.message || err);
          lastErr = err;
        }
      }

      if (!labelResultText) {
        return NextResponse.json(
          { error: 'Vision model failed to analyze label', details: lastErr?.message },
          { status: 500 }
        );
      }

      let structuredResponse: StructuredBISResponse;
      try {
        structuredResponse = JSON.parse(labelResultText) as StructuredBISResponse;
        structuredResponse.responseType = 'label_analysis';
      } catch (pErr) {
        structuredResponse = {
          responseType: 'label_analysis',
          identified_product: 'Product Label',
          summary: 'Label inspection completed. Please review package image clarity.',
          label_checklist: [
            { item: 'ISI / CRS Standard Mark', status: 'uncertain', detail: 'Could not clearly verify mark due to image resolution.' },
            { item: 'BIS License / Registration Number', status: 'uncertain', detail: 'License number text unclear.' },
            { item: 'IS Standard Code Marking', status: 'uncertain', detail: 'IS code marking unreadable.' },
            { item: 'Manufacturer / Importer Declaration', status: 'uncertain', detail: 'Declaration text unreadable.' }
          ],
          applicable_standards: [],
          certification_required: 'BIS Label Verification',
          testing_requirements: [],
          action_checklist: [],
          sources: ['https://www.bis.gov.in'],
          found_in_context: true,
        };
      }

      // Mark scan session as processed
      if (isSupabaseConfigured && supabaseAdmin) {
        await supabaseAdmin
          .from('scan_sessions')
          .update({ status: 'processed' })
          .eq('id', sessionId);
      }

      return NextResponse.json({
        confident: true,
        scanType: 'label',
        productDescription: structuredResponse.identified_product || 'product packaging label',
        structuredResponse,
        conversationId: conversationId || null,
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // BRANCH B: PRODUCT IDENTIFICATION (scanType === 'product' — ORIGINAL FLOW)
    // ──────────────────────────────────────────────────────────────────────────
    const visionPrompt = `You are a product identification expert for Indian BIS regulatory compliance. Look at this image and identify exactly what product is shown.

Always give a confident, specific product name. Never refuse or say you cannot identify it.

Examples of good answers: "mobile phone", "remote control", "plastic water bottle", "cotton t-shirt", "double door refrigerator", "LED television", "electric ceiling fan", "pressure cooker", "laptop computer", "packaged chips", "motorcycle helmet"

Respond with ONLY the product name — 1 to 5 words maximum. No explanation. No punctuation. Just the product name.`;

    let visionResponseText = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        console.log(`[identify] Trying model ${modelName} for session ${sessionId}...`);
        const visionModel = ai.getGenerativeModel({ model: modelName });
        const visionResult = await visionModel.generateContent([visionPrompt, imagePart]);
        visionResponseText = visionResult.response.text().trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
        console.log(`[identify] Model ${modelName} success: "${visionResponseText}"`);
        if (visionResponseText) break;
      } catch (err: any) {
        console.warn(`[identify] Model ${modelName} failed:`, err?.message || err);
        lastError = err;
      }
    }

    if (!visionResponseText) {
      return NextResponse.json(
        {
          error: 'Vision model failed to identify product',
          details: lastError?.message || 'All Gemini models in fallback chain failed',
        },
        { status: 500 }
      );
    }

    const productDescription = visionResponseText.trim() || 'unknown product';

    // Mark scan session as processed
    if (isSupabaseConfigured && supabaseAdmin) {
      await supabaseAdmin
        .from('scan_sessions')
        .update({ status: 'processed' })
        .eq('id', sessionId);
    }

    return NextResponse.json({
      confident: true,
      scanType: 'product',
      productDescription,
      conversationId: conversationId || null,
    });

  } catch (err: any) {
    console.error('POST /api/scan/identify error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

if (!geminiApiKey) {
  console.error('❌ Error: GEMINI_API_KEY must be set in .env.local to generate embeddings');
  process.exit(1);
}

// Polyfill WebSocket for Node 20 environment if missing
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = class {};
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
const ai = new GoogleGenerativeAI(geminiApiKey);

// Gemini text-embedding-004 yields 768-dim vector embeddings
async function generateEmbedding(text: string): Promise<number[]> {
  const model = ai.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

async function seed() {
  console.log('🚀 Starting BIS Compliance Assistant Seeding Script...\n');

  const seedFilePath = path.resolve(__dirname, 'data/seed-standards.json');
  const rawData = fs.readFileSync(seedFilePath, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. Seed bis_standards
  console.log(`📦 Seeding ${data.standards.length} BIS Standards...`);
  for (const item of data.standards) {
    const textToEmbed = `Standard: ${item.standard_code} - ${item.title}. Category: ${item.product_category}. Description: ${item.description}. Certification: ${item.certification_type}. Testing: ${item.testing_requirements}`;
    
    console.log(` -> Generating embedding for: ${item.standard_code} (${item.product_category})`);
    let vector: number[] | null = null;
    try {
      vector = await generateEmbedding(textToEmbed);
    } catch (err: any) {
      console.warn(`  ⚠️ Could not generate embedding for ${item.standard_code} (${err.message || err}). Inserting without embedding.`);
    }

    try {
      const { error } = await supabase.from('bis_standards').upsert(
        {
          standard_code: item.standard_code,
          title: item.title,
          product_category: item.product_category,
          description: item.description,
          certification_type: item.certification_type,
          testing_requirements: item.testing_requirements,
          source_url: item.source_url,
          embedding: vector
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error(`  ❌ Failed to insert ${item.standard_code}:`, error.message);
      } else {
        console.log(`  ✅ Successfully seeded ${item.standard_code}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Error embedding ${item.standard_code}:`, err.message || err);
    }
  }

  // 2. Seed certification_schemes
  console.log(`\n📋 Seeding ${data.schemes.length} Certification Schemes...`);
  for (const scheme of data.schemes) {
    const textToEmbed = `Scheme: ${scheme.scheme_name}. Description: ${scheme.description}. Steps: ${scheme.application_steps.join(' ')}. Documents: ${scheme.required_documents.join(' ')}`;
    
    console.log(` -> Generating embedding for scheme: ${scheme.scheme_name}`);
    let vector: number[] | null = null;
    try {
      vector = await generateEmbedding(textToEmbed);
    } catch (err: any) {
      console.warn(`  ⚠️ Could not generate embedding for scheme ${scheme.scheme_name} (${err.message || err}). Inserting without embedding.`);
    }

    try {
      const { error } = await supabase.from('certification_schemes').upsert(
        {
          scheme_name: scheme.scheme_name,
          description: scheme.description,
          application_steps: scheme.application_steps,
          required_documents: scheme.required_documents,
          fee_info: scheme.fee_info,
          embedding: vector
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error(`  ❌ Failed to insert ${scheme.scheme_name}:`, error.message);
      } else {
        console.log(`  ✅ Successfully seeded scheme ${scheme.scheme_name}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Error embedding scheme ${scheme.scheme_name}:`, err.message || err);
    }
  }

  console.log('\n🎉 Seeding completed successfully!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});

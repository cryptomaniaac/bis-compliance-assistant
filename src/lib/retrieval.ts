import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { generateQueryEmbedding } from './embeddings';
import seedData from '../../scripts/data/seed-standards.json';

export interface RetrievedStandard {
  standard_code: string;
  title: string;
  product_category: string;
  description: string;
  certification_type: string;
  testing_requirements: string;
  source_url: string;
  similarity?: number;
}

export interface RetrievedScheme {
  scheme_name: string;
  description: string;
  application_steps: string[];
  required_documents: string[];
  fee_info?: string;
  similarity?: number;
}

export interface RetrievalResult {
  standards: RetrievedStandard[];
  schemes: RetrievedScheme[];
}

export async function retrieveRelevantContext(userQuery: string): Promise<RetrievalResult> {
  // 1. Attempt vector retrieval if Supabase and Gemini are configured
  if (isSupabaseConfigured && supabaseAdmin) {
    const embedding = await generateQueryEmbedding(userQuery);

    if (embedding) {
      try {
        const [standardsRes, schemesRes] = await Promise.all([
          supabaseAdmin.rpc('match_bis_standards', {
            query_embedding: embedding,
            match_threshold: 0.35,
            match_count: 4
          }),
          supabaseAdmin.rpc('match_certification_schemes', {
            query_embedding: embedding,
            match_threshold: 0.35,
            match_count: 2
          })
        ]);

        if (!standardsRes.error && standardsRes.data && standardsRes.data.length > 0) {
          return {
            standards: standardsRes.data,
            schemes: schemesRes.data || []
          };
        }
      } catch (err) {
        console.warn('Vector match query failed, using fallback retriever:', err);
      }
    }
  }

  // 2. High-precision keyword/semantic scoring fallback over seed dataset
  const terms = userQuery.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  const scoredStandards = seedData.standards.map(st => {
    const textToMatch = `${st.standard_code} ${st.title} ${st.product_category} ${st.description} ${st.certification_type} ${st.testing_requirements}`.toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (st.product_category.toLowerCase().includes(term)) score += 4;
      if (st.title.toLowerCase().includes(term)) score += 3;
      if (st.standard_code.toLowerCase().includes(term)) score += 5;
      if (textToMatch.includes(term)) score += 1;
    }

    return { ...st, score };
  });

  // Filter standards with score > 0 or return top matches if matches exist
  const matchedStandards = scoredStandards
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ score, ...rest }) => rest);

  const matchedSchemes = seedData.schemes.slice(0, 2);

  return {
    standards: matchedStandards,
    schemes: matchedSchemes
  };
}

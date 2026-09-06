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

const STOP_WORDS = new Set([
  'have', 'an', 'a', 'the', 'is', 'are', 'for', 'in', 'of', 'and', 'or', 'to', 'with', 'on', 'at', 'by', 'from',
  'my', 'i', 'we', 'you', 'sell', 'making', 'make', 'manufacture', 'import', 'supplier', 'supply', 'producing', 'produce',
  'check', 'details', 'compliance', 'standard', 'rules', 'requirement', 'requirements', 'need', 'needs', 'product'
]);

const GENERIC_MODIFIERS = new Set([
  'packaged', 'portable', 'electric', 'electrical', 'electronic', 'digital', 'automatic', 'manual', 'home', 'household',
  'commercial', 'industrial', 'small', 'large', 'heavy', 'light', 'general', 'type', 'series', 'part', 'safety',
  'spec', 'specification', 'control', 'device', 'unit', 'system', 'equipment', 'apparatus'
]);

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
          const rawData: RetrievedStandard[] = standardsRes.data;
          const maxSim = Math.max(...rawData.map(s => s.similarity || 0));

          // Gating: Absolute similarity >= 0.50 AND relative ratio >= 0.60 of top match
          const filteredVector = rawData.filter(s =>
            (s.similarity || 0) >= 0.50 && (s.similarity || 0) >= maxSim * 0.60
          );

          if (filteredVector.length > 0) {
            return {
              standards: filteredVector,
              schemes: schemesRes.data || []
            };
          }
        }
      } catch (err) {
        console.warn('Vector match query failed, using fallback retriever:', err);
      }
    }
  }

  // 2. High-precision keyword/semantic scoring fallback over seed dataset
  const terms = userQuery
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  if (terms.length === 0) {
    return { standards: [], schemes: seedData.schemes.slice(0, 2) };
  }

  const coreTerms = terms.filter(t => !GENERIC_MODIFIERS.has(t));
  const hasCoreTerms = coreTerms.length > 0;

  const scoredStandards = seedData.standards.map(st => {
    const codeClean = st.standard_code.toLowerCase();
    const catClean = st.product_category.toLowerCase();
    const titleClean = st.title.toLowerCase();
    const descClean = st.description.toLowerCase();

    let score = 0;

    for (const term of terms) {
      const isModifier = GENERIC_MODIFIERS.has(term);
      const categoryWeight = isModifier && hasCoreTerms ? 2 : 8;
      const titleWeight = isModifier && hasCoreTerms ? 2 : 6;
      const codeWeight = isModifier && hasCoreTerms ? 3 : 10;

      if (catClean.includes(term)) score += categoryWeight;
      if (titleClean.includes(term)) score += titleWeight;
      if (codeClean.includes(term)) score += codeWeight;
      if (descClean.includes(term)) score += 1;
    }

    return { ...st, score, similarity: Math.min(0.99, score / 25) };
  });

  const sorted = scoredStandards.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  if (sorted.length === 0) {
    return { standards: [], schemes: seedData.schemes.slice(0, 2) };
  }

  const topScore = sorted[0].score;

  // Empirical Confidence Thresholds:
  // 1. Absolute minimum score bar = 10 (must match a primary product category/title term)
  // 2. Relative ratio bar = 0.60 of topScore
  const MIN_ABSOLUTE_SCORE = 10;
  const MIN_RELATIVE_RATIO = 0.60;

  if (topScore < MIN_ABSOLUTE_SCORE) {
    return { standards: [], schemes: seedData.schemes.slice(0, 2) };
  }

  const matchedStandards = sorted
    .filter(s => s.score >= MIN_ABSOLUTE_SCORE && s.score >= topScore * MIN_RELATIVE_RATIO)
    .slice(0, 4)
    .map(({ score, ...rest }) => rest);

  return {
    standards: matchedStandards,
    schemes: seedData.schemes.slice(0, 2)
  };
}

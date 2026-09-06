import seedData from '../scripts/data/seed-standards.json';

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

export function filterRetrievedStandards(userQuery: string) {
  const terms = userQuery
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  if (terms.length === 0) return [];

  const coreTerms = terms.filter(t => !GENERIC_MODIFIERS.has(t));
  const hasCoreTerms = coreTerms.length > 0;

  const scored = seedData.standards.map(st => {
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

      if (catClean.includes(term)) {
        score += categoryWeight;
      }
      if (titleClean.includes(term)) {
        score += titleWeight;
      }
      if (codeClean.includes(term)) {
        score += codeWeight;
      }
      if (descClean.includes(term)) {
        score += 1;
      }
    }

    return { ...st, score, similarity: Math.min(0.99, score / 25) };
  });

  const sorted = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);
  if (sorted.length === 0) return [];

  const topScore = sorted[0].score;

  // Confidence Thresholds:
  // 1. Absolute minimum score bar = 10 (must match a core term or strong combo)
  // 2. Relative ratio bar = 0.65 of topScore
  const MIN_ABSOLUTE_SCORE = 10;
  const MIN_RELATIVE_RATIO = 0.65;

  if (topScore < MIN_ABSOLUTE_SCORE) {
    return []; // Low confidence overall -> trigger "not in database" fallback
  }

  const filtered = sorted.filter(s => s.score >= MIN_ABSOLUTE_SCORE && s.score >= topScore * MIN_RELATIVE_RATIO);

  return filtered.slice(0, 4);
}

const TEST_QUERIES = [
  'I have an air conditioner remote control',
  'LED bulbs',
  'electric kettle',
  'children\'s toys',
  'random made-up product xyz999',
  'packaged orange juice',
  'medical diagnostic ultrasound',
];

console.log('--- REFINED EMPIRICAL FILTERING TEST RESULTS ---');
for (const q of TEST_QUERIES) {
  const results = filterRetrievedStandards(q);
  console.log(`\nQUERY: "${q}"`);
  console.log(`FOUND (${results.length}):`);
  if (results.length === 0) {
    console.log('  -> ZERO CONFIDENT MATCHES (Triggers Fallback UI)');
  } else {
    for (const r of results) {
      console.log(`  - [Score: ${r.score}] ${r.standard_code} (${r.product_category}): ${r.title}`);
    }
  }
}

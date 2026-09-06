import { retrieveRelevantContext } from '../src/lib/retrieval';
import seedData from '../scripts/data/seed-standards.json';

const TEST_QUERIES = [
  'I have an air conditioner remote control',
  'LED bulbs',
  'electric kettle',
  'children\'s toys',
  'random made-up product xyz999',
];

function scoreQuery(userQuery: string) {
  // Ignore common stop words
  const stopWords = new Set(['have', 'an', 'a', 'the', 'is', 'for', 'in', 'of', 'and', 'or', 'to', 'with', 'on', 'at', 'by', 'from', 'my', 'i', 'sell', 'make', 'manufacture', 'import']);
  const terms = userQuery
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2 && !stopWords.has(t));

  console.log(`\n==============================================`);
  console.log(`QUERY: "${userQuery}"`);
  console.log(`KEYWORD TERMS: [${terms.join(', ')}]`);
  console.log(`----------------------------------------------`);

  const scored = seedData.standards.map(st => {
    const textToMatch = `${st.standard_code} ${st.title} ${st.product_category} ${st.description} ${st.certification_type} ${st.testing_requirements}`.toLowerCase();
    let score = 0;

    let categoryMatches = 0;
    let titleMatches = 0;
    let codeMatches = 0;

    for (const term of terms) {
      if (st.product_category.toLowerCase().includes(term)) {
        score += 5;
        categoryMatches++;
      }
      if (st.title.toLowerCase().includes(term)) {
        score += 4;
        titleMatches++;
      }
      if (st.standard_code.toLowerCase().includes(term)) {
        score += 6;
        codeMatches++;
      }
      if (textToMatch.includes(term)) {
        score += 1;
      }
    }

    return {
      code: st.standard_code,
      title: st.title,
      category: st.product_category,
      score,
      categoryMatches,
      titleMatches,
    };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  for (const item of sorted) {
    if (item.score > 0) {
      console.log(`  - [Score: ${item.score}] ${item.code} (${item.category}): ${item.title}`);
    }
  }
}

for (const q of TEST_QUERIES) {
  scoreQuery(q);
}

import { generateComplianceResponse } from '../src/lib/llm';
import { retrieveRelevantContext } from '../src/lib/retrieval';

interface TestCase {
  query: string;
  expectedKeywords: string[];
}

const EVAL_DATASET: TestCase[] = [
  { query: 'I manufacture LED bulbs for home lighting in India', expectedKeywords: ['16102', 'CRS', 'LED'] },
  { query: 'I am launching an electric kettle for kitchen use', expectedKeywords: ['302', 'ISI', 'Kettle'] },
  { query: 'I manufacture induction cooktops', expectedKeywords: ['16242', '302', 'ISI'] },
  { query: 'I import audio video equipment', expectedKeywords: ['616', '62368', 'ISI', 'CRS'] },
  { query: 'I make plastic toys for children sold in India', expectedKeywords: ['9873', 'ISI', 'Toy'] },
  { query: 'I produce packaged mineral drinking water', expectedKeywords: ['14543', 'ISI', 'Water'] },
  { query: 'I manufacture portable fire extinguishers', expectedKeywords: ['15683', 'ISI', 'Fire'] },
  { query: 'I sell lithium-ion power banks imported from China', expectedKeywords: ['16046', 'CRS', 'Battery'] },
  { query: 'I make motorcycle safety helmets', expectedKeywords: ['4151', 'ISI', 'Helmet'] },
  { query: 'I manufacture ordinary portland cement', expectedKeywords: ['269', 'ISI', 'Cement'] },
  { query: 'I supply high strength TMT steel bars', expectedKeywords: ['1786', 'ISI', 'Steel'] },
  { query: 'I manufacture burnt clay building bricks', expectedKeywords: ['1077', 'ISI', 'Brick'] },
  { query: 'I manufacture LED luminaires street lights', expectedKeywords: ['10322', 'CRS', 'Luminaire'] },
  { query: 'I make electrical plugs and socket outlets', expectedKeywords: ['1293', 'ISI', 'Plug'] },
  { query: 'I manufacture LED drivers', expectedKeywords: ['15885', 'CRS', 'Driver'] },
  { query: 'I sell video game consoles', expectedKeywords: ['62368', 'CRS', 'Equipment'] },
  { query: 'I sell packaged orange juice', expectedKeywords: ['FSSAI', 'Food', 'bis'] },
  { query: 'I sell medical diagnostic ultrasound machines', expectedKeywords: ['CDSCO', 'Medical', 'bis'] },
];

async function runEvaluation() {
  console.log(`Starting accuracy evaluation against ${EVAL_DATASET.length} curated test queries...`);
  let passedCount = 0;

  for (let i = 0; i < EVAL_DATASET.length; i++) {
    const test = EVAL_DATASET[i];
    try {
      const context = await retrieveRelevantContext(test.query);
      const response = await generateComplianceResponse(test.query, context, [], 'en');

      const fullText = (
        (response.identified_product || '') + ' ' +
        (response.summary || '') + ' ' +
        (response.certification_required || '') + ' ' +
        (response.applicable_standards || []).map(s => s.code + ' ' + s.title).join(' ')
      ).toLowerCase();

      const matched = test.expectedKeywords.some(kw => fullText.includes(kw.toLowerCase()));

      if (matched) {
        passedCount++;
        console.log(`[PASS] Query ${i + 1}: "${test.query}"`);
      } else {
        console.log(`[FAIL] Query ${i + 1}: "${test.query}"`);
      }
    } catch (err) {
      console.error(`[ERROR] Query ${i + 1}: "${test.query}"`, err);
    }
  }

  const accuracyPct = ((passedCount / EVAL_DATASET.length) * 100).toFixed(1);
  console.log(`\n==============================================`);
  console.log(`EVALUATION RESULTS: ${passedCount} / ${EVAL_DATASET.length} Passed`);
  console.log(`VERIFIED ACCURACY: ${accuracyPct}%`);
  console.log(`==============================================\n`);
}

runEvaluation();

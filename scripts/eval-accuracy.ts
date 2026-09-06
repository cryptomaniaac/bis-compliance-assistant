import fs from 'fs';
import path from 'path';
import { generateComplianceResponse } from '../src/lib/llm';
import { retrieveRelevantContext } from '../src/lib/retrieval';

interface TestCase {
  id: number;
  query: string;
  category: 'single_match' | 'filtered_ambiguous' | 'out_of_scope';
  check: (ctx: any, resp: any) => { passed: boolean; reason: string };
}

const EVAL_TEST_SUITE: TestCase[] = [
  // 1-15: Clean Single-Match Queries
  {
    id: 1,
    query: 'I manufacture LED bulbs for home lighting in India',
    category: 'single_match',
    check: (ctx) => {
      const hasIS16102 = ctx.standards.some((s: any) => s.standard_code.includes('16102'));
      return { passed: hasIS16102, reason: hasIS16102 ? 'Matched IS 16102' : 'Missing IS 16102' };
    },
  },
  {
    id: 2,
    query: 'I am launching an electric kettle for kitchen use',
    category: 'single_match',
    check: (ctx) => {
      const hasIS302_201 = ctx.standards.some((s: any) => s.standard_code.includes('302-2-201'));
      return { passed: hasIS302_201, reason: hasIS302_201 ? 'Matched IS 302-2-201' : 'Missing IS 302-2-201' };
    },
  },
  {
    id: 3,
    query: 'I manufacture induction cooktops',
    category: 'single_match',
    check: (ctx) => {
      const hasIS16242 = ctx.standards.some((s: any) => s.standard_code.includes('16242'));
      return { passed: hasIS16242, reason: hasIS16242 ? 'Matched IS 16242' : 'Missing IS 16242' };
    },
  },
  {
    id: 4,
    query: 'I make plastic toys for children sold in India',
    category: 'single_match',
    check: (ctx) => {
      const hasIS9873 = ctx.standards.some((s: any) => s.standard_code.includes('9873'));
      return { passed: hasIS9873, reason: hasIS9873 ? 'Matched IS 9873' : 'Missing IS 9873' };
    },
  },
  {
    id: 5,
    query: 'I produce packaged mineral drinking water',
    category: 'single_match',
    check: (ctx) => {
      const hasIS14543 = ctx.standards.some((s: any) => s.standard_code.includes('14543'));
      return { passed: hasIS14543, reason: hasIS14543 ? 'Matched IS 14543' : 'Missing IS 14543' };
    },
  },
  {
    id: 6,
    query: 'I manufacture portable fire extinguishers',
    category: 'single_match',
    check: (ctx) => {
      const hasIS15683 = ctx.standards.some((s: any) => s.standard_code.includes('15683'));
      return { passed: hasIS15683, reason: hasIS15683 ? 'Matched IS 15683' : 'Missing IS 15683' };
    },
  },
  {
    id: 7,
    query: 'I sell lithium-ion power banks imported from China',
    category: 'single_match',
    check: (ctx) => {
      const hasIS16046 = ctx.standards.some((s: any) => s.standard_code.includes('16046'));
      return { passed: hasIS16046, reason: hasIS16046 ? 'Matched IS 16046' : 'Missing IS 16046' };
    },
  },
  {
    id: 8,
    query: 'I make motorcycle safety helmets',
    category: 'single_match',
    check: (ctx) => {
      const hasIS4151 = ctx.standards.some((s: any) => s.standard_code.includes('4151'));
      return { passed: hasIS4151, reason: hasIS4151 ? 'Matched IS 4151' : 'Missing IS 4151' };
    },
  },
  {
    id: 9,
    query: 'I manufacture ordinary portland cement',
    category: 'single_match',
    check: (ctx) => {
      const hasIS269 = ctx.standards.some((s: any) => s.standard_code.includes('269'));
      return { passed: hasIS269, reason: hasIS269 ? 'Matched IS 269' : 'Missing IS 269' };
    },
  },
  {
    id: 10,
    query: 'I supply high strength TMT steel bars',
    category: 'single_match',
    check: (ctx) => {
      const hasIS1786 = ctx.standards.some((s: any) => s.standard_code.includes('1786'));
      return { passed: hasIS1786, reason: hasIS1786 ? 'Matched IS 1786' : 'Missing IS 1786' };
    },
  },
  {
    id: 11,
    query: 'I manufacture burnt clay building bricks',
    category: 'single_match',
    check: (ctx) => {
      const hasIS1077 = ctx.standards.some((s: any) => s.standard_code.includes('1077'));
      return { passed: hasIS1077, reason: hasIS1077 ? 'Matched IS 1077' : 'Missing IS 1077' };
    },
  },
  {
    id: 12,
    query: 'I manufacture LED luminaires street lights',
    category: 'single_match',
    check: (ctx) => {
      const hasIS10322 = ctx.standards.some((s: any) => s.standard_code.includes('10322'));
      return { passed: hasIS10322, reason: hasIS10322 ? 'Matched IS 10322' : 'Missing IS 10322' };
    },
  },
  {
    id: 13,
    query: 'I make electrical plugs and socket outlets',
    category: 'single_match',
    check: (ctx) => {
      const hasIS1293 = ctx.standards.some((s: any) => s.standard_code.includes('1293'));
      return { passed: hasIS1293, reason: hasIS1293 ? 'Matched IS 1293' : 'Missing IS 1293' };
    },
  },
  {
    id: 14,
    query: 'I manufacture LED drivers',
    category: 'single_match',
    check: (ctx) => {
      const hasIS15885 = ctx.standards.some((s: any) => s.standard_code.includes('15885'));
      return { passed: hasIS15885, reason: hasIS15885 ? 'Matched IS 15885' : 'Missing IS 15885' };
    },
  },
  {
    id: 15,
    query: 'I sell video game consoles',
    category: 'single_match',
    check: (ctx) => {
      const hasIS62368 = ctx.standards.some((s: any) => s.standard_code.includes('62368'));
      return { passed: hasIS62368, reason: hasIS62368 ? 'Matched IS/IEC 62368-1' : 'Missing IS 62368' };
    },
  },

  // 16: AC Remote Style Ambiguous Query
  {
    id: 16,
    query: 'I have an air conditioner remote control',
    category: 'filtered_ambiguous',
    check: (ctx) => {
      const hasAC = ctx.standards.some((s: any) => s.standard_code.includes('1391'));
      const hasUnrelated = ctx.standards.some((s: any) =>
        s.standard_code.includes('15298') || s.standard_code.includes('3196') || s.standard_code.includes('302-2-3')
      );
      const ok = hasAC && !hasUnrelated && ctx.standards.length === 1;
      return { passed: ok, reason: ok ? 'Only IS 1391 returned (noise filtered)' : 'Failed noise filtering check' };
    },
  },

  // 17-20: Out-of-Scope / Non-BIS Queries
  {
    id: 17,
    query: 'I sell packaged orange juice',
    category: 'out_of_scope',
    check: (ctx) => {
      const ok = ctx.standards.length === 0;
      return { passed: ok, reason: ok ? 'Zero BIS standards matched (FSSAI fallback)' : 'Incorrectly matched BIS standards' };
    },
  },
  {
    id: 18,
    query: 'I sell medical diagnostic ultrasound machines',
    category: 'out_of_scope',
    check: (ctx) => {
      const ok = ctx.standards.length === 0;
      return { passed: ok, reason: ok ? 'Zero BIS standards matched (CDSCO fallback)' : 'Incorrectly matched BIS standards' };
    },
  },
  {
    id: 19,
    query: 'I manufacture prescription cardiovascular medicines',
    category: 'out_of_scope',
    check: (ctx) => {
      const ok = ctx.standards.length === 0;
      return { passed: ok, reason: ok ? 'Zero BIS standards matched (Pharma fallback)' : 'Incorrectly matched BIS standards' };
    },
  },
  {
    id: 20,
    query: 'quantum space widget xyz999',
    category: 'out_of_scope',
    check: (ctx) => {
      const ok = ctx.standards.length === 0;
      return { passed: ok, reason: ok ? 'Zero BIS standards matched (General fallback)' : 'Incorrectly matched BIS standards' };
    },
  },
];

async function runEvaluationSuite() {
  console.log(`\n===========================================================`);
  console.log(`BHARAT AI — COMPLIANCE RETRIEVAL ACCURACY EVALUATION SUITE`);
  console.log(`Running offline benchmark against ${EVAL_TEST_SUITE.length} curated queries...`);
  console.log(`===========================================================\n`);

  let passedCount = 0;
  const resultsDetail = [];

  for (const test of EVAL_TEST_SUITE) {
    try {
      const context = await retrieveRelevantContext(test.query);
      const response = await generateComplianceResponse(test.query, context, [], 'en');

      const evaluation = test.check(context, response);

      if (evaluation.passed) {
        passedCount++;
        console.log(`[PASS] Test #${test.id} (${test.category}): "${test.query}" → ${evaluation.reason}`);
      } else {
        console.log(`[FAIL] Test #${test.id} (${test.category}): "${test.query}" → ${evaluation.reason}`);
      }

      resultsDetail.push({
        id: test.id,
        query: test.query,
        category: test.category,
        passed: evaluation.passed,
        reason: evaluation.reason,
        returnedStandards: context.standards.map((s: any) => s.standard_code),
      });
    } catch (err: any) {
      console.error(`[ERROR] Test #${test.id}: "${test.query}"`, err?.message || err);
      resultsDetail.push({
        id: test.id,
        query: test.query,
        category: test.category,
        passed: false,
        reason: `Execution Error: ${err?.message || 'Unknown'}`,
        returnedStandards: [],
      });
    }
  }

  const accuracyPctNumber = (passedCount / EVAL_TEST_SUITE.length) * 100;
  const accuracyFormatted = `${accuracyPctNumber.toFixed(0)}%`;

  const summaryResult = {
    passed: passedCount,
    total: EVAL_TEST_SUITE.length,
    accuracy: accuracyFormatted,
    accuracyPct: accuracyPctNumber,
    timestamp: new Date().toISOString(),
    tests: resultsDetail,
  };

  console.log(`\n===========================================================`);
  console.log(`SUMMARY: ${passedCount} / ${EVAL_TEST_SUITE.length} PASSED`);
  console.log(`VERIFIED ACCURACY: ${accuracyFormatted}`);
  console.log(`===========================================================\n`);

  // Write results to scripts/eval_results.json
  const outputPath = path.join(__dirname, 'eval_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(summaryResult, null, 2));
  console.log(`Saved benchmark results to ${outputPath}`);
}

runEvaluationSuite().catch(console.error);

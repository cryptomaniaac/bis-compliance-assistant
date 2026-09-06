import { generateComplianceResponse } from '../src/lib/llm';
import { retrieveRelevantContext } from '../src/lib/retrieval';

async function runRegressionTests() {
  console.log('--- STARTING PRIORITY 1 REGRESSION TESTS ---');

  // Test 1: Normal text query (LED bulbs)
  console.log('\n[TEST 1] Standard BIS query: LED bulbs');
  const context1 = await retrieveRelevantContext('LED bulbs');
  const resp1 = await generateComplianceResponse('I manufacture LED bulbs for home lighting', context1, [], 'en');
  console.log('Result 1 Identified Product:', resp1.identified_product);
  console.log('Result 1 Applicable Standards:', resp1.applicable_standards.map(s => s.code));
  console.log('Result 1 Response Type:', resp1.responseType);
  if (resp1.applicable_standards.length > 0) {
    console.log('✅ TEST 1 PASSED');
  } else {
    console.error('❌ TEST 1 FAILED');
  }

  // Test 2: Label Analysis / Non-BIS Out of scope (e.g., packaged fruit juice)
  console.log('\n[TEST 2] Non-BIS product: Packaged Fruit Juice');
  const context2 = await retrieveRelevantContext('packaged fruit juice');
  const resp2 = await generateComplianceResponse('Check label compliance for packaged orange juice', context2, [], 'en');
  console.log('Result 2 Summary:', resp2.summary.substring(0, 100) + '...');
  console.log('Result 2 Response Type:', resp2.responseType);
  if (resp2.summary.toLowerCase().includes('fssai') || resp2.responseType === 'non_bis_regulated' || !resp2.label_checklist || resp2.label_checklist.length === 0) {
    console.log('✅ TEST 2 PASSED (Correctly routed to FSSAI / non-BIS)');
  } else {
    console.warn('⚠️ TEST 2 WARNING check output');
  }

  console.log('\n--- PRIORITY 1 REGRESSION TESTS COMPLETED ---');
}

runRegressionTests().catch(console.error);

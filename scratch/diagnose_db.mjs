#!/usr/bin/env node
// Diagnostic script: test scan_sessions DB operations directly using real Supabase keys
// Run with: node scratch/diagnose_db.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local
const envLines = readFileSync('.env.local', 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? supabaseUrl.slice(0, 40) + '...' : 'MISSING');
console.log('Anon Key:', supabaseAnonKey ? supabaseAnonKey.slice(0, 20) + '...' : 'MISSING');
console.log('Service Role Key:', supabaseServiceKey ? supabaseServiceKey.slice(0, 20) + '...' : 'MISSING');
console.log();

import ws from 'ws';

const wsOptions = { realtime: { transport: ws } };
const adminClient = createClient(supabaseUrl, supabaseServiceKey, wsOptions);
const anonClient = createClient(supabaseUrl, supabaseAnonKey, wsOptions);

async function run() {
  // 1. INSERT a new session with adminClient
  console.log('--- Step 1: INSERT session with adminClient ---');
  const { data: insertData, error: insertError } = await adminClient
    .from('scan_sessions')
    .insert({ status: 'waiting' })
    .select('id')
    .single();

  if (insertError) {
    console.error('INSERT FAILED:', JSON.stringify(insertError, null, 2));
    return;
  }
  const sessionId = insertData.id;
  console.log('Inserted session ID:', sessionId);

  // 2. Poll (SELECT) with anonClient (as phone would)
  console.log('\n--- Step 2: SELECT with anonClient (phone poll) ---');
  const { data: pollData1, error: pollErr1 } = await anonClient
    .from('scan_sessions')
    .select('status, image_url')
    .eq('id', sessionId)
    .maybeSingle();
  console.log('Anon poll result:', pollData1, pollErr1 ? '| Error:' + JSON.stringify(pollErr1) : '');

  // 3. UPDATE with adminClient (simulating /api/scan/complete)
  console.log('\n--- Step 3: UPDATE status=completed with adminClient ---');
  const { data: updateData, error: updateError } = await adminClient
    .from('scan_sessions')
    .update({ status: 'completed' })
    .eq('id', sessionId)
    .select('id');
  console.log('Update result:', updateData, updateError ? '| Error:' + JSON.stringify(updateError) : '');
  console.log('Rows updated:', updateData ? updateData.length : 0);

  // 4. Poll again with anonClient — must see 'completed'
  console.log('\n--- Step 4: SELECT with anonClient after update ---');
  const { data: pollData2, error: pollErr2 } = await anonClient
    .from('scan_sessions')
    .select('status, image_url')
    .eq('id', sessionId)
    .maybeSingle();
  console.log('Anon poll result:', pollData2, pollErr2 ? '| Error:' + JSON.stringify(pollErr2) : '');

  if (pollData2?.status === 'completed') {
    console.log('\n✅ BUG 1 FIX CONFIRMED: Poll correctly returns status=completed');
  } else {
    console.log('\n❌ BUG 1 STILL BROKEN: Poll returned status:', pollData2?.status ?? 'null');
    console.log('   This means RLS is blocking either the UPDATE or the SELECT by anonClient.');
    
    // 5. Try SELECT with adminClient to see if row itself is correct
    console.log('\n--- Step 5: SELECT with adminClient to check row directly ---');
    const { data: adminPoll, error: adminPollErr } = await adminClient
      .from('scan_sessions')
      .select('id, status')
      .eq('id', sessionId)
      .maybeSingle();
    console.log('Admin poll result:', adminPoll, adminPollErr ? '| Error:' + JSON.stringify(adminPollErr) : '');
  }

  // Cleanup
  await adminClient.from('scan_sessions').delete().eq('id', sessionId);
  console.log('\nCleaned up test session.');
}

run().catch(console.error);

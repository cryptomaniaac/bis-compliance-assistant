import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

// Polyfill WebSocket for Node 20
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing column existence via Supabase REST...');

async function run() {
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });
  
  // Try querying scan_type column
  const { data, error } = await client
    .from('scan_sessions')
    .select('id, status, scan_type')
    .limit(1);

  if (error) {
    console.log('QueryResult error:', error.message);
  } else {
    console.log('SUCCESS! scan_type column exists. Sample row:', data);
  }
}

run();

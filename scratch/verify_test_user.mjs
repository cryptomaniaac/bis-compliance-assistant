import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class {};
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await client
    .from('users')
    .update({ email_verified: true })
    .eq('email', 'authtest@example.com')
    .select('id, email, email_verified');

  console.log('Update result:', data, error);
}

run();

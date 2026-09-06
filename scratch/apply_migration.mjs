import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Use raw fetch to REST or RPC
async function applyMigration() {
  console.log('Testing column existence or applying migration via Supabase REST...');
  
  // Try inserting a row with scan_type = 'product'
  const res = await fetch(`${supabaseUrl}/rest/v1/scan_sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      status: 'waiting',
      scan_type: 'product'
    })
  });

  const data = await res.json();
  if (res.ok) {
    console.log('SUCCESS! scan_type column exists and accepts values. Test row created:', data[0]?.id);
    // Delete test row
    if (data[0]?.id) {
      await fetch(`${supabaseUrl}/rest/v1/scan_sessions?id=eq.${data[0].id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        }
      });
      console.log('Cleaned up test row.');
    }
  } else {
    console.log('Column check result:', data);
  }
}

applyMigration();

import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import seedData from '../../../../../scripts/data/seed-standards.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').trim().toLowerCase();

  // 1. Try querying Supabase
  if (isSupabaseConfigured && supabaseAdmin) {
    let supabaseQuery = supabaseAdmin
      .from('bis_standards')
      .select('id, standard_code, title, product_category, description, certification_type, testing_requirements, source_url')
      .order('standard_code', { ascending: true });

    if (query) {
      supabaseQuery = supabaseQuery.or(
        `standard_code.ilike.%${query}%,title.ilike.%${query}%,product_category.ilike.%${query}%,description.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery.limit(50);
    if (!error && data && data.length > 0) {
      // Deduplicate by standard_code
      const uniqueMap = new Map();
      data.forEach(item => {
        const key = item.standard_code ? item.standard_code.trim().toLowerCase() : '';
        if (key && !uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });
      return NextResponse.json({ standards: Array.from(uniqueMap.values()) });
    }
  }

  // 2. Local search fallback
  if (!query) {
    const uniqueMap = new Map();
    seedData.standards.forEach(item => {
      const key = item.standard_code ? item.standard_code.trim().toLowerCase() : '';
      if (key && !uniqueMap.has(key)) uniqueMap.set(key, item);
    });
    return NextResponse.json({ standards: Array.from(uniqueMap.values()) });
  }

  const filtered = seedData.standards.filter(st => {
    const text = `${st.standard_code} ${st.title} ${st.product_category} ${st.description} ${st.certification_type}`.toLowerCase();
    return text.includes(query);
  });

  const uniqueMap = new Map();
  filtered.forEach(item => {
    const key = item.standard_code ? item.standard_code.trim().toLowerCase() : '';
    if (key && !uniqueMap.has(key)) uniqueMap.set(key, item);
  });

  return NextResponse.json({ standards: Array.from(uniqueMap.values()) });
}

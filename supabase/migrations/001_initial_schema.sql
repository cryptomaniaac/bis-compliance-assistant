-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. bis_standards table
CREATE TABLE IF NOT EXISTS bis_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_code TEXT NOT NULL,
  title TEXT NOT NULL,
  product_category TEXT NOT NULL,
  description TEXT NOT NULL,
  certification_type TEXT NOT NULL,
  testing_requirements TEXT NOT NULL,
  embedding VECTOR(768),
  source_url TEXT NOT NULL DEFAULT 'https://www.services.bis.gov.in',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. certification_schemes table
CREATE TABLE IF NOT EXISTS certification_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_name TEXT NOT NULL,
  description TEXT NOT NULL,
  application_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  fee_info TEXT,
  embedding VECTOR(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  structured_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bis_standards_category ON bis_standards(product_category);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Cosine Similarity Match Function for bis_standards
CREATE OR REPLACE FUNCTION match_bis_standards(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  standard_code TEXT,
  title TEXT,
  product_category TEXT,
  description TEXT,
  certification_type TEXT,
  testing_requirements TEXT,
  source_url TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    standard_code,
    title,
    product_category,
    description,
    certification_type,
    testing_requirements,
    source_url,
    1 - (bis_standards.embedding <=> query_embedding) AS similarity
  FROM bis_standards
  WHERE 1 - (bis_standards.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Cosine Similarity Match Function for certification_schemes
CREATE OR REPLACE FUNCTION match_certification_schemes(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  scheme_name TEXT,
  description TEXT,
  application_steps JSONB,
  required_documents JSONB,
  fee_info TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    scheme_name,
    description,
    application_steps,
    required_documents,
    fee_info,
    1 - (certification_schemes.embedding <=> query_embedding) AS similarity
  FROM certification_schemes
  WHERE 1 - (certification_schemes.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

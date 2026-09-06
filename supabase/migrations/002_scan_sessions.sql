-- Migration 002: QR-Code Cross-Device Scan Sessions
-- Run this in Supabase Dashboard > SQL Editor before deploying the scan feature.

-- 1. scan_sessions table
CREATE TABLE IF NOT EXISTS scan_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'uploaded', 'processed')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast realtime lookups
CREATE INDEX IF NOT EXISTS idx_scan_sessions_status ON scan_sessions(status);
CREATE INDEX IF NOT EXISTS idx_scan_sessions_conversation ON scan_sessions(conversation_id);

-- 2. Enable Supabase Realtime for scan_sessions
-- Run this in your Supabase Dashboard under Database > Replication if not already enabled:
-- ALTER PUBLICATION supabase_realtime ADD TABLE scan_sessions;

-- 3. Create Supabase Storage bucket for product scan images
-- (Run this via Dashboard > Storage > Create Bucket if SQL approach not supported)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-scans',
  'product-scans',
  true,
  10485760, -- 10MB max
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Policy: Allow anyone to upload to product-scans bucket
CREATE POLICY IF NOT EXISTS "Allow public uploads to product-scans"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'product-scans');

-- 5. Storage Policy: Allow anyone to read from product-scans bucket (for Gemini to fetch)
CREATE POLICY IF NOT EXISTS "Allow public reads from product-scans"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-scans');

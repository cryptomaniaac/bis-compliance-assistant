-- ============================================================================
-- BIS Assist - Custom Auth Database Schema Migration
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for ultra-fast user lookups by email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. Create OTP Verification Codes Table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INT DEFAULT 0 NOT NULL,
  last_sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for OTP verification lookup by email and code
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes(email);

-- 3. Row Level Security (RLS) Configuration
-- We enable RLS on both tables so public anon keys CANNOT access passwords or OTPs.
-- All auth reads and writes are performed securely server-side via SUPABASE_SERVICE_ROLE_KEY.

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Deny all public access by default (Server Service Role bypasses RLS automatically)
DROP POLICY IF EXISTS "No public access to users" ON public.users;
CREATE POLICY "No public access to users" ON public.users FOR ALL USING (false);

DROP POLICY IF EXISTS "No public access to otp_codes" ON public.otp_codes;
CREATE POLICY "No public access to otp_codes" ON public.otp_codes FOR ALL USING (false);

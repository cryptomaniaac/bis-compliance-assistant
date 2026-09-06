-- Migration 004: Add scan_type column to scan_sessions table for Label/Packaging visual check feature
-- Default value 'product' guarantees 100% backward compatibility for existing and default scan sessions.

ALTER TABLE scan_sessions ADD COLUMN IF NOT EXISTS scan_type TEXT NOT NULL DEFAULT 'product';

-- Index for filtering by scan_type if needed
CREATE INDEX IF NOT EXISTS idx_scan_sessions_scan_type ON scan_sessions(scan_type);

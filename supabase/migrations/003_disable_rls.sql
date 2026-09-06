-- Migration 003: Allow public access / disable RLS on data tables for hackathon/demo environment
ALTER TABLE IF EXISTS bis_standards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS certification_schemes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scan_sessions DISABLE ROW LEVEL SECURITY;

-- Alternatively, allow public select/insert if RLS remains enabled:
CREATE POLICY "Allow public select on bis_standards" ON bis_standards FOR SELECT USING (true);
CREATE POLICY "Allow public insert on bis_standards" ON bis_standards FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on certification_schemes" ON certification_schemes FOR SELECT USING (true);
CREATE POLICY "Allow public insert on certification_schemes" ON certification_schemes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on conversations" ON conversations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on messages" ON messages FOR INSERT WITH CHECK (true);

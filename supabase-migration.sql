-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Set up Row Level Security (RLS) for waitlist
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Clips Table (Clipboard History)
CREATE TABLE IF NOT EXISTS clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  display_value TEXT,
  type TEXT DEFAULT 'TEXT',
  is_sensitive BOOLEAN DEFAULT false,
  source_device TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Clips
CREATE POLICY "Users can view their own clips" ON clips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips" ON clips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips" ON clips
  FOR DELETE USING (auth.uid() = user_id);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'extension', 'cli', 'android', 'vscode'
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Devices
CREATE POLICY "Users can view their own devices" ON devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own devices" ON devices
  FOR ALL USING (auth.uid() = user_id);

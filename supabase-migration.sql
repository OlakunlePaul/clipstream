-- Create the waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Set up Row Level Security (RLS)
-- We enable RLS but don't add policies since we use the service_role key 
-- to bypass it in the API route for signups.
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

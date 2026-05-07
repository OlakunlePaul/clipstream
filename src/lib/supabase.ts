import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// We use service role key for the API route to bypass RLS for waitlist signups
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

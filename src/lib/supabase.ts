import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Public client for use in browser components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for use in API routes (Node.js/Server components only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

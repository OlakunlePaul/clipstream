import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// We use service role key for the API route to bypass RLS for waitlist signups
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp in seconds
  user: {
    id: string;
    email: string;
    user_metadata: {
      avatar_url?: string;
      full_name?: string;
    };
  };
}

export async function getSession(): Promise<Session | null> {
  const { session } = await chrome.storage.local.get("session");
  if (!session) return null;

  // Refresh logic: check if within 5 minutes of expiry
  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at - now < 300) {
    return null;
  }

  return session;
}

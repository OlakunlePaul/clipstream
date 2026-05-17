import { createClient, Session } from "@supabase/supabase-js";

export type { Session };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

// Custom storage adapter for Chrome Extensions
const chromeStorageAdapter = {
  getItem: (key: string) => {
    return chrome.storage.local.get(key).then(res => res[key] || null);
  },
  setItem: (key: string, value: string) => {
    return chrome.storage.local.set({ [key]: value });
  },
  removeItem: (key: string) => {
    return chrome.storage.local.remove(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});


export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) return null;

  // Refresh logic is now handled automatically by supabase-js
  return session;
}

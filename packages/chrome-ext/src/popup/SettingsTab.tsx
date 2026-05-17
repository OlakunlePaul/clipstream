import { useState, useEffect } from "react";
import { Session, supabase } from "../lib/supabase";
import { LogOut, Zap, Bell, Shield, ArrowUpRight, Check } from "lucide-react";

export function SettingsTab({ session }: { session: Session }) {
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dailySyncs, setDailySyncs] = useState(0);
  const syncLimit = 200;

  useEffect(() => {
    // 1. Load preferences
    chrome.storage.local.get(["autoSync", "notifications"], (res) => {
      if (res.autoSync !== undefined) setAutoSync(res.autoSync);
      if (res.notifications !== undefined) setNotifications(res.notifications);
    });

    // 2. Fetch real daily syncs from Supabase
    const fetchSyncs = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from("clips")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .gte("created_at", today.toISOString());

      if (!error && count !== null) {
        setDailySyncs(count);
      }
    };

    fetchSyncs();
  }, [session.user.id]);

  const handleToggleAutoSync = (val: boolean) => {
    setAutoSync(val);
    chrome.storage.local.set({ autoSync: val });
  };

  const handleToggleNotifications = (val: boolean) => {
    setNotifications(val);
    chrome.storage.local.set({ notifications: val });
  };

  const handleSignOut = () => {
    chrome.runtime.sendMessage({ type: "SIGN_OUT" }, () => {
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-bold">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="p-4 bg-dark-lighter rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
            {(session.user.email?.[0] || "?").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{session.user.email || "Unknown User"}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-gray-400 uppercase">Free Plan</span>
            </div>
          </div>
        </div>

        {/* Sync Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Daily Syncs</span>
            <span className="text-white font-medium">{dailySyncs} / {syncLimit}</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((dailySyncs / syncLimit) * 100, 100)}%` }} 
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-1">
          <div className="flex items-center justify-between p-3 bg-dark-lighter rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <RefreshCwIcon className="w-4 h-4 text-primary" />
              <span className="text-sm">Auto-sync enabled</span>
            </div>
            <Toggle active={autoSync} onClick={() => handleToggleAutoSync(!autoSync)} />
          </div>

          <div className="flex items-center justify-between p-3 bg-dark-lighter rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm">Notifications</span>
            </div>
            <Toggle active={notifications} onClick={() => handleToggleNotifications(!notifications)} />
          </div>
        </div>

        {/* Pro Upgrade */}
        <button className="w-full p-4 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-left relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <h3 className="font-bold text-sm">Upgrade to Pro</h3>
            </div>
            <p className="text-[11px] text-white/80 pr-12">
              Unlimited syncs, E2E encryption, and custom device names.
            </p>
          </div>
          <ArrowUpRight className="absolute right-4 top-4 w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
        </button>

        {/* Secondary Actions */}
        <div className="space-y-1 pt-2">
          <button className="w-full flex items-center justify-between p-3 text-gray-400 hover:text-white transition-colors text-sm">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4" />
              <span>Security & Privacy</span>
            </div>
            <ArrowUpRight className="w-3 h-3" />
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-3 text-red-500/80 hover:text-red-500 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out of ClipStream</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-4 rounded-full p-0.5 transition-colors ${active ? "bg-primary" : "bg-white/10"}`}
    >
      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${active ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}

function RefreshCwIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
    </svg>
  );
}

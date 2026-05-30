import { useState, useEffect } from "react";
import { Session, supabase } from "../lib/supabase";
import { LogOut, Zap, Bell, Shield, ArrowUpRight, Check } from "lucide-react";

export function SettingsTab({ session }: { session: Session }) {
  const [autoSync, setAutoSync] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [dailySyncs, setDailySyncs] = useState(0);
  const [tier, setTier] = useState<"free" | "pro" | "lifetime">("free");
  const [isActivating, setIsActivating] = useState(false);
  const [activationKey, setActivationKey] = useState("");
  const [activationStatus, setActivationStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [activationError, setActivationError] = useState("");
  const syncLimit = 200;

  useEffect(() => {
    // 1. Load preferences
    chrome.storage.local.get(["autoSync", "notifications"], (res) => {
      if (res.autoSync !== undefined) setAutoSync(res.autoSync);
      if (res.notifications !== undefined) setNotifications(res.notifications);
    });

    // 2. Fetch profile tier and daily syncs
    const fetchData = async () => {
      // Fetch tier
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", session.user.id)
        .single();
      
      if (!profileError && profile) {
        setTier(profile.tier as "free" | "pro" | "lifetime");
      }

      // Fetch daily syncs
      const dateStr = new Date().toISOString().split('T')[0];
      const { data: usage, error: usageError } = await supabase
        .from("usage_stats")
        .select("sync_count")
        .eq("user_id", session.user.id)
        .eq("date", dateStr)
        .single();

      if (!usageError && usage) {
        setDailySyncs(usage.sync_count);
      } else {
        setDailySyncs(0);
      }
    };

    fetchData();
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

  const handleActivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationKey.trim()) return;

    setActivationStatus("loading");
    setActivationError("");

    try {
      const { data, error } = await supabase.rpc("activate_license_key", {
        p_key_code: activationKey.trim(),
      });

      if (error) throw error;

      if (data === "SUCCESS") {
        setActivationStatus("success");
        // Refetch profile to update the UI tier
        const { data: profile } = await supabase
          .from("profiles")
          .select("tier")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setTier(profile.tier as "free" | "pro" | "lifetime");
        }
        setTimeout(() => {
          setIsActivating(false);
          setActivationStatus("idle");
          setActivationKey("");
        }, 1500);
      } else if (data === "KEY_NOT_FOUND") {
        setActivationStatus("error");
        setActivationError("Invalid activation key. Please check and try again.");
      } else if (data === "KEY_ALREADY_USED") {
        setActivationStatus("error");
        setActivationError("This license key has already been redeemed.");
      } else {
        setActivationStatus("error");
        setActivationError("Activation failed. Unknown response code.");
      }
    } catch (err: any) {
      console.error(err);
      setActivationStatus("error");
      setActivationError(err.message || "Failed to connect to the activation server.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark text-text">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-bold">Settings</h2>
        <span className="font-mono text-xs text-muted">// clipstream.v1</span>
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
              {tier === "free" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-400 uppercase tracking-wider">
                  Free Plan
                </span>
              )}
              {tier === "pro" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/25 text-primary border border-primary/30 uppercase tracking-wider">
                  Pro Plan
                </span>
              )}
              {tier === "lifetime" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                  Lifetime Plan
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sync Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Daily Syncs</span>
            <span className="text-white font-medium">
              {tier === "free" ? `${dailySyncs} / ${syncLimit}` : `${dailySyncs} (Unlimited)`}
            </span>
          </div>
          {tier === "free" && (
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${Math.min((dailySyncs / syncLimit) * 100, 100)}%` }} 
              />
            </div>
          )}
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

        {/* Dynamic License Card */}
        {tier === "free" ? (
          <div className="space-y-3">
            {!isActivating ? (
              <button 
                onClick={() => setIsActivating(true)}
                className="w-full p-4 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-left relative overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                    <h3 className="font-bold text-sm text-white">Upgrade to Pro</h3>
                  </div>
                  <p className="text-[11px] text-white/80 pr-12">
                    Unlimited syncs, E2E encryption, and custom device names.
                  </p>
                </div>
                <ArrowUpRight className="absolute right-4 top-4 w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
              </button>
            ) : (
              <div className="p-4 bg-dark-lighter border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs text-primary font-bold">// activate key</span>
                  </div>
                  <button 
                    onClick={() => { setIsActivating(false); setActivationStatus("idle"); }}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {activationStatus === "success" ? (
                  <div className="flex items-center gap-2 text-xs text-green font-semibold py-2">
                    <Check className="w-4 h-4" /> Account upgraded successfully!
                  </div>
                ) : (
                  <form onSubmit={handleActivateKey} className="space-y-3">
                    <input
                      type="text"
                      placeholder="CS-INVITE-XXXX-XXXX"
                      value={activationKey}
                      onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
                      className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary"
                      disabled={activationStatus === "loading"}
                      required
                    />

                    {activationStatus === "error" && (
                      <p className="text-[10px] text-red-500 font-semibold leading-relaxed">
                        {activationError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={activationStatus === "loading"}
                      className="w-full py-2 bg-primary text-black font-semibold text-xs rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {activationStatus === "loading" ? (
                        <>
                          <RefreshCwIcon className="w-3 h-3 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        "Redeem Code"
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-dark-lighter border border-white/5 rounded-2xl flex items-center gap-3">
            {tier === "pro" ? (
              <Zap className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <Shield className="w-5 h-5 text-purple-400 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold text-white">
                {tier === "pro" ? "Pro Subscription Active" : "Lifetime Access Active"}
              </h4>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                {tier === "pro" 
                  ? "Enjoy unlimited syncing, up to 10 devices, and 90-day history retention."
                  : "Enjoy unlimited syncing, unlimited devices, and 90-day history retention! Thanks for being a founding developer."}
              </p>
            </div>
          </div>
        )}

        {/* Secondary Actions */}
        <div className="space-y-1 pt-2">
          <button 
            onClick={() => chrome.tabs.create({ url: "https://clipstream.dev/privacy" })}
            className="w-full flex items-center justify-between p-3 text-gray-400 hover:text-white transition-colors text-sm"
          >
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

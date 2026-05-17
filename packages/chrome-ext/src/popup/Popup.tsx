import { useEffect, useState } from "react";
import { Session, supabase } from "../lib/supabase";
import { History, Laptop, Settings, RefreshCw } from "lucide-react";
import { HistoryTab } from "@/popup/HistoryTab";
import { DevicesTab } from "@/popup/DevicesTab";
import { SettingsTab } from "@/popup/SettingsTab";
// Production Popup UI

type Tab = "history" | "devices" | "settings";

export function Popup() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("history");

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes (shared via storage adapter)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark">
        <RefreshCw className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <SignInView onSignIn={() => window.location.reload()} />;
  }

  return (
    <div className="flex flex-col h-full bg-dark">
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "devices" && <DevicesTab />}
        {activeTab === "settings" && <SettingsTab session={session} />}
      </div>

      {/* Navigation Bar */}
      <nav className="flex items-center justify-around border-t border-white/5 bg-dark-lighter py-3">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "history" ? "text-primary" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium">History</span>
        </button>
        <button
          onClick={() => setActiveTab("devices")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "devices" ? "text-primary" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Laptop className="w-5 h-5" />
          <span className="text-[10px] font-medium">Devices</span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "settings" ? "text-primary" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </nav>
    </div>
  );
}

function SignInView({ onSignIn }: { onSignIn: () => void }) {
  const handleSignIn = () => {
    chrome.runtime.sendMessage({ type: "SIGN_IN" }, (response) => {
      if (response?.success) {
        window.location.reload();
      } else {
        console.error("Sign in failed:", response?.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-dark p-8 text-center">
      <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
        <div className="text-primary font-bold text-3xl">C</div>
      </div>
      <h2 className="text-xl font-bold mb-2">Welcome to ClipStream</h2>
      <p className="text-sm text-gray-400 mb-8">
        Copy anywhere. Paste everywhere. Sign in to start syncing your devices.
      </p>
      <button
        onClick={handleSignIn}
        className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  );
}

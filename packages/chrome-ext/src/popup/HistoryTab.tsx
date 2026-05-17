import { useEffect, useState, useRef } from "react";
import { Search, Clipboard, Lock, Trash2, CheckCircle2, RefreshCw } from "lucide-react";
import { ContentType } from "@clipstream/shared/src/classifier";
import { supabase } from "../lib/supabase";

interface HistoryItem {
  id: string;
  content: string;
  display_value: string;
  type: ContentType;
  created_at: string;
  is_sensitive: boolean;
  source_device?: string;
}

export function HistoryTab() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("clips")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(true);
  }, []);

  const filteredHistory = history.filter((item) =>
    item.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = async (item: HistoryItem) => {
    await navigator.clipboard.writeText(item.content);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    // Optimistic Update: Remove from UI immediately
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    
    // Background Update: Delete from cloud
    try {
      const { error } = await supabase.from("clips").delete().eq("id", id);
      if (error) throw error;
      
      // Also update local storage if needed
      await chrome.storage.local.set({ history: updated });
    } catch (error) {
      console.error("Failed to delete clip:", error);
      // Optional: rollback if needed, but usually better to just log
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => Math.min(prev + 1, filteredHistory.length - 1));
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        e.preventDefault();
      } else if (e.key === "Enter" && filteredHistory[selectedIndex]) {
        handleCopy(filteredHistory[selectedIndex]);
      } else if (e.key === "Delete" && filteredHistory[selectedIndex]) {
        handleDelete(filteredHistory[selectedIndex].id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredHistory, selectedIndex]);

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search history..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-lighter border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* History List */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-xs">Fetching clips...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
            <Clipboard className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">No clips yet — copy something and it will appear here</p>
          </div>
        ) : (
          filteredHistory.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleCopy(item)}
              className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                selectedIndex === index
                   ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                  : "bg-dark-lighter border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getTypeStyles(item.type)}`}>
                    {item.type}
                  </span>
                  {item.is_sensitive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 uppercase tracking-wider">
                      <Lock className="w-2.5 h-2.5" />
                      Sensitive
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500">
                  {formatRelativeTime(new Date(item.created_at).getTime())}
                </span>
              </div>

              <p className="text-sm text-gray-300 break-all line-clamp-2">
                {item.is_sensitive ? item.display_value : item.content.slice(0, 60)}
                {!item.is_sensitive && item.content.length > 60 && "..."}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-gray-600">
                  via {item.source_device ? "another device" : "this device"}
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {copiedId === item.id && (
                <div className="absolute inset-0 bg-primary/90 rounded-2xl flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-200">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="font-bold text-sm text-white">Copied</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function getTypeStyles(type: ContentType) {
  switch (type) {
    case ContentType.API_KEY: return "bg-orange-500/10 text-orange-500";
    case ContentType.COMMAND: return "bg-blue-500/10 text-blue-500";
    case ContentType.CODE: return "bg-purple-500/10 text-purple-500";
    case ContentType.URL: return "bg-green-500/10 text-green-500";
    case ContentType.FILE_PATH: return "bg-yellow-500/10 text-yellow-500";
    case ContentType.ERROR_TRACE: return "bg-red-500/10 text-red-500";
    default: return "bg-gray-500/10 text-gray-500";
  }
}

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

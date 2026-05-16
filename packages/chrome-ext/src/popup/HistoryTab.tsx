import { useEffect, useState, useRef } from "react";
import { Search, Clipboard, Lock, Trash2, CheckCircle2 } from "lucide-react";
import { ContentType } from "@clipstream/shared/src/classifier";

interface HistoryItem {
  id: string;
  content: string;
  displayValue: string;
  type: ContentType;
  timestamp: number;
  isSensitive: boolean;
  sourceDevice?: string;
}

export function HistoryTab() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chrome.storage.local.get("history", (data) => {
      setHistory(data.history || []);
    });
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
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    await chrome.storage.local.set({ history: updated });
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
        {filteredHistory.length === 0 ? (
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
                  {item.isSensitive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 uppercase tracking-wider">
                      <Lock className="w-2.5 h-2.5" />
                      Sensitive
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>

              <p className="text-sm text-gray-300 break-all line-clamp-2">
                {item.isSensitive ? item.displayValue : item.content.slice(0, 60)}
                {!item.isSensitive && item.content.length > 60 && "..."}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <span className="text-[10px] text-gray-600">
                  via {item.sourceDevice || "this device"}
                </span>
                <button
                  onClick={(e) => {
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

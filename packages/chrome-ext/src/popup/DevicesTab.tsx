import { useEffect, useState } from "react";
import { Laptop, Smartphone, Monitor, Globe, MoreVertical, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Device {
  id: string;
  name: string;
  platform: "extension" | "cli" | "android" | "vscode";
  last_seen: string;
}

export function DevicesTab() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const storageData = await chrome.storage.local.get("deviceId");
      setCurrentDeviceId(storageData.deviceId || null);

      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .order("last_seen", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-bold">Connected Devices</h2>
        <p className="text-xs text-gray-500">Manage your synced clipboard network</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3 opacity-50">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-xs">Fetching devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <p className="text-xs">No devices connected</p>
          </div>
        ) : (
          devices.map((device) => {
            const isCurrent = device.id === currentDeviceId;
            return (
              <div
                key={device.id}
                className="flex items-center gap-4 p-4 bg-dark-lighter rounded-2xl border border-white/5 group hover:border-white/10 transition-colors"
              >
                <div className={`p-3 rounded-xl ${isCurrent ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-400"}`}>
                  {getPlatformIcon(device.platform)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{device.name}</h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                        This Device
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Last seen {formatRelativeTime(new Date(device.last_seen).getTime())}
                  </p>
                </div>

                <button className="p-1 text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-dark-lighter/50 text-center">
        <button 
          onClick={fetchDevices}
          className="text-xs text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh devices
        </button>
      </div>
    </div>
  );
}

function getPlatformIcon(platform: Device["platform"]) {
  switch (platform) {
    case "extension": return <Globe className="w-5 h-5" />;
    case "vscode": return <Monitor className="w-5 h-5" />;
    case "android": return <Smartphone className="w-5 h-5" />;
    case "cli": return <Laptop className="w-5 h-5" />;
    default: return <Globe className="w-5 h-5" />;
  }
}

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

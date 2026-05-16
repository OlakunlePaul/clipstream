import { useEffect, useState } from "react";
import { Laptop, Smartphone, Monitor, Globe, MoreVertical } from "lucide-react";

interface Device {
  id: string;
  name: string;
  platform: "extension" | "cli" | "android" | "vscode";
  lastSeen: number;
  isCurrent: boolean;
}

export function DevicesTab() {
  const [devices, setDevices] = useState<Device[]>([
    { id: "1", name: "MacBook Pro", platform: "extension", lastSeen: Date.now(), isCurrent: true },
    { id: "2", name: "Work Station", platform: "vscode", lastSeen: Date.now() - 3600000, isCurrent: false },
    { id: "3", name: "Pixel 8 Pro", platform: "android", lastSeen: Date.now() - 86400000, isCurrent: false },
  ]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-bold">Connected Devices</h2>
        <p className="text-xs text-gray-500">Manage your synced clipboard network</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-center gap-4 p-4 bg-dark-lighter rounded-2xl border border-white/5 group hover:border-white/10 transition-colors"
          >
            <div className={`p-3 rounded-xl ${device.isCurrent ? "bg-primary/10 text-primary" : "bg-white/5 text-gray-400"}`}>
              {getPlatformIcon(device.platform)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{device.name}</h3>
                {device.isCurrent && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary uppercase">
                    This Device
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Last seen {formatRelativeTime(device.lastSeen)}
              </p>
            </div>

            <button className="p-1 text-gray-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-dark-lighter/50 text-center">
        <button className="text-xs text-primary font-bold hover:underline">
          + Add another device
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

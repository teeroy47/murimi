import { Bell, Search, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SyncStatus = "online" | "offline" | "syncing";

const syncConfig: Record<SyncStatus, { label: string; icon: React.ReactNode; className: string }> = {
  online: {
    label: "Online",
    icon: <Wifi className="h-3 w-3" />,
    className: "bg-success/15 text-success border-success/30",
  },
  offline: {
    label: "Offline",
    icon: <WifiOff className="h-3 w-3" />,
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  syncing: {
    label: "Syncing",
    icon: <RefreshCw className="h-3 w-3 animate-spin" />,
    className: "bg-info/15 text-info border-info/30",
  },
};

export function TopBar() {
  const syncStatus: SyncStatus = "online";
  const sync = syncConfig[syncStatus];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card px-4">
      <SidebarTrigger className="-ml-1" />

      <Select defaultValue="green-acres">
        <SelectTrigger className="w-[180px] h-9 text-sm font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="green-acres">Green Acres Farm</SelectItem>
          <SelectItem value="sunrise">Sunrise Piggery</SelectItem>
        </SelectContent>
      </Select>

      <Badge variant="outline" className={`gap-1 text-xs ${sync.className}`}>
        {sync.icon}
        {sync.label}
      </Badge>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pig ID, pen, batch..."
            className="h-9 w-[240px] pl-8 text-sm"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
            3
          </span>
        </Button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          JD
        </div>
      </div>
    </header>
  );
}

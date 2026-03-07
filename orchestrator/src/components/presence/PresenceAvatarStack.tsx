"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PresenceEntry } from "@/hooks/usePresence";

function formatPresenceLocation(location?: string | null) {
  if (!location) return null;
  if (location.includes("/documents/")) return "Viewing a document";
  if (location.includes("/projects/")) return "In a project";
  if (location.includes("/signals")) return "In signals";
  if (location.includes("/inbox")) return "In inbox";
  if (location.includes("/agents")) return "In agents";
  return location;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PresenceAvatarStack({
  entries,
  max = 4,
  size = "sm",
}: {
  entries: PresenceEntry[];
  max?: number;
  size?: "sm" | "md";
}) {
  const visible = entries.slice(0, max);
  const overflow = Math.max(0, entries.length - visible.length);
  const avatarSize = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";

  if (!entries.length) return null;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((entry) => (
          <Avatar
            key={entry._id}
            className={`${avatarSize} border-2 border-background`}
            title={
              formatPresenceLocation(entry.location)
                ? `${entry.displayName} • ${formatPresenceLocation(entry.location)}`
                : entry.displayName
            }
          >
            <AvatarImage src={entry.avatarUrl ?? undefined} alt={entry.displayName} />
            <AvatarFallback>{initials(entry.displayName)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-2 text-xs text-muted-foreground">+{overflow}</span>
      )}
    </div>
  );
}

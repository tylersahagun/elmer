"use client";

import * as React from "react";
import { Loader2, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContextPeek } from "@/hooks/useContextPeek";
import { useUIStore } from "@/lib/store";

interface ContextPeekPopoverProps {
  workspaceId: string;
  entityType: "project" | "document" | "signal";
  entityId: string;
  entityName: string;
  children: React.ReactNode;
  className?: string;
}

export function ContextPeekPopover({
  workspaceId,
  entityType,
  entityId,
  entityName,
  children,
  className,
}: ContextPeekPopoverProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [popoverPos, setPopoverPos] = React.useState<{ top: number; left: number } | null>(null);
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { summary, isLoading, trigger } = useContextPeek(workspaceId, entityType, entityId);
  const openElmerPanelWithContext = useUIStore((s) => s.openElmerPanelWithContext);

  const handleMouseEnter = React.useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPopoverPos({
          top: rect.bottom + 6,
          left: rect.left,
        });
      }
      setIsVisible(true);
      void trigger();
    }, 500);
  }, [trigger]);

  const handleMouseLeave = React.useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleChatAboutThis = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsVisible(false);
      openElmerPanelWithContext(entityType, entityId, entityName);
    },
    [openElmerPanelWithContext, entityType, entityId, entityName],
  );

  const showPopover = isVisible && (isLoading || !!summary);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn("relative", className)}
      >
        {children}
      </div>

      {showPopover && popoverPos && (
        <div
          onMouseEnter={() => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            setIsVisible(true);
          }}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "fixed",
            top: popoverPos.top,
            left: popoverPos.left,
            zIndex: 9999,
            maxWidth: 280,
            minWidth: 200,
          }}
          className={cn(
            "rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-xl p-3",
            "animate-in fade-in slide-in-from-top-1 duration-150",
          )}
        >
          <p className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="truncate">{entityName}</span>
          </p>

          {isLoading && !summary ? (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground py-1">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              <span>Generating summary…</span>
            </div>
          ) : summary ? (
            <p className="text-[11px] text-slate-300 leading-relaxed">{summary}</p>
          ) : null}

          <button
            onClick={handleChatAboutThis}
            className={cn(
              "mt-2.5 w-full flex items-center justify-center gap-1.5",
              "text-[11px] font-medium text-purple-300 hover:text-purple-200",
              "px-2 py-1.5 rounded-md bg-purple-500/15 hover:bg-purple-500/25",
              "border border-purple-500/20 hover:border-purple-500/40",
              "transition-colors duration-150",
            )}
          >
            <MessageSquare className="w-3 h-3" />
            Chat about this →
          </button>
        </div>
      )}
    </>
  );
}

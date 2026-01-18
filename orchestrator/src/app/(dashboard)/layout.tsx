"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { DisplaySettingsProvider, type DisplayMode } from "@/components/display";

// Get display mode from localStorage for initial render
function getInitialDisplayMode(): DisplayMode {
  if (typeof window === "undefined") return "immersive";
  try {
    const stored = localStorage.getItem("elmer-display-mode");
    if (stored === "focus" || stored === "immersive") {
      return stored;
    }
  } catch {
    // Ignore localStorage errors
  }
  return "immersive";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [displayMode, setDisplayMode] = useState<DisplayMode>("immersive");

  // Load display mode from localStorage on mount
  useEffect(() => {
    setDisplayMode(getInitialDisplayMode());
  }, []);

  // Persist display mode to localStorage
  const handleDisplayModeChange = (mode: DisplayMode) => {
    setDisplayMode(mode);
    try {
      localStorage.setItem("elmer-display-mode", mode);
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DisplaySettingsProvider
        initialMode={displayMode}
        onModeChange={handleDisplayModeChange}
      >
        {children}
      </DisplaySettingsProvider>
    </QueryClientProvider>
  );
}

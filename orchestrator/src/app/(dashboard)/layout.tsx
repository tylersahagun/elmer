"use client";

import { useState } from "react";
import { AppShellProviders } from "@/components/providers/AppShellProviders";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import {
  DisplaySettingsProvider,
  type DisplayMode,
} from "@/components/display";

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
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() =>
    getInitialDisplayMode(),
  );

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
    <AppShellProviders>
      <ReactQueryProvider>
        <DisplaySettingsProvider
          initialMode={displayMode}
          onModeChange={handleDisplayModeChange}
        >
          {children}
        </DisplaySettingsProvider>
      </ReactQueryProvider>
    </AppShellProviders>
  );
}

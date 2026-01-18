"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type DisplayMode = "immersive" | "focus";

interface DisplaySettingsContextValue {
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  isFocusMode: boolean;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextValue | null>(null);

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (!context) {
    // Return safe defaults when used outside provider (e.g., during SSR or in isolated components)
    return {
      displayMode: "immersive" as DisplayMode,
      setDisplayMode: () => {},
      isFocusMode: false,
    };
  }
  return context;
}

interface DisplaySettingsProviderProps {
  children: React.ReactNode;
  initialMode?: DisplayMode;
  onModeChange?: (mode: DisplayMode) => void;
}

export function DisplaySettingsProvider({
  children,
  initialMode = "immersive",
  onModeChange,
}: DisplaySettingsProviderProps) {
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(initialMode);

  // Sync with initial mode changes (e.g., from workspace settings)
  useEffect(() => {
    setDisplayModeState(initialMode);
  }, [initialMode]);

  // Apply/remove focus-mode class on document body
  useEffect(() => {
    const root = document.documentElement;
    if (displayMode === "focus") {
      root.classList.add("focus-mode");
    } else {
      root.classList.remove("focus-mode");
    }
  }, [displayMode]);

  const setDisplayMode = (mode: DisplayMode) => {
    setDisplayModeState(mode);
    onModeChange?.(mode);
  };

  const value = React.useMemo(
    () => ({
      displayMode,
      setDisplayMode,
      isFocusMode: displayMode === "focus",
    }),
    [displayMode]
  );

  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

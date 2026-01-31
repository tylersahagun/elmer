"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface UseResizablePanelOptions {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
  storageKey?: string;
  direction?: "left" | "right";
}

interface UseResizablePanelReturn {
  width: number;
  isResizing: boolean;
  handleResizeStart: (e: React.MouseEvent) => void;
  setWidth: (width: number) => void;
}

export function useResizablePanel({
  minWidth = 200,
  maxWidth = 500,
  defaultWidth = 280,
  storageKey,
  direction = "right",
}: UseResizablePanelOptions = {}): UseResizablePanelReturn {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Load saved width from localStorage
  useEffect(() => {
    if (storageKey) {
      const savedWidth = localStorage.getItem(storageKey);
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          queueMicrotask(() => setWidth(parsed));
        }
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  // Save width to localStorage
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, width.toString());
    }
  }, [width, storageKey]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width],
  );

  // Handle resize move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta =
        direction === "right"
          ? e.clientX - startXRef.current
          : startXRef.current - e.clientX;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidthRef.current + delta),
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Add cursor style to body while resizing
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, direction, minWidth, maxWidth]);

  return {
    width,
    isResizing,
    handleResizeStart,
    setWidth,
  };
}

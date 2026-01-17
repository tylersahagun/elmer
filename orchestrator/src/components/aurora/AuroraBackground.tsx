"use client";

import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  showRadialGradient?: boolean;
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <>
      <div className={cn("aurora-bg pointer-events-none", className)} aria-hidden="true">
        {showRadialGradient && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
        )}
      </div>
      {children}
    </>
  );
}

export function AuroraGlow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("aurora-glow", className)}>
      {children}
    </div>
  );
}

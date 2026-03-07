"use client";

import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { TourProvider } from "@/components/onboarding/tour/TourProvider";

export function AppShellProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClientProvider>
      <SessionProvider>
        <TourProvider>{children}</TourProvider>
      </SessionProvider>
    </ConvexClientProvider>
  );
}

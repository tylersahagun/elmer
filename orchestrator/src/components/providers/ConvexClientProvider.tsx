"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { validateConvexDeploymentUrl } from "@/lib/auth/convex";

function RuntimeConfigurationError({ detail }: { detail: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="font-heading text-2xl">Runtime configuration error</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Elmer could not initialize its Convex client for this route.
        </p>
        <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 font-mono text-sm text-amber-100">
          {detail}
        </p>
      </div>
    </div>
  );
}

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convexUrlCheck = validateConvexDeploymentUrl(convexUrl);
  const convex = useMemo(
    () =>
      convexUrlCheck.ok && convexUrlCheck.normalizedUrl
        ? new ConvexReactClient(convexUrlCheck.normalizedUrl)
        : null,
    [convexUrlCheck.ok, convexUrlCheck.normalizedUrl],
  );

  if (!convex) {
    return <RuntimeConfigurationError detail={convexUrlCheck.detail} />;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

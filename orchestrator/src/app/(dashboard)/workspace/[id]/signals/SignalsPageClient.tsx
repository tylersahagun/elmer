"use client";

import { useCallback, useEffect, useState } from "react";
import { useConvexAuth, useQuery as useConvexQuery } from "convex/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { SimpleNavbar } from "@/components/chrome/Navbar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { canRunConvexQuery } from "@/lib/auth/convex";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { SignalSuggestionsBanner } from "@/components/signals/SignalSuggestionsBanner";
import { OrphanSignalsBanner } from "@/components/signals/OrphanSignalsBanner";
import { SignalClustersPanel } from "@/components/signals/SignalClustersPanel";
import { CreateSignalModal } from "@/components/signals/CreateSignalModal";
import {
  SignalDetailModal,
  type Signal,
} from "@/components/signals/SignalDetailModal";
import { getSignalIdFromSearchParam } from "@/lib/projects/navigation";
import { getWorkspacePathSegment } from "@/lib/workspaces/path";

interface SignalsPageClientProps {
  workspaceId: string;
}

export function SignalsPageClient({ workspaceId }: SignalsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isLoaded, isSignedIn } = useCurrentUser();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const canLoadConvexData = canRunConvexQuery({
    isClerkLoaded: isLoaded,
    isSignedIn,
    isConvexAuthenticated,
  });

  const workspace = useConvexQuery(
    api.workspaces.get,
    canLoadConvexData
      ? { workspaceId: workspaceId as Id<"workspaces"> }
      : "skip",
  );

  const workspacePath = getWorkspacePathSegment(workspace);
  const selectedSignalId = getSignalIdFromSearchParam(searchParams.get("id"));

  const syncSignalQueryParam = useCallback(
    (signalId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (signalId) {
        params.set("id", signalId);
      } else {
        params.delete("id");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const mapSignalDetail = useCallback((signal: {
    id?: string;
    _id?: string;
    workspaceId: string;
    verbatim: string;
    interpretation?: string | null;
    status: string;
    source: string;
    sourceRef?: string | null;
    sourceMetadata?: Record<string, unknown> | null;
    severity?: string | null;
    frequency?: string | null;
    userSegment?: string | null;
    createdAt?: string;
    updatedAt?: string;
    processedAt?: string | null;
    _creationTime?: number;
  }): Signal => ({
    id: signal.id ?? signal._id ?? "",
    workspaceId: signal.workspaceId,
    verbatim: signal.verbatim,
    interpretation: signal.interpretation ?? null,
    status:
      signal.status === "pending"
        ? "new"
        : signal.status === "assigned"
          ? "linked"
          : (signal.status as Signal["status"]),
    source: signal.source,
    sourceRef: signal.sourceRef ?? null,
    sourceMetadata: signal.sourceMetadata ?? null,
    severity: signal.severity ?? null,
    frequency: signal.frequency ?? null,
    userSegment: signal.userSegment ?? null,
    createdAt:
      signal.createdAt ??
      new Date(signal._creationTime ?? Date.now()).toISOString(),
    updatedAt:
      signal.updatedAt ??
      new Date(signal._creationTime ?? Date.now()).toISOString(),
    processedAt: signal.processedAt ?? null,
  }), []);

  useEffect(() => {
    if (!selectedSignalId || selectedSignal?.id === selectedSignalId) {
      return;
    }

    let cancelled = false;
    const loadSignal = async () => {
      const res = await fetch(`/api/signals/${selectedSignalId}`);
      if (!res.ok) {
        syncSignalQueryParam(null);
        return;
      }
      const signal = await res.json();
      if (!cancelled) {
        setSelectedSignal(mapSignalDetail(signal));
      }
    };

    void loadSignal();
    return () => {
      cancelled = true;
    };
  }, [mapSignalDetail, selectedSignal?.id, selectedSignalId, syncSignalQueryParam]);

  return (
    <>
      <SimpleNavbar path={`~/workspace/${workspacePath}/signals`} />
      <div className="container mx-auto py-6 px-4" data-testid="signals-page">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Signals</h1>
          <p className="text-sm text-muted-foreground">
            Review workspace evidence, spot clusters, and drill into individual signals.
          </p>
        </div>

        {/* AI Suggestions Banner */}
        <SignalSuggestionsBanner workspaceId={workspaceId} />

        {/* Orphan Signals Banner - shows when orphans exist with project suggestions (MAINT-01) */}
        <OrphanSignalsBanner workspaceId={workspaceId} />

        {/* Signal Clusters Discovery */}
        <SignalClustersPanel workspaceId={workspaceId} />

        <SignalsTable
          workspaceId={workspaceId}
          onViewSignal={(signal) => {
            setSelectedSignal(signal as Signal);
            syncSignalQueryParam(signal.id);
          }}
          onCreateSignal={() => setShowCreateModal(true)}
        />

        <CreateSignalModal
          workspaceId={workspaceId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />

        <SignalDetailModal
          signal={selectedSignal}
          isOpen={!!selectedSignal && !!selectedSignalId}
          onClose={() => {
            setSelectedSignal(null);
            syncSignalQueryParam(null);
          }}
          onUpdate={() => {}}
          onDelete={() => {
            setSelectedSignal(null);
            syncSignalQueryParam(null);
          }}
        />
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import { SignalsTable } from "@/components/signals/SignalsTable";
import { SignalSuggestionsBanner } from "@/components/signals/SignalSuggestionsBanner";
import { OrphanSignalsBanner } from "@/components/signals/OrphanSignalsBanner";
import { SignalClustersPanel } from "@/components/signals/SignalClustersPanel";
import { CreateSignalModal } from "@/components/signals/CreateSignalModal";
import { SignalDetailModal, type Signal } from "@/components/signals/SignalDetailModal";

interface SignalsPageClientProps {
  workspaceId: string;
}

export function SignalsPageClient({ workspaceId }: SignalsPageClientProps) {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="container mx-auto py-6 px-4">
      {/* AI Suggestions Banner */}
      <SignalSuggestionsBanner workspaceId={workspaceId} />

      {/* Orphan Signals Banner - shows when orphans exist with project suggestions (MAINT-01) */}
      <OrphanSignalsBanner workspaceId={workspaceId} />

      {/* Signal Clusters Discovery */}
      <SignalClustersPanel workspaceId={workspaceId} />

      <SignalsTable
        workspaceId={workspaceId}
        onViewSignal={(signal) => setSelectedSignal(signal as Signal)}
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
        isOpen={!!selectedSignal}
        onClose={() => setSelectedSignal(null)}
        onUpdate={() => {}}
        onDelete={() => setSelectedSignal(null)}
      />
    </div>
  );
}

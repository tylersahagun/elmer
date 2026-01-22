"use client";

import { useState } from "react";
import { SignalsTable } from "@/components/signals/SignalsTable";

interface Signal {
  id: string;
  verbatim: string;
  interpretation?: string | null;
  status: "new" | "reviewed" | "linked" | "archived";
  source: string;
  severity?: string | null;
  createdAt: string;
}

interface SignalsPageClientProps {
  workspaceId: string;
}

export function SignalsPageClient({ workspaceId }: SignalsPageClientProps) {
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // For debugging - will be replaced by actual modals in 12-03-PLAN
  console.log("Selected signal:", selectedSignal);
  console.log("Show create modal:", showCreateModal);

  return (
    <div className="container mx-auto py-6 px-4">
      <SignalsTable
        workspaceId={workspaceId}
        onViewSignal={setSelectedSignal}
        onCreateSignal={() => setShowCreateModal(true)}
      />

      {/* Modals will be added in 12-03-PLAN */}
    </div>
  );
}

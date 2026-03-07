"use client";

import { Badge } from "@/components/ui/badge";
import type { InitiativeStatusSnapshot, MeasurementReadiness } from "@/lib/status/types";

const ORDER: MeasurementReadiness[] = ["instrumented", "partial", "missing"];

interface MeasurementReadinessPanelProps {
  initiatives: InitiativeStatusSnapshot[];
  coverage: Record<MeasurementReadiness, number>;
}

export function MeasurementReadinessPanel({
  initiatives,
  coverage,
}: MeasurementReadinessPanelProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-medium">Measurement readiness</h3>
        <div className="flex gap-2">
          {ORDER.map((state) => (
            <Badge key={state} variant="outline">
              {state}: {coverage[state]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {initiatives.map((initiative) => (
          <div key={initiative.id} className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">{initiative.name}</div>
              <Badge variant="secondary">{initiative.measurementReadiness}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {initiative.measurementReadiness === "instrumented"
                ? "Metrics document and release thresholds are configured."
                : initiative.measurementReadiness === "partial"
                  ? "Some measurement infrastructure exists, but thresholds or current values are incomplete."
                  : "No measurement contract is configured yet."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

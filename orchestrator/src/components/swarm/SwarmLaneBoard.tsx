"use client";

import type { SwarmLane } from "@/lib/swarm/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SwarmLaneBoardProps {
  lanes: SwarmLane[];
  onChange: (lanes: SwarmLane[]) => void;
}

export function SwarmLaneBoard({ lanes, onChange }: SwarmLaneBoardProps) {
  const updateLane = (index: number, lane: SwarmLane) =>
    onChange(lanes.map((item, itemIndex) => (itemIndex === index ? lane : item)));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {lanes.map((lane, index) => (
        <div key={lane.id} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-medium">{lane.name}</div>
            <Badge variant="secondary">{lane.status}</Badge>
          </div>

          <select
            value={lane.status}
            onChange={(event) =>
              updateLane(index, {
                ...lane,
                status: event.target.value as SwarmLane["status"],
              })
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="active">active</option>
            <option value="ready">ready</option>
            <option value="blocked">blocked</option>
            <option value="gated">gated</option>
            <option value="holding">holding</option>
          </select>

          <div className="flex flex-wrap gap-2">
            {lane.linkedIssues.map((issue) => (
              <Badge key={issue} variant="outline">
                {issue}
              </Badge>
            ))}
          </div>

          <Input
            value={lane.owner}
            onChange={(event) =>
              updateLane(index, { ...lane, owner: event.target.value })
            }
            placeholder="Lane owner"
          />

          <Textarea
            value={lane.focus}
            onChange={(event) =>
              updateLane(index, { ...lane, focus: event.target.value })
            }
            rows={4}
            placeholder="Lane focus"
          />

          <div className="space-y-1 text-sm">
            <div className="font-medium">Dependencies</div>
            <ul className="list-disc pl-5 text-muted-foreground">
              {lane.dependencies.length > 0 ? (
                lane.dependencies.map((dependency) => (
                  <li key={dependency}>{dependency}</li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>

          <div className="space-y-1 text-sm">
            <div className="font-medium">Exit criteria</div>
            <ul className="list-disc pl-5 text-muted-foreground">
              {lane.exitCriteria.length > 0 ? (
                lane.exitCriteria.map((criterion) => (
                  <li key={criterion}>{criterion}</li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </div>

          <Textarea
            value={lane.evidence.join("\n")}
            onChange={(event) =>
              updateLane(index, {
                ...lane,
                evidence: event.target.value
                  .split("\n")
                  .map((value) => value.trim())
                  .filter(Boolean),
              })
            }
            rows={3}
            placeholder="One evidence line per line"
          />

          <Textarea
            value={lane.nextAction}
            onChange={(event) =>
              updateLane(index, { ...lane, nextAction: event.target.value })
            }
            rows={3}
            placeholder="Next action"
          />

          <Textarea
            value={lane.handoffRequest || ""}
            onChange={(event) =>
              updateLane(index, {
                ...lane,
                handoffRequest: event.target.value || null,
              })
            }
            rows={3}
            placeholder="Handoff request"
          />

          <Textarea
            value={lane.blockers.join("\n")}
            onChange={(event) =>
              updateLane(index, {
                ...lane,
                blockers: event.target.value
                  .split("\n")
                  .map((value) => value.trim())
                  .filter(Boolean),
              })
            }
            rows={3}
            placeholder="One blocker per line"
          />
        </div>
      ))}
    </div>
  );
}

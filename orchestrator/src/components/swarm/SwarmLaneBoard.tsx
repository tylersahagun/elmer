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
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {lanes.map((lane, index) => (
        <div key={lane.id} className="rounded-lg border p-4 space-y-3">
          <div className="font-medium">{lane.name}</div>
          <div className="flex flex-wrap gap-2">
            {lane.jobs.map((job) => (
              <Badge key={job.id} variant="outline">
                {job.label}
              </Badge>
            ))}
          </div>
          <Input
            value={lane.owner}
            onChange={(event) =>
              onChange(
                lanes.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, owner: event.target.value }
                    : item,
                ),
              )
            }
            placeholder="Lane owner"
          />
          <Textarea
            value={lane.focus}
            onChange={(event) =>
              onChange(
                lanes.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, focus: event.target.value }
                    : item,
                ),
              )
            }
            rows={4}
            placeholder="Lane focus"
          />
          <Textarea
            value={lane.blockers.join("\n")}
            onChange={(event) =>
              onChange(
                lanes.map((item, itemIndex) =>
                  itemIndex === index
                    ? {
                        ...item,
                        blockers: event.target.value
                          .split("\n")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      }
                    : item,
                ),
              )
            }
            rows={3}
            placeholder="One blocker per line"
          />
        </div>
      ))}
    </div>
  );
}

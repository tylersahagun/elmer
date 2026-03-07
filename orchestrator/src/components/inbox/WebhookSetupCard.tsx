"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WebhookSetupCardProps {
  workspaceId: string;
}

export function WebhookSetupCard({ workspaceId }: WebhookSetupCardProps) {
  const examplePayload = useMemo(
    () =>
      JSON.stringify(
        {
          workspaceId,
          payload: {
            type: "transcript",
            title: "Customer interview - Q1",
            content: "Full transcript text here...",
            participants: ["PM", "Customer"],
          },
        },
        null,
        2,
      ),
    [workspaceId],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook intake</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>
          Route transcripts, notes, and external feedback directly into the inbox
          using <code>/api/webhooks/ingest</code> or normalized signals through{" "}
          <code>/api/webhooks/signals</code>.
        </p>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          {examplePayload}
        </pre>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            navigator.clipboard.writeText("/api/webhooks/ingest")
          }
        >
          Copy ingest endpoint
        </Button>
      </CardContent>
    </Card>
  );
}

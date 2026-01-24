"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Workflow } from "lucide-react";
import type { DocumentType, KnowledgebaseType } from "@/lib/db/schema";

interface Column {
  id: string;
  displayName: string;
  enabled: boolean;
  order: number;
}

interface PipelineSettingsCardProps {
  automationMode: "manual" | "auto_to_stage" | "auto_all";
  setAutomationMode: (value: "manual" | "auto_to_stage" | "auto_all") => void;
  automationStopStage: string;
  setAutomationStopStage: (value: string) => void;
  automationNotifyStage: string;
  setAutomationNotifyStage: (value: string) => void;
  knowledgebaseMapping: Record<string, string>;
  setKnowledgebaseMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  columns: Column[];
}

const knowledgebaseOptions: Array<{ value: KnowledgebaseType; label: string }> = [
  { value: "company_context", label: "Company Context" },
  { value: "strategic_guardrails", label: "Guardrails" },
  { value: "personas", label: "Personas" },
  { value: "roadmap", label: "Roadmap" },
  { value: "rules", label: "Rules" },
];

const documentTypeLabels: Record<DocumentType, string> = {
  research: "Research",
  prd: "PRD",
  design_brief: "Design Brief",
  engineering_spec: "Engineering Spec",
  gtm_brief: "GTM Brief",
  prototype_notes: "Prototype Notes",
  jury_report: "Jury Report",
  state: "State",
};

export function PipelineSettingsCard({
  automationMode,
  setAutomationMode,
  automationStopStage,
  setAutomationStopStage,
  automationNotifyStage,
  setAutomationNotifyStage,
  knowledgebaseMapping,
  setKnowledgebaseMapping,
  columns,
}: PipelineSettingsCardProps) {
  const sortedDocumentTypes = useMemo(
    () => (Object.keys(documentTypeLabels) as DocumentType[]).sort(),
    []
  );

  const enabledColumns = columns
    .filter((column) => column.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="w-5 h-5" />
          Pipeline Configuration
        </CardTitle>
        <CardDescription>
          Control how projects flow through the pipeline automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Automation Depth */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Automation Depth</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Automation Mode</Label>
              <Select
                value={automationMode}
                onValueChange={(value) =>
                  setAutomationMode(value as "manual" | "auto_to_stage" | "auto_all")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual - Require approval for each stage</SelectItem>
                  <SelectItem value="auto_to_stage">Auto until stage - Run automatically then pause</SelectItem>
                  <SelectItem value="auto_all">Auto all stages - Fully automated pipeline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {automationMode === "auto_to_stage" && (
              <div className="space-y-2">
                <Label>Stop At Stage</Label>
                <Select
                  value={automationStopStage || "none"}
                  onValueChange={(value) => setAutomationStopStage(value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select stage...</SelectItem>
                    {enabledColumns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Pipeline will pause for approval at this stage.
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Notify At Stage</Label>
            <Select
              value={automationNotifyStage || "always"}
              onValueChange={(value) => setAutomationNotifyStage(value === "always" ? "" : value)}
            >
              <SelectTrigger className="max-w-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always notify</SelectItem>
                {enabledColumns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    Only at {column.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Knowledge Base Publishing */}
        <div className="space-y-4 pt-4 border-t">
          <div>
            <h4 className="text-sm font-medium">Knowledge Base Publishing</h4>
            <p className="text-xs text-muted-foreground mt-1">
              When jobs generate documents, they can automatically be copied to your knowledge base.
              Map each document type to a section, or leave as &quot;None&quot; to keep documents only in the project folder.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDocumentTypes.map((docType) => (
              <div key={docType} className="space-y-1.5">
                <Label className="text-sm">
                  {documentTypeLabels[docType]}
                </Label>
                <Select
                  value={knowledgebaseMapping[docType] || "none"}
                  onValueChange={(value) =>
                    setKnowledgebaseMapping((prev) => ({
                      ...prev,
                      [docType]: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {knowledgebaseOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

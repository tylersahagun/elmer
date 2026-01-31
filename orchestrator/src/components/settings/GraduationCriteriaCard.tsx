"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Save,
  Loader2,
  FileText,
  Users,
  Sparkles,
  BarChart3,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import type { GraduationCriteria, DocumentType } from "@/lib/db/schema";

interface ColumnConfig {
  id: string;
  stage: string;
  displayName: string;
  graduationCriteria?: GraduationCriteria;
  enforceGraduation?: boolean;
}

interface GraduationCriteriaCardProps {
  workspaceId: string;
}

const documentTypeOptions: { value: DocumentType; label: string }[] = [
  { value: "research", label: "Research" },
  { value: "prd", label: "PRD" },
  { value: "design_brief", label: "Design Brief" },
  { value: "engineering_spec", label: "Engineering Spec" },
  { value: "gtm_brief", label: "GTM Brief" },
  { value: "prototype_notes", label: "Prototype Notes" },
  { value: "jury_report", label: "Jury Report" },
  { value: "metrics", label: "Metrics" },
];

export function GraduationCriteriaCard({
  workspaceId,
}: GraduationCriteriaCardProps) {
  const queryClient = useQueryClient();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [editState, setEditState] = useState<
    Record<
      string,
      {
        criteria: GraduationCriteria;
        enforced: boolean;
      }
    >
  >({});

  // Fetch column configs
  const { data: columns, isLoading } = useQuery<ColumnConfig[]>({
    queryKey: ["column-configs", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/columns`);
      if (!res.ok) throw new Error("Failed to fetch columns");
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({
      columnId,
      criteria,
      enforced,
    }: {
      columnId: string;
      criteria: GraduationCriteria;
      enforced: boolean;
    }) => {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graduationCriteria: criteria,
          enforceGraduation: enforced,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["column-configs", workspaceId],
      });
      toast.success("Graduation criteria saved");
    },
    onError: () => {
      toast.error("Failed to save graduation criteria");
    },
  });

  const getEditState = (column: ColumnConfig) => {
    return (
      editState[column.id] || {
        criteria: column.graduationCriteria || {},
        enforced: column.enforceGraduation || false,
      }
    );
  };

  const updateEditState = (
    columnId: string,
    field: keyof GraduationCriteria | "enforced",
    value: unknown,
  ) => {
    setEditState((prev) => {
      const current = prev[columnId] || {
        criteria:
          columns?.find((c) => c.id === columnId)?.graduationCriteria || {},
        enforced:
          columns?.find((c) => c.id === columnId)?.enforceGraduation || false,
      };

      if (field === "enforced") {
        return {
          ...prev,
          [columnId]: { ...current, enforced: value as boolean },
        };
      }

      return {
        ...prev,
        [columnId]: {
          ...current,
          criteria: { ...current.criteria, [field]: value },
        },
      };
    });
  };

  const handleSave = (column: ColumnConfig) => {
    const state = getEditState(column);
    saveMutation.mutate({
      columnId: column.id,
      criteria: state.criteria,
      enforced: state.enforced,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          <CardTitle>Graduation Criteria</CardTitle>
        </div>
        <CardDescription>
          Define requirements projects must meet to advance between stages. When
          enforced, projects cannot move forward without meeting all criteria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {columns?.map((column) => {
          const state = getEditState(column);
          const isExpanded = expandedStage === column.id;
          const hasCriteria = Object.values(state.criteria).some(
            (v) =>
              v !== undefined &&
              v !== null &&
              v !== false &&
              (Array.isArray(v) ? v.length > 0 : true),
          );

          return (
            <Collapsible
              key={column.id}
              open={isExpanded}
              onOpenChange={(open) => setExpandedStage(open ? column.id : null)}
            >
              <div className="border rounded-lg">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-t-lg transition-colors">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{column.displayName}</span>
                      <Badge variant="outline" className="text-xs">
                        {column.stage}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {state.enforced && (
                        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Enforced
                        </Badge>
                      )}
                      {hasCriteria && !state.enforced && (
                        <Badge variant="secondary">Criteria defined</Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4 border-t">
                    {/* Enforcement toggle */}
                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                      <div>
                        <Label className="font-medium">
                          Enforce Graduation
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Block projects from advancing without meeting criteria
                        </p>
                      </div>
                      <Switch
                        checked={state.enforced}
                        onCheckedChange={(checked) =>
                          updateEditState(column.id, "enforced", checked)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Required Documents */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4" />
                          Required Documents
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              <span className="truncate">
                                {(state.criteria.requiredDocuments?.length ||
                                  0) > 0
                                  ? `${state.criteria.requiredDocuments?.length} selected`
                                  : "Select documents..."}
                              </span>
                              <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>
                              Document Types
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {documentTypeOptions.map((doc) => (
                              <DropdownMenuCheckboxItem
                                key={doc.value}
                                checked={state.criteria.requiredDocuments?.includes(
                                  doc.value,
                                )}
                                onCheckedChange={(checked) => {
                                  const current =
                                    state.criteria.requiredDocuments || [];
                                  const newDocs = checked
                                    ? [...current, doc.value]
                                    : current.filter((d) => d !== doc.value);
                                  updateEditState(
                                    column.id,
                                    "requiredDocuments",
                                    newDocs,
                                  );
                                }}
                                onSelect={(e) => e.preventDefault()}
                              >
                                {doc.label}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Min Approval Rate */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4" />
                          Min Approval Rate (%)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="e.g., 70"
                          value={
                            state.criteria.minApprovalRate !== undefined
                              ? Math.round(state.criteria.minApprovalRate * 100)
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            updateEditState(
                              column.id,
                              "minApprovalRate",
                              val ? Number(val) / 100 : undefined,
                            );
                          }}
                        />
                      </div>

                      {/* Min Jury Evaluations */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4" />
                          Min Jury Evaluations
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 1"
                          value={state.criteria.minJuryEvaluations ?? ""}
                          onChange={(e) =>
                            updateEditState(
                              column.id,
                              "minJuryEvaluations",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </div>

                      {/* Min Signals Processed */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4" />
                          Min Signals Processed
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g., 3"
                          value={state.criteria.minSignalsProcessed ?? ""}
                          onChange={(e) =>
                            updateEditState(
                              column.id,
                              "minSignalsProcessed",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Boolean toggles */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${column.id}-prototype`}
                          checked={state.criteria.requirePrototype || false}
                          onCheckedChange={(checked) =>
                            updateEditState(
                              column.id,
                              "requirePrototype",
                              checked,
                            )
                          }
                        />
                        <Label
                          htmlFor={`${column.id}-prototype`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Sparkles className="w-4 h-4" />
                          Require Prototype
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${column.id}-metrics`}
                          checked={state.criteria.requireMetricsGate || false}
                          onCheckedChange={(checked) =>
                            updateEditState(
                              column.id,
                              "requireMetricsGate",
                              checked,
                            )
                          }
                        />
                        <Label
                          htmlFor={`${column.id}-metrics`}
                          className="flex items-center gap-2 text-sm"
                        >
                          <BarChart3 className="w-4 h-4" />
                          Require Metrics Gate
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id={`${column.id}-override`}
                          checked={state.criteria.allowManualOverride ?? true}
                          onCheckedChange={(checked) =>
                            updateEditState(
                              column.id,
                              "allowManualOverride",
                              checked,
                            )
                          }
                        />
                        <Label
                          htmlFor={`${column.id}-override`}
                          className="text-sm"
                        >
                          Allow Manual Override
                        </Label>
                      </div>
                    </div>

                    {/* Save button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => handleSave(column)}
                        disabled={saveMutation.isPending}
                      >
                        {saveMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Criteria
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}

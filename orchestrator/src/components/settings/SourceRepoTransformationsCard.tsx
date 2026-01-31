"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { SourceRepoTransformation, PathMapping } from "@/lib/db/schema";

interface SourceRepoTransformationsCardProps {
  transformations: SourceRepoTransformation[];
  onChange: (transformations: SourceRepoTransformation[]) => void;
  onSync?: (sourceRepo: string) => Promise<void>;
}

// Default pm-workspace transformation
const PM_WORKSPACE_TRANSFORMATION: SourceRepoTransformation = {
  sourceRepo: "tylersahagun/pm-workspace",
  name: "PM Workspace",
  enabled: true,
  pathMappings: [
    { from: "pm-workspace-docs/", to: "elmer-docs/" },
    { from: "@pm-workspace-docs/", to: "@elmer-docs/" },
    {
      from: "elephant-ai/web/src/components/prototypes/",
      to: "prototypes/src/components/",
    },
    {
      from: "elephant-ai/web/src/components/",
      to: "prototypes/src/components/",
    },
    {
      from: "cd elephant-ai && npm run build-storybook -w web",
      to: "cd prototypes && npm run build-storybook",
    },
    {
      from: "cd elephant-ai && npm run chromatic -w web",
      to: "cd prototypes && npm run chromatic",
    },
    { from: "tylersahagun/pm-workspace", to: "tylersahagun/elmer" },
  ],
  chromaticConfig: {
    token: "chpt_46b823319a0135f",
    appId: "696c2c54e35ea5bca2a772d8",
    productionUrl: "https://main--696c2c54e35ea5bca2a772d8.chromatic.com",
  },
};

export function SourceRepoTransformationsCard({
  transformations,
  onChange,
  onSync,
}: SourceRepoTransformationsCardProps) {
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState<string | null>(null);

  const toggleExpanded = (repo: string) => {
    setExpandedRepos((prev) => {
      const next = new Set(prev);
      if (next.has(repo)) {
        next.delete(repo);
      } else {
        next.add(repo);
      }
      return next;
    });
  };

  const addPmWorkspaceDefault = () => {
    if (
      transformations.some(
        (t) => t.sourceRepo === PM_WORKSPACE_TRANSFORMATION.sourceRepo,
      )
    ) {
      return;
    }
    onChange([...transformations, PM_WORKSPACE_TRANSFORMATION]);
  };

  const addCustomTransformation = () => {
    const newTransformation: SourceRepoTransformation = {
      sourceRepo: "",
      name: "New Transformation",
      enabled: false,
      pathMappings: [],
    };
    onChange([...transformations, newTransformation]);
  };

  const updateTransformation = (
    index: number,
    updates: Partial<SourceRepoTransformation>,
  ) => {
    const updated = [...transformations];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeTransformation = (index: number) => {
    onChange(transformations.filter((_, i) => i !== index));
  };

  const addPathMapping = (index: number) => {
    const updated = [...transformations];
    updated[index] = {
      ...updated[index],
      pathMappings: [
        ...(updated[index].pathMappings || []),
        { from: "", to: "" },
      ],
    };
    onChange(updated);
  };

  const updatePathMapping = (
    transformIndex: number,
    mappingIndex: number,
    updates: Partial<PathMapping>,
  ) => {
    const updated = [...transformations];
    const mappings = [...(updated[transformIndex].pathMappings || [])];
    mappings[mappingIndex] = { ...mappings[mappingIndex], ...updates };
    updated[transformIndex] = {
      ...updated[transformIndex],
      pathMappings: mappings,
    };
    onChange(updated);
  };

  const removePathMapping = (transformIndex: number, mappingIndex: number) => {
    const updated = [...transformations];
    updated[transformIndex] = {
      ...updated[transformIndex],
      pathMappings:
        updated[transformIndex].pathMappings?.filter(
          (_, i) => i !== mappingIndex,
        ) || [],
    };
    onChange(updated);
  };

  const handleSync = async (sourceRepo: string) => {
    if (!onSync) return;
    setSyncing(sourceRepo);
    try {
      await onSync(sourceRepo);
    } finally {
      setSyncing(null);
    }
  };

  const hasPmWorkspace = transformations.some(
    (t) => t.sourceRepo === PM_WORKSPACE_TRANSFORMATION.sourceRepo,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Source Repository Transformations</span>
          {!hasPmWorkspace && (
            <Button size="sm" variant="outline" onClick={addPmWorkspaceDefault}>
              <Plus className="h-4 w-4 mr-1" />
              Add PM Workspace
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Configure path transformations when syncing agents from external
          repositories. Transformations adapt paths, URLs, and configurations to
          match your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {transformations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No transformations configured.</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={addPmWorkspaceDefault}>
                <Plus className="h-4 w-4 mr-1" />
                Add PM Workspace Default
              </Button>
              <Button variant="ghost" onClick={addCustomTransformation}>
                Add Custom
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {transformations.map((transformation, index) => {
              const isExpanded = expandedRepos.has(
                transformation.sourceRepo || `new-${index}`,
              );
              const isSyncing = syncing === transformation.sourceRepo;

              return (
                <div
                  key={transformation.sourceRepo || `new-${index}`}
                  className="border rounded-lg"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() =>
                        toggleExpanded(
                          transformation.sourceRepo || `new-${index}`,
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {transformation.name || "Unnamed"}
                        </span>
                        {transformation.sourceRepo && (
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {transformation.sourceRepo}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transformation.pathMappings?.length || 0} path mappings
                        {transformation.lastSynced && (
                          <>
                            {" "}
                            · Last synced:{" "}
                            {new Date(
                              transformation.lastSynced,
                            ).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={transformation.enabled}
                        onCheckedChange={(checked) =>
                          updateTransformation(index, { enabled: checked })
                        }
                      />
                      {onSync && transformation.sourceRepo && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSync(transformation.sourceRepo)}
                          disabled={isSyncing || !transformation.enabled}
                        >
                          {isSyncing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTransformation(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="border-t px-3 py-4 space-y-4">
                      {/* Basic info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`name-${index}`}>Name</Label>
                          <Input
                            id={`name-${index}`}
                            value={transformation.name}
                            onChange={(e) =>
                              updateTransformation(index, {
                                name: e.target.value,
                              })
                            }
                            placeholder="e.g., PM Workspace"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`repo-${index}`}>
                            Source Repository
                          </Label>
                          <Input
                            id={`repo-${index}`}
                            value={transformation.sourceRepo}
                            onChange={(e) =>
                              updateTransformation(index, {
                                sourceRepo: e.target.value,
                              })
                            }
                            placeholder="owner/repo"
                            className="font-mono"
                          />
                        </div>
                      </div>

                      {/* Chromatic config */}
                      <div>
                        <Label className="text-sm font-medium">
                          Chromatic Configuration
                        </Label>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <Label
                              htmlFor={`chromatic-token-${index}`}
                              className="text-xs text-muted-foreground"
                            >
                              Token
                            </Label>
                            <Input
                              id={`chromatic-token-${index}`}
                              value={
                                transformation.chromaticConfig?.token || ""
                              }
                              onChange={(e) =>
                                updateTransformation(index, {
                                  chromaticConfig: {
                                    ...transformation.chromaticConfig,
                                    token: e.target.value,
                                  },
                                })
                              }
                              placeholder="chpt_..."
                              className="font-mono text-xs"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`chromatic-appid-${index}`}
                              className="text-xs text-muted-foreground"
                            >
                              App ID
                            </Label>
                            <Input
                              id={`chromatic-appid-${index}`}
                              value={
                                transformation.chromaticConfig?.appId || ""
                              }
                              onChange={(e) =>
                                updateTransformation(index, {
                                  chromaticConfig: {
                                    ...transformation.chromaticConfig,
                                    appId: e.target.value,
                                  },
                                })
                              }
                              placeholder="App ID"
                              className="font-mono text-xs"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`chromatic-url-${index}`}
                              className="text-xs text-muted-foreground"
                            >
                              Production URL
                            </Label>
                            <Input
                              id={`chromatic-url-${index}`}
                              value={
                                transformation.chromaticConfig?.productionUrl ||
                                ""
                              }
                              onChange={(e) =>
                                updateTransformation(index, {
                                  chromaticConfig: {
                                    ...transformation.chromaticConfig,
                                    productionUrl: e.target.value,
                                  },
                                })
                              }
                              placeholder="https://..."
                              className="font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Path mappings */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">
                            Path Mappings
                          </Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addPathMapping(index)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {transformation.pathMappings?.map(
                            (mapping, mappingIndex) => (
                              <div
                                key={mappingIndex}
                                className="flex items-center gap-2"
                              >
                                <Input
                                  value={mapping.from}
                                  onChange={(e) =>
                                    updatePathMapping(index, mappingIndex, {
                                      from: e.target.value,
                                    })
                                  }
                                  placeholder="From pattern"
                                  className="font-mono text-xs flex-1"
                                />
                                <span className="text-muted-foreground">→</span>
                                <Input
                                  value={mapping.to}
                                  onChange={(e) =>
                                    updatePathMapping(index, mappingIndex, {
                                      to: e.target.value,
                                    })
                                  }
                                  placeholder="To replacement"
                                  className="font-mono text-xs flex-1"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    removePathMapping(index, mappingIndex)
                                  }
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ),
                          )}
                          {(!transformation.pathMappings ||
                            transformation.pathMappings.length === 0) && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              No path mappings. Click "Add" to create one.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <Button
              variant="outline"
              className="w-full"
              onClick={addCustomTransformation}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Custom Transformation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

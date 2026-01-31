"use client";

import { Package, FileText, Users, Radio, Bot, AlertTriangle, Columns } from "lucide-react";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";
import { useMemo } from "react";

export function ValidationSummary() {
  const {
    result,
    selectedInitiatives,
    selectedContextPaths,
    selectedAgents
  } = useDiscoveryStore();

  const summary = useMemo(() => {
    if (!result) return null;

    // Count selected items
    const projects = selectedInitiatives.size;

    // Count context path types
    let knowledge = 0;
    let personas = 0;
    let signals = 0;

    result.contextPaths.forEach((cp) => {
      if (selectedContextPaths.has(cp.path)) {
        if (cp.type === 'knowledge') knowledge += cp.fileCount;
        if (cp.type === 'personas') personas += cp.fileCount;
        if (cp.type === 'signals') signals += cp.fileCount;
      }
    });

    // Count agents
    const agents = result.agents.filter(a => selectedAgents.has(a.path)).length;

    // Count dynamic columns that will be created
    const existingColumns = new Set([
      'inbox', 'discovery', 'prd', 'design', 'prototype',
      'validate', 'tickets', 'build', 'alpha', 'beta', 'ga'
    ]);
    const dynamicColumns = new Set<string>();

    result.initiatives.forEach((initiative) => {
      if (selectedInitiatives.has(initiative.id)) {
        if (!existingColumns.has(initiative.mappedColumn)) {
          dynamicColumns.add(initiative.mappedColumn);
        }
      }
    });

    // Count ambiguous mappings
    const ambiguous = result.initiatives.filter(
      i => selectedInitiatives.has(i.id) && i.isStatusAmbiguous
    ).length;

    return {
      projects,
      knowledge,
      personas,
      signals,
      agents,
      dynamicColumns: Array.from(dynamicColumns),
      ambiguous
    };
  }, [result, selectedInitiatives, selectedContextPaths, selectedAgents]);

  if (!summary) return null;

  // Per CONTEXT.md: "Display summary at top of preview"
  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
      <h3 className="font-semibold mb-3">Import Summary</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Projects */}
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <div>
            <div className="text-lg font-bold">{summary.projects}</div>
            <div className="text-xs text-muted-foreground">
              {summary.projects === 1 ? 'project' : 'projects'}
            </div>
          </div>
        </div>

        {/* Knowledge docs */}
        {summary.knowledge > 0 && (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-lg font-bold">{summary.knowledge}</div>
              <div className="text-xs text-muted-foreground">knowledge docs</div>
            </div>
          </div>
        )}

        {/* Personas */}
        {summary.personas > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-lg font-bold">{summary.personas}</div>
              <div className="text-xs text-muted-foreground">
                {summary.personas === 1 ? 'persona' : 'personas'}
              </div>
            </div>
          </div>
        )}

        {/* Signals */}
        {summary.signals > 0 && (
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-lg font-bold">{summary.signals}</div>
              <div className="text-xs text-muted-foreground">
                {summary.signals === 1 ? 'signal' : 'signals'}
              </div>
            </div>
          </div>
        )}

        {/* Agents */}
        {summary.agents > 0 && (
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-lg font-bold">{summary.agents}</div>
              <div className="text-xs text-muted-foreground">
                {summary.agents === 1 ? 'agent' : 'agents'}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic columns */}
        {summary.dynamicColumns.length > 0 && (
          <div className="flex items-center gap-2">
            <Columns className="h-5 w-5 text-teal-500" />
            <div>
              <div className="text-lg font-bold">{summary.dynamicColumns.length}</div>
              <div className="text-xs text-muted-foreground">new columns</div>
            </div>
          </div>
        )}
      </div>

      {/* Ambiguous warning */}
      {summary.ambiguous > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <span>
            {summary.ambiguous} item{summary.ambiguous === 1 ? ' has' : 's have'} ambiguous
            status mapping - review recommended
          </span>
        </div>
      )}

      {/* Dynamic columns list */}
      {summary.dynamicColumns.length > 0 && (
        <div className="mt-3 text-sm text-muted-foreground">
          New columns to create: {summary.dynamicColumns.join(', ')}
        </div>
      )}
    </div>
  );
}

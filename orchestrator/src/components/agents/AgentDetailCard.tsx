"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  FileCode,
  Bot,
  Zap,
  ScrollText,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  FolderOpen,
  Globe,
  Lock,
  Clock,
} from "lucide-react";
import type { AgentDefinitionType } from "@/lib/db/schema";
import { AgentExecutionHistory } from "./AgentExecutionHistory";

interface AgentDetailCardProps {
  agent: {
    id: string;
    name: string;
    type: AgentDefinitionType;
    description: string | null;
    sourcePath: string;
    content: string;
    metadata: Record<string, unknown> | null;
  };
  workspaceId: string;
  onClose: () => void;
}

// Type-safe metadata interfaces
interface SkillMetadata {
  triggers?: string[];
  workflow?: string[];
  templates?: string[];
  outputPaths?: string[];
}

interface CommandMetadata {
  usage?: string;
  steps?: string[];
  delegatesTo?: { type: "subagent" | "skill" | "direct"; name?: string };
  prerequisites?: string[];
}

interface SubagentMetadata {
  model?: "inherit" | "fast";
  readonly?: boolean;
  contextFiles?: string[];
  outputPaths?: string[];
}

interface RuleMetadata {
  globs?: string[];
  alwaysApply?: boolean;
}

// Section component for collapsible sections
function DetailSection({
  title,
  icon: Icon,
  children,
  defaultExpanded = true,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string | number;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border rounded-lg bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-accent/50 transition-colors rounded-lg"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="font-medium text-sm">{title}</span>
        {badge !== undefined && (
          <Badge variant="outline" className="text-xs ml-auto">
            {badge}
          </Badge>
        )}
      </button>
      {isExpanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// List component for arrays of strings
function StringList({ items, emptyMessage = "None" }: { items: string[]; emptyMessage?: string }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item, index) => (
        <li key={index} className="text-sm flex items-start gap-2">
          <span className="text-muted-foreground select-none">-</span>
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Skill detail renderer
function SkillDetails({ metadata }: { metadata: SkillMetadata }) {
  return (
    <div className="space-y-3">
      <DetailSection title="Triggers" icon={Play} badge={metadata.triggers?.length || 0}>
        <StringList items={metadata.triggers || []} emptyMessage="No triggers defined" />
      </DetailSection>

      <DetailSection title="Workflow" icon={FileText} badge={metadata.workflow?.length || 0}>
        {metadata.workflow && metadata.workflow.length > 0 ? (
          <ol className="space-y-2">
            {metadata.workflow.map((step, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded min-w-[1.5rem] text-center">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground italic">No workflow steps defined</p>
        )}
      </DetailSection>

      <DetailSection title="Output Paths" icon={FolderOpen} badge={metadata.outputPaths?.length || 0}>
        <StringList items={metadata.outputPaths || []} emptyMessage="No output paths defined" />
      </DetailSection>
    </div>
  );
}

// Command detail renderer
function CommandDetails({ metadata }: { metadata: CommandMetadata }) {
  return (
    <div className="space-y-3">
      {metadata.usage && (
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Usage</span>
          </div>
          <code className="text-sm font-mono bg-muted px-2 py-1 rounded block">
            {metadata.usage}
          </code>
        </div>
      )}

      <DetailSection title="Steps" icon={Play} badge={metadata.steps?.length || 0}>
        {metadata.steps && metadata.steps.length > 0 ? (
          <ol className="space-y-2">
            {metadata.steps.map((step, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-muted-foreground font-mono text-xs bg-muted px-1.5 py-0.5 rounded min-w-[1.5rem] text-center">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground italic">No steps defined</p>
        )}
      </DetailSection>

      {metadata.delegatesTo && (
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-1">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Delegates to</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {metadata.delegatesTo.type}
            </Badge>
            {metadata.delegatesTo.name && (
              <span className="text-sm font-mono">{metadata.delegatesTo.name}</span>
            )}
          </div>
        </div>
      )}

      {metadata.prerequisites && metadata.prerequisites.length > 0 && (
        <DetailSection title="Prerequisites" icon={Lock} badge={metadata.prerequisites.length}>
          <StringList items={metadata.prerequisites} />
        </DetailSection>
      )}
    </div>
  );
}

// Subagent detail renderer
function SubagentDetails({ metadata }: { metadata: SubagentMetadata }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {metadata.model && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Model: {metadata.model}
          </Badge>
        )}
        {metadata.readonly && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Read-only
          </Badge>
        )}
      </div>

      <DetailSection title="Context Files" icon={FileText} badge={metadata.contextFiles?.length || 0}>
        <StringList items={metadata.contextFiles || []} emptyMessage="No context files defined" />
      </DetailSection>

      <DetailSection title="Output Paths" icon={FolderOpen} badge={metadata.outputPaths?.length || 0}>
        <StringList items={metadata.outputPaths || []} emptyMessage="No output paths defined" />
      </DetailSection>
    </div>
  );
}

// Rule detail renderer
function RuleDetails({ metadata }: { metadata: RuleMetadata }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {metadata.alwaysApply && (
          <Badge variant="default" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Always Apply
          </Badge>
        )}
      </div>

      <DetailSection title="Globs" icon={FolderOpen} badge={metadata.globs?.length || 0}>
        <StringList items={metadata.globs || []} emptyMessage="No glob patterns - applies to all files" />
      </DetailSection>
    </div>
  );
}

// AGENTS.md detail renderer - shows full markdown content
function AgentsMdDetails({ content }: { content: string }) {
  return (
    <DetailSection title="Full Content" icon={BookOpen} defaultExpanded={true}>
      <ScrollArea className="h-96">
        <pre className="text-xs font-mono whitespace-pre-wrap">{content}</pre>
      </ScrollArea>
    </DetailSection>
  );
}

// Icon mapping by agent type
const TYPE_ICONS: Record<AgentDefinitionType, React.ElementType> = {
  agents_md: BookOpen,
  skill: Zap,
  command: FileCode,
  subagent: Bot,
  rule: ScrollText,
};

// Badge styling by agent type
const TYPE_BADGES: Record<AgentDefinitionType, { label: string; className: string }> = {
  agents_md: {
    label: "AGENTS.md",
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800",
  },
  skill: {
    label: "Skill",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  },
  command: {
    label: "Command",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800",
  },
  subagent: {
    label: "Subagent",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 border-orange-200 dark:border-orange-800",
  },
  rule: {
    label: "Rule",
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200 border-gray-200 dark:border-gray-700",
  },
};

export function AgentDetailCard({ agent, workspaceId, onClose }: AgentDetailCardProps) {
  const { type, name, sourcePath, description, content, metadata } = agent;
  const Icon = TYPE_ICONS[type];
  const badge = TYPE_BADGES[type];

  // Render type-specific details
  const renderDetails = () => {
    switch (type) {
      case "skill":
        return <SkillDetails metadata={(metadata as SkillMetadata) || {}} />;
      case "command":
        return <CommandDetails metadata={(metadata as CommandMetadata) || {}} />;
      case "subagent":
        return <SubagentDetails metadata={(metadata as SubagentMetadata) || {}} />;
      case "rule":
        return <RuleDetails metadata={(metadata as RuleMetadata) || {}} />;
      case "agents_md":
        return <AgentsMdDetails content={content} />;
      default:
        return (
          <pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
            {content}
          </pre>
        );
    }
  };

  return (
    <div className="border-t border-border bg-muted/30 p-4 space-y-4">
      {/* Header with name, type badge, and close button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{name}</h3>
              <Badge variant="outline" className={`text-xs ${badge.className}`}>
                {badge.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate max-w-md">{sourcePath}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-accent transition-colors"
          aria-label="Close details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Description if available */}
      {description && (
        <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">{description}</p>
      )}

      {/* Type-specific details */}
      {renderDetails()}

      {/* Execution History */}
      <AgentExecutionHistory agentId={agent.id} workspaceId={workspaceId} />
    </div>
  );
}

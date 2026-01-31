"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/glass";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useKanbanStore, useUIStore } from "@/lib/store";
import { springPresets, staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Sparkles,
  Loader2,
  User,
  Bot,
  X,
  Terminal,
  FileText,
  Layers,
  Users,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Clock,
  type LucideIcon,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  jobId?: string; // If this message created a job
  jobStatus?:
    | "pending"
    | "running"
    | "waiting_input"
    | "completed"
    | "failed"
    | "cancelled";
}

interface CommandDefinition {
  id: string;
  name: string;
  description?: string | null;
  type: "command";
  metadata?: {
    usage?: string;
  } | null;
}

type CommandItem = {
  command: string;
  label: string;
  description: string;
  jobType: string | null;
  requiresProject: boolean;
  icon?: LucideIcon;
  agentDefinitionId?: string;
};

// Slash commands definition
const SLASH_COMMANDS: CommandItem[] = [
  {
    command: "/research",
    label: "Analyze Research",
    icon: Sparkles,
    description: "Analyze transcript or feedback",
    jobType: "analyze_transcript",
    requiresProject: true,
  },
  {
    command: "/pm",
    label: "Generate PRD",
    icon: FileText,
    description: "Generate a PRD for a project",
    jobType: "generate_prd",
    requiresProject: true,
  },
  {
    command: "/design",
    label: "Design Brief",
    icon: Layers,
    description: "Generate design brief",
    jobType: "generate_design_brief",
    requiresProject: true,
  },
  {
    command: "/eng",
    label: "Engineering Spec",
    icon: Terminal,
    description: "Generate engineering spec",
    jobType: "generate_engineering_spec",
    requiresProject: true,
  },
  {
    command: "/gtm",
    label: "GTM Brief",
    icon: Sparkles,
    description: "Generate GTM brief",
    jobType: "generate_gtm_brief",
    requiresProject: true,
  },
  {
    command: "/proto",
    label: "Build Prototype",
    icon: Layers,
    description: "Build a Storybook prototype",
    jobType: "build_prototype",
    requiresProject: true,
  },
  {
    command: "/iterate",
    label: "Iterate Prototype",
    icon: Sparkles,
    description: "Iterate based on feedback",
    jobType: "iterate_prototype",
    requiresProject: true,
  },
  {
    command: "/validate",
    label: "Run Validation",
    icon: Users,
    description: "Run jury evaluation",
    jobType: "run_jury_evaluation",
    requiresProject: true,
  },
  {
    command: "/status",
    label: "Project Status",
    icon: BarChart3,
    description: "Get project status overview",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/status-all",
    label: "Workspace Status",
    icon: BarChart3,
    description: "Get status across all projects",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/tickets",
    label: "Generate Tickets",
    icon: Terminal,
    description: "Generate tickets from prototype",
    jobType: "generate_tickets",
    requiresProject: true,
  },
  {
    command: "/score",
    label: "Score Alignment",
    icon: CheckCircle,
    description: "Score stage alignment",
    jobType: "score_stage_alignment",
    requiresProject: true,
  },
  {
    command: "/ingest",
    label: "Process Signals",
    icon: MessageSquare,
    description: "Process new signals for a project",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/synthesize",
    label: "Synthesize Signals",
    icon: BarChart3,
    description: "Synthesize signal patterns",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/help",
    label: "Command Help",
    icon: AlertCircle,
    description: "List available commands",
    jobType: null,
    requiresProject: false,
  },
  {
    command: "/roadmap",
    label: "Roadmap",
    icon: BarChart3,
    description: "View product roadmap",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/save",
    label: "Save Work",
    icon: Terminal,
    description: "Commit and push changes",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/update",
    label: "Update Workspace",
    icon: Terminal,
    description: "Pull latest changes",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/branch",
    label: "Create Branch",
    icon: Terminal,
    description: "Create a feature branch",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/share",
    label: "Create PR",
    icon: Terminal,
    description: "Open a pull request",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/setup",
    label: "Workspace Setup",
    icon: Terminal,
    description: "Run initial setup",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/think",
    label: "Think",
    icon: Sparkles,
    description: "Structured thinking session",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/teach",
    label: "Teach",
    icon: Sparkles,
    description: "Explain a concept or plan",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/reflect",
    label: "Reflect",
    icon: Sparkles,
    description: "Reflect on progress",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/unstick",
    label: "Unstick",
    icon: Sparkles,
    description: "Get unstuck with next actions",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/collab",
    label: "Collaborate",
    icon: Users,
    description: "Collaboration guidance",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/eod",
    label: "End of Day",
    icon: FileText,
    description: "Generate EOD report",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/eow",
    label: "End of Week",
    icon: FileText,
    description: "Generate EOW report",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/visual-digest",
    label: "Visual Digest",
    icon: FileText,
    description: "Create visual digest",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/publish-digest",
    label: "Publish Digest",
    icon: FileText,
    description: "Publish digest to repo",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/design-system",
    label: "Design System",
    icon: Layers,
    description: "Design system guidance",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/image",
    label: "Image",
    icon: Layers,
    description: "Generate an image",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/figma-sync",
    label: "Figma Sync",
    icon: Layers,
    description: "Sync from Figma",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/figjam",
    label: "FigJam",
    icon: Layers,
    description: "Generate FigJam board",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/maintain",
    label: "Maintenance",
    icon: Terminal,
    description: "Run workspace maintenance",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/admin",
    label: "Admin",
    icon: Terminal,
    description: "Admin tools",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/measure",
    label: "Measure",
    icon: BarChart3,
    description: "Generate measurement plan",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/availability-check",
    label: "Availability Check",
    icon: BarChart3,
    description: "Check service availability",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/sync",
    label: "Sync",
    icon: Terminal,
    description: "Run full sync",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/sync-dev",
    label: "Sync Dev",
    icon: Terminal,
    description: "Sync dev environment",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/sync-notion",
    label: "Sync Notion",
    icon: Terminal,
    description: "Sync Notion content",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/sync-linear",
    label: "Sync Linear",
    icon: Terminal,
    description: "Sync Linear issues",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/sync-github",
    label: "Sync GitHub",
    icon: Terminal,
    description: "Sync GitHub data",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
  {
    command: "/full-sync",
    label: "Full Sync",
    icon: Terminal,
    description: "Run all sync pipelines",
    jobType: "execute_agent_definition",
    requiresProject: false,
  },
];

const QUICK_ACTIONS = [
  { label: "Project status", prompt: "/status" },
  { label: "Next steps", prompt: "What should I focus on next?" },
  { label: "Run PRD", prompt: "/pm" },
  { label: "Build prototype", prompt: "/proto" },
  { label: "Synthesize signals", prompt: "/synthesize" },
];

export function ChatSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openJobLogsDrawer = useUIStore((s) => s.openJobLogsDrawer);
  const activeProjectId = useKanbanStore((s) => s.activeProjectId);
  const workspace = useKanbanStore((s) => s.workspace);
  const projects = useKanbanStore((s) => s.projects);
  const router = useRouter();
  const pathname = usePathname();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I'm your PM assistant. I can help with project status, run commands, or answer questions.\n\n**Slash commands:**\n• `/pm` - Generate PRD\n• `/proto` - Build prototype\n• `/validate` - Run jury evaluation\n• `/status` - Project overview\n\nType `/` to see all commands.",
      timestamp: new Date(),
      suggestions: QUICK_ACTIONS.map((a) => a.label),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCommandPicker, setShowCommandPicker] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobStatusMap, setJobStatusMap] = useState<
    Record<string, Message["jobStatus"]>
  >({});

  // Get active project
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId),
    [projects, activeProjectId],
  );

  const { data: commandDefinitions } = useQuery({
    queryKey: ["agent-commands", workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const res = await fetch(`/api/agents?workspaceId=${workspace.id}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.agents || []).filter(
        (agent: { type: string }) => agent.type === "command",
      ) as CommandDefinition[];
    },
    enabled: Boolean(workspace?.id),
  });

  const dynamicCommands = useMemo<CommandItem[]>(() => {
    if (!commandDefinitions || commandDefinitions.length === 0) return [];
    const staticSet = new Set(SLASH_COMMANDS.map((cmd) => cmd.command));
    return commandDefinitions
      .map((cmd) => {
        const usage = cmd.metadata?.usage || "";
        const usageMatch = usage.match(/\/[a-z0-9-]+/i);
        const command = usageMatch
          ? usageMatch[0].toLowerCase()
          : `/${cmd.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")}`;
        return {
          command,
          label: cmd.name,
          description: cmd.description || "Run workspace command",
          jobType: "execute_agent_definition",
          requiresProject: false,
          icon: Terminal,
          agentDefinitionId: cmd.id,
        };
      })
      .filter((cmd) => !staticSet.has(cmd.command));
  }, [commandDefinitions]);

  const allCommands = useMemo(() => {
    const dynamicMap = new Map(
      dynamicCommands.map((cmd) => [cmd.command, cmd]),
    );
    const merged = SLASH_COMMANDS.map((cmd) => {
      const dynamic = dynamicMap.get(cmd.command);
      if (!dynamic) return cmd;
      return {
        ...cmd,
        agentDefinitionId: dynamic.agentDefinitionId,
        description: dynamic.description || cmd.description,
      };
    });
    const dynamicOnly = dynamicCommands.filter(
      (cmd) => !SLASH_COMMANDS.some((s) => s.command === cmd.command),
    );
    return [...merged, ...dynamicOnly];
  }, [dynamicCommands]);

  // Filter commands based on input
  const filteredCommands = useMemo(() => {
    if (!input.startsWith("/")) return [];
    const query = input.slice(1).toLowerCase();
    return allCommands.filter(
      (cmd) =>
        cmd.command.slice(1).startsWith(query) ||
        cmd.label.toLowerCase().includes(query),
    );
  }, [input, allCommands]);

  const contextActions = useMemo(() => {
    if (!activeProject) return [];
    switch (activeProject.stage) {
      case "discovery":
        return [
          { label: "Analyze transcript", prompt: "/research" },
          { label: "Generate PRD", prompt: "/pm" },
        ];
      case "prd":
        return [
          { label: "Design brief", prompt: "/design" },
          { label: "Engineering spec", prompt: "/eng" },
        ];
      case "design":
        return [
          { label: "Build prototype", prompt: "/proto" },
          { label: "Generate tickets", prompt: "/tickets" },
        ];
      case "prototype":
        return [
          { label: "Run validation", prompt: "/validate" },
          { label: "Iterate prototype", prompt: "/iterate" },
        ];
      case "validate":
        return [
          { label: "Generate tickets", prompt: "/tickets" },
          { label: "Score alignment", prompt: "/score" },
        ];
      default:
        return [];
    }
  }, [activeProject]);

  const quickActions = useMemo(() => {
    const merged = [...contextActions, ...QUICK_ACTIONS];
    const seen = new Set<string>();
    return merged.filter((action) => {
      if (seen.has(action.label)) return false;
      seen.add(action.label);
      return true;
    });
  }, [contextActions]);

  const navigationActions = useMemo(() => {
    if (!workspace?.id) return [];
    const baseLinks = {
      dashboard: `/workspace/${workspace.id}`,
      knowledge: `/workspace/${workspace.id}/knowledgebase`,
      personas: `/workspace/${workspace.id}/personas`,
      signals: `/workspace/${workspace.id}/signals`,
      agents: `/workspace/${workspace.id}/agents`,
      settings: `/workspace/${workspace.id}/settings`,
    };

    if (pathname?.includes("/knowledgebase")) {
      return [
        { label: "Back to Dashboard", href: baseLinks.dashboard },
        { label: "Open Signals", href: baseLinks.signals },
      ];
    }

    if (pathname?.includes("/personas")) {
      return [
        { label: "Back to Dashboard", href: baseLinks.dashboard },
        { label: "Open Knowledge", href: baseLinks.knowledge },
      ];
    }

    if (pathname?.includes("/signals")) {
      return [
        { label: "Back to Dashboard", href: baseLinks.dashboard },
        { label: "Open Agents", href: baseLinks.agents },
      ];
    }

    if (pathname?.includes("/projects/")) {
      return [
        { label: "Back to Workspace", href: baseLinks.dashboard },
        { label: "Open Signals", href: baseLinks.signals },
      ];
    }

    return [
      { label: "Open Knowledge", href: baseLinks.knowledge },
      { label: "Open Personas", href: baseLinks.personas },
      { label: "Open Signals", href: baseLinks.signals },
    ];
  }, [pathname, workspace?.id]);

  // Show command picker when typing /
  useEffect(() => {
    setShowCommandPicker(input.startsWith("/") && filteredCommands.length > 0);
    setSelectedCommandIndex(0);
  }, [input, filteredCommands.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Poll job status for messages with job IDs
  useEffect(() => {
    if (!workspace?.id) return;

    const jobIds = messages
      .map((m) => m.jobId)
      .filter((id): id is string => Boolean(id));

    if (jobIds.length === 0) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs?workspaceId=${workspace.id}`);
        if (!res.ok) return;
        const jobs = await res.json();
        if (cancelled) return;
        const nextMap: Record<string, Message["jobStatus"]> = {};
        jobs.forEach((job: { id: string; status: Message["jobStatus"] }) => {
          if (jobIds.includes(job.id)) {
            nextMap[job.id] = job.status;
          }
        });
        setJobStatusMap((prev) => ({ ...prev, ...nextMap }));
      } catch {
        // Swallow polling errors
      }
    };

    poll();
    const interval = window.setInterval(poll, 12000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [workspace?.id, messages]);

  // Parse slash command from input
  const parseSlashCommand = useCallback(
    (
      text: string,
    ): {
      command: CommandItem | null;
      projectName: string | null;
      args: string;
    } => {
      const parts = text.trim().split(/\s+/);
      const commandText = parts[0]?.toLowerCase();
      const command =
        allCommands.find((c) => c.command === commandText) || null;
      const args = parts.slice(1).join(" ").trim();
      const projectName = args || null;
      return { command, projectName, args };
    },
    [allCommands],
  );

  // Create job for a command
  const createJob = useCallback(
    async (
      jobType: string,
      projectId: string | null,
      projectName?: string,
      input?: Record<string, unknown>,
    ) => {
      try {
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            workspaceId: workspace?.id,
            type: jobType,
            input,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create job");
        }

        const job = await response.json();

        // Open job logs drawer
        openJobLogsDrawer(job.id, projectName ?? "Workspace");

        return job;
      } catch (error) {
        throw error;
      }
    },
    [workspace?.id, openJobLogsDrawer],
  );

  const renderJobStatus = (status?: Message["jobStatus"]) => {
    if (!status) return null;
    const mapping = {
      pending: {
        label: "Queued",
        icon: Clock,
        className: "text-muted-foreground",
      },
      running: { label: "Running", icon: Loader2, className: "text-amber-400" },
      waiting_input: {
        label: "Needs input",
        icon: AlertCircle,
        className: "text-purple-400",
      },
      completed: {
        label: "Complete",
        icon: CheckCircle,
        className: "text-green-400",
      },
      failed: { label: "Failed", icon: AlertCircle, className: "text-red-400" },
      cancelled: {
        label: "Cancelled",
        icon: AlertCircle,
        className: "text-muted-foreground",
      },
    } as const;

    const config = mapping[status];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[10px]",
          config.className,
        )}
      >
        <Icon
          className={cn("w-3 h-3", status === "running" ? "animate-spin" : "")}
        />
        {config.label}
      </span>
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setShowCommandPicker(false);
    setIsLoading(true);

    try {
      // Check if it's a slash command
      const { command, projectName, args } = parseSlashCommand(
        userMessage.content,
      );

      if (command) {
        // Handle local commands without jobs
        if (command.command === "/help") {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Available commands:\n\n${allCommands.map((cmd) => `• ${cmd.command} — ${cmd.description}`).join("\n")}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }

        if (
          command.jobType === "execute_agent_definition" &&
          !(command as { agentDefinitionId?: string }).agentDefinitionId
        ) {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "⚠️ This command isn't synced yet. Open Settings → Admin and sync commands from the source repo.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        }

        // For job commands, we need a project when required
        if (command.jobType && command.requiresProject) {
          // Try to find project by name or use active project
          let targetProject = activeProject;

          if (projectName) {
            const matchedProject = projects.find((p) =>
              p.name.toLowerCase().includes(projectName.toLowerCase()),
            );
            if (matchedProject) {
              targetProject = matchedProject;
            }
          }

          if (!targetProject) {
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ No project selected. Please select a project first or specify a project name:\n\n\`${command.command} [project name]\`\n\nActive projects:\n${projects.map((p) => `• ${p.name}`).join("\n")}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsLoading(false);
            return;
          }

          // Create the job
          try {
            const job = await createJob(
              command.jobType,
              targetProject.id,
              targetProject.name,
              command.jobType === "execute_agent_definition"
                ? {
                    agentDefinitionId: (
                      command as { agentDefinitionId?: string }
                    ).agentDefinitionId,
                    command: command.command,
                    args,
                    raw: userMessage.content,
                  }
                : undefined,
            );

            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `✅ Started **${command.label}** for **${targetProject.name}**\n\nJob ID: \`${job.id}\`\n\nClick the notification to view progress.`,
              timestamp: new Date(),
              jobId: job.id,
              jobStatus: "running",
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : "Unknown error";
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ Failed to start job: ${errorMsg}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }

          setIsLoading(false);
          return;
        }

        if (command.jobType && !command.requiresProject) {
          try {
            const job = await createJob(
              command.jobType,
              null,
              undefined,
              command.jobType === "execute_agent_definition"
                ? {
                    agentDefinitionId: (
                      command as { agentDefinitionId?: string }
                    ).agentDefinitionId,
                    command: command.command,
                    args,
                    raw: userMessage.content,
                  }
                : undefined,
            );
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `✅ Started **${command.label}**\n\nJob ID: \`${job.id}\`\n\nClick the notification to view progress.`,
              timestamp: new Date(),
              jobId: job.id,
              jobStatus: "running",
            };
            setMessages((prev) => [...prev, assistantMessage]);
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : "Unknown error";
            const assistantMessage: Message = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `❌ Failed to start job: ${errorMsg}`,
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }

          setIsLoading(false);
          return;
        }
      }

      // Regular chat message - call API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          workspaceId: workspace?.id,
          activeProjectId: activeProject?.id,
          context: {
            projects: projects.map((p) => ({
              id: p.id,
              name: p.name,
              stage: p.stage,
              status: p.status,
            })),
            activeProject: activeProject
              ? {
                  id: activeProject.id,
                  name: activeProject.name,
                  stage: activeProject.stage,
                  status: activeProject.status,
                }
              : null,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          suggestions: data.suggestions,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Fallback response
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: generateLocalResponse(userMessage.content, projects),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      // Fallback response on error
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: generateLocalResponse(userMessage.content, projects),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCommand = (command: CommandItem) => {
    setInput(command.command + " ");
    setShowCommandPicker(false);
    inputRef.current?.focus();
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    if (prompt.startsWith("/")) {
      // If it's a slash command, show picker
      setShowCommandPicker(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showCommandPicker) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex((i) =>
          Math.min(i + 1, filteredCommands.length - 1),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedCommandIndex]) {
          handleSelectCommand(filteredCommands[selectedCommandIndex]);
        }
      } else if (e.key === "Escape") {
        setShowCommandPicker(false);
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={toggleSidebar}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
      />

      <motion.aside
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={springPresets.snappy}
        className="fixed right-0 top-0 h-full w-full sm:w-[380px] lg:relative lg:w-[380px] border-l border-white/10 bg-white/95 dark:bg-slate-900/95 lg:bg-white/5 backdrop-blur-xl flex flex-col z-50 lg:z-auto lg:h-[calc(100vh-80px)]"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">
                Ask about your projects
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  variants={staggerItem}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      message.role === "user"
                        ? "bg-purple-500/20"
                        : "bg-linear-to-br from-teal-500/20 to-purple-500/20"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-teal-400" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}
                  >
                    <GlassCard
                      className={`p-3 inline-block max-w-[280px] ${
                        message.role === "user" ? "bg-purple-500/10" : ""
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </GlassCard>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() =>
                              handleQuickAction(
                                quickActions.find((a) => a.label === suggestion)
                                  ?.prompt || suggestion,
                              )
                            }
                            className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-muted-foreground mt-1">
                      <span>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.jobId && (
                        <span className="ml-2">
                          {renderJobStatus(
                            jobStatusMap[message.jobId] || message.jobStatus,
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-teal-400" />
                </div>
                <GlassCard className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-white/10 space-y-2">
          {navigationActions.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Navigate</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {navigationActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(action.href)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1">
              Quick actions
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input with Command Picker */}
        <div className="p-4 border-t border-white/10 relative">
          {/* Command Picker */}
          <AnimatePresence>
            {showCommandPicker && filteredCommands.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 right-4 mb-2 p-2 rounded-lg bg-slate-900/95 border border-white/10 backdrop-blur-xl shadow-xl"
              >
                <p className="text-[10px] text-muted-foreground px-2 pb-2 border-b border-white/10 mb-2">
                  Commands
                </p>
                <div className="space-y-1">
                  {filteredCommands.map((cmd, index) => {
                    const Icon = cmd.icon ?? Terminal;
                    return (
                      <button
                        key={cmd.command}
                        onClick={() => handleSelectCommand(cmd)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left",
                          index === selectedCommandIndex
                            ? "bg-purple-500/20 text-purple-300"
                            : "hover:bg-white/5",
                        )}
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono">
                              {cmd.command}
                            </code>
                            <span className="text-xs text-muted-foreground">
                              {cmd.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {cmd.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Project Indicator */}
          {activeProject && (
            <div className="mb-2 px-1">
              <p className="text-[10px] text-muted-foreground">
                Active:{" "}
                <span className="text-purple-400">{activeProject.name}</span>
              </p>
            </div>
          )}

          <div className="glass-card p-2 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                activeProject
                  ? `Ask about ${activeProject.name} or type /...`
                  : "Type / for commands..."
              }
              className="flex-1 bg-transparent border-none outline-none text-sm px-2"
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : input.startsWith("/") ? (
                <>
                  <Terminal className="w-3 h-3" />
                  Run
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// Local response generator (fallback when API is unavailable)
function generateLocalResponse(
  query: string,
  projects: { name: string; stage: string; status: string }[],
): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("status") || lowerQuery.includes("active")) {
    const activeProjects = projects.filter((p) => p.status === "active");
    if (activeProjects.length === 0) {
      return "You don't have any active projects right now. Would you like to create a new one?";
    }

    const byStage: Record<string, string[]> = {};
    activeProjects.forEach((p) => {
      if (!byStage[p.stage]) byStage[p.stage] = [];
      byStage[p.stage].push(p.name);
    });

    let response = `You have ${activeProjects.length} active project${activeProjects.length > 1 ? "s" : ""}:\n\n`;
    Object.entries(byStage).forEach(([stage, names]) => {
      response += `**${stage.charAt(0).toUpperCase() + stage.slice(1)}**: ${names.join(", ")}\n`;
    });

    return response;
  }

  if (lowerQuery.includes("next") || lowerQuery.includes("focus")) {
    const inPrd = projects.filter((p) => p.stage === "prd");
    const inPrototype = projects.filter((p) => p.stage === "prototype");
    const inValidate = projects.filter((p) => p.stage === "validate");

    if (inValidate.length > 0) {
      return `I'd suggest reviewing the validation results for **${inValidate[0].name}**. Once validated, you can move it to the tickets stage.`;
    }
    if (inPrototype.length > 0) {
      return `**${inPrototype[0].name}** is in the prototype stage. Consider running a jury evaluation to validate the design.`;
    }
    if (inPrd.length > 0) {
      return `**${inPrd[0].name}** has a PRD ready. The next step would be to build a prototype.`;
    }

    return "All your projects seem to be progressing well! Consider starting a new initiative or reviewing metrics for released features.";
  }

  if (lowerQuery.includes("blocked") || lowerQuery.includes("stalled")) {
    const stalled = projects.filter((p) => {
      // Projects that have been in the same stage for a while would be considered stalled
      return p.status === "paused";
    });

    if (stalled.length > 0) {
      return `Found ${stalled.length} paused project${stalled.length > 1 ? "s" : ""}: ${stalled.map((p) => p.name).join(", ")}. Would you like me to help unblock any of these?`;
    }

    return "No blocked or stalled projects found. Everything seems to be moving along!";
  }

  if (
    lowerQuery.includes("create") ||
    lowerQuery.includes("issue") ||
    lowerQuery.includes("feedback")
  ) {
    return "To create an issue from feedback, you can:\n\n1. Click **New Project** and paste the feedback\n2. Or share the feedback here and I'll help structure it into an actionable item\n\nWhat feedback would you like to turn into an issue?";
  }

  return "I can help you with:\n\n• **Project status** - Overview of active projects\n• **Next steps** - Suggestions for what to focus on\n• **Blocked items** - Find stalled projects\n• **Create issues** - Turn feedback into actionable items\n\nWhat would you like to know?";
}

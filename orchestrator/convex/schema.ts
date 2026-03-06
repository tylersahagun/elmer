import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    settings: v.any(),
    clerkOrgId: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  projects: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    stage: v.string(), // "inbox" | "discovery" | "define" | "build" | "validate" | "launch"
    status: v.string(), // "on_track" | "at_risk" | "blocked" | "stale"
    priority: v.string(), // "P0" | "P1" | "P2" | "P3"
    metadata: v.any(),
    isLocked: v.optional(v.boolean()),
    // Linked Slack channel for continuous prototype feedback ingestion
    slackChannelId: v.optional(v.string()),
    slackChannelName: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_stage", ["workspaceId", "stage"]),

  documents: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    // "research" | "prd" | "design_brief" | "engineering_spec" | "gtm_brief" |
    // "prototype_notes" | "metrics" | "jury_report" | "feature_guide" |
    // "competitive_landscape" | "success_criteria" | "gtm_plan" | "retrospective"
    type: v.string(),
    content: v.string(),
    title: v.string(),
    version: v.number(),
    reviewStatus: v.string(), // "draft" | "reviewed" | "approved"
    generatedByAgent: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_type", ["projectId", "type"]),

  jobs: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(),
    // "pending" | "running" | "completed" | "failed" | "waiting_input" | "cancelled"
    status: v.string(),
    input: v.any(),
    output: v.any(),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    attempt: v.number(),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
    runId: v.optional(v.string()), // Convex scheduler ID (_scheduled_functions ID as string)
    initiatedBy: v.optional(v.string()), // Clerk user ID or "system"
    initiatedByName: v.optional(v.string()),
    rootInitiator: v.optional(v.string()), // original human trigger across job chains
    rootInitiatorName: v.optional(v.string()),
    parentJobId: v.optional(v.id("jobs")),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_project", ["projectId"])
    .index("by_parent", ["parentJobId"]),

  jobLogs: defineTable({
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    level: v.string(), // "info" | "warn" | "error" | "debug"
    message: v.string(),
    stepKey: v.optional(v.string()),
    meta: v.optional(v.any()),
  }).index("by_job", ["jobId"]),

  pendingQuestions: defineTable({
    jobId: v.id("jobs"),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    questionType: v.string(), // "blocking" | "approval" | "choice"
    questionText: v.string(),
    choices: v.optional(v.array(v.string())),
    context: v.optional(v.any()),
    status: v.string(), // "pending" | "answered" | "timed_out"
    response: v.optional(v.any()),
    respondedBy: v.optional(v.string()), // Clerk user ID
    timeoutAt: v.optional(v.number()),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_job", ["jobId"]),

  signals: defineTable({
    workspaceId: v.id("workspaces"),
    verbatim: v.string(),
    interpretation: v.optional(v.string()),
    severity: v.optional(v.string()),
    source: v.string(),
    status: v.string(),
    classification: v.optional(v.any()),
    neonSignalId: v.optional(v.string()), // FK to Neon pgvector
    inboxItemId: v.optional(v.id("inboxItems")),
    tags: v.optional(v.array(v.string())),
  }).index("by_workspace_status", ["workspaceId", "status"]),

  signalProjects: defineTable({
    signalId: v.id("signals"),
    projectId: v.id("projects"),
    confidence: v.optional(v.number()),
    linkedBy: v.optional(v.string()),
  })
    .index("by_signal", ["signalId"])
    .index("by_project", ["projectId"]),

  inboxItems: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(), // "transcript" | "document" | "signal" | "feedback"
    source: v.string(),
    title: v.string(),
    rawContent: v.string(),
    processedContent: v.optional(v.string()),
    status: v.string(), // "pending" | "processing" | "assigned" | "dismissed"
    aiSummary: v.optional(v.string()),
    tldr: v.optional(v.string()),
    impactScore: v.optional(v.number()),
    suggestsVisionUpdate: v.optional(v.boolean()),
    extractedProblems: v.optional(v.any()),
    hypothesisMatches: v.optional(v.any()),
    projectDirectionChange: v.optional(v.any()),
    assignedProjectId: v.optional(v.id("projects")),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_priority", ["workspaceId", "impactScore"]),

  memoryEntries: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    type: v.string(), // "decision" | "feedback" | "context" | "artifact" | "conversation"
    content: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"]),

  agentDefinitions: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(), // "subagent" | "skill" | "command" | "rule"
    name: v.string(),
    description: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
    content: v.string(),
    enabled: v.boolean(),
    phase: v.optional(v.string()),
    executionMode: v.string(), // "server" | "cursor"
    requiredArtifacts: v.optional(v.array(v.string())),
    producedArtifacts: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  })
    .index("by_workspace_type", ["workspaceId", "type"])
    .index("by_name", ["workspaceId", "name"]),

  agentExecutions: defineTable({
    jobId: v.id("jobs"),
    agentDefinitionId: v.optional(v.id("agentDefinitions")),
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    inputContext: v.optional(v.any()),
    toolCalls: v.optional(v.array(v.any())),
    output: v.optional(v.any()),
    tokensUsed: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_job", ["jobId"])
    .index("by_project", ["projectId"]),

  notifications: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()), // Clerk user ID
    projectId: v.optional(v.id("projects")),
    jobId: v.optional(v.id("jobs")),
    type: v.string(),
    priority: v.string(),
    status: v.string(),
    title: v.string(),
    message: v.string(),
    actionType: v.optional(v.string()),
    actionData: v.optional(v.any()),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_user", ["userId", "status"]),

  presence: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    location: v.string(),
    projectId: v.optional(v.id("projects")),
    documentId: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user_workspace", ["userId", "workspaceId"])
    .index("by_document", ["workspaceId", "documentId"])
    .index("by_project_presence", ["workspaceId", "projectId"]),

  tasks: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "todo" | "in_progress" | "done" | "blocked"
    priority: v.optional(v.string()),
    assignedTo: v.optional(v.string()), // Clerk user ID
    createdBy: v.string(),
    dueDate: v.optional(v.number()),
    linkedJobId: v.optional(v.id("jobs")),
    linkedDocumentId: v.optional(v.id("documents")),
    sourceSignalId: v.optional(v.id("signals")),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_assigned", ["assignedTo", "status"]),

  graphNodes: defineTable({
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    name: v.string(),
    domain: v.optional(v.string()),
    accessWeight: v.number(),
    decayRate: v.number(),
    pagerank: v.optional(v.number()),
    communityId: v.optional(v.string()),
    validTo: v.optional(v.number()),
    metadata: v.optional(v.any()),
    neonNodeId: v.optional(v.string()),
  })
    .index("by_workspace_type", ["workspaceId", "entityType"])
    .index("by_entity", ["entityType", "entityId"]),

  graphEdges: defineTable({
    workspaceId: v.id("workspaces"),
    fromNodeId: v.id("graphNodes"),
    toNodeId: v.id("graphNodes"),
    relationType: v.string(),
    weight: v.optional(v.number()),
    confidence: v.optional(v.number()),
    source: v.string(), // "agent" | "human" | "inferred"
  })
    .index("by_from", ["fromNodeId"])
    .index("by_to", ["toNodeId"])
    .index("by_workspace_type", ["workspaceId", "relationType"]),

  graphObservations: defineTable({
    nodeId: v.id("graphNodes"),
    workspaceId: v.id("workspaces"),
    depth: v.number(), // 0=summary → 3=raw
    content: v.string(),
    supersededBy: v.optional(v.id("graphObservations")),
  }).index("by_node", ["nodeId"]),

  graphCommunities: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    theme: v.optional(v.string()),
    memberCount: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  graphEvents: defineTable({
    workspaceId: v.id("workspaces"),
    eventType: v.string(),
    entityId: v.optional(v.string()),
    actor: v.optional(v.string()), // Clerk user ID or "system"
    details: v.optional(v.any()),
  }).index("by_workspace", ["workspaceId"]),

  knowledgebaseEntries: defineTable({
    workspaceId: v.id("workspaces"),
    // "company_context" | "strategic_guardrails" | "personas" | "roadmap" | "rules"
    type: v.string(),
    title: v.string(),
    content: v.string(),
    filePath: v.optional(v.string()),
    version: v.number(),
  }).index("by_workspace_type", ["workspaceId", "type"]),

  prototypeVariants: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    // "storybook" | "v0" | "nano_banana" | "magic_patterns" | "figma_make" | "replit" | "local_mock"
    platform: v.string(),
    outputType: v.string(), // "iframe_url" | "static_images" | "tsx_code" | "github_repo"
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    title: v.string(),
    status: v.string(), // "generating" | "ready" | "promoted" | "archived"
    promotedToStorybook: v.optional(v.boolean()),
    chromaticUrl: v.optional(v.string()),
    generatedByJobId: v.optional(v.id("jobs")),
    // Prototype lineage — links this variant to the one it was iterated from
    parentVariantId: v.optional(v.id("prototypeVariants")),
    // Slack thread timestamp when this prototype was posted for feedback
    slackMessageTs: v.optional(v.string()),
    // How many iterations deep this variant is (0 = original)
    iterationCount: v.optional(v.number()),
    metadata: v.optional(v.any()),
  })
    .index("by_project", ["projectId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_parent", ["parentVariantId"]),

  // Links feedback signals to the specific prototype variant that generated them
  signalProtoVariants: defineTable({
    signalId: v.id("signals"),
    prototypeVariantId: v.id("prototypeVariants"),
    // "slack_thread" | "direct_message" | "manual" | "askelephant"
    feedbackSource: v.optional(v.string()),
  })
    .index("by_signal", ["signalId"])
    .index("by_variant", ["prototypeVariantId"]),

  chatThreads: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.string(),
    title: v.string(),
    contextEntityType: v.optional(v.string()), // "project" | "document" | "signal"
    contextEntityId: v.optional(v.string()),
    lastMessageAt: v.number(),
    model: v.optional(v.string()), // user's model override: "haiku" | "sonnet" | "auto"
    isArchived: v.boolean(),
  })
    .index("by_workspace_user", ["workspaceId", "userId"])
    .index("by_last_message", ["workspaceId", "lastMessageAt"]),

  chatMessages: defineTable({
    threadId: v.id("chatThreads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.any())),
    tokenCount: v.optional(v.number()),
    agentJobId: v.optional(v.id("jobs")),
    isHITL: v.optional(v.boolean()),
    hitlJobId: v.optional(v.id("jobs")),
  }).index("by_thread", ["threadId"]),
});

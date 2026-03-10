import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    contextPath: v.optional(v.string()),
    settings: v.any(),
    clerkOrgId: v.optional(v.string()),
    onboardingCompletedAt: v.optional(v.number()),
    onboardingData: v.optional(v.any()),
  }).index("by_slug", ["slug"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()),
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    image: v.optional(v.string()),
    role: v.string(),
    joinedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_clerk_workspace", ["clerkUserId", "workspaceId"])
    .index("by_user_workspace", ["userId", "workspaceId"]),

  invitations: defineTable({
    workspaceId: v.id("workspaces"),
    email: v.string(),
    role: v.string(),
    token: v.string(),
    invitedBy: v.optional(v.string()),
    invitedByClerkUserId: v.optional(v.string()),
    inviterName: v.optional(v.string()),
    inviterEmail: v.optional(v.string()),
    expiresAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_token", ["token"])
    .index("by_email_workspace", ["email", "workspaceId"]),

  columnConfigs: defineTable({
    workspaceId: v.id("workspaces"),
    stage: v.string(),
    displayName: v.string(),
    order: v.number(),
    color: v.optional(v.string()),
    autoTriggerJobs: v.optional(v.array(v.string())),
    agentTriggers: v.optional(v.array(v.any())),
    requiredDocuments: v.optional(v.array(v.string())),
    requiredApprovals: v.optional(v.number()),
    aiIterations: v.optional(v.number()),
    rules: v.optional(v.any()),
    humanInLoop: v.optional(v.boolean()),
    enabled: v.optional(v.boolean()),
    graduationCriteria: v.optional(v.any()),
    enforceGraduation: v.optional(v.boolean()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_stage", ["workspaceId", "stage"]),

  projects: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    stage: v.string(), // "inbox" | "discovery" | "define" | "build" | "validate" | "launch"
    status: v.string(), // "on_track" | "at_risk" | "blocked" | "stale"
    priority: v.string(), // "P0" | "P1" | "P2" | "P3"
    metadata: v.any(),
    isLocked: v.optional(v.boolean()),
    slackChannelId: v.optional(v.string()),
    slackChannelName: v.optional(v.string()),
    // Embedding for project-signal matching (replaces pgvector on Postgres projects table)
    embeddingVector: v.optional(v.array(v.float64())),
    embeddingUpdatedAt: v.optional(v.number()),
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
    frequency: v.optional(v.string()),
    userSegment: v.optional(v.string()),
    source: v.string(),
    status: v.string(),
    classification: v.optional(v.any()),
    neonSignalId: v.optional(v.string()),
    inboxItemId: v.optional(v.id("inboxItems")),
    tags: v.optional(v.array(v.string())),
    // Embedding for in-process cosine similarity search (replaces pgvector)
    embeddingVector: v.optional(v.array(v.float64())),
    embeddingUpdatedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),
    sourceRef: v.optional(v.string()),
    sourceMetadata: v.optional(v.any()),
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
    sourceRepo: v.optional(v.string()),
    sourceRef: v.optional(v.string()),
    sourcePath: v.optional(v.string()),
    syncedAt: v.optional(v.number()),
  })
    .index("by_workspace_type", ["workspaceId", "type"])
    .index("by_name", ["workspaceId", "name"])
    .index("by_source_repo", ["workspaceId", "sourceRepo", "sourceRef"]),

  agentKnowledgeSources: defineTable({
    workspaceId: v.id("workspaces"),
    sourceRepo: v.string(),
    sourceRef: v.string(),
    sourcePath: v.string(),
    type: v.string(), // "knowledge" | "personas"
    name: v.string(),
    syncedAt: v.number(),
  })
    .index("by_workspace_repo", ["workspaceId", "sourceRepo", "sourceRef"])
    .index("by_workspace_repo_type", ["workspaceId", "sourceRepo", "sourceRef", "type"]),

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
    messageHistory: v.optional(v.string()),
    pausedAtToolCallId: v.optional(v.string()),
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

  activityLogs: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.optional(v.string()),
    action: v.string(),
    targetType: v.optional(v.string()),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    actorName: v.optional(v.string()),
    actorEmail: v.optional(v.string()),
    actorImage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspace_created", ["workspaceId", "createdAt"])
    .index("by_user_created", ["userId", "createdAt"]),

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

  personas: defineTable({
    workspaceId: v.id("workspaces"),
    archetypeId: v.string(),
    name: v.string(),
    description: v.string(),
    role: v.any(),
    pains: v.array(v.string()),
    successCriteria: v.array(v.string()),
    evaluationHeuristics: v.array(v.string()),
    typicalTools: v.array(v.string()),
    fears: v.array(v.string()),
    psychographicRanges: v.any(),
    content: v.string(),
    filePath: v.optional(v.string()),
    version: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_archetype", ["workspaceId", "archetypeId"]),

  signalPersonas: defineTable({
    signalId: v.id("signals"),
    personaId: v.id("personas"),
    linkedBy: v.optional(v.string()),
  })
    .index("by_signal", ["signalId"])
    .index("by_persona", ["personaId"]),

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

  // ── Execution Worker System ───────────────────────────────────────────────
  // Replaces the Postgres stage_runs / run_logs / artifacts / worker_heartbeats
  // tables. Workers are external processes; Convex is the control plane.

  stageRuns: defineTable({
    cardId: v.string(),               // project/card ID being automated
    workspaceId: v.id("workspaces"),
    stage: v.string(),                // "discovery" | "define" | "build" | "validate" | "launch"
    // "queued" | "running" | "succeeded" | "failed" | "cancelled"
    status: v.string(),
    automationLevel: v.string(),      // "full_auto" | "human_approval" | "human_in_loop"
    provider: v.string(),             // "anthropic" | "openai"
    attempt: v.number(),
    idempotencyKey: v.string(),
    triggeredBy: v.string(),          // Clerk user ID or "system"
    claimedBy: v.optional(v.string()),  // worker ID
    claimedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_card_stage", ["cardId", "stage"])
    .index("by_idempotency", ["idempotencyKey"]),

  runLogs: defineTable({
    runId: v.id("stageRuns"),
    workspaceId: v.id("workspaces"),
    level: v.string(),    // "info" | "warn" | "error" | "debug"
    message: v.string(),
    stepKey: v.optional(v.string()),
    meta: v.optional(v.any()),
  }).index("by_run", ["runId"]),

  artifacts: defineTable({
    runId: v.id("stageRuns"),
    workspaceId: v.id("workspaces"),
    cardId: v.string(),
    // "document" | "file" | "url" | "pr" | "storybook" | "prototype"
    type: v.string(),
    content: v.optional(v.string()),
    url: v.optional(v.string()),
    metadata: v.optional(v.any()),
  }).index("by_run", ["runId"]),

  workerHeartbeats: defineTable({
    workerId: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    lastSeen: v.number(),
    activeRunIds: v.optional(v.array(v.string())),
    processedCount: v.number(),
    failedCount: v.number(),
  }).index("by_worker", ["workerId"]),

  stageRecipes: defineTable({
    workspaceId: v.id("workspaces"),
    stage: v.string(),
    automationLevel: v.string(),
    provider: v.string(),
    skills: v.optional(v.array(v.string())),
    gates: v.optional(v.array(v.string())),
    enabled: v.boolean(),
    // Full structured recipe steps and gate definitions (richer than skills[]/gates[])
    recipeSteps: v.optional(v.any()),
    gateDefinitions: v.optional(v.any()),
    onFailBehavior: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_stage", ["workspaceId", "stage"]),

  // ── Skills Catalog ────────────────────────────────────────────────────────
  // Replaces Postgres skills table.

  skills: defineTable({
    workspaceId: v.optional(v.id("workspaces")),
    source: v.string(), // "local" | "skillsmp" | "imported"
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    entrypoint: v.optional(v.string()),
    promptTemplate: v.optional(v.string()),
    trustLevel: v.string(), // "vetted" | "community" | "untrusted"
    remoteMetadata: v.optional(v.any()),
    metadata: v.optional(v.any()),
    inputSchema: v.optional(v.any()),
    outputSchema: v.optional(v.any()),
    tags: v.optional(v.array(v.string())),
    lastSynced: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_source", ["source"]),

  // ── Knowledge Sources ─────────────────────────────────────────────────────
  // Replaces Postgres knowledge_sources table.

  knowledgeSources: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(), // "notion" | "confluence" | "drive"
    config: v.optional(v.any()),
    lastSyncedAt: v.optional(v.number()),
  }).index("by_workspace", ["workspaceId"]),

  // ── Tickets and Linear Sync ───────────────────────────────────────────────
  // Replaces Postgres tickets / linearMappings tables.

  tickets: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    status: v.optional(v.string()),
    linearId: v.optional(v.string()),
    linearIdentifier: v.optional(v.string()),
    jiraId: v.optional(v.string()),
    jiraKey: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("by_project", ["projectId"])
    .index("by_workspace", ["workspaceId"]),

  linearMappings: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    linearTeamId: v.optional(v.string()),
    linearProjectId: v.optional(v.string()),
    lastSyncedAt: v.optional(v.number()),
  }).index("by_workspace", ["workspaceId"]),

  // ── Project Commits ───────────────────────────────────────────────────────
  // Replaces Postgres projectCommits table.

  projectCommits: defineTable({
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
    sha: v.string(),
    message: v.string(),
    author: v.optional(v.string()),
    committedAt: v.number(),
    url: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_committed", ["projectId", "committedAt"]),

  // ── Webhook Keys ──────────────────────────────────────────────────────────
  // Replaces Postgres webhookKeys table.

  webhookKeys: defineTable({
    workspaceId: v.id("workspaces"),
    keyHash: v.string(),
    name: v.string(),
    createdBy: v.optional(v.string()),
    lastUsedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_key_hash", ["keyHash"]),

  // ── Jury Evaluations ──────────────────────────────────────────────────────
  // Replaces Postgres juryEvaluations table.
  // Stores results from synthetic user jury evaluations run during the validate stage.

  juryEvaluations: defineTable({
    projectId: v.id("projects"),
    workspaceId: v.id("workspaces"),
    phase: v.string(), // "prototype" | "prd" | "design"
    jurySize: v.number(),
    approvalRate: v.number(), // 0.0 – 1.0
    conditionalRate: v.optional(v.number()),
    rejectionRate: v.optional(v.number()),
    verdict: v.string(), // "pass" | "fail" | "conditional"
    topConcerns: v.optional(v.array(v.string())),
    topSuggestions: v.optional(v.array(v.string())),
    rawResults: v.optional(v.any()),
    reportPath: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_workspace", ["workspaceId"]),

  // ── Signals with embedding storage ───────────────────────────────────────
  // embeddingVector is added to existing signals via a migration.
  // Stored as an array of float64 numbers (1536 dimensions for text-embedding-3-small).
  // Used for in-process cosine similarity search replacing pgvector.
});

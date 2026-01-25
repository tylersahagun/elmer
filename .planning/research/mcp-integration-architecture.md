# MCP Integration Architecture Research

**Date:** 2026-01-24  
**Status:** Research Complete  
**Related:** `orchestrator/`, `mcp-server/`, `elmer-docs/company-context/integrations.md`

## Executive Summary

This document researches how Model Context Protocol (MCP) tools work and how they could be integrated into the Next.js job runner (`orchestrator`). MCP provides a standardized way to connect AI agents with external data sources and tools through a client-host-server architecture.

**Key Findings:**
- MCP uses JSON-RPC over stdio/HTTP/SSE transports
- Current architecture: Jobs stay "pending" → Cursor AI processes via MCP → Results saved back
- Proposed architecture: Job runner acts as MCP client → Connects to external MCP servers → Executes tools directly
- Authentication handled per-server via workspace configuration
- Tool naming convention: `{TOOLKIT}_{ACTION}_{ENTITY}` (e.g., `SLACK_SEND_MESSAGE`)

---

## 1. How MCP Works

### 1.1 Architecture Overview

MCP follows a **client-host-server architecture** built on JSON-RPC:

```
┌─────────┐      ┌─────────┐      ┌─────────┐
│  Host   │──────│ Client  │──────│ Server  │
│(Cursor) │      │(Job Run)│      │(Linear) │
└─────────┘      └─────────┘      └─────────┘
```

**Components:**

1. **Host** (Cursor IDE)
   - Creates and manages client instances
   - Controls permissions and lifecycle
   - Enforces security policies
   - Coordinates AI/LLM integration

2. **Client** (Job Runner)
   - Maintains 1:1 stateful session per server
   - Handles protocol negotiation
   - Routes messages bidirectionally
   - Manages subscriptions/notifications

3. **Server** (External Service)
   - Exposes resources, tools, and prompts
   - Operates independently
   - Requests sampling through client
   - Respects security constraints

### 1.2 Protocol Details

**Transport Types:**
- **Stdio** - Local process-spawned servers (current `mcp-server/`)
- **Streamable HTTP** - Remote servers (recommended for production)
- **HTTP + SSE** - Backwards compatibility

**Protocol Flow:**
1. **Initialize** - Client sends `initialize` request, server responds with capabilities
2. **Tool Discovery** - Client calls `tools/list` to discover available tools
3. **Tool Execution** - Client calls `tools/call` with tool name and arguments
4. **Resource Access** - Client calls `resources/list` and `resources/read` for data
5. **Sampling** - Server can request AI sampling through client interface

**Message Format:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "SLACK_SEND_MESSAGE",
    "arguments": {
      "channel": "#general",
      "text": "Hello"
    }
  }
}
```

### 1.3 Tool Discovery

Tools are discovered via `tools/list` request:

```typescript
// Server response
{
  "tools": [
    {
      "name": "SLACK_SEND_MESSAGE",
      "description": "Send a message to a Slack channel",
      "inputSchema": {
        "type": "object",
        "properties": {
          "channel": { "type": "string" },
          "text": { "type": "string" }
        },
        "required": ["channel", "text"]
      }
    }
  ]
}
```

**Tool Naming Convention:**
- Format: `{TOOLKIT}_{ACTION}_{ENTITY}`
- Examples:
  - `SLACK_FETCH_CONVERSATION_HISTORY`
  - `LINEAR_CREATE_LINEAR_ISSUE`
  - `NOTION_QUERY_DATABASE`
  - `HUBSPOT_GET_CONTACT_IDS`
  - `POSTHOG_RETRIEVE_PROJECT_INSIGHTS`

---

## 2. Current Architecture

### 2.1 Existing Flow

**Current State:**
```
Job Created → Status: "pending" → Cursor AI (via MCP) → complete-job → Status: "completed"
```

**Components:**

1. **Job Executor** (`orchestrator/src/lib/jobs/executor.ts`)
   - Validates job prerequisites
   - Leaves jobs in "pending" status
   - Jobs NOT executed server-side

2. **MCP Server** (`mcp-server/src/index.ts`)
   - Provides CRUD tools for jobs
   - Exposes job processing tools (generate-prd, analyze-transcript, etc.)
   - Runs as stdio server (spawned by Cursor)

3. **Cursor AI**
   - Calls `get-pending-jobs` MCP tool
   - Processes jobs using other MCP tools
   - Calls `complete-job` to finish

**Limitations:**
- Jobs only process when Cursor is active
- No server-side execution capability
- Cannot leverage external MCP servers (Slack, Linear, etc.)

### 2.2 Agent Executor (Alternative)

**New Component:** `orchestrator/src/lib/agent/executor.ts`
- Uses Anthropic SDK directly
- Has tool definitions matching MCP server
- Executes jobs server-side using Claude
- **Does NOT use MCP protocol** - uses Anthropic tool use instead

**Current Tools:**
- `get_project_context`
- `get_workspace_context`
- `save_document`
- `save_jury_evaluation`
- `save_tickets`
- `update_project_score`

---

## 3. Proposed Architecture: MCP Client Integration

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              Next.js Job Runner (Orchestrator)           │
│                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ Job Worker   │───▶│ MCP Client   │───▶│ External  │ │
│  │              │    │ Manager      │    │ MCP       │ │
│  │              │    │              │    │ Servers    │ │
│  └──────────────┘    └──────────────┘    └───────────┘ │
│         │                    │                  │        │
│         │                    │                  │        │
│         ▼                    ▼                  ▼        │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Database (Jobs, Projects, Docs)         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              External MCP Servers                        │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Slack   │  │  Linear  │  │  Notion  │  │ PostHog ││
│  │  MCP     │  │  MCP     │  │  MCP     │  │  MCP    ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
└─────────────────────────────────────────────────────────┘
```

### 3.2 Execution Flow

**Step-by-Step:**

1. **Job Created**
   ```
   Job Worker detects new job → Validates prerequisites → Ready to execute
   ```

2. **MCP Client Connection**
   ```
   Job Worker → MCP Client Manager → Get workspace MCP config → Connect to servers
   ```

3. **Tool Discovery**
   ```
   MCP Client → tools/list → Cache tool definitions → Map to job requirements
   ```

4. **Tool Execution**
   ```
   Job Worker → Identify required tools → MCP Client → tools/call → External API
   ```

5. **Result Processing**
   ```
   External API response → MCP Client → Job Worker → Save results → Complete job
   ```

**Example: Generate Tickets Job**

```typescript
// 1. Job created: generate_tickets
{
  type: "generate_tickets",
  projectId: "proj_123",
  input: { engineeringSpec: "..." }
}

// 2. Job Worker identifies: Need LINEAR_CREATE_LINEAR_ISSUE tool

// 3. MCP Client Manager connects to Linear MCP server
const linearClient = await mcpClientManager.connect("linear", {
  apiKey: workspace.mcpConfigs.linear.apiKey,
  workspaceId: workspace.mcpConfigs.linear.workspaceId
});

// 4. Discover available tools
const tools = await linearClient.listTools();
// Returns: ["LINEAR_CREATE_LINEAR_ISSUE", "LINEAR_SEARCH_ISSUES", ...]

// 5. Execute tool
const result = await linearClient.callTool("LINEAR_CREATE_LINEAR_ISSUE", {
  title: "Implement authentication",
  description: "...",
  teamId: "team_123"
});

// 6. Save result and complete job
await saveTickets(projectId, [result.data]);
await completeJob(jobId, { ticketsCreated: 1 });
```

---

## 4. MCP Server Configuration Management

### 4.1 Workspace-Level Configuration

**Database Schema Addition:**

```typescript
// orchestrator/src/lib/db/schema.ts

export const mcpServerConfigs = pgTable("mcp_server_configs", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  
  // Server identification
  serverName: text("server_name").notNull(), // "slack", "linear", "notion", etc.
  serverType: text("server_type").notNull(), // "stdio", "http", "sse"
  
  // Connection details
  command: text("command"), // For stdio: ["node", "path/to/server.js"]
  args: jsonb("args").$type<string[]>(), // Command arguments
  env: jsonb("env").$type<Record<string, string>>(), // Environment variables
  
  // HTTP/SSE details
  url: text("url"), // For HTTP/SSE servers
  headers: jsonb("headers").$type<Record<string, string>>(), // Auth headers
  
  // Authentication
  authType: text("auth_type").$type<"api_key" | "oauth" | "bearer">(),
  credentials: jsonb("credentials").$type<Record<string, string>>(), // Encrypted
  
  // Configuration
  enabled: boolean("enabled").default(true),
  config: jsonb("config").$type<Record<string, unknown>>(), // Server-specific config
  
  // Metadata
  lastConnectedAt: timestamp("last_connected_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 4.2 Configuration Examples

**Slack MCP Server (HTTP):**
```json
{
  "serverName": "slack",
  "serverType": "http",
  "url": "https://mcp-slack.example.com",
  "authType": "bearer",
  "credentials": {
    "token": "xoxb-..."
  },
  "enabled": true
}
```

**Linear MCP Server (HTTP):**
```json
{
  "serverName": "linear",
  "serverType": "http",
  "url": "https://mcp-linear.example.com",
  "authType": "api_key",
  "credentials": {
    "apiKey": "lin_api_..."
  },
  "config": {
    "workspaceId": "team_123"
  },
  "enabled": true
}
```

**Local MCP Server (Stdio):**
```json
{
  "serverName": "pm-orchestrator",
  "serverType": "stdio",
  "command": "node",
  "args": ["../mcp-server/dist/index.js"],
  "env": {
    "ORCHESTRATOR_DB_PATH": "/path/to/db"
  },
  "enabled": true
}
```

### 4.3 Configuration UI

**Settings Page:** `/settings/integrations/mcp`

- List configured MCP servers
- Add/edit server configurations
- Test connections
- View available tools
- Enable/disable servers

---

## 5. Authentication Handling

### 5.1 Authentication Types

**1. API Key**
```typescript
headers: {
  "Authorization": `Bearer ${credentials.apiKey}`
}
```

**2. OAuth 2.0**
```typescript
// Store refresh token, auto-refresh access token
headers: {
  "Authorization": `Bearer ${await getAccessToken(credentials.refreshToken)}`
}
```

**3. Custom Headers**
```typescript
headers: {
  "X-API-Key": credentials.apiKey,
  "X-Workspace-ID": config.workspaceId
}
```

### 5.2 Credential Storage

**Encryption:**
- Store credentials encrypted at rest
- Use workspace-specific encryption keys
- Decrypt only when connecting to server

**Implementation:**
```typescript
import { encrypt, decrypt } from "@/lib/encryption";

// Store
await db.insert(mcpServerConfigs).values({
  credentials: encrypt(JSON.stringify({
    apiKey: "secret_key"
  }), workspaceId)
});

// Retrieve
const config = await db.query.mcpServerConfigs.findFirst(...);
const credentials = JSON.parse(decrypt(config.credentials, workspaceId));
```

### 5.3 Token Refresh

**OAuth Token Refresh:**
```typescript
class MCPClient {
  async refreshTokenIfNeeded() {
    if (this.tokenExpiresAt < Date.now() + 60000) { // 1 min buffer
      const newToken = await refreshOAuthToken(this.refreshToken);
      this.accessToken = newToken.access_token;
      this.tokenExpiresAt = Date.now() + (newToken.expires_in * 1000);
      
      // Update in database
      await updateMCPConfig(this.configId, {
        credentials: encrypt({ ...credentials, accessToken: newToken.access_token })
      });
    }
  }
}
```

---

## 6. MCP Client Implementation

### 6.1 Client Manager

**File:** `orchestrator/src/lib/mcp/client-manager.ts`

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private configs: Map<string, MCPServerConfig> = new Map();

  /**
   * Connect to an MCP server
   */
  async connect(serverName: string, workspaceId: string): Promise<Client> {
    // Check cache
    const cached = this.clients.get(`${workspaceId}:${serverName}`);
    if (cached) return cached;

    // Load config
    const config = await this.loadConfig(serverName, workspaceId);
    if (!config || !config.enabled) {
      throw new Error(`MCP server ${serverName} not configured or disabled`);
    }

    // Create client based on transport type
    let client: Client;
    let transport: Transport;

    switch (config.serverType) {
      case "stdio":
        transport = new StdioClientTransport({
          command: config.command!,
          args: config.args || [],
          env: { ...process.env, ...config.env }
        });
        break;

      case "http":
      case "sse":
        transport = new SSEClientTransport({
          url: config.url!,
          headers: await this.buildHeaders(config)
        });
        break;

      case "streamableHttp":
        transport = new StreamableHTTPClientTransport({
          url: config.url!,
          headers: await this.buildHeaders(config)
        });
        break;

      default:
        throw new Error(`Unsupported transport type: ${config.serverType}`);
    }

    client = new Client({
      name: "orchestrator-job-runner",
      version: "1.0.0"
    }, {
      capabilities: {}
    });

    await client.connect(transport);

    // Initialize
    await client.initialize();

    // Cache client
    const key = `${workspaceId}:${serverName}`;
    this.clients.set(key, client);
    this.configs.set(key, config);

    return client;
  }

  /**
   * Get or connect to a server
   */
  async getClient(serverName: string, workspaceId: string): Promise<Client> {
    const key = `${workspaceId}:${serverName}`;
    const cached = this.clients.get(key);
    if (cached) return cached;
    return this.connect(serverName, workspaceId);
  }

  /**
   * List available tools from a server
   */
  async listTools(serverName: string, workspaceId: string): Promise<Tool[]> {
    const client = await this.getClient(serverName, workspaceId);
    const response = await client.listTools();
    return response.tools;
  }

  /**
   * Call a tool on a server
   */
  async callTool(
    serverName: string,
    workspaceId: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<ToolResult> {
    const client = await this.getClient(serverName, workspaceId);
    const response = await client.callTool({
      name: toolName,
      arguments: args
    });
    return response;
  }

  /**
   * Build authentication headers
   */
  private async buildHeaders(config: MCPServerConfig): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    const credentials = JSON.parse(decrypt(config.credentials, config.workspaceId));

    switch (config.authType) {
      case "api_key":
        headers["X-API-Key"] = credentials.apiKey;
        break;

      case "bearer":
        headers["Authorization"] = `Bearer ${credentials.token}`;
        break;

      case "oauth":
        // Refresh token if needed
        await this.refreshTokenIfNeeded(config);
        headers["Authorization"] = `Bearer ${credentials.accessToken}`;
        break;
    }

    // Add custom headers from config
    if (config.headers) {
      Object.assign(headers, config.headers);
    }

    return headers;
  }

  /**
   * Load server configuration from database
   */
  private async loadConfig(serverName: string, workspaceId: string): Promise<MCPServerConfig | null> {
    const config = await db.query.mcpServerConfigs.findFirst({
      where: and(
        eq(mcpServerConfigs.serverName, serverName),
        eq(mcpServerConfigs.workspaceId, workspaceId),
        eq(mcpServerConfigs.enabled, true)
      )
    });

    return config || null;
  }
}
```

### 6.2 Tool Registry

**File:** `orchestrator/src/lib/mcp/tool-registry.ts`

```typescript
/**
 * Maps job types to required MCP tools
 */
export const JOB_TO_MCP_TOOLS: Record<JobType, string[]> = {
  generate_tickets: ["LINEAR_CREATE_LINEAR_ISSUE", "LINEAR_SEARCH_ISSUES"],
  validate_tickets: ["LINEAR_SEARCH_ISSUES"],
  analyze_transcript: [], // Uses internal tools
  generate_prd: [], // Uses internal tools
  // ... etc
};

/**
 * Maps MCP tool names to server names
 */
export function getServerForTool(toolName: string): string {
  if (toolName.startsWith("SLACK_")) return "slack";
  if (toolName.startsWith("LINEAR_")) return "linear";
  if (toolName.startsWith("NOTION_")) return "notion";
  if (toolName.startsWith("HUBSPOT_")) return "hubspot";
  if (toolName.startsWith("POSTHOG_")) return "posthog";
  // Default to pm-orchestrator for internal tools
  return "pm-orchestrator";
}
```

---

## 7. Integration with Job Executor

### 7.1 Updated Job Executor

**File:** `orchestrator/src/lib/jobs/executor.ts`

```typescript
import { MCPClientManager } from "@/lib/mcp/client-manager";
import { JOB_TO_MCP_TOOLS, getServerForTool } from "@/lib/mcp/tool-registry";

export class JobExecutor {
  private mcpClientManager: MCPClientManager;

  constructor() {
    this.mcpClientManager = new MCPClientManager();
  }

  async executeJob(
    job: AgentJob,
    onProgress?: AgentProgressCallback
  ): Promise<ExecutionResult> {
    // 1. Determine execution mode
    const workspace = await getWorkspace(job.workspaceId);
    const executionMode = workspace.settings?.aiExecutionMode || "server";

    if (executionMode === "cursor") {
      // Leave job pending for Cursor AI
      return { success: true, output: { status: "pending" } };
    }

    // 2. Check if job requires external MCP tools
    const requiredTools = JOB_TO_MCP_TOOLS[job.type] || [];
    const hasExternalTools = requiredTools.some(
      tool => getServerForTool(tool) !== "pm-orchestrator"
    );

    if (hasExternalTools && executionMode === "server") {
      // Execute using MCP clients
      return this.executeWithMCP(job, requiredTools, onProgress);
    }

    // 3. Fall back to internal execution (existing logic)
    return this.executeInternally(job, onProgress);
  }

  private async executeWithMCP(
    job: AgentJob,
    requiredTools: string[],
    onProgress?: AgentProgressCallback
  ): Promise<ExecutionResult> {
    try {
      onProgress?.({ type: "log", message: `Connecting to MCP servers...` });

      // Group tools by server
      const toolsByServer = new Map<string, string[]>();
      for (const tool of requiredTools) {
        const server = getServerForTool(tool);
        if (!toolsByServer.has(server)) {
          toolsByServer.set(server, []);
        }
        toolsByServer.get(server)!.push(tool);
      }

      // Discover tools from each server
      const availableTools = new Map<string, Set<string>>();
      for (const [server, tools] of toolsByServer) {
        try {
          const client = await this.mcpClientManager.getClient(server, job.workspaceId);
          const serverTools = await this.mcpClientManager.listTools(server, job.workspaceId);
          const toolNames = new Set(serverTools.map(t => t.name));
          availableTools.set(server, toolNames);

          // Verify all required tools are available
          for (const tool of tools) {
            if (!toolNames.has(tool)) {
              throw new Error(`Tool ${tool} not available on server ${server}`);
            }
          }
        } catch (error) {
          return {
            success: false,
            error: `Failed to connect to ${server} MCP server: ${error.message}`
          };
        }
      }

      // Execute job-specific logic using MCP tools
      return this.executeJobWithTools(job, requiredTools, onProgress);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "MCP execution failed"
      };
    }
  }

  private async executeJobWithTools(
    job: AgentJob,
    tools: string[],
    onProgress?: AgentProgressCallback
  ): Promise<ExecutionResult> {
    // Job-specific execution logic
    switch (job.type) {
      case "generate_tickets": {
        // 1. Get engineering spec
        const engSpec = await getDocumentByType(job.projectId!, "engineering_spec");
        
        // 2. Generate tickets using AI (internal)
        const tickets = await this.generateTicketsFromSpec(engSpec?.content || "");
        
        // 3. Create tickets in Linear using MCP
        const linearClient = await this.mcpClientManager.getClient("linear", job.workspaceId);
        const createdTickets = [];
        
        for (const ticket of tickets) {
          onProgress?.({ 
            type: "log", 
            message: `Creating ticket: ${ticket.title}` 
          });
          
          const result = await this.mcpClientManager.callTool(
            "linear",
            job.workspaceId,
            "LINEAR_CREATE_LINEAR_ISSUE",
            {
              title: ticket.title,
              description: ticket.description,
              teamId: job.workspace.mcpConfigs?.linear?.teamId
            }
          );
          
          createdTickets.push(result);
        }
        
        // 4. Save tickets to database
        await createTickets(job.projectId!, createdTickets);
        
        return {
          success: true,
          output: { ticketsCreated: createdTickets.length }
        };
      }

      // ... other job types
    }
  }
}
```

---

## 8. Recommendations

### 8.1 Implementation Phases

**Phase 1: Foundation (Week 1-2)**
- [ ] Add `mcp_server_configs` table to database
- [ ] Implement `MCPClientManager` class
- [ ] Add MCP server configuration UI
- [ ] Test with local `pm-orchestrator` MCP server

**Phase 2: External Servers (Week 3-4)**
- [ ] Integrate Linear MCP server
- [ ] Integrate Slack MCP server (if available)
- [ ] Add credential encryption/decryption
- [ ] Implement token refresh for OAuth

**Phase 3: Job Integration (Week 5-6)**
- [ ] Update `JobExecutor` to use MCP clients
- [ ] Implement tool registry and mapping
- [ ] Add MCP tool execution to job workflows
- [ ] Error handling and retry logic

**Phase 4: Advanced Features (Week 7-8)**
- [ ] Tool discovery caching
- [ ] Connection pooling
- [ ] Health checks and monitoring
- [ ] Rate limiting per server

### 8.2 Architecture Decisions

**Decision 1: Client vs. Direct API Calls**
- **Recommendation:** Use MCP clients for consistency
- **Rationale:** Standardized interface, easier to add new integrations, matches Cursor workflow

**Decision 2: Connection Management**
- **Recommendation:** Connection pooling with lazy initialization
- **Rationale:** Avoid connection overhead, reuse connections across jobs

**Decision 3: Error Handling**
- **Recommendation:** Graceful degradation to internal execution
- **Rationale:** If MCP server unavailable, fall back to existing logic

**Decision 4: Authentication Storage**
- **Recommendation:** Encrypt credentials at rest, decrypt on-demand
- **Rationale:** Security best practice, workspace-level encryption keys

### 8.3 Security Considerations

1. **Credential Encryption**
   - Use workspace-specific encryption keys
   - Never log credentials
   - Rotate keys periodically

2. **Network Security**
   - Use HTTPS for HTTP/SSE transports
   - Validate SSL certificates
   - Support custom CA certificates

3. **Access Control**
   - Verify workspace ownership before connecting
   - Audit MCP tool calls
   - Rate limit per workspace

4. **Error Handling**
   - Don't expose credential errors in logs
   - Sanitize error messages
   - Log connection failures (without credentials)

### 8.4 Performance Considerations

1. **Connection Pooling**
   - Reuse connections across jobs
   - Close idle connections after timeout
   - Max connections per server

2. **Tool Discovery Caching**
   - Cache tool lists per server
   - Invalidate on server config change
   - TTL: 1 hour

3. **Parallel Execution**
   - Execute independent tools in parallel
   - Batch tool calls when possible
   - Respect rate limits

---

## 9. Example: Generate Tickets Job Flow

### 9.1 Current Flow (Cursor)

```
1. Job created: generate_tickets
2. Job status: "pending"
3. Cursor AI calls: get-pending-jobs
4. Cursor AI calls: get-job-context
5. Cursor AI generates tickets using AI
6. Cursor AI calls: complete-job with tickets
7. Job status: "completed"
```

### 9.2 Proposed Flow (Server + MCP)

```
1. Job created: generate_tickets
2. Job Worker picks up job
3. Job Worker → MCP Client Manager → Connect to Linear MCP
4. Job Worker → Get engineering spec from database
5. Job Worker → Generate tickets using AI (internal)
6. Job Worker → MCP Client → LINEAR_CREATE_LINEAR_ISSUE (for each ticket)
7. Job Worker → Save tickets to database
8. Job Worker → Complete job
9. Job status: "completed"
```

**Benefits:**
- ✅ No dependency on Cursor being active
- ✅ Can run in background/worker processes
- ✅ Leverages external MCP servers directly
- ✅ Consistent with Cursor workflow (same tools)

---

## 10. Open Questions

1. **MCP Server Availability**
   - Are official MCP servers available for Slack, Linear, Notion, etc.?
   - Do we need to build our own MCP servers for these services?
   - Should we use existing SDKs wrapped in MCP servers?

2. **Tool Naming**
   - Should we standardize tool names across servers?
   - How do we handle conflicts (same tool name, different servers)?

3. **Fallback Strategy**
   - If MCP server unavailable, fall back to direct API calls?
   - Or fail job and retry later?

4. **Monitoring**
   - How do we monitor MCP server health?
   - What metrics should we track (latency, error rate, etc.)?

5. **Testing**
   - How do we test MCP client integration?
   - Mock MCP servers for unit tests?

---

## 11. References

- [MCP Specification](https://modelcontextprotocol.io/specification/latest)
- [MCP Architecture](https://modelcontextprotocol.io/specification/2024-11-05/architecture)
- [MCP SDK Documentation](https://modelcontextprotocol.io/docs/sdk)
- [Building MCP Clients (Node.js)](https://modelcontextprotocol.info/docs/tutorials/building-a-client-node/)
- [Current MCP Server Implementation](../mcp-server/src/index.ts)
- [Current Job Executor](../orchestrator/src/lib/jobs/executor.ts)
- [Agent Executor](../orchestrator/src/lib/agent/executor.ts)

---

## 12. Next Steps

1. **Research MCP Server Availability**
   - Check if official MCP servers exist for target services
   - Evaluate community-built servers
   - Determine if we need to build custom servers

2. **Prototype MCP Client**
   - Build minimal `MCPClientManager` implementation
   - Test with local `pm-orchestrator` server
   - Verify tool discovery and execution

3. **Design Database Schema**
   - Finalize `mcp_server_configs` table structure
   - Plan migration strategy
   - Design configuration UI

4. **Create Integration Plan**
   - Prioritize which MCP servers to integrate first
   - Estimate effort for each integration
   - Plan testing strategy

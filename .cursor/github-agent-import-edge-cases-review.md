# GitHub Agent Architecture Import - Edge Cases & Error Handling Review

**Review Date:** January 24, 2026  
**Source Plan:** `.cursor/pm-workspace-structure-analysis.md`  
**Target:** Import agent architecture from GitHub repositories (commands, skills, agents, rules)

---

## Executive Summary

The current import plan outlines a basic structure for importing agent architectures but lacks comprehensive error handling and edge case management. This review identifies 10 critical scenarios and provides recommendations for graceful degradation, partial success handling, and user experience improvements.

---

## 1. Partial Import: Some Files Fail to Parse

### What Could Go Wrong
- **Malformed Markdown**: Syntax errors, invalid frontmatter, encoding issues
- **File Permissions**: Read-only files, locked files, permission denied
- **Corrupted Files**: Binary data in text files, incomplete downloads
- **Parser Errors**: Markdown parser crashes on edge cases (nested code blocks, unusual syntax)

### Impact
- **High**: User gets partial functionality, unclear what's broken
- **Medium**: Some commands work, others don't, confusing UX
- **Low**: Import appears successful but silently fails on some files

### How to Handle Gracefully

1. **Transaction-like Behavior**
   ```typescript
   interface ImportResult {
     success: boolean;
     imported: {
       commands: string[];
       skills: string[];
       agents: string[];
       rules: string[];
     };
     failed: {
       file: string;
       error: string;
       category: 'command' | 'skill' | 'agent' | 'rule';
     }[];
     warnings: string[];
   }
   ```

2. **Continue on Error**
   - Parse files individually with try-catch per file
   - Log failures but continue processing remaining files
   - Return detailed report of successes and failures

3. **Validation Before Import**
   - Pre-flight check: validate file structure before importing
   - Report issues upfront: "5 files have syntax errors, proceed anyway?"

4. **User Choice**
   - Option to "Import All" vs "Import Valid Only"
   - Show preview of what will be imported before committing
   - Allow manual review of failed files

### What Should Be Added to Plan

```markdown
## Error Handling: Partial Import

1. **Per-File Error Isolation**
   - Wrap each file parse in try-catch
   - Continue processing remaining files on error
   - Track success/failure per file

2. **Import Result Reporting**
   - Return structured result with:
     - Successfully imported items
     - Failed items with error messages
     - Warnings (e.g., deprecated format, missing dependencies)

3. **Pre-Import Validation**
   - Optional validation pass before import
   - Report issues without importing
   - Allow user to fix issues or proceed anyway

4. **Rollback Capability**
   - Track what was imported in this session
   - Provide "undo import" functionality
   - Store import metadata for audit trail
```

---

## 2. Sync Conflicts: Repo Changes Between Syncs

### What Could Go Wrong
- **Concurrent Modifications**: User modifies imported files locally while repo updates
- **Deleted Files**: Files removed from repo but still exist locally
- **Renamed Files**: Files renamed in repo (old name exists locally, new name doesn't)
- **Version Drift**: Local changes conflict with upstream changes

### Impact
- **High**: Data loss, overwritten user changes
- **Medium**: Confusion about which version is "correct"
- **Low**: Stale imports, missing new features

### How to Handle Gracefully

1. **Three-Way Merge Strategy**
   - Base (last sync) → Local (current) → Remote (new)
   - Detect conflicts and prompt user
   - Auto-merge when safe (e.g., only remote changed)

2. **Conflict Detection**
   ```typescript
   interface SyncConflict {
     file: string;
     type: 'modified' | 'deleted' | 'renamed' | 'added';
     localVersion: string | null;
     remoteVersion: string | null;
     baseVersion: string | null;
     resolution: 'keep-local' | 'use-remote' | 'merge' | 'manual';
   }
   ```

3. **Sync Modes**
   - **Safe Mode**: Only sync if no local changes detected
   - **Merge Mode**: Attempt automatic merge, prompt on conflicts
   - **Overwrite Mode**: Replace local with remote (with confirmation)
   - **Dry Run**: Show what would change without applying

4. **Version Tracking**
   - Store commit SHA or last-modified timestamp per file
   - Compare against remote before syncing
   - Track sync history

### What Should Be Added to Plan

```markdown
## Sync Conflict Handling

1. **Pre-Sync Conflict Detection**
   - Compare local file hashes/timestamps with last sync state
   - Detect modified, deleted, renamed files
   - Report conflicts before syncing

2. **Conflict Resolution Strategies**
   - **Auto-merge**: When only remote changed (safe)
   - **Keep Local**: When only local changed
   - **Prompt User**: When both changed (show diff)
   - **Manual Review**: For complex conflicts

3. **Sync Modes**
   - Safe (no local changes), Merge (auto-merge), Overwrite (with confirmation)
   - Dry-run mode to preview changes

4. **Version Tracking**
   - Store commit SHA or timestamp per imported file
   - Compare against remote before syncing
   - Maintain sync history/audit log
```

---

## 3. Circular References: Command → Skill → Command

### What Could Go Wrong
- **Direct Cycles**: Command A references Skill B, Skill B references Command A
- **Indirect Cycles**: Command A → Skill B → Agent C → Command A
- **Deep Cycles**: Multi-level circular dependencies
- **Self-References**: Component references itself

### Impact
- **High**: Infinite loops during execution, stack overflow
- **Medium**: Import hangs, unclear error messages
- **Low**: Performance degradation, confusing dependency graph

### How to Handle Gracefully

1. **Dependency Graph Construction**
   ```typescript
   interface DependencyNode {
     id: string;
     type: 'command' | 'skill' | 'agent' | 'rule';
     dependencies: string[]; // IDs of referenced components
   }
   
   function buildDependencyGraph(imported: ImportResult): Map<string, DependencyNode> {
     // Build graph from imported items
   }
   ```

2. **Cycle Detection Algorithm**
   - Use DFS (Depth-First Search) with coloring
   - Detect cycles during graph construction
   - Report all cycles found, not just first one

3. **Cycle Resolution**
   - **Warn and Continue**: Import anyway, warn about cycles
   - **Break Cycles**: Optionally remove one dependency to break cycle
   - **Fail Fast**: Reject import if cycles detected (strict mode)

4. **Visualization**
   - Generate dependency graph visualization
   - Highlight cycles in red
   - Show affected components

### What Should Be Added to Plan

```markdown
## Circular Reference Detection

1. **Dependency Graph Analysis**
   - Build directed graph of all dependencies
   - Nodes: commands, skills, agents, rules
   - Edges: references between components

2. **Cycle Detection**
   - Use DFS algorithm to detect cycles
   - Report all cycles, not just first
   - Identify cycle participants

3. **Cycle Resolution Options**
   - **Strict Mode**: Fail import if cycles detected
   - **Warn Mode**: Import anyway, log warnings
   - **Auto-Break**: Remove one dependency to break cycle (with user approval)

4. **Dependency Visualization**
   - Generate visual dependency graph
   - Highlight cycles
   - Export as image or interactive diagram
```

---

## 4. Missing Dependencies: Skill References Non-Existent File

### What Could Go Wrong
- **Broken References**: Skill references command that wasn't imported
- **Version Mismatch**: Skill expects newer version of command
- **Renamed Components**: Component renamed but references still use old name
- **External Dependencies**: References to components outside import scope

### Impact
- **High**: Runtime failures when using imported components
- **Medium**: Import succeeds but functionality broken
- **Low**: Warnings ignored, issues discovered later

### How to Handle Gracefully

1. **Dependency Validation**
   ```typescript
   interface DependencyCheck {
     component: string;
     missing: string[];
     outdated: { ref: string; expected: string; found: string }[];
     external: string[]; // References outside import scope
   }
   ```

2. **Pre-Import Validation**
   - Scan all files for references before importing
   - Build reference map (what references what)
   - Validate all references exist in import set

3. **Resolution Strategies**
   - **Fail Fast**: Reject import if dependencies missing
   - **Import Dependencies**: Optionally fetch missing dependencies from repo
   - **Warn and Continue**: Import anyway, mark as incomplete
   - **Create Stubs**: Generate placeholder components for missing deps

4. **Dependency Resolution**
   - **Shallow**: Only check direct references
   - **Deep**: Recursively check all transitive dependencies
   - **Optional**: Distinguish required vs optional dependencies

### What Should Be Added to Plan

```markdown
## Missing Dependency Handling

1. **Dependency Scanning**
   - Parse all files for references (@references, imports, calls)
   - Build reference map before import
   - Identify internal vs external references

2. **Dependency Validation**
   - Check all references exist in import set
   - Validate version compatibility (if versioned)
   - Detect renamed/moved components

3. **Resolution Options**
   - **Strict**: Fail if required dependencies missing
   - **Auto-Import**: Fetch missing dependencies from repo
   - **Warn**: Import anyway, mark incomplete components
   - **Stub**: Create placeholder components

4. **Dependency Types**
   - Required: Must exist or import fails
   - Optional: Warn if missing but continue
   - External: References outside import scope (document only)
```

---

## 5. Large Repos: Hundreds of Skills/Commands

### What Could Go Wrong
- **Performance**: Slow parsing, memory exhaustion
- **Timeout**: Import takes too long, request times out
- **Rate Limiting**: GitHub API rate limits exceeded
- **UI Freeze**: Browser/UI becomes unresponsive during import

### Impact
- **High**: Import fails, user frustrated
- **Medium**: Slow performance, poor UX
- **Low**: Background processing needed

### How to Handle Gracefully

1. **Pagination & Batching**
   ```typescript
   interface ImportProgress {
     total: number;
     processed: number;
     current: string;
     stage: 'discovery' | 'parsing' | 'validating' | 'importing';
     errors: number;
   }
   ```

2. **Incremental Processing**
   - Process files in batches (e.g., 10-20 at a time)
   - Yield control between batches (prevent blocking)
   - Show progress indicator

3. **Background Processing**
   - Use background job/worker for large imports
   - Stream progress updates via SSE/WebSocket
   - Allow user to navigate away, return later

4. **Optimization**
   - Parallel parsing where safe (independent files)
   - Lazy loading (parse on-demand vs all upfront)
   - Caching parsed results

5. **Rate Limit Management**
   - Track GitHub API rate limit usage
   - Implement exponential backoff
   - Queue requests, process when limit resets

### What Should Be Added to Plan

```markdown
## Large Repository Handling

1. **Batch Processing**
   - Process files in configurable batches (default: 20)
   - Yield between batches to prevent blocking
   - Show progress: "Processing 45/200 files..."

2. **Background Jobs**
   - For imports > 50 files, use background job
   - Stream progress updates to UI
   - Allow user to check status later

3. **Progress Tracking**
   - Real-time progress updates
   - Stage indicators (discovery, parsing, validating, importing)
   - Estimated time remaining

4. **Performance Optimization**
   - Parallel parsing for independent files
   - Lazy loading (parse on-demand)
   - Cache parsed results

5. **Rate Limit Management**
   - Track GitHub API usage
   - Implement exponential backoff
   - Queue requests when limit reached
   - Resume when limit resets
```

---

## 6. Private Repos: Rate Limits, Token Expiration, Access Revocation

### What Could Go Wrong
- **Token Expiration**: GitHub token expires mid-import
- **Access Revocation**: User revokes access, token invalidated
- **Rate Limits**: Exceed GitHub API rate limits (5,000/hour for authenticated)
- **Permission Changes**: Repo made private, user loses access

### Impact
- **High**: Import fails mid-way, partial state
- **Medium**: Need to re-authenticate, restart import
- **Low**: Delayed import due to rate limits

### How to Handle Gracefully

1. **Token Validation**
   ```typescript
   async function validateGitHubToken(token: string): Promise<boolean> {
     try {
       const octokit = new Octokit({ auth: token });
       await octokit.users.getAuthenticated();
       return true;
     } catch (error) {
       if (error.status === 401) return false;
       throw error;
     }
   }
   ```

2. **Pre-Import Checks**
   - Validate token before starting import
   - Check repository access permissions
   - Verify rate limit availability

3. **Token Refresh**
   - Detect token expiration (401 errors)
   - Prompt user to re-authenticate
   - Resume import from checkpoint

4. **Rate Limit Handling**
   - Track rate limit usage (check `X-RateLimit-Remaining` header)
   - Implement exponential backoff
   - Queue requests when limit reached
   - Show user: "Rate limit reached, resuming in 1 hour"

5. **Checkpointing**
   - Save import state periodically
   - Resume from last checkpoint on failure
   - Store: files processed, errors encountered, current position

6. **Access Error Handling**
   - Detect 403 (forbidden) vs 404 (not found)
   - Clear error messages: "Access denied" vs "Repository not found"
   - Provide re-authentication flow

### What Should Be Added to Plan

```markdown
## Private Repository & Authentication Handling

1. **Pre-Import Validation**
   - Validate GitHub token before import
   - Check repository access (public/private)
   - Verify rate limit availability
   - Test API connectivity

2. **Token Management**
   - Detect token expiration (401 errors)
   - Prompt for re-authentication
   - Store refresh tokens if available
   - Clear error messages for auth failures

3. **Rate Limit Management**
   - Track rate limit usage from API headers
   - Implement exponential backoff
   - Queue requests when limit reached
   - Show user-friendly messages: "Rate limit reached, resuming in X minutes"

4. **Checkpointing**
   - Save import progress periodically
   - Store: files processed, errors, current position
   - Resume from checkpoint on failure
   - Allow manual resume

5. **Access Error Handling**
   - Distinguish 403 (forbidden) vs 404 (not found)
   - Clear error messages
   - Provide re-authentication flow
   - Handle permission changes gracefully
```

---

## 7. Offline/Network: GitHub Unreachable During Execution

### What Could Go Wrong
- **Network Interruption**: Connection lost mid-import
- **GitHub Downtime**: GitHub API unavailable
- **DNS Issues**: Cannot resolve github.com
- **Firewall/Proxy**: Corporate firewall blocks GitHub

### Impact
- **High**: Import fails, partial state, need to restart
- **Medium**: User waits, unclear what's happening
- **Low**: Temporary delay, auto-retry succeeds

### How to Handle Gracefully

1. **Retry Logic**
   ```typescript
   interface RetryConfig {
     maxRetries: number;
     initialDelay: number; // ms
     maxDelay: number; // ms
     backoffMultiplier: number;
   }
   
   async function fetchWithRetry<T>(
     fn: () => Promise<T>,
     config: RetryConfig
   ): Promise<T> {
     // Exponential backoff retry logic
   }
   ```

2. **Network Detection**
   - Check connectivity before import
   - Detect network errors (ECONNREFUSED, ETIMEDOUT)
   - Distinguish temporary vs permanent failures

3. **Graceful Degradation**
   - Use cached data if available
   - Show offline mode message
   - Allow queuing imports for when online

4. **Checkpointing & Resume**
   - Save progress before each network call
   - Resume from last successful fetch
   - Don't re-fetch already downloaded files

5. **User Communication**
   - Show connection status indicator
   - Clear error messages: "Cannot reach GitHub, retrying..."
   - Allow manual retry vs auto-retry

6. **Timeout Handling**
   - Set reasonable timeouts (e.g., 30s per request)
   - Distinguish timeout vs network error
   - Retry with longer timeout on timeout errors

### What Should Be Added to Plan

```markdown
## Network & Offline Handling

1. **Pre-Import Connectivity Check**
   - Test GitHub API connectivity before import
   - Check DNS resolution
   - Verify network access

2. **Retry Strategy**
   - Exponential backoff (1s, 2s, 4s, 8s...)
   - Max retries: 3-5 attempts
   - Distinguish retryable vs non-retryable errors

3. **Checkpointing**
   - Save progress after each successful file fetch
   - Resume from last checkpoint on failure
   - Don't re-fetch already downloaded files

4. **Timeout Management**
   - Set per-request timeouts (30s default)
   - Longer timeout for large files
   - Distinguish timeout vs network error

5. **User Feedback**
   - Show connection status: "Connected" / "Retrying..." / "Offline"
   - Progress indicator: "Fetching file 23/100..."
   - Clear error messages with retry option

6. **Offline Mode**
   - Use cached data if available
   - Queue imports for when online
   - Show "Import queued, will resume when online"
```

---

## 8. Version Mismatch: Old SKILL.md Format

### What Could Go Wrong
- **Format Evolution**: SKILL.md format changed, old format incompatible
- **Missing Fields**: New required fields not present in old format
- **Deprecated Syntax**: Old syntax no longer supported
- **Schema Changes**: Validation rules changed

### Impact
- **High**: Import fails, unclear why
- **Medium**: Import succeeds but functionality broken
- **Low**: Warnings, degraded functionality

### How to Handle Gracefully

1. **Format Detection**
   ```typescript
   interface FormatVersion {
     version: string; // e.g., "1.0", "2.0"
     detected: boolean;
     confidence: 'high' | 'medium' | 'low';
   }
   
   function detectFormatVersion(content: string): FormatVersion {
     // Detect format based on structure, fields, syntax
   }
   ```

2. **Version Compatibility Matrix**
   - Document supported format versions
   - Map old → new format conversion rules
   - Identify breaking changes

3. **Migration/Conversion**
   - Auto-convert old format to new format
   - Preserve data during conversion
   - Log conversion actions

4. **Validation with Warnings**
   - Accept old format but warn user
   - Mark as "legacy format"
   - Suggest migration path

5. **Format Documentation**
   - Document format versions
   - Provide migration guide
   - Show examples of each version

6. **Strict vs Lenient Mode**
   - **Strict**: Reject old formats
   - **Lenient**: Accept with warnings
   - **Auto-Migrate**: Convert automatically

### What Should Be Added to Plan

```markdown
## Version Mismatch Handling

1. **Format Detection**
   - Detect format version from file structure
   - Identify format markers (frontmatter, schema version)
   - Confidence scoring for detection

2. **Version Compatibility**
   - Document supported versions
   - Compatibility matrix (old → new)
   - Identify breaking changes

3. **Migration Strategy**
   - **Auto-Migrate**: Convert old format to new automatically
   - **Warn**: Accept old format, warn user
   - **Reject**: Fail import for unsupported versions

4. **Format Validation**
   - Validate against format schema
   - Report missing required fields
   - Suggest fixes for common issues

5. **Migration Logging**
   - Log all format conversions
   - Show "Migrated X files from v1.0 to v2.0"
   - Allow review of converted files

6. **Format Documentation**
   - Document format versions and changes
   - Provide migration examples
   - Link to format specification
```

---

## 9. Duplicate Names: Two Repos Have Skills with Same Name

### What Could Go Wrong
- **Name Collision**: `research-analyst` skill exists in both repos
- **Overwrite**: Second import overwrites first (data loss)
- **Ambiguity**: Which version should be used?
- **Namespace Pollution**: Global namespace conflicts

### Impact
- **High**: Data loss, overwritten imports
- **Medium**: Confusion about which version is active
- **Low**: Need manual resolution

### How to Handle Gracefully

1. **Namespace Strategy**
   ```typescript
   interface ImportNamespace {
     source: string; // repo owner/name
     prefix: string; // e.g., "pm-workspace-research-analyst"
   }
   
   function generateUniqueName(
     name: string,
     source: string,
     existing: string[]
   ): string {
     // Generate namespace-prefixed name
   }
   ```

2. **Collision Detection**
   - Check for existing names before import
   - Detect exact matches and near-matches
   - Report collisions before importing

3. **Resolution Strategies**
   - **Namespace**: Prefix with repo name (e.g., `pm-workspace-research-analyst`)
   - **Version**: Keep both, mark with version (e.g., `research-analyst-v1`, `research-analyst-v2`)
   - **Overwrite**: Replace existing (with confirmation)
   - **Skip**: Don't import duplicate (with warning)
   - **Merge**: Attempt to merge (complex, risky)

4. **User Choice**
   - Prompt user on collision: "Name collision detected, how to resolve?"
   - Show diff between versions
   - Allow custom naming

5. **Import Metadata**
   - Track source repository per import
   - Store import timestamp
   - Allow filtering by source

6. **Aliasing**
   - Import with unique name
   - Create alias to original name
   - Allow user to choose which alias is "primary"

### What Should Be Added to Plan

```markdown
## Duplicate Name Handling

1. **Collision Detection**
   - Check for existing names before import
   - Detect exact and near-matches (fuzzy matching)
   - Report all collisions upfront

2. **Namespace Strategies**
   - **Prefix**: `{repo-name}-{component-name}`
   - **Version**: `{component-name}-v{version}`
   - **Source**: `{owner}-{repo}-{component-name}`
   - **Custom**: User-provided prefix

3. **Resolution Options**
   - **Namespace**: Auto-prefix with repo name
   - **Overwrite**: Replace existing (with confirmation)
   - **Skip**: Don't import duplicate (warn user)
   - **Keep Both**: Import with unique name, create alias

4. **User Interaction**
   - Prompt on collision with options
   - Show diff between versions
   - Allow custom naming
   - Remember user preference

5. **Import Tracking**
   - Store source repository per import
   - Track import timestamp
   - Allow filtering/searching by source
   - Show import history

6. **Aliasing System**
   - Import with unique name
   - Create alias to original name
   - Allow multiple aliases
   - User chooses "primary" alias
```

---

## 10. Execution Timeout: Imported Agent Takes Too Long

### What Could Go Wrong
- **Infinite Loops**: Agent gets stuck in loop
- **Long-Running Tasks**: Agent performs slow operations (API calls, file processing)
- **Resource Exhaustion**: Agent consumes too much memory/CPU
- **Deadlock**: Agent waits for resource that never becomes available

### Impact
- **High**: System hangs, need manual intervention
- **Medium**: Timeout errors, unclear what happened
- **Low**: Slow performance, user waits

### How to Handle Gracefully

1. **Timeout Configuration**
   ```typescript
   interface ExecutionConfig {
     timeout: number; // ms
     maxMemory: number; // bytes
     maxCpuTime: number; // ms
     allowBackground: boolean;
   }
   ```

2. **Timeout Enforcement**
   - Set per-agent timeout (default: 5 minutes)
   - Set per-operation timeout (default: 30 seconds)
   - Kill process on timeout

3. **Progress Monitoring**
   - Track execution progress
   - Detect stalls (no progress for X seconds)
   - Log intermediate results

4. **Resource Limits**
   - Memory limits (e.g., 512MB per agent)
   - CPU time limits
   - File descriptor limits
   - Network request limits

5. **Graceful Termination**
   - Send termination signal (SIGTERM)
   - Allow cleanup (save state, close connections)
   - Force kill if no response (SIGKILL after 10s)

6. **Timeout Handling**
   - **Fail Fast**: Stop execution immediately
   - **Save State**: Save partial results
   - **Retry**: Optionally retry with longer timeout
   - **Background**: Move to background job if allowed

7. **User Communication**
   - Show timeout warnings: "Agent running for 4:30, timeout in 30s"
   - Allow user to extend timeout
   - Clear error messages: "Agent timed out after 5 minutes"

8. **Detection Mechanisms**
   - **Heartbeat**: Agent must send heartbeat every N seconds
   - **Progress Tracking**: Detect lack of progress
   - **Resource Monitoring**: Track memory/CPU usage

### What Should Be Added to Plan

```markdown
## Execution Timeout Handling

1. **Timeout Configuration**
   - Per-agent timeout (default: 5 minutes)
   - Per-operation timeout (default: 30 seconds)
   - Configurable per workspace/agent type

2. **Resource Limits**
   - Memory limit (e.g., 512MB per agent)
   - CPU time limit
   - File descriptor limit
   - Network request limit

3. **Progress Monitoring**
   - Track execution progress
   - Detect stalls (no progress for 30s+)
   - Log intermediate results

4. **Timeout Enforcement**
   - Send SIGTERM on timeout
   - Allow 10s for graceful shutdown
   - Force kill (SIGKILL) if no response

5. **State Preservation**
   - Save partial results on timeout
   - Store execution state
   - Allow resume/retry

6. **User Communication**
   - Show timeout warnings
   - Allow extending timeout
   - Clear error messages
   - Option to move to background

7. **Detection Mechanisms**
   - Heartbeat system (agent must ping every 10s)
   - Progress tracking (detect stalls)
   - Resource monitoring (memory/CPU)
```

---

## Implementation Priority

### Phase 1: Critical (Must Have)
1. **Partial Import Handling** - Users need to know what failed
2. **Missing Dependencies** - Prevent broken imports
3. **Network/Offline Handling** - Common failure mode
4. **Token Expiration** - Authentication is critical

### Phase 2: Important (Should Have)
5. **Sync Conflicts** - Prevents data loss
6. **Duplicate Names** - Prevents overwrites
7. **Large Repos** - Performance and UX
8. **Execution Timeout** - Prevents hangs

### Phase 3: Nice to Have (Could Have)
9. **Circular References** - Edge case, can warn
10. **Version Mismatch** - Can handle with warnings initially

---

## Recommended Architecture Changes

### 1. Import Service Layer
```typescript
class AgentArchitectureImporter {
  async import(
    repo: GitHubRepo,
    options: ImportOptions
  ): Promise<ImportResult> {
    // Orchestrates entire import process
    // Handles all error cases
    // Returns structured result
  }
}
```

### 2. Validation Layer
```typescript
class ImportValidator {
  validateFiles(files: File[]): ValidationResult;
  checkDependencies(imported: ImportResult): DependencyCheck;
  detectConflicts(local: ImportResult, remote: ImportResult): Conflict[];
}
```

### 3. Error Recovery Layer
```typescript
class ImportRecovery {
  checkpoint(state: ImportState): void;
  resume(checkpointId: string): Promise<ImportResult>;
  rollback(importId: string): Promise<void>;
}
```

### 4. Progress Tracking
```typescript
class ImportProgress {
  update(stage: string, progress: number): void;
  onProgress(callback: (progress: ProgressUpdate) => void): void;
}
```

---

## Testing Recommendations

### Unit Tests
- Parse individual files (valid, invalid, edge cases)
- Dependency resolution logic
- Cycle detection algorithm
- Name collision detection

### Integration Tests
- Full import from test repository
- Network failure simulation
- Token expiration simulation
- Rate limit handling

### E2E Tests
- Import from real GitHub repo
- Conflict resolution flow
- Large repository import
- Error recovery flow

---

## Documentation Needs

1. **User Guide**: How to import, resolve conflicts, handle errors
2. **Troubleshooting**: Common issues and solutions
3. **API Documentation**: Import API, error codes, result formats
4. **Format Specification**: SKILL.md, command.md formats and versions

---

## Conclusion

The current import plan provides a solid foundation but needs significant error handling and edge case management. Implementing the recommendations above will create a robust, user-friendly import system that gracefully handles failures and provides clear feedback.

**Next Steps:**
1. Implement Phase 1 (Critical) error handling
2. Add progress tracking and user feedback
3. Create import result reporting system
4. Build conflict resolution UI
5. Add comprehensive logging and monitoring

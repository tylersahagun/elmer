## Placement Analysis: Chief-of-Staff Hub

### Feature Classification

- **Type:** Dashboard
- **Frequency of Use:** Daily
- **User Goal:** Review what automation did, approve risky actions, and see scheduled work in one place.

### Similar Features in Codebase

| Feature                 | Location                                                                                                                     | Pattern                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Action Items            | `elephant-ai/web/src/routes/workspaces/$workspaceId/action-items/index.tsx` + `elephant-ai/web/src/components/action-items/` | Dedicated page with list + detail side panel |
| Workflows (Automations) | `elephant-ai/web/src/routes/workspaces/$workspaceId/workflows/index.tsx` + `elephant-ai/web/src/components/workflows/`       | Full-page automation surface with tabs       |
| Rep Workspace prototype | `elephant-ai/web/src/components/rep-workspace.stories.tsx`                                                                   | Dashboard-style page using `Page` layout     |
| Authorization policies  | `elephant-ai/web/src/components/authorization/`                                                                              | Table-based policy and audit patterns        |

### Recommendation

**Integration Type:** New Page

**Location:** `elephant-ai/web/src/components/hub/chief-of-staff/`

**Navigation Entry:** Primary sidebar item in `NavMain` labeled "Hub" (or "Chief of Staff") placed near the top of the main list.

**Parent Context:** Workspace route under `RootLayout` (`/workspaces/:workspaceId/*`) using the standard sidebar + `Page` layout.

**Rationale:** This is intended as the daily entry point across personas and requires full-page real estate for the three-bucket layout, filters, and approvals. Keeping it as a primary nav page avoids forcing users into workflow lists and aligns with the "proactive hub" product principle. Approval detail can use a side panel pattern consistent with Action Items.

### Alternative Considered

Embedding the hub within the Workflows/Automations page or as an extension of Action Items was considered, but would keep users in configuration or task views instead of a proactive daily overview.

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentDefinitions from "../agentDefinitions.js";
import type * as agentExecutions from "../agentExecutions.js";
import type * as agents from "../agents.js";
import type * as cron from "../cron.js";
import type * as crons from "../crons.js";
import type * as documents from "../documents.js";
import type * as graph from "../graph.js";
import type * as http from "../http.js";
import type * as inbox from "../inbox.js";
import type * as inboxItems from "../inboxItems.js";
import type * as jobs from "../jobs.js";
import type * as knowledgebase from "../knowledgebase.js";
import type * as mcp from "../mcp.js";
import type * as memory from "../memory.js";
import type * as notifications from "../notifications.js";
import type * as pendingQuestions from "../pendingQuestions.js";
import type * as projects from "../projects.js";
import type * as prototypes from "../prototypes.js";
import type * as seedHelpers from "../seedHelpers.js";
import type * as signals from "../signals.js";
import type * as tasks from "../tasks.js";
import type * as tools_codebase from "../tools/codebase.js";
import type * as tools_db from "../tools/db.js";
import type * as tools_githubAuth from "../tools/githubAuth.js";
import type * as tools_index from "../tools/index.js";
import type * as tools_services from "../tools/services.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentDefinitions: typeof agentDefinitions;
  agentExecutions: typeof agentExecutions;
  agents: typeof agents;
  cron: typeof cron;
  crons: typeof crons;
  documents: typeof documents;
  graph: typeof graph;
  http: typeof http;
  inbox: typeof inbox;
  inboxItems: typeof inboxItems;
  jobs: typeof jobs;
  knowledgebase: typeof knowledgebase;
  mcp: typeof mcp;
  memory: typeof memory;
  notifications: typeof notifications;
  pendingQuestions: typeof pendingQuestions;
  projects: typeof projects;
  prototypes: typeof prototypes;
  seedHelpers: typeof seedHelpers;
  signals: typeof signals;
  tasks: typeof tasks;
  "tools/codebase": typeof tools_codebase;
  "tools/db": typeof tools_db;
  "tools/githubAuth": typeof tools_githubAuth;
  "tools/index": typeof tools_index;
  "tools/services": typeof tools_services;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

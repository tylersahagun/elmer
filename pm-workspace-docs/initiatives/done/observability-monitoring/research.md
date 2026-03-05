# Automated Metrics & Observability Research

## TL;DR

AskElephant has strong foundations with PostHog and LangSmith already integrated, but lacks a **systematic, automated approach** to deploying metrics when new features launch. This research outlines a comprehensive strategy to create an automated metrics deployment system that tracks both product usage (PostHog) and AI quality (LangSmith), with automated evaluation pipelines and dashboards that spin up automatically per feature/project.

## Current State Analysis

### What's Already Working Well

**PostHog Integration (Extensive)**
- ✅ Backend events captured via `captureEvent()` in `functions/src/contexts/infra/analytics/`
- ✅ Frontend tracking via analytics plugin in `web/src/lib/analytics/analytics-plugin-posthog.ts`
- ✅ Mobile tracking via `posthog-react-native`
- ✅ Naming convention established: `category:object_action` (e.g., `workflows:run_started`)
- ✅ Workspace/user grouping for B2B analytics
- ✅ Session recording enabled with smart masking

**LangSmith Integration (Solid)**
- ✅ AI SDK wrapped with LangSmith via `wrapAISDK()` in `functions/src/contexts/llm/ai.ts`
- ✅ PostHog AI tracing via `@posthog/ai` `withTracing()` wrapper
- ✅ Python agents using `@traceable` decorator for LangSmith
- ✅ Tracing project setup script exists: `functions_py/scripts/create_tracing_project.py`
- ✅ Datasets and rules for data collection configured

**OpenTelemetry (Infrastructure)**
- ✅ Full OTel SDK setup in `functions/src/tracing.ts`
- ✅ Exports to Google Cloud Trace/Monitoring
- ✅ HTTP, gRPC, Express, GraphQL, Postgres instrumentation

### What's Missing (The Pain Points)

| Gap | Impact |
|-----|--------|
| **No automated dashboard creation** | New features launch without visibility |
| **Manual event registration** | Engineers forget to add events, inconsistent coverage |
| **No AI quality metrics in PostHog** | Can't correlate AI performance with user behavior |
| **No automated evaluation pipelines** | AI regressions caught reactively, not proactively |
| **No feature-level metrics aggregation** | Hard to measure success of specific features |
| **No alerting on AI degradation** | Latency/error spikes not detected automatically |
| **Missing LLM cost attribution** | Can't track costs by feature/workspace/model |

---

## Recommended Architecture

### Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTOMATED METRICS SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │  FEATURE     │    │  METRICS     │    │   AUTOMATED                  │  │
│  │  REGISTRY    │───▶│  GENERATOR   │───▶│   DASHBOARD CREATION         │  │
│  │              │    │              │    │                              │  │
│  │  - Feature   │    │  - Event     │    │  - PostHog Feature Dashboard │  │
│  │    manifest  │    │    templates │    │  - LangSmith Project + Rules │  │
│  │  - Metrics   │    │  - Naming    │    │  - OTel Metrics/Alerts       │  │
│  │    config    │    │    standards │    │                              │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────────┘  │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │  POSTHOG     │    │  LANGSMITH   │    │   UNIFIED                    │  │
│  │  LAYER       │    │  LAYER       │    │   OBSERVABILITY              │  │
│  │              │    │              │    │                              │  │
│  │  - Usage     │◀──▶│  - Quality   │───▶│  - Feature Health Score      │  │
│  │  - Funnels   │    │  - Latency   │    │  - Cost Attribution          │  │
│  │  - Retention │    │  - Evals     │    │  - Regression Detection      │  │
│  │  - Costs     │    │  - Datasets  │    │                              │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Strategy

### Phase 1: Feature Registry & Metrics Schema (Foundation)

Create a centralized registry that defines what metrics each feature should track.

**Feature Manifest Format:**

```typescript
// src/metrics/feature-registry.ts
export interface FeatureMetricsConfig {
  featureId: string;
  category: 'chat' | 'agents' | 'workflows' | 'integrations' | 'core';
  
  // PostHog events to auto-generate
  usage: {
    events: Array<{
      action: string;  // e.g., 'started', 'completed', 'failed'
      properties?: string[];  // Additional properties to capture
    }>;
    funnels?: Array<{
      name: string;
      steps: string[];  // Event names in order
    }>;
  };
  
  // LangSmith configuration (if AI-powered)
  ai?: {
    projectName: string;
    evaluators: Array<'relevance' | 'coherence' | 'faithfulness' | 'toxicity' | 'custom'>;
    samplingRate: number;  // 0.0 - 1.0
    datasets?: string[];  // Datasets to auto-populate
  };
  
  // Alerting thresholds
  alerts?: {
    latencyP95ThresholdMs?: number;
    errorRateThreshold?: number;
    costThresholdPerDay?: number;
  };
}

// Example registration
export const FEATURE_REGISTRY: FeatureMetricsConfig[] = [
  {
    featureId: 'global-chat',
    category: 'chat',
    usage: {
      events: [
        { action: 'message_sent', properties: ['model_id', 'has_tools'] },
        { action: 'completed', properties: ['token_count', 'latency_ms'] },
        { action: 'failed', properties: ['error_type'] },
        { action: 'tool_used', properties: ['tool_name', 'success'] },
      ],
      funnels: [
        { name: 'Chat Completion', steps: ['message_sent', 'completed'] },
      ],
    },
    ai: {
      projectName: 'global-chat',
      evaluators: ['relevance', 'coherence'],
      samplingRate: 0.1,
      datasets: ['chat-quality-eval'],
    },
    alerts: {
      latencyP95ThresholdMs: 5000,
      errorRateThreshold: 0.05,
      costThresholdPerDay: 100,
    },
  },
  {
    featureId: 'transcript-extraction',
    category: 'agents',
    usage: {
      events: [
        { action: 'started', properties: ['engagement_id'] },
        { action: 'completed', properties: ['annotation_count', 'latency_ms'] },
        { action: 'failed', properties: ['error_type', 'agent_id'] },
      ],
    },
    ai: {
      projectName: 'transcript-extraction',
      evaluators: ['faithfulness', 'relevance'],
      samplingRate: 0.2,
      datasets: ['extraction-quality'],
    },
    alerts: {
      latencyP95ThresholdMs: 30000,
      errorRateThreshold: 0.1,
    },
  },
];
```

### Phase 2: Automated Event Generation (DRY)

Create decorators/wrappers that automatically emit events based on the registry.

**TypeScript Implementation:**

```typescript
// src/metrics/auto-metrics.ts
import { captureEvent } from '@/contexts/infra/analytics';
import { FeatureMetricsConfig, FEATURE_REGISTRY } from './feature-registry';

export function withFeatureMetrics<T extends (...args: any[]) => Promise<any>>(
  featureId: string,
  fn: T
): T {
  const config = FEATURE_REGISTRY.find(f => f.featureId === featureId);
  if (!config) throw new Error(`Feature ${featureId} not in registry`);
  
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    const { workspaceId, viewerId, ...metadata } = extractContext(args);
    
    // Emit 'started' event
    captureEvent({
      viewerId,
      workspaceId,
      eventName: `${config.category}:${config.featureId}_started`,
      metadata,
    });
    
    try {
      const result = await fn(...args);
      
      // Emit 'completed' event
      captureEvent({
        viewerId,
        workspaceId,
        eventName: `${config.category}:${config.featureId}_completed`,
        metadata: {
          ...metadata,
          latency_ms: Date.now() - startTime,
        },
      });
      
      return result;
    } catch (error) {
      // Emit 'failed' event
      captureEvent({
        viewerId,
        workspaceId,
        eventName: `${config.category}:${config.featureId}_failed`,
        metadata: {
          ...metadata,
          error_type: error.name,
          latency_ms: Date.now() - startTime,
        },
      });
      throw error;
    }
  }) as T;
}
```

**Python Decorator:**

```python
# src/metrics/auto_metrics.py
from functools import wraps
from firebase.posthog_client import get_posthog_client
from langsmith import traceable
import time

def with_feature_metrics(feature_id: str, category: str):
    """Auto-emit PostHog + LangSmith metrics for a feature."""
    def decorator(fn):
        @wraps(fn)
        @traceable(name=f"{category}.{feature_id}")
        def wrapper(*args, **kwargs):
            start_time = time.time()
            workspace_id = kwargs.get('workspace_id')
            viewer_id = kwargs.get('viewer_id')
            
            ph = get_posthog_client()
            ph.capture(
                distinct_id=viewer_id,
                event=f"{category}:{feature_id}_started",
                groups={'workspace': workspace_id},
            )
            
            try:
                result = fn(*args, **kwargs)
                ph.capture(
                    distinct_id=viewer_id,
                    event=f"{category}:{feature_id}_completed",
                    properties={'latency_ms': (time.time() - start_time) * 1000},
                    groups={'workspace': workspace_id},
                )
                return result
            except Exception as e:
                ph.capture(
                    distinct_id=viewer_id,
                    event=f"{category}:{feature_id}_failed",
                    properties={'error_type': type(e).__name__},
                    groups={'workspace': workspace_id},
                )
                raise
        return wrapper
    return decorator
```

### Phase 3: Automated Dashboard & Project Creation

**CLI Tool for Feature Onboarding:**

```typescript
// scripts/onboard-feature-metrics.ts
import { Client } from 'langsmith';
import PostHog from 'posthog-node';
import { FEATURE_REGISTRY } from '../src/metrics/feature-registry';

async function onboardFeature(featureId: string) {
  const config = FEATURE_REGISTRY.find(f => f.featureId === featureId);
  if (!config) throw new Error(`Feature ${featureId} not found`);
  
  // 1. Create LangSmith project + datasets
  if (config.ai) {
    const langsmith = new Client();
    
    // Create project per environment
    for (const env of ['staging', 'production']) {
      const projectName = `${config.ai.projectName}_${env}`;
      
      try {
        await langsmith.createProject({ projectName });
        console.log(`✅ Created LangSmith project: ${projectName}`);
      } catch (e) {
        console.log(`ℹ️ Project exists: ${projectName}`);
      }
      
      // Create datasets
      for (const dataset of config.ai.datasets || []) {
        try {
          await langsmith.createDataset({
            datasetName: `${dataset}_${env}`,
            dataType: 'kv',
          });
          console.log(`✅ Created dataset: ${dataset}_${env}`);
        } catch (e) {
          console.log(`ℹ️ Dataset exists: ${dataset}_${env}`);
        }
      }
    }
  }
  
  // 2. Create PostHog dashboard template
  const posthog = new PostHog(process.env.POSTHOG_API_KEY!);
  
  console.log(`
📊 PostHog Dashboard Template for ${config.featureId}:
---------------------------------------------------
Dashboard Name: ${config.featureId} Metrics

Insights to create:
${config.usage.events.map(e => `- ${config.category}:${config.featureId}_${e.action} count`).join('\n')}

${config.usage.funnels?.map(f => `
Funnel: ${f.name}
Steps: ${f.steps.join(' → ')}
`).join('\n') || ''}

${config.alerts ? `
Alerts:
- P95 Latency > ${config.alerts.latencyP95ThresholdMs}ms
- Error Rate > ${config.alerts.errorRateThreshold! * 100}%
${config.alerts.costThresholdPerDay ? `- Daily Cost > $${config.alerts.costThresholdPerDay}` : ''}
` : ''}
  `);
}

// Run from CLI
const featureId = process.argv[2];
if (!featureId) {
  console.log('Usage: npx tsx scripts/onboard-feature-metrics.ts <featureId>');
  process.exit(1);
}
onboardFeature(featureId);
```

### Phase 4: LLM Quality Evaluation System

**Automated Evaluation Pipeline:**

```typescript
// src/metrics/llm-evaluation.ts
import { Client } from 'langsmith';
import { evaluate } from 'langsmith/evaluation';

interface EvaluationConfig {
  projectName: string;
  datasetName: string;
  evaluators: string[];
  schedule: 'hourly' | 'daily' | 'weekly';
}

export async function runAutomatedEvaluation(config: EvaluationConfig) {
  const client = new Client();
  
  // Get recent runs from the project
  const runs = await client.listRuns({
    projectName: config.projectName,
    filter: 'gt(start_time, now - 1d)',  // Last 24 hours
  });
  
  // Sample for evaluation
  const sampled = sampleRuns(runs, 100);
  
  // Run evaluators
  const results = await evaluate(
    (example) => {
      // Find the run for this example
      const run = sampled.find(r => r.id === example.id);
      return run?.outputs;
    },
    {
      data: config.datasetName,
      evaluators: buildEvaluators(config.evaluators),
      experimentPrefix: `auto-eval-${new Date().toISOString().split('T')[0]}`,
    }
  );
  
  // Send summary to PostHog for unified dashboard
  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: 'system',
    event: 'llm:evaluation_completed',
    properties: {
      project: config.projectName,
      dataset: config.datasetName,
      run_count: sampled.length,
      avg_relevance_score: results.aggregateMetrics?.relevance?.mean,
      avg_coherence_score: results.aggregateMetrics?.coherence?.mean,
    },
  });
  
  return results;
}

function buildEvaluators(types: string[]) {
  return types.map(type => {
    switch (type) {
      case 'relevance':
        return relevanceEvaluator();
      case 'coherence':
        return coherenceEvaluator();
      case 'faithfulness':
        return faithfulnessEvaluator();
      default:
        throw new Error(`Unknown evaluator: ${type}`);
    }
  });
}
```

**Scheduled Evaluation Cloud Function:**

```typescript
// functions/src/contexts/metrics/scheduled-evaluations.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { FEATURE_REGISTRY } from '@/metrics/feature-registry';
import { runAutomatedEvaluation } from '@/metrics/llm-evaluation';

export const dailyLlmEvaluations = onSchedule(
  { schedule: '0 6 * * *', timeoutSeconds: 540 },
  async () => {
    const aiFeatures = FEATURE_REGISTRY.filter(f => f.ai);
    
    for (const feature of aiFeatures) {
      for (const env of ['staging', 'production']) {
        await runAutomatedEvaluation({
          projectName: `${feature.ai!.projectName}_${env}`,
          datasetName: `${feature.ai!.datasets?.[0]}_${env}`,
          evaluators: feature.ai!.evaluators,
          schedule: 'daily',
        });
      }
    }
  }
);
```

### Phase 5: Unified Observability Dashboard

**PostHog + LangSmith Data Sync:**

Send LangSmith metrics to PostHog for unified dashboards:

```typescript
// src/metrics/langsmith-to-posthog-sync.ts
import { Client } from 'langsmith';
import { getPostHogClient } from '@/contexts/infra/post-hog/client';

export async function syncLangSmithMetrics() {
  const langsmith = new Client();
  const posthog = getPostHogClient();
  
  // Get project metrics from last hour
  for (const project of await langsmith.listProjects()) {
    const runs = await langsmith.listRuns({
      projectName: project.name,
      filter: 'gt(start_time, now - 1h)',
    });
    
    const metrics = computeMetrics(runs);
    
    posthog.capture({
      distinctId: 'system-metrics',
      event: '$ai_project_metrics',
      properties: {
        project_name: project.name,
        total_runs: metrics.count,
        avg_latency_ms: metrics.avgLatency,
        error_rate: metrics.errorRate,
        total_tokens: metrics.totalTokens,
        estimated_cost_usd: metrics.estimatedCost,
        p95_latency_ms: metrics.p95Latency,
      },
    });
  }
}

function computeMetrics(runs: any[]) {
  const successful = runs.filter(r => r.status === 'success');
  const latencies = runs.map(r => r.end_time - r.start_time).filter(Boolean);
  
  return {
    count: runs.length,
    avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    p95Latency: percentile(latencies, 95),
    errorRate: 1 - (successful.length / runs.length),
    totalTokens: runs.reduce((acc, r) => acc + (r.token_usage?.total || 0), 0),
    estimatedCost: runs.reduce((acc, r) => acc + (r.estimated_cost || 0), 0),
  };
}
```

---

## Maintenance & Operational Systems

### 1. Automated Health Checks

```typescript
// src/metrics/health-checks.ts
export const metricsHealthCheck = onSchedule(
  { schedule: 'every 1 hours' },
  async () => {
    const checks = [
      checkPostHogIngestion(),
      checkLangSmithTracing(),
      checkOTelExport(),
    ];
    
    const results = await Promise.all(checks);
    const failed = results.filter(r => !r.healthy);
    
    if (failed.length > 0) {
      await sendSlackAlert({
        channel: '#eng-alerts',
        text: `⚠️ Metrics Health Check Failed:\n${failed.map(f => `- ${f.name}: ${f.error}`).join('\n')}`,
      });
    }
  }
);
```

### 2. Feature Coverage Audit

Run weekly to ensure all features have proper instrumentation:

```typescript
// scripts/audit-feature-coverage.ts
async function auditFeatureCoverage() {
  const registry = FEATURE_REGISTRY;
  const posthogEvents = await fetchAllPostHogEventNames();
  const langsmithProjects = await fetchAllLangSmithProjects();
  
  for (const feature of registry) {
    const expectedEvents = feature.usage.events.map(
      e => `${feature.category}:${feature.featureId}_${e.action}`
    );
    
    const missingEvents = expectedEvents.filter(e => !posthogEvents.includes(e));
    
    if (missingEvents.length > 0) {
      console.warn(`⚠️ ${feature.featureId}: Missing events: ${missingEvents.join(', ')}`);
    }
    
    if (feature.ai) {
      const hasProject = langsmithProjects.some(
        p => p.startsWith(feature.ai!.projectName)
      );
      if (!hasProject) {
        console.warn(`⚠️ ${feature.featureId}: Missing LangSmith project`);
      }
    }
  }
}
```

### 3. Cost Attribution & Budgeting

```typescript
// src/metrics/cost-attribution.ts
export async function generateCostReport(period: 'daily' | 'weekly' | 'monthly') {
  const costs = await aggregateLLMCosts(period);
  
  return {
    byFeature: groupBy(costs, 'feature'),
    byWorkspace: groupBy(costs, 'workspace_id'),
    byModel: groupBy(costs, 'model_id'),
    total: costs.reduce((acc, c) => acc + c.cost_usd, 0),
    topWorkspaces: getTopN(groupBy(costs, 'workspace_id'), 10),
    costTrend: computeTrend(costs),
  };
}
```

---

## Implementation Roadmap

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Foundation** | 2 weeks | Feature registry schema, initial population with 5 key features |
| **Phase 2: Auto-instrumentation** | 2 weeks | TypeScript + Python decorators, migration of existing features |
| **Phase 3: Dashboard Automation** | 2 weeks | CLI tool, LangSmith project templates, PostHog dashboard templates |
| **Phase 4: Evaluation Pipeline** | 3 weeks | Automated evaluators, scheduled runs, dataset management |
| **Phase 5: Unified Observability** | 2 weeks | LangSmith→PostHog sync, unified dashboards, alerting |
| **Phase 6: Maintenance Systems** | 1 week | Health checks, coverage audits, cost reporting |

**Total: ~12 weeks for full implementation**

---

## Quick Wins (Implement This Week)

1. **Standardize AI event naming**: Update `AnalyticsEventName` enum to include all AI features with consistent naming
2. **Add `feature` property to all LLM calls**: Already partially done in `ai.ts`, ensure coverage
3. **Create LangSmith projects for staging/production**: Run `create_tracing_project.py` with proper config
4. **Enable LLM cost tracking in PostHog**: The `withTracing` wrapper already captures `$ai_generation` events

---

## Open Questions

1. **Dataset sampling strategy**: What % of production traces should auto-populate eval datasets?
2. **Alert escalation path**: Who gets paged for AI degradation vs. usage anomalies?
3. **Retention policies**: How long to keep LangSmith traces vs. PostHog events?
4. **Multi-model support**: How to handle cost attribution when fallback models are used?
5. **Customer-facing quality metrics**: Should we expose any of this to users (e.g., AI confidence scores)?

---

## References

- [PostHog LLM Analytics Docs](https://posthog.com/docs/llm-analytics)
- [PostHog Custom Properties](https://posthog.com/docs/llm-analytics/custom-properties)
- [LangSmith Observability Stack](https://docs.langchain.com/langsmith/observability-stack)
- [LangSmith Insights Agent](https://docs.langchain.com/langsmith/insights)
- [PostHog Agent Toolkit](https://pypi.org/project/posthog-agent-toolkit/)
- [Langfuse PostHog Integration](https://langfuse.com/changelog/2024-04-22-posthog-integration)
- Current implementation: `elephant-ai/functions/src/contexts/llm/ai.ts`
- Analytics constants: `elephant-ai/functions/src/contexts/infra/analytics/constants.ts`


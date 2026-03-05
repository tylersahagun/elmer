#!/usr/bin/env npx ts-node
/**
 * PostHog Early Access Feature Migration Script
 * 
 * This script migrates existing PostHog feature flags to Early Access Features,
 * enabling the Beta Features UI in AskElephant to display them.
 * 
 * Usage:
 *   1. Set environment variables (or create .env file):
 *      - POSTHOG_API_KEY: Personal API key with early_access_feature:write scope
 *      - POSTHOG_PROJECT_ID: Your PostHog project ID
 *   2. Update FLAG_MIGRATIONS array with your flag configurations
 *   3. Run: npx ts-node migrate-flags-to-early-access.ts
 * 
 * API Reference: https://posthog.com/docs/api/early-access-feature
 */

import * as dotenv from 'dotenv';
dotenv.config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const POSTHOG_BASE_URL = process.env.POSTHOG_BASE_URL || 'https://us.posthog.com';
const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY || '';
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || '';

// Stage mapping from your Release Lifecycle Process
// PostHog supports: 'concept' | 'alpha' | 'beta' | 'general-availability'
// Your UI maps: 'concept'/'alpha' → 'labs', 'beta' → 'beta'
type PostHogStage = 'concept' | 'alpha' | 'beta' | 'general-availability';
type FeatureScope = 'personal' | 'workspace';

interface FlagMigration {
  // The existing PostHog feature flag key
  flagKey: string;
  
  // Display name in the Beta Features UI
  name: string;
  
  // Description shown to users
  description: string;
  
  // PostHog Early Access stage
  // 'concept' = Coming soon (register interest)
  // 'alpha' = Labs in your UI (early testing)
  // 'beta' = Beta in your UI (stable, pre-GA)
  stage: PostHogStage;
  
  // Scope: 'personal' (affects only user) or 'workspace' (affects all users)
  scope: FeatureScope;
  
  // Optional: Link to documentation/KB article
  documentationUrl?: string;
  
  // Optional: Category for grouping
  category?: string;
  
  // Optional: Whether to skip if already exists
  skipIfExists?: boolean;
}

// ============================================================================
// FLAG MIGRATIONS - CONFIGURE YOUR FLAGS HERE
// ============================================================================

const FLAG_MIGRATIONS: FlagMigration[] = [
  // -------------------------------------------------------------------------
  // BETA STAGE (Stable, gathering feedback before GA)
  // -------------------------------------------------------------------------
  {
    flagKey: 'top-navigation-enabled',
    name: 'Top Navigation',
    description: 'Try our new horizontal navigation layout. The sidebar moves to the top of the screen for a cleaner, more spacious workspace.',
    stage: 'beta',
    scope: 'personal',
    category: 'navigation',
  },
  {
    flagKey: 'unified-settings-page',
    name: 'Unified Settings',
    description: 'Combined workspace settings and personal preferences into one streamlined settings page.',
    stage: 'beta',
    scope: 'personal',
    category: 'settings',
  },
  {
    flagKey: 'unified-automations',
    name: 'Unified Automations',
    description: 'Combined view of workflows, prompts, signals, tags, and agents in one automations tab.',
    stage: 'beta',
    scope: 'workspace',
    category: 'automations',
  },
  {
    flagKey: 'customers-page',
    name: 'Customers Page',
    description: 'Combined companies and contacts into a single, unified customers view.',
    stage: 'beta',
    scope: 'workspace',
    category: 'crm',
  },
  {
    flagKey: 'global-chat-column-layout',
    name: 'Global Chat Layout',
    description: 'Chat takes a dedicated column, pushing page content to the left for a more focused conversation experience.',
    stage: 'beta',
    scope: 'personal',
    category: 'chat',
  },

  // -------------------------------------------------------------------------
  // ALPHA/LABS STAGE (Early exploration, may change significantly)
  // -------------------------------------------------------------------------
  {
    flagKey: 'fga-engine-beta',
    name: 'Fine-Grained Access Control',
    description: 'New permissions engine with granular access control. May change significantly based on feedback.',
    stage: 'alpha',
    scope: 'workspace',
    category: 'security',
  },
  {
    flagKey: 'chat-tool-process-agent',
    name: 'Process Agent',
    description: 'AI agent that can help automate and manage your workflows. Experimental feature.',
    stage: 'alpha',
    scope: 'personal',
    category: 'ai',
  },
  {
    flagKey: 'chat-tool-settings-agent',
    name: 'Settings Agent',
    description: 'AI agent that can help you configure and manage your settings. Experimental feature.',
    stage: 'alpha',
    scope: 'personal',
    category: 'ai',
  },
  {
    flagKey: 'crm-agent-upgrades',
    name: 'Enhanced CRM Agent',
    description: 'Improved CRM agent with better data extraction and sync capabilities.',
    stage: 'alpha',
    scope: 'workspace',
    category: 'crm',
  },

  // -------------------------------------------------------------------------
  // CONCEPT STAGE (Coming soon - users can register interest)
  // -------------------------------------------------------------------------
  // Uncomment and add flags that are coming soon but not yet available
  // {
  //   flagKey: 'future-feature',
  //   name: 'Future Feature',
  //   description: 'Coming soon! Register interest to be notified when this is available.',
  //   stage: 'concept',
  //   scope: 'personal',
  //   category: 'upcoming',
  // },

  // -------------------------------------------------------------------------
  // INTEGRATION FLAGS (Add more as needed)
  // -------------------------------------------------------------------------
  {
    flagKey: 'integration-dialpad',
    name: 'Dialpad Integration',
    description: 'Connect your Dialpad account to sync call recordings and transcripts.',
    stage: 'beta',
    scope: 'workspace',
    category: 'integrations',
  },
  {
    flagKey: 'gong-integration-enabled',
    name: 'Gong Integration',
    description: 'Import your Gong call recordings and leverage AskElephant\'s AI analysis.',
    stage: 'beta',
    scope: 'workspace',
    category: 'integrations',
  },

  // Add more flags here following the same pattern...
];

// ============================================================================
// API TYPES
// ============================================================================

interface PostHogFeatureFlag {
  id: number;
  key: string;
  name: string;
  active: boolean;
}

interface PostHogEarlyAccessFeature {
  id: string;
  name: string;
  description: string;
  stage: string;
  feature_flag: {
    id: number;
    key: string;
  } | null;
  documentation_url: string | null;
}

interface CreateEarlyAccessFeatureParams {
  name: string;
  description: string;
  stage: PostHogStage;
  documentation_url?: string;
  feature_flag_id?: number;
}

// ============================================================================
// API CLIENT
// ============================================================================

class PostHogClient {
  private baseUrl: string;
  private apiKey: string;
  private projectId: string;

  constructor(baseUrl: string, apiKey: string, projectId: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.projectId = projectId;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH',
    endpoint: string,
    body?: object
  ): Promise<T> {
    const url = `${this.baseUrl}/api/projects/${this.projectId}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PostHog API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async getFeatureFlags(): Promise<PostHogFeatureFlag[]> {
    const result = await this.request<{ results: PostHogFeatureFlag[] }>(
      'GET',
      '/feature_flags/?limit=200'
    );
    return result.results;
  }

  async getEarlyAccessFeatures(): Promise<PostHogEarlyAccessFeature[]> {
    const result = await this.request<{ results: PostHogEarlyAccessFeature[] }>(
      'GET',
      '/early_access_feature/'
    );
    return result.results;
  }

  async createEarlyAccessFeature(
    params: CreateEarlyAccessFeatureParams
  ): Promise<PostHogEarlyAccessFeature> {
    return this.request<PostHogEarlyAccessFeature>(
      'POST',
      '/early_access_feature/',
      params
    );
  }

  async updateEarlyAccessFeature(
    id: string,
    params: Partial<CreateEarlyAccessFeatureParams>
  ): Promise<PostHogEarlyAccessFeature> {
    return this.request<PostHogEarlyAccessFeature>(
      'PATCH',
      `/early_access_feature/${id}/`,
      params
    );
  }
}

// ============================================================================
// MIGRATION LOGIC
// ============================================================================

interface MigrationResult {
  flagKey: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message: string;
  earlyAccessFeatureId?: string;
}

async function migrateFlags(): Promise<MigrationResult[]> {
  // Validate configuration
  if (!POSTHOG_API_KEY) {
    throw new Error('POSTHOG_API_KEY environment variable is required');
  }
  if (!POSTHOG_PROJECT_ID) {
    throw new Error('POSTHOG_PROJECT_ID environment variable is required');
  }

  const client = new PostHogClient(POSTHOG_BASE_URL, POSTHOG_API_KEY, POSTHOG_PROJECT_ID);
  const results: MigrationResult[] = [];

  console.log('🚀 Starting PostHog Early Access Feature migration...\n');
  console.log(`   Base URL: ${POSTHOG_BASE_URL}`);
  console.log(`   Project ID: ${POSTHOG_PROJECT_ID}`);
  console.log(`   Flags to migrate: ${FLAG_MIGRATIONS.length}\n`);

  // Step 1: Fetch existing feature flags
  console.log('📋 Fetching existing feature flags...');
  const existingFlags = await client.getFeatureFlags();
  const flagsByKey = new Map(existingFlags.map(f => [f.key, f]));
  console.log(`   Found ${existingFlags.length} feature flags\n`);

  // Step 2: Fetch existing early access features
  console.log('📋 Fetching existing early access features...');
  const existingEAFeatures = await client.getEarlyAccessFeatures();
  const eaByFlagKey = new Map(
    existingEAFeatures
      .filter(ea => ea.feature_flag?.key)
      .map(ea => [ea.feature_flag!.key, ea])
  );
  console.log(`   Found ${existingEAFeatures.length} early access features\n`);

  // Step 3: Process each migration
  console.log('🔄 Processing migrations...\n');

  for (const migration of FLAG_MIGRATIONS) {
    const { flagKey, name, description, stage, scope, documentationUrl } = migration;

    try {
      // Check if feature flag exists
      const flag = flagsByKey.get(flagKey);
      if (!flag) {
        results.push({
          flagKey,
          status: 'error',
          message: `Feature flag "${flagKey}" not found in PostHog`,
        });
        console.log(`   ❌ ${flagKey}: Feature flag not found`);
        continue;
      }

      // Check if early access feature already exists
      const existingEA = eaByFlagKey.get(flagKey);
      if (existingEA) {
        if (migration.skipIfExists) {
          results.push({
            flagKey,
            status: 'skipped',
            message: 'Early access feature already exists',
            earlyAccessFeatureId: existingEA.id,
          });
          console.log(`   ⏭️  ${flagKey}: Skipped (already exists)`);
          continue;
        }

        // Update existing early access feature
        const updated = await client.updateEarlyAccessFeature(existingEA.id, {
          name,
          description: `${description}${scope === 'workspace' ? ' [Workspace-level]' : ''}`,
          stage,
          documentation_url: documentationUrl,
        });

        results.push({
          flagKey,
          status: 'updated',
          message: `Updated early access feature`,
          earlyAccessFeatureId: updated.id,
        });
        console.log(`   🔄 ${flagKey}: Updated (${stage})`);
        continue;
      }

      // Create new early access feature
      const created = await client.createEarlyAccessFeature({
        name,
        description: `${description}${scope === 'workspace' ? ' [Workspace-level]' : ''}`,
        stage,
        documentation_url: documentationUrl,
        feature_flag_id: flag.id,
      });

      results.push({
        flagKey,
        status: 'created',
        message: `Created early access feature`,
        earlyAccessFeatureId: created.id,
      });
      console.log(`   ✅ ${flagKey}: Created (${stage})`);

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        flagKey,
        status: 'error',
        message,
      });
      console.log(`   ❌ ${flagKey}: Error - ${message}`);
    }

    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═'.repeat(70));
  console.log('PostHog Early Access Feature Migration');
  console.log('Release Lifecycle Process • AskElephant');
  console.log('═'.repeat(70));
  console.log();

  try {
    const results = await migrateFlags();

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('MIGRATION SUMMARY');
    console.log('═'.repeat(70));

    const created = results.filter(r => r.status === 'created').length;
    const updated = results.filter(r => r.status === 'updated').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`\n   ✅ Created: ${created}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors:  ${errors}`);
    console.log(`   ─────────────────`);
    console.log(`   📊 Total:   ${results.length}`);

    if (errors > 0) {
      console.log('\n⚠️  Some migrations failed. Check the errors above.');
      console.log('\nFailed flags:');
      results
        .filter(r => r.status === 'error')
        .forEach(r => console.log(`   - ${r.flagKey}: ${r.message}`));
    }

    console.log('\n' + '═'.repeat(70));
    console.log('NEXT STEPS');
    console.log('═'.repeat(70));
    console.log(`
1. Verify in PostHog:
   ${POSTHOG_BASE_URL}/project/${POSTHOG_PROJECT_ID}/early_access_features

2. Test in your app:
   - Start the dev server: cd elephant-ai && npm run dev -w web
   - Navigate to Settings → Beta Features
   - Verify features appear and toggles work

3. Release features in PostHog:
   - Early access features must be "released" before users can see them
   - Go to each feature in PostHog and click "Release"
`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();

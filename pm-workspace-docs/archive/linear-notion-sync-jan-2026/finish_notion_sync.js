#!/usr/bin/env node
/**
 * Finish Linear→Notion sync using Composio/Notion.
 * Run from pm-workspace: node finish_notion_sync.js
 * Requires: COMPOSIO_ENTITY_ID or Notion env from Composio integration
 */
const fs = require('fs');
const path = require('path');

const BATCH_DIR = '/tmp/sync_batches';
const DB_ID = '308f79b2-c8ac-81d1-a3ff-f1dad31a4edd';

async function main() {
  const files = fs.readdirSync(BATCH_DIR).filter(f => f.endsWith('.jsonl')).sort();
  let created = 0, failed = 0, failures = [];
  for (const file of files) {
    const lines = fs.readFileSync(path.join(BATCH_DIR, file), 'utf8').trim().split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const payload = JSON.parse(line);
        // This script would need Composio SDK or direct Notion API
        // For now, output what we'd send
        const sei = payload.properties.find(p => p.name === 'Source Event ID')?.value;
        console.log('Would insert:', sei);
        created++;
      } catch (e) {
        failed++;
        failures.push({ line: line.slice(0, 50), error: e.message });
      }
    }
  }
  console.log('Total would process:', created, 'Failed:', failed);
  if (failures.length) console.log('Sample failures:', failures.slice(0, 5));
}

main().catch(console.error);

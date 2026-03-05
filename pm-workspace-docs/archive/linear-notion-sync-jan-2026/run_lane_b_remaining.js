#!/usr/bin/env node
/**
 * Output remaining Lane B payloads for MCP NOTION_INSERT_ROW_DATABASE.
 * Run: node run_lane_b_remaining.js
 * 
 * Each line = one complete payload. Agent should invoke call_mcp_tool with
 * server=user-mcp-notion-jxkjdq, toolName=NOTION_INSERT_ROW_DATABASE,
 * arguments=<parsed JSON>.
 * 
 * IMPORTANT: Notion MCP requires number values as strings ("1", "0.5").
 */
const fs = require('fs');
const path = require('path');

const NORM = '/tmp/sync_batches/norm';
const files = ['B_040_10', 'B_050_10', 'B_060_10', 'B_070_10', 'B_080_10', 'B_090_10', 'B_100_10', 'B_110_10', 'B_120_9'];

let total = 0;
for (const base of files) {
  const p = path.join(NORM, base + '.jsonl');
  if (!fs.existsSync(p)) continue;
  const lines = fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean);
  for (const line of lines) {
    const payload = JSON.parse(line);
    console.log(JSON.stringify({ database_id: payload.database_id, properties: payload.properties }));
    total++;
  }
}
console.error('Total payloads:', total);

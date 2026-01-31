import { describe, it, expect } from 'vitest';
import {
  generateDeterministicId,
  generateProjectId,
  generateContextPathId,
  generateAgentId,
} from '../id-generator';

describe('generateDeterministicId', () => {
  it('produces same ID for same inputs (deterministic)', () => {
    const parts = ['workspace-1', 'owner/repo', 'initiatives/feature-a'];
    const id1 = generateDeterministicId(parts);
    const id2 = generateDeterministicId(parts);

    expect(id1).toBe(id2);
  });

  it('produces different IDs for different inputs', () => {
    const id1 = generateDeterministicId(['workspace-1', 'owner/repo', 'initiatives/feature-a']);
    const id2 = generateDeterministicId(['workspace-1', 'owner/repo', 'initiatives/feature-b']);

    expect(id1).not.toBe(id2);
  });

  it('returns 16 character hex string', () => {
    const id = generateDeterministicId(['test', 'input']);

    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[a-f0-9]{16}$/);
  });

  it('is stable across multiple calls', () => {
    const parts = ['ws', 'repo', 'path'];
    const ids = Array.from({ length: 100 }, () => generateDeterministicId(parts));

    // All 100 calls should produce the same ID
    expect(new Set(ids).size).toBe(1);
  });

  it('handles empty parts array', () => {
    const id = generateDeterministicId([]);

    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[a-f0-9]{16}$/);
  });

  it('handles parts with special characters', () => {
    const id = generateDeterministicId(['ws-1', 'owner/repo', 'path/with spaces/and-dashes']);

    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[a-f0-9]{16}$/);
  });

  it('produces unique IDs for similar inputs', () => {
    // These are very similar but should produce different IDs
    const id1 = generateDeterministicId(['a', 'b', 'c']);
    const id2 = generateDeterministicId(['a', 'b|c']); // Same when joined but different parts
    const id3 = generateDeterministicId(['a|b', 'c']); // Same when joined but different parts

    expect(new Set([id1, id2, id3]).size).toBe(3);
  });
});

describe('generateProjectId', () => {
  it('starts with proj_ prefix', () => {
    const id = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-a');

    expect(id).toMatch(/^proj_/);
  });

  it('is 21 characters total (5 prefix + 16 hash)', () => {
    const id = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-a');

    expect(id).toHaveLength(21);
  });

  it('produces same ID for same workspace, repo, and path', () => {
    const id1 = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-a');
    const id2 = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-a');

    expect(id1).toBe(id2);
  });

  it('produces different IDs for different workspaces', () => {
    const id1 = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-a');
    const id2 = generateProjectId('ws-456', 'owner/repo', 'initiatives/feature-a');

    expect(id1).not.toBe(id2);
  });

  it('produces different IDs for different repos', () => {
    const id1 = generateProjectId('ws-123', 'owner/repo-a', 'initiatives/feature-a');
    const id2 = generateProjectId('ws-123', 'owner/repo-b', 'initiatives/feature-a');

    expect(id1).not.toBe(id2);
  });

  it('produces different IDs for different paths', () => {
    const id1 = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-a');
    const id2 = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-b');

    expect(id1).not.toBe(id2);
  });

  it('ID format matches regex pattern', () => {
    const id = generateProjectId('ws-123', 'owner/repo', 'initiatives/feature-a');

    expect(id).toMatch(/^proj_[a-f0-9]{16}$/);
  });
});

describe('generateContextPathId', () => {
  it('starts with ctx_ prefix', () => {
    const id = generateContextPathId('ws-123', 'owner/repo', 'knowledge', 'docs/knowledge');

    expect(id).toMatch(/^ctx_/);
  });

  it('is 20 characters total (4 prefix + 16 hash)', () => {
    const id = generateContextPathId('ws-123', 'owner/repo', 'knowledge', 'docs/knowledge');

    expect(id).toHaveLength(20);
  });

  it('produces same ID for same inputs', () => {
    const id1 = generateContextPathId('ws-123', 'owner/repo', 'personas', 'docs/personas');
    const id2 = generateContextPathId('ws-123', 'owner/repo', 'personas', 'docs/personas');

    expect(id1).toBe(id2);
  });

  it('produces different IDs for different context types', () => {
    const id1 = generateContextPathId('ws-123', 'owner/repo', 'knowledge', 'docs');
    const id2 = generateContextPathId('ws-123', 'owner/repo', 'personas', 'docs');

    expect(id1).not.toBe(id2);
  });
});

describe('generateAgentId', () => {
  it('starts with agt_ prefix', () => {
    const id = generateAgentId('ws-123', 'owner/repo', 'skill', '.claude/skills/prd.md');

    expect(id).toMatch(/^agt_/);
  });

  it('is 20 characters total (4 prefix + 16 hash)', () => {
    const id = generateAgentId('ws-123', 'owner/repo', 'skill', '.claude/skills/prd.md');

    expect(id).toHaveLength(20);
  });

  it('produces same ID for same inputs', () => {
    const id1 = generateAgentId('ws-123', 'owner/repo', 'command', '.claude/commands/generate.md');
    const id2 = generateAgentId('ws-123', 'owner/repo', 'command', '.claude/commands/generate.md');

    expect(id1).toBe(id2);
  });

  it('produces different IDs for different agent types', () => {
    const id1 = generateAgentId('ws-123', 'owner/repo', 'skill', 'agents/prd.md');
    const id2 = generateAgentId('ws-123', 'owner/repo', 'command', 'agents/prd.md');

    expect(id1).not.toBe(id2);
  });
});

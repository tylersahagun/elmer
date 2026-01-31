import { describe, it, expect } from 'vitest';
import {
  parseMetaJson,
  extractStatus,
  parseAndExtractStatus,
  isParseSuccess,
  isParseError,
  type MetaJsonSchema,
  type ParseResult,
} from '../meta-parser';

describe('meta-parser', () => {
  describe('parseMetaJson', () => {
    it('parses valid JSON with status field', () => {
      const content = JSON.stringify({ status: 'discovery', name: 'Feature A' });
      const result = parseMetaJson(content);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('discovery');
        expect(result.data.name).toBe('Feature A');
      }
    });

    it('parses valid JSON with all common fields', () => {
      const meta = {
        status: 'build',
        name: 'My Initiative',
        title: 'My Initiative Title',
        description: 'A description',
        archived: false,
        created: '2024-01-01',
        updated: '2024-01-15',
        tags: ['feature', 'priority-1'],
      };
      const result = parseMetaJson(JSON.stringify(meta));

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('build');
        expect(result.data.name).toBe('My Initiative');
        expect(result.data.tags).toEqual(['feature', 'priority-1']);
      }
    });

    it('parses JSON with unknown fields (forward compatibility)', () => {
      const content = JSON.stringify({
        status: 'discovery',
        customField: 'custom value',
        nestedObject: { deep: 'value' },
      });
      const result = parseMetaJson(content);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('discovery');
        expect(result.data['customField']).toBe('custom value');
        expect(result.data['nestedObject']).toEqual({ deep: 'value' });
      }
    });

    it('returns ParseError for empty content', () => {
      const result = parseMetaJson('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Empty file content');
      }
    });

    it('returns ParseError for whitespace-only content', () => {
      const result = parseMetaJson('   \n\t  ');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Empty file content');
      }
    });

    it('returns ParseError for malformed JSON', () => {
      const result = parseMetaJson('{ invalid json }');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid JSON');
      }
    });

    it('returns ParseError with position details when available', () => {
      const result = parseMetaJson('{"status": discovery}'); // missing quotes

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid JSON');
        // Position details may or may not be present depending on engine
      }
    });

    it('returns ParseError for JSON array', () => {
      const result = parseMetaJson('["item1", "item2"]');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid structure: expected object, got array');
      }
    });

    it('returns ParseError for JSON string', () => {
      const result = parseMetaJson('"just a string"');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid structure: expected object, got string');
      }
    });

    it('returns ParseError for JSON number', () => {
      const result = parseMetaJson('42');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid structure: expected object, got number');
      }
    });

    it('returns ParseError for JSON null', () => {
      const result = parseMetaJson('null');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid structure: expected object, got null');
      }
    });

    it('parses empty object as valid', () => {
      const result = parseMetaJson('{}');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });
  });

  describe('extractStatus', () => {
    it('extracts status from status field', () => {
      const meta: MetaJsonSchema = { status: 'discovery' };
      const result = extractStatus(meta);

      expect(result.value).toBe('discovery');
      expect(result.source).toBe('status');
      expect(result.archived).toBe(false);
    });

    it('extracts status from stage field when status is missing', () => {
      const meta: MetaJsonSchema = { stage: 'development' };
      const result = extractStatus(meta);

      expect(result.value).toBe('development');
      expect(result.source).toBe('stage');
      expect(result.archived).toBe(false);
    });

    it('extracts status from state field when status and stage are missing', () => {
      const meta: MetaJsonSchema = { state: 'in-progress' };
      const result = extractStatus(meta);

      expect(result.value).toBe('in-progress');
      expect(result.source).toBe('state');
      expect(result.archived).toBe(false);
    });

    it('prefers status over stage', () => {
      const meta: MetaJsonSchema = { status: 'discovery', stage: 'development' };
      const result = extractStatus(meta);

      expect(result.value).toBe('discovery');
      expect(result.source).toBe('status');
    });

    it('prefers stage over state', () => {
      const meta: MetaJsonSchema = { stage: 'development', state: 'paused' };
      const result = extractStatus(meta);

      expect(result.value).toBe('development');
      expect(result.source).toBe('stage');
    });

    it('handles archived: true', () => {
      const meta: MetaJsonSchema = { status: 'completed', archived: true };
      const result = extractStatus(meta);

      expect(result.value).toBe('completed');
      expect(result.source).toBe('status');
      expect(result.archived).toBe(true);
    });

    it('handles archived: false explicitly', () => {
      const meta: MetaJsonSchema = { status: 'active', archived: false };
      const result = extractStatus(meta);

      expect(result.archived).toBe(false);
    });

    it('defaults archived to false when not present', () => {
      const meta: MetaJsonSchema = { status: 'active' };
      const result = extractStatus(meta);

      expect(result.archived).toBe(false);
    });

    it('returns null value when no status fields present', () => {
      const meta: MetaJsonSchema = { name: 'Feature A' };
      const result = extractStatus(meta);

      expect(result.value).toBeNull();
      expect(result.source).toBe('none');
    });

    it('returns null value for empty string status', () => {
      const meta: MetaJsonSchema = { status: '' };
      const result = extractStatus(meta);

      expect(result.value).toBeNull();
      expect(result.source).toBe('none');
    });

    it('returns null value for whitespace-only status', () => {
      const meta: MetaJsonSchema = { status: '   ' };
      const result = extractStatus(meta);

      expect(result.value).toBeNull();
      expect(result.source).toBe('none');
    });

    it('trims whitespace from status value', () => {
      const meta: MetaJsonSchema = { status: '  discovery  ' };
      const result = extractStatus(meta);

      expect(result.value).toBe('discovery');
    });

    it('converts non-string status to string', () => {
      // Some _meta.json files might have number or boolean status
      const meta = { status: 1 } as unknown as MetaJsonSchema;
      const result = extractStatus(meta);

      expect(result.value).toBe('1');
      expect(result.source).toBe('status');
    });

    it('handles null status field by falling back', () => {
      const meta: MetaJsonSchema = { status: null as unknown as string, stage: 'build' };
      const result = extractStatus(meta);

      // null is undefined-ish but !== undefined, so we should handle it
      expect(result.value).toBe('build');
      expect(result.source).toBe('stage');
    });
  });

  describe('parseAndExtractStatus', () => {
    it('parses and extracts status in one step', () => {
      const content = JSON.stringify({ status: 'discovery' });
      const result = parseAndExtractStatus(content);

      expect(result).not.toBeNull();
      expect(result?.value).toBe('discovery');
      expect(result?.source).toBe('status');
    });

    it('returns null for invalid JSON', () => {
      const result = parseAndExtractStatus('{ invalid }');

      expect(result).toBeNull();
    });

    it('returns null for empty content', () => {
      const result = parseAndExtractStatus('');

      expect(result).toBeNull();
    });
  });

  describe('type guards', () => {
    it('isParseSuccess returns true for success result', () => {
      const result = parseMetaJson('{"status": "discovery"}');
      expect(isParseSuccess(result)).toBe(true);
      expect(isParseError(result)).toBe(false);
    });

    it('isParseError returns true for error result', () => {
      const result = parseMetaJson('invalid');
      expect(isParseError(result)).toBe(true);
      expect(isParseSuccess(result)).toBe(false);
    });
  });

  describe('real-world examples', () => {
    it('handles typical pm-workspace _meta.json', () => {
      const content = JSON.stringify({
        name: 'Smart Notifications',
        status: 'discovery',
        description: 'Intelligent notification system with ML-based prioritization',
        tags: ['notifications', 'ml', 'q1-2024'],
        created: '2024-01-15T10:30:00Z',
        owner: 'product-team',
      });

      const result = parseMetaJson(content);
      expect(result.success).toBe(true);

      if (result.success) {
        const status = extractStatus(result.data);
        expect(status.value).toBe('discovery');
        expect(status.source).toBe('status');
        expect(status.archived).toBe(false);
      }
    });

    it('handles legacy format with stage instead of status', () => {
      const content = JSON.stringify({
        name: 'Old Feature',
        stage: 'build',
        created: '2023-06-01',
      });

      const result = parseAndExtractStatus(content);
      expect(result?.value).toBe('build');
      expect(result?.source).toBe('stage');
    });

    it('handles minimal _meta.json', () => {
      const content = JSON.stringify({ status: 'inbox' });

      const result = parseAndExtractStatus(content);
      expect(result?.value).toBe('inbox');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  mapStatusToColumn,
  createDynamicColumn,
  isKnownColumn,
  normalizeStatus,
  mapStatusWithFallback,
  getColumnAliases,
  STATUS_ALIASES,
  KNOWN_COLUMNS,
} from '../status-mapper';

describe('status-mapper', () => {
  describe('normalizeStatus', () => {
    it('converts to lowercase', () => {
      expect(normalizeStatus('DISCOVERY')).toBe('discovery');
    });

    it('trims whitespace', () => {
      expect(normalizeStatus('  discovery  ')).toBe('discovery');
    });

    it('normalizes dashes and underscores', () => {
      expect(normalizeStatus('in_progress')).toBe('in-progress');
      expect(normalizeStatus('in-progress')).toBe('in-progress');
    });

    it('converts spaces to dashes', () => {
      expect(normalizeStatus('in progress')).toBe('in-progress');
    });

    it('collapses multiple separators', () => {
      expect(normalizeStatus('in--progress')).toBe('in-progress');
      expect(normalizeStatus('in__progress')).toBe('in-progress');
    });

    it('handles empty string', () => {
      expect(normalizeStatus('')).toBe('');
    });
  });

  describe('mapStatusToColumn', () => {
    describe('exact matches', () => {
      it('matches "discovery" with confidence 1.0', () => {
        const result = mapStatusToColumn('discovery');
        expect(result.column).toBe('discovery');
        expect(result.confidence).toBe(1.0);
        expect(result.isAmbiguous).toBe(false);
      });

      it('matches "Discovery" case-insensitively', () => {
        const result = mapStatusToColumn('Discovery');
        expect(result.column).toBe('discovery');
        expect(result.confidence).toBe(1.0);
      });

      it('matches alias "dev" to column "build"', () => {
        const result = mapStatusToColumn('dev');
        expect(result.column).toBe('build');
        expect(result.confidence).toBe(1.0);
      });

      it('matches "in-progress" to column "build"', () => {
        const result = mapStatusToColumn('in-progress');
        expect(result.column).toBe('build');
        expect(result.confidence).toBe(1.0);
      });

      it('matches "in_progress" to column "build"', () => {
        const result = mapStatusToColumn('in_progress');
        expect(result.column).toBe('build');
        expect(result.confidence).toBe(1.0);
      });
    });

    describe('fuzzy matches', () => {
      it('matches "development-ready" via starts-with', () => {
        const result = mapStatusToColumn('development-ready');
        expect(result.column).toBe('build');
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
        expect(result.confidence).toBeLessThan(1.0);
      });

      it('matches "pre-alpha" via contains', () => {
        const result = mapStatusToColumn('pre-alpha');
        expect(result.column).toBe('alpha');
        expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      });
    });

    describe('ambiguous statuses', () => {
      it('detects ambiguity in "discovery-dev-ready"', () => {
        const result = mapStatusToColumn('discovery-dev-ready');
        expect(result.isAmbiguous).toBe(true);
        expect(result.column).not.toBeNull();
        expect(result.alternatives).toBeDefined();
        expect(result.alternatives!.length).toBeGreaterThan(0);
      });

      it('has lower confidence for ambiguous matches', () => {
        const result = mapStatusToColumn('discovery-development');
        expect(result.confidence).toBeLessThanOrEqual(0.5);
      });
    });

    describe('no match', () => {
      it('returns null column for unknown status', () => {
        const result = mapStatusToColumn('totally-unknown-status');
        expect(result.column).toBeNull();
        expect(result.confidence).toBe(0);
        expect(result.isAmbiguous).toBe(false);
      });

      it('returns null for empty string', () => {
        const result = mapStatusToColumn('');
        expect(result.column).toBeNull();
        expect(result.confidence).toBe(0);
      });

      it('returns original and normalized status', () => {
        const result = mapStatusToColumn('My Custom Status');
        expect(result.originalStatus).toBe('My Custom Status');
        expect(result.normalizedStatus).toBe('my-custom-status');
      });
    });

    describe('all known columns have aliases', () => {
      it.each(KNOWN_COLUMNS)('column "%s" matches its own name', (column) => {
        const result = mapStatusToColumn(column);
        expect(result.column).toBe(column);
        expect(result.confidence).toBe(1.0);
      });
    });

    describe('common alias mappings', () => {
      it.each([
        ['inbox', 'inbox'],
        ['new', 'inbox'],
        ['triage', 'inbox'],
        ['backlog', 'inbox'],
        ['research', 'discovery'],
        ['exploring', 'discovery'],
        ['requirements', 'prd'],
        ['spec', 'prd'],
        ['ux', 'design'],
        ['wireframe', 'design'],
        ['poc', 'prototype'],
        ['mvp', 'prototype'],
        ['qa', 'validate'],
        ['testing', 'validate'],
        ['jira', 'tickets'],
        ['linear', 'tickets'],
        ['coding', 'build'],
        ['implementation', 'build'],
        ['internal', 'alpha'],
        ['beta-testing', 'beta'],
        ['production', 'ga'],
        ['shipped', 'ga'],
        ['released', 'ga'],
      ])('maps "%s" to "%s"', (alias, expectedColumn) => {
        const result = mapStatusToColumn(alias);
        expect(result.column).toBe(expectedColumn);
      });
    });
  });

  describe('createDynamicColumn', () => {
    it('converts kebab-case to Title Case', () => {
      expect(createDynamicColumn('beta-testing')).toBe('Beta Testing');
    });

    it('converts snake_case to Title Case', () => {
      expect(createDynamicColumn('user_acceptance')).toBe('User Acceptance');
    });

    it('preserves already-formatted names with spaces', () => {
      expect(createDynamicColumn('Beta Testing')).toBe('Beta Testing');
    });

    it('handles single word', () => {
      expect(createDynamicColumn('custom')).toBe('Custom');
    });

    it('trims whitespace', () => {
      expect(createDynamicColumn('  beta-testing  ')).toBe('Beta Testing');
    });
  });

  describe('isKnownColumn', () => {
    it('returns true for known columns', () => {
      expect(isKnownColumn('inbox')).toBe(true);
      expect(isKnownColumn('discovery')).toBe(true);
      expect(isKnownColumn('build')).toBe(true);
      expect(isKnownColumn('ga')).toBe(true);
    });

    it('returns false for unknown columns', () => {
      expect(isKnownColumn('custom')).toBe(false);
      expect(isKnownColumn('unknown')).toBe(false);
    });

    it('returns false for aliases (not canonical names)', () => {
      expect(isKnownColumn('dev')).toBe(false);  // alias for 'build'
      expect(isKnownColumn('shipped')).toBe(false);  // alias for 'ga'
    });
  });

  describe('getColumnAliases', () => {
    it('returns aliases for known column', () => {
      const aliases = getColumnAliases('build');
      expect(aliases).toContain('build');
      expect(aliases).toContain('dev');
      expect(aliases).toContain('development');
    });

    it('includes the canonical name as first alias', () => {
      const aliases = getColumnAliases('inbox');
      expect(aliases[0]).toBe('inbox');
    });
  });

  describe('mapStatusWithFallback', () => {
    it('returns known column for matched status', () => {
      const result = mapStatusWithFallback('discovery');
      expect(result.column).toBe('discovery');
      expect(result.isKnown).toBe(true);
      expect(result.confidence).toBe(1.0);
    });

    it('returns dynamic column for unmatched status', () => {
      const result = mapStatusWithFallback('custom-workflow');
      expect(result.column).toBe('Custom Workflow');
      expect(result.isKnown).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('preserves ambiguity info', () => {
      const result = mapStatusWithFallback('discovery-dev');
      expect(result.isAmbiguous).toBe(true);
    });
  });

  describe('STATUS_ALIASES constant', () => {
    it('has aliases for all known columns', () => {
      for (const column of KNOWN_COLUMNS) {
        expect(STATUS_ALIASES[column]).toBeDefined();
        expect(STATUS_ALIASES[column].length).toBeGreaterThan(0);
      }
    });

    it('each alias array starts with the canonical name', () => {
      for (const column of KNOWN_COLUMNS) {
        expect(STATUS_ALIASES[column][0]).toBe(column);
      }
    });
  });

  describe('real-world status examples', () => {
    it.each([
      ['discovery', 'discovery'],
      ['Discovery', 'discovery'],
      ['DISCOVERY', 'discovery'],
      ['in progress', 'build'],
      ['In Progress', 'build'],
      ['IN-PROGRESS', 'build'],
      ['in_progress', 'build'],
      ['dev', 'build'],
      ['shipped', 'ga'],
      ['done', 'ga'],
      ['complete', 'ga'],
    ])('handles real-world status "%s" -> "%s"', (input, expected) => {
      const result = mapStatusToColumn(input);
      expect(result.column).toBe(expected);
    });
  });
});

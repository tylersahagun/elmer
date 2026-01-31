import { describe, it, expect } from 'vitest';
import {
  matchFolderPattern,
  matchInitiativePattern,
  matchContextPatterns,
  matchAnyPattern,
  rankFolderMatch,
  isPmWorkspaceFolder,
  INITIATIVE_PATTERNS,
  CONTEXT_PATTERNS,
  type PatternMatch,
} from '../patterns';

describe('patterns', () => {
  describe('matchFolderPattern', () => {
    it('returns confidence 1.0 for exact match', () => {
      const result = matchFolderPattern('initiatives', INITIATIVE_PATTERNS, 'initiative');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(1.0);
      expect(result?.matchType).toBe('exact');
      expect(result?.pattern).toBe('initiatives');
    });

    it('returns confidence 1.0 for singular when singular is in patterns', () => {
      // "initiative" is explicitly in INITIATIVE_PATTERNS, so exact match
      const result = matchFolderPattern('initiative', INITIATIVE_PATTERNS, 'initiative');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(1.0);
      expect(result?.matchType).toBe('exact');
    });

    it('returns confidence 0.9 for plural variation when only plural is in patterns', () => {
      // Test with a custom pattern array that only has plural forms
      const pluralOnlyPatterns = ['initiatives', 'features'] as const;
      const result = matchFolderPattern('initiative', pluralOnlyPatterns, 'initiative');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(0.9);
      expect(result?.matchType).toBe('plural');
    });

    it('is case insensitive', () => {
      const result = matchFolderPattern('Initiatives', INITIATIVE_PATTERNS, 'initiative');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(1.0);
      expect(result?.matchType).toBe('exact');
    });

    it('returns null for no match', () => {
      const result = matchFolderPattern('random-folder', INITIATIVE_PATTERNS, 'initiative');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = matchFolderPattern('', INITIATIVE_PATTERNS, 'initiative');
      expect(result).toBeNull();
    });

    it('returns null for whitespace only', () => {
      const result = matchFolderPattern('   ', INITIATIVE_PATTERNS, 'initiative');
      expect(result).toBeNull();
    });

    it('trims whitespace from folder name', () => {
      const result = matchFolderPattern('  initiatives  ', INITIATIVE_PATTERNS, 'initiative');
      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(1.0);
    });
  });

  describe('matchInitiativePattern', () => {
    it.each([
      ['initiatives', 1.0, 'exact'],
      ['initiative', 1.0, 'exact'],  // singular is in patterns, so exact match
      ['features', 1.0, 'exact'],
      ['feature', 1.0, 'exact'],     // singular is in patterns, so exact match
      ['projects', 1.0, 'exact'],
      ['project', 1.0, 'exact'],     // singular is in patterns, so exact match
      ['work', 1.0, 'exact'],
      ['epics', 1.0, 'exact'],
      ['epic', 1.0, 'exact'],        // singular is in patterns, so exact match
    ])('matches "%s" with confidence %f (%s)', (folderName, expectedConfidence, expectedType) => {
      const result = matchInitiativePattern(folderName);
      expect(result).not.toBeNull();
      expect(result?.confidence).toBe(expectedConfidence);
      expect(result?.matchType).toBe(expectedType);
      expect(result?.folderType).toBe('initiative');
    });

    it('does not match non-initiative folders', () => {
      expect(matchInitiativePattern('src')).toBeNull();
      expect(matchInitiativePattern('lib')).toBeNull();
      expect(matchInitiativePattern('components')).toBeNull();
    });
  });

  describe('matchContextPatterns', () => {
    it.each([
      ['knowledge', 'knowledge', 1.0],
      ['docs', 'knowledge', 1.0],
      ['kb', 'knowledge', 1.0],
      ['documentation', 'knowledge', 1.0],
      ['pm-workspace-docs', 'knowledge', 1.0],
      ['elmer-docs', 'knowledge', 1.0],
    ])('matches "%s" as %s folder with confidence %f', (folderName, expectedType, expectedConfidence) => {
      const result = matchContextPatterns(folderName);
      expect(result).not.toBeNull();
      expect(result?.folderType).toBe(expectedType);
      expect(result?.confidence).toBe(expectedConfidence);
    });

    it.each([
      ['personas', 'personas', 1.0],
      ['persona', 'personas', 1.0],  // singular is in patterns
      ['team', 'personas', 1.0],
      ['users', 'personas', 1.0],
    ])('matches "%s" as %s folder', (folderName, expectedType, expectedConfidence) => {
      const result = matchContextPatterns(folderName);
      expect(result).not.toBeNull();
      expect(result?.folderType).toBe(expectedType);
      expect(result?.confidence).toBe(expectedConfidence);
    });

    it.each([
      ['signals', 'signals', 1.0],
      ['signal', 'signals', 1.0],  // singular is in patterns
      ['feedback', 'signals', 1.0],
      ['insights', 'signals', 1.0],
    ])('matches "%s" as %s folder', (folderName, expectedType, expectedConfidence) => {
      const result = matchContextPatterns(folderName);
      expect(result).not.toBeNull();
      expect(result?.folderType).toBe(expectedType);
      expect(result?.confidence).toBe(expectedConfidence);
    });

    it('returns null for non-context folders', () => {
      expect(matchContextPatterns('src')).toBeNull();
      expect(matchContextPatterns('node_modules')).toBeNull();
    });
  });

  describe('matchAnyPattern', () => {
    it('matches initiative patterns', () => {
      const result = matchAnyPattern('initiatives');
      expect(result).not.toBeNull();
      expect(result?.folderType).toBe('initiative');
    });

    it('matches context patterns', () => {
      const result = matchAnyPattern('knowledge');
      expect(result).not.toBeNull();
      expect(result?.folderType).toBe('knowledge');
    });

    it('prioritizes initiative patterns', () => {
      // If a folder matched both (hypothetically), initiative should win
      // This test ensures initiative patterns are checked first
      const result = matchAnyPattern('projects');
      expect(result?.folderType).toBe('initiative');
    });
  });

  describe('rankFolderMatch', () => {
    it('sorts matches by confidence descending', () => {
      const matches: PatternMatch[] = [
        { pattern: 'feature', matchType: 'plural', confidence: 0.9, folderType: 'initiative' },
        { pattern: 'initiatives', matchType: 'exact', confidence: 1.0, folderType: 'initiative' },
        { pattern: 'epic', matchType: 'plural', confidence: 0.9, folderType: 'initiative' },
      ];

      const ranked = rankFolderMatch(matches);

      expect(ranked[0].confidence).toBe(1.0);
      expect(ranked[1].confidence).toBe(0.9);
      expect(ranked[2].confidence).toBe(0.9);
    });

    it('does not mutate original array', () => {
      const matches: PatternMatch[] = [
        { pattern: 'feature', matchType: 'plural', confidence: 0.9, folderType: 'initiative' },
        { pattern: 'initiatives', matchType: 'exact', confidence: 1.0, folderType: 'initiative' },
      ];

      const original = [...matches];
      rankFolderMatch(matches);

      expect(matches).toEqual(original);
    });

    it('handles empty array', () => {
      const ranked = rankFolderMatch([]);
      expect(ranked).toEqual([]);
    });
  });

  describe('isPmWorkspaceFolder', () => {
    it('returns true for pm-workspace folders', () => {
      expect(isPmWorkspaceFolder('initiatives')).toBe(true);
      expect(isPmWorkspaceFolder('features')).toBe(true);
      expect(isPmWorkspaceFolder('knowledge')).toBe(true);
      expect(isPmWorkspaceFolder('personas')).toBe(true);
      expect(isPmWorkspaceFolder('signals')).toBe(true);
    });

    it('returns false for non-pm-workspace folders', () => {
      expect(isPmWorkspaceFolder('src')).toBe(false);
      expect(isPmWorkspaceFolder('node_modules')).toBe(false);
      expect(isPmWorkspaceFolder('random-folder')).toBe(false);
    });
  });

  describe('INITIATIVE_PATTERNS constant', () => {
    it('includes all expected patterns', () => {
      expect(INITIATIVE_PATTERNS).toContain('initiatives');
      expect(INITIATIVE_PATTERNS).toContain('initiative');
      expect(INITIATIVE_PATTERNS).toContain('features');
      expect(INITIATIVE_PATTERNS).toContain('feature');
      expect(INITIATIVE_PATTERNS).toContain('projects');
      expect(INITIATIVE_PATTERNS).toContain('project');
      expect(INITIATIVE_PATTERNS).toContain('work');
      expect(INITIATIVE_PATTERNS).toContain('epics');
      expect(INITIATIVE_PATTERNS).toContain('epic');
    });
  });

  describe('CONTEXT_PATTERNS constant', () => {
    it('includes knowledge patterns', () => {
      expect(CONTEXT_PATTERNS.knowledge).toContain('knowledge');
      expect(CONTEXT_PATTERNS.knowledge).toContain('docs');
      expect(CONTEXT_PATTERNS.knowledge).toContain('kb');
    });

    it('includes personas patterns', () => {
      expect(CONTEXT_PATTERNS.personas).toContain('personas');
      expect(CONTEXT_PATTERNS.personas).toContain('persona');
      expect(CONTEXT_PATTERNS.personas).toContain('team');
    });

    it('includes signals patterns', () => {
      expect(CONTEXT_PATTERNS.signals).toContain('signals');
      expect(CONTEXT_PATTERNS.signals).toContain('signal');
      expect(CONTEXT_PATTERNS.signals).toContain('feedback');
    });
  });
});

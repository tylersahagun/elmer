import { describe, it, expect, beforeEach } from 'vitest';
import { useConversationStore } from '../conversation-store';
import type { DiscoveryAmbiguity } from '@/lib/discovery/types';

describe('useConversationStore', () => {
  beforeEach(() => {
    useConversationStore.getState().reset();
  });

  describe('startConversation', () => {
    it('initializes with system message', () => {
      useConversationStore.getState().startConversation();
      const state = useConversationStore.getState();

      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].type).toBe('system');
      expect(state.isComplete).toBe(false);
    });
  });

  describe('askQuestion', () => {
    it('adds question message and sets waiting state', () => {
      const ambiguity: DiscoveryAmbiguity = {
        id: 'amb_1',
        type: 'multiple_initiative_folders',
        question: 'Which folder?',
        options: [
          { id: 'opt_1', label: '/features/', value: 'features' },
          { id: 'opt_2', label: '/work/', value: 'work' },
        ],
        context: { paths: ['features', 'work'] },
        resolved: false,
      };

      useConversationStore.getState().startConversation();
      useConversationStore.getState().askQuestion(ambiguity);
      const state = useConversationStore.getState();

      expect(state.messages).toHaveLength(2);
      expect(state.messages[1].type).toBe('question');
      expect(state.messages[1].ambiguityId).toBe('amb_1');
      expect(state.currentAmbiguityId).toBe('amb_1');
      expect(state.isWaitingForAnswer).toBe(true);
    });
  });

  describe('answerQuestion', () => {
    it('records answer and clears waiting state', () => {
      const ambiguity: DiscoveryAmbiguity = {
        id: 'amb_1',
        type: 'multiple_initiative_folders',
        question: 'Which folder?',
        options: [
          { id: 'opt_1', label: '/features/', value: 'features' },
        ],
        context: {},
        resolved: false,
      };

      useConversationStore.getState().startConversation();
      useConversationStore.getState().askQuestion(ambiguity);
      useConversationStore.getState().answerQuestion('amb_1', ambiguity.options[0]);
      const state = useConversationStore.getState();

      expect(state.messages).toHaveLength(3);
      expect(state.messages[2].type).toBe('answer');
      expect(state.messages[2].selectedOptionId).toBe('opt_1');
      expect(state.isWaitingForAnswer).toBe(false);

      const answer = state.getAnswer('amb_1');
      expect(answer).toBeDefined();
      expect(answer?.selectedOptionId).toBe('opt_1');
      expect(answer?.selectedOptionValue).toBe('features');
    });
  });

  describe('reviseAnswer', () => {
    it('allows revising previous answer', () => {
      const ambiguity: DiscoveryAmbiguity = {
        id: 'amb_1',
        type: 'multiple_initiative_folders',
        question: 'Which folder?',
        options: [
          { id: 'opt_1', label: '/features/', value: 'features' },
          { id: 'opt_2', label: '/work/', value: 'work' },
        ],
        context: {},
        resolved: false,
      };

      useConversationStore.getState().startConversation();
      useConversationStore.getState().askQuestion(ambiguity);
      useConversationStore.getState().answerQuestion('amb_1', ambiguity.options[0]);

      // Now revise
      useConversationStore.getState().reviseAnswer('amb_1');
      const state = useConversationStore.getState();

      // Should have info message + re-asked question
      expect(state.messages.length).toBeGreaterThan(3);
      expect(state.isWaitingForAnswer).toBe(true);
      expect(state.currentAmbiguityId).toBe('amb_1');

      // Previous answer should be marked as revised
      const answer = state.getAnswer('amb_1');
      expect(answer?.revised).toBe(true);
    });

    it('canRevise returns correct value', () => {
      const ambiguity: DiscoveryAmbiguity = {
        id: 'amb_1',
        type: 'multiple_initiative_folders',
        question: 'Which folder?',
        options: [{ id: 'opt_1', label: '/features/', value: 'features' }],
        context: {},
        resolved: false,
      };

      // No answer yet
      expect(useConversationStore.getState().canRevise('amb_1')).toBe(false);

      useConversationStore.getState().startConversation();
      useConversationStore.getState().askQuestion(ambiguity);
      useConversationStore.getState().answerQuestion('amb_1', ambiguity.options[0]);

      // Has answer, not complete
      expect(useConversationStore.getState().canRevise('amb_1')).toBe(true);

      useConversationStore.getState().markComplete();

      // Complete, cannot revise
      expect(useConversationStore.getState().canRevise('amb_1')).toBe(false);
    });
  });

  describe('markComplete', () => {
    it('adds completion message and sets complete state', () => {
      useConversationStore.getState().startConversation();
      useConversationStore.getState().markComplete();
      const state = useConversationStore.getState();

      expect(state.isComplete).toBe(true);
      expect(state.isWaitingForAnswer).toBe(false);
      expect(state.messages[state.messages.length - 1].type).toBe('system');
    });
  });

  describe('getAllAnswers', () => {
    it('returns all recorded answers', () => {
      const ambiguity1: DiscoveryAmbiguity = {
        id: 'amb_1',
        type: 'multiple_initiative_folders',
        question: 'Q1?',
        options: [{ id: 'opt_1', label: 'A1', value: 'v1' }],
        context: {},
        resolved: false,
      };

      const ambiguity2: DiscoveryAmbiguity = {
        id: 'amb_2',
        type: 'multiple_context_paths',
        question: 'Q2?',
        options: [{ id: 'opt_2', label: 'A2', value: 'v2' }],
        context: {},
        resolved: false,
      };

      useConversationStore.getState().startConversation();
      useConversationStore.getState().askQuestion(ambiguity1);
      useConversationStore.getState().answerQuestion('amb_1', ambiguity1.options[0]);
      useConversationStore.getState().askQuestion(ambiguity2);
      useConversationStore.getState().answerQuestion('amb_2', ambiguity2.options[0]);

      const answers = useConversationStore.getState().getAllAnswers();
      expect(answers).toHaveLength(2);
    });
  });

  describe('reset', () => {
    it('clears all state', () => {
      useConversationStore.getState().startConversation();
      useConversationStore.getState().addInfoMessage('test');
      useConversationStore.getState().reset();
      const state = useConversationStore.getState();

      expect(state.messages).toHaveLength(0);
      expect(state.isComplete).toBe(false);
      expect(state.answers.size).toBe(0);
    });
  });
});

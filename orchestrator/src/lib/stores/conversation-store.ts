/**
 * Conversation Store
 *
 * Manages the conversational discovery Q&A flow.
 * Implements CONV-02 (chat-like interface), CONV-04 (deterministic flow),
 * CONV-05 (revise previous answers).
 */

import { create } from 'zustand';
import type {
  DiscoveryAmbiguity,
  AmbiguityOption,
} from '@/lib/discovery/types';

/**
 * A message in the conversation
 */
export interface ConversationMessage {
  id: string;
  type: 'system' | 'question' | 'answer' | 'info';
  content: string;
  timestamp: Date;

  // For question messages
  ambiguityId?: string;
  options?: AmbiguityOption[];

  // For answer messages
  selectedOptionId?: string;
  selectedOptionLabel?: string;

  // UI state
  canRevise?: boolean;
}

/**
 * Answer record for tracking user's choices
 */
export interface AnswerRecord {
  ambiguityId: string;
  selectedOptionId: string;
  selectedOptionValue: unknown;
  answeredAt: Date;
  revised: boolean;
}

interface ConversationState {
  // Message history
  messages: ConversationMessage[];

  // Answer tracking
  answers: Map<string, AnswerRecord>;

  // Current state
  currentAmbiguityId: string | null;
  isWaitingForAnswer: boolean;
  isComplete: boolean;

  // Actions
  startConversation: () => void;
  askQuestion: (ambiguity: DiscoveryAmbiguity) => void;
  answerQuestion: (ambiguityId: string, option: AmbiguityOption) => void;
  reviseAnswer: (ambiguityId: string) => void;
  addInfoMessage: (content: string) => void;
  markComplete: () => void;

  // Getters
  getAnswer: (ambiguityId: string) => AnswerRecord | undefined;
  getAllAnswers: () => AnswerRecord[];
  canRevise: (ambiguityId: string) => boolean;

  // Reset
  reset: () => void;
}

/**
 * Generate unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  messages: [],
  answers: new Map(),
  currentAmbiguityId: null,
  isWaitingForAnswer: false,
  isComplete: false,

  startConversation: () => {
    set({
      messages: [{
        id: generateMessageId(),
        type: 'system',
        content: "I'm analyzing your repository structure. Let me ask a few questions to make sure I understand it correctly.",
        timestamp: new Date(),
      }],
      answers: new Map(),
      currentAmbiguityId: null,
      isWaitingForAnswer: false,
      isComplete: false,
    });
  },

  askQuestion: (ambiguity) => {
    const message: ConversationMessage = {
      id: generateMessageId(),
      type: 'question',
      content: ambiguity.question,
      timestamp: new Date(),
      ambiguityId: ambiguity.id,
      options: ambiguity.options,
    };

    set((state) => ({
      messages: [...state.messages, message],
      currentAmbiguityId: ambiguity.id,
      isWaitingForAnswer: true,
    }));
  },

  answerQuestion: (ambiguityId, option) => {
    const { currentAmbiguityId, answers } = get();

    // Verify this is the current question
    if (currentAmbiguityId !== ambiguityId) {
      console.warn('Answering non-current question:', ambiguityId);
    }

    // Create answer message
    const answerMessage: ConversationMessage = {
      id: generateMessageId(),
      type: 'answer',
      content: option.label,
      timestamp: new Date(),
      selectedOptionId: option.id,
      selectedOptionLabel: option.label,
      canRevise: true,
    };

    // Record the answer
    const answerRecord: AnswerRecord = {
      ambiguityId,
      selectedOptionId: option.id,
      selectedOptionValue: option.value,
      answeredAt: new Date(),
      revised: answers.has(ambiguityId), // Mark as revised if we had a previous answer
    };

    const newAnswers = new Map(answers);
    newAnswers.set(ambiguityId, answerRecord);

    set((state) => ({
      messages: [...state.messages, answerMessage],
      answers: newAnswers,
      currentAmbiguityId: null,
      isWaitingForAnswer: false,
    }));
  },

  reviseAnswer: (ambiguityId) => {
    const { messages, answers } = get();

    // Find the original question for this ambiguity
    const questionMessage = messages.find(
      m => m.type === 'question' && m.ambiguityId === ambiguityId
    );

    if (!questionMessage || !questionMessage.options) {
      console.warn('Cannot revise - question not found:', ambiguityId);
      return;
    }

    // Add info message about revision
    const infoMessage: ConversationMessage = {
      id: generateMessageId(),
      type: 'info',
      content: 'Revising previous answer...',
      timestamp: new Date(),
    };

    // Re-ask the question
    const newQuestionMessage: ConversationMessage = {
      id: generateMessageId(),
      type: 'question',
      content: questionMessage.content,
      timestamp: new Date(),
      ambiguityId,
      options: questionMessage.options,
    };

    // Mark previous answer as revised
    const previousAnswer = answers.get(ambiguityId);
    if (previousAnswer) {
      const newAnswers = new Map(answers);
      newAnswers.set(ambiguityId, { ...previousAnswer, revised: true });
      set({ answers: newAnswers });
    }

    set((state) => ({
      messages: [...state.messages, infoMessage, newQuestionMessage],
      currentAmbiguityId: ambiguityId,
      isWaitingForAnswer: true,
    }));
  },

  addInfoMessage: (content) => {
    const message: ConversationMessage = {
      id: generateMessageId(),
      type: 'info',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  markComplete: () => {
    const completeMessage: ConversationMessage = {
      id: generateMessageId(),
      type: 'system',
      content: "Great! I now have enough information to complete the discovery. You can review the results below.",
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, completeMessage],
      isComplete: true,
      isWaitingForAnswer: false,
      currentAmbiguityId: null,
    }));
  },

  getAnswer: (ambiguityId) => {
    return get().answers.get(ambiguityId);
  },

  getAllAnswers: () => {
    return Array.from(get().answers.values());
  },

  canRevise: (ambiguityId) => {
    // Can revise if we have an answer and conversation is not complete
    const { answers, isComplete } = get();
    return answers.has(ambiguityId) && !isComplete;
  },

  reset: () => {
    set({
      messages: [],
      answers: new Map(),
      currentAmbiguityId: null,
      isWaitingForAnswer: false,
      isComplete: false,
    });
  },
}));

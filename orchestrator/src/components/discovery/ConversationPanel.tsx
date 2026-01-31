"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, RotateCcw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useConversationStore,
  type ConversationMessage,
} from "@/lib/stores/conversation-store";
import { useDiscoveryStore } from "@/lib/stores/discovery-store";
import { QuestionCard } from "./QuestionCard";
import type {
  AmbiguityOption,
  DiscoveryAmbiguity,
} from "@/lib/discovery/types";
import {
  detectAmbiguities,
  getNextAmbiguity,
} from "@/lib/discovery/ambiguity-detector";

interface ConversationPanelProps {
  onComplete?: () => void;
  className?: string;
}

export function ConversationPanel({
  onComplete,
  className,
}: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Conversation store
  const {
    messages,
    isWaitingForAnswer,
    isComplete,
    currentAmbiguityId,
    startConversation,
    askQuestion,
    answerQuestion,
    reviseAnswer,
    markComplete,
    canRevise,
    getAnswer,
  } = useConversationStore();

  // Discovery store
  const {
    result,
    ambiguities,
    setAmbiguities,
    resolveAmbiguity,
    applyAmbiguityResolutions,
  } = useDiscoveryStore();

  // Initialize conversation when result is available
  useEffect(() => {
    if (result && messages.length === 0) {
      // Detect ambiguities
      const detected = detectAmbiguities(result);
      setAmbiguities(detected);

      if (detected.length > 0) {
        // Start conversation and ask first question
        startConversation();
        const first = getNextAmbiguity(detected);
        if (first) {
          askQuestion(first);
        }
      } else {
        // No ambiguities - mark complete immediately
        startConversation();
        markComplete();
        onComplete?.();
      }
    }
  }, [
    result,
    messages.length,
    setAmbiguities,
    startConversation,
    askQuestion,
    markComplete,
    onComplete,
  ]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    const scrollToBottom = () => {
      if (scrollRef.current) {
        const scrollElement = scrollRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (scrollElement) {
          // Smooth scroll to bottom
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    };

    // Delay slightly to allow message to render
    const timeoutId = setTimeout(scrollToBottom, 150);
    return () => clearTimeout(timeoutId);
  }, [messages, messages.length]);

  // Handle answer selection
  const handleSelectOption = (option: AmbiguityOption) => {
    if (!currentAmbiguityId) return;

    // Record answer in conversation store
    answerQuestion(currentAmbiguityId, option);

    // Resolve ambiguity in discovery store
    resolveAmbiguity(currentAmbiguityId, option.id);

    // Build updated ambiguities array with current one resolved
    const updatedAmbiguities = ambiguities.map((a) =>
      a.id === currentAmbiguityId
        ? { ...a, resolved: true, selectedOptionId: option.id }
        : a,
    );

    // Check for next ambiguity
    const next = getNextAmbiguity(updatedAmbiguities);

    if (next) {
      // Ask next question after a short delay for the answer to render
      setTimeout(() => {
        askQuestion(next);
        // Scroll to bottom after new question is added
        setTimeout(() => {
          if (scrollRef.current) {
            const scrollElement = scrollRef.current.querySelector(
              "[data-radix-scroll-area-viewport]",
            );
            if (scrollElement) {
              scrollElement.scrollTop = scrollElement.scrollHeight;
            }
          }
        }, 100);
      }, 500);
    } else {
      // All questions answered - apply resolutions and complete
      applyAmbiguityResolutions();
      markComplete();
      onComplete?.();
    }
  };

  // Handle revision
  const handleRevise = (ambiguityId: string) => {
    reviseAnswer(ambiguityId);
  };

  // Get the ambiguity for a question message
  const getAmbiguityForMessage = (
    message: ConversationMessage,
  ): DiscoveryAmbiguity | null => {
    if (!message.ambiguityId) return null;
    return ambiguities.find((a) => a.id === message.ambiguityId) || null;
  };

  // Don't render if no ambiguities and conversation not started
  if (ambiguities.length === 0 && messages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-white/10 bg-white/5 overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-medium">Repository Analysis</h3>
          <p className="text-[10px] text-muted-foreground">
            {isComplete
              ? "Analysis complete"
              : isWaitingForAnswer
                ? "Please answer the question below"
                : "Analyzing..."}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="relative flex-1 min-h-[200px] max-h-[500px]"
        ref={scrollRef}
      >
        <div className="p-4 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                {/* System/Info/Question messages - aligned left with bot avatar */}
                {(message.type === "system" ||
                  message.type === "question" ||
                  message.type === "info") && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-teal-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {(message.type === "system" ||
                        message.type === "info") && (
                        <div className="p-3 rounded-lg bg-white/5 inline-block max-w-[300px]">
                          <p className="text-sm text-muted-foreground">
                            {message.content}
                          </p>
                        </div>
                      )}
                      {message.type === "question" && message.options && (
                        <div className="p-3 rounded-lg bg-white/5 max-w-[350px]">
                          <QuestionCard
                            question={message.content}
                            options={message.options}
                            onSelectOption={handleSelectOption}
                            selectedOptionId={
                              message.ambiguityId
                                ? getAnswer(message.ambiguityId)
                                    ?.selectedOptionId
                                : undefined
                            }
                            disabled={
                              message.ambiguityId !== currentAmbiguityId ||
                              !isWaitingForAnswer
                            }
                          />
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Answer messages - aligned right with user avatar */}
                {message.type === "answer" && (
                  <div className="flex justify-end gap-3">
                    <div className="flex flex-col items-end gap-1 min-w-0">
                      <div className="p-3 rounded-lg bg-purple-500/10 max-w-[250px]">
                        <p className="text-sm">{message.content}</p>
                      </div>
                      {message.canRevise &&
                        message.ambiguityId &&
                        canRevise(message.ambiguityId) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevise(message.ambiguityId!)}
                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Revise
                          </Button>
                        )}
                      <p className="text-[10px] text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer showing progress */}
      {ambiguities.length > 0 && (
        <div className="px-4 py-2 border-t border-white/10 text-center">
          <p className="text-[10px] text-muted-foreground">
            {isComplete
              ? `All ${ambiguities.length} question${ambiguities.length === 1 ? "" : "s"} answered`
              : `Question ${ambiguities.filter((a) => a.resolved).length + 1} of ${ambiguities.length}`}
          </p>
        </div>
      )}
    </div>
  );
}

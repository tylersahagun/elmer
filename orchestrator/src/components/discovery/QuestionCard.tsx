"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, HelpCircle } from "lucide-react";
import type { AmbiguityOption } from "@/lib/discovery/types";

interface QuestionCardProps {
  question: string;
  options: AmbiguityOption[];
  onSelectOption: (option: AmbiguityOption) => void;
  selectedOptionId?: string;
  disabled?: boolean;
  showRecommended?: boolean;
}

export function QuestionCard({
  question,
  options,
  onSelectOption,
  selectedOptionId,
  disabled = false,
  showRecommended = true,
}: QuestionCardProps) {
  return (
    <div className="space-y-3">
      {/* Question text */}
      <div className="flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm leading-relaxed">{question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 pl-6">
        {options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isRecommended = showRecommended && option.recommended;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => !disabled && onSelectOption(option)}
              disabled={disabled}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all",
                "focus:outline-none focus:ring-2 focus:ring-purple-500/50",
                isSelected
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/5",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && !isSelected && "cursor-pointer"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium text-sm",
                      isSelected && "text-purple-300"
                    )}>
                      {option.label}
                    </span>
                    {isRecommended && !isSelected && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Recommended
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <Check className="h-4 w-4 text-purple-400" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

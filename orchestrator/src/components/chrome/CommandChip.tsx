"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface CommandChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** The command text (will be parsed for token coloring) */
  children: ReactNode;
  /** Whether the chip is currently active/selected */
  active?: boolean;
  /** Optional icon to display before the command */
  icon?: ReactNode;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Display variant */
  variant?: "default" | "outline" | "ghost";
}

export const CommandChip = forwardRef<HTMLButtonElement, CommandChipProps>(
  function CommandChip(
    {
      children,
      active = false,
      icon,
      size = "default",
      variant = "default",
      className,
      disabled,
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          "inline-flex items-center font-mono rounded-full border transition-colors duration-150",
          // Size variants
          size === "sm" && "h-7 px-2.5 text-xs gap-1.5",
          size === "default" && "h-[34px] px-3 text-xs gap-2",
          size === "lg" && "h-10 px-4 text-sm gap-2",
          // Variant styles
          variant === "default" && [
            "bg-white border-[#B8C0CC]",
            "dark:bg-[#0F1620] dark:border-white/[0.14]",
            "hover:bg-[#F5F7FA] dark:hover:bg-[#1A2332]",
          ],
          variant === "outline" && [
            "bg-transparent border-[#B8C0CC]",
            "dark:border-white/[0.14]",
            "hover:bg-[#F5F7FA] dark:hover:bg-[#1A2332]",
          ],
          variant === "ghost" && [
            "bg-transparent border-transparent",
            "hover:bg-[#F5F7FA] dark:hover:bg-[#1A2332]",
            "hover:border-[#B8C0CC] dark:hover:border-white/[0.14]",
          ],
          // Active state
          active && [
            "bg-[#F0F2F5] border-[#9CA3AF]",
            "dark:bg-[#1A2332] dark:border-white/20",
          ],
          // Disabled state
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

// Tokenized command text component for proper coloring
interface CommandTextProps {
  /** Prompt symbol (defaults to $) */
  prompt?: string;
  /** The main command */
  command: string;
  /** Arguments/flags */
  args?: string;
  /** Whether to show the prompt */
  showPrompt?: boolean;
}

export function CommandText({
  prompt = "$",
  command,
  args,
  showPrompt = true,
}: CommandTextProps) {
  return (
    <span className="inline-flex items-center gap-1">
      {showPrompt && (
        <span className="text-emerald-500 dark:text-emerald-400">{prompt}</span>
      )}
      <span className="text-foreground font-medium">{command}</span>
      {args && (
        <span className="text-muted-foreground">{args}</span>
      )}
    </span>
  );
}

// Pre-styled caret/arrow component for section headers
export function CommandCaret({ className }: { className?: string }) {
  return (
    <span className={cn("text-orange-500 dark:text-orange-400 font-bold", className)}>
      {">"}
    </span>
  );
}

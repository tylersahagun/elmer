"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type BlurLevel = "sm" | "md" | "lg" | "xl";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  children: React.ReactNode;
  className?: string;
  blur?: BlurLevel;
  interactive?: boolean;
  noPadding?: boolean;
}

const blurMap: Record<BlurLevel, string> = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      children,
      className,
      blur = "lg",
      interactive = false,
      noPadding = false,
      ...props
    },
    ref
  ) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        whileHover={
          interactive
            ? {
                scale: 1.01,
                y: -2,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }
            : undefined
        }
        whileTap={interactive ? { scale: 0.99 } : undefined}
        className={cn(
          "rounded-2xl border border-white/20 dark:border-white/10",
          "bg-white/12 dark:bg-black/25",
          blurMap[blur],
          "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
          "transition-colors duration-200",
          !noPadding && "p-4",
          interactive && "cursor-pointer hover:bg-white/18 dark:hover:bg-black/35",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={cn(
        "rounded-3xl border border-white/20 dark:border-white/10",
        "bg-white/12 dark:bg-black/25",
        "backdrop-blur-xl",
        "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        "p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface GlassOverlayProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassOverlay({ children, className, onClick }: GlassOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "fixed inset-0 z-50",
        "bg-black/20 dark:bg-black/40",
        "backdrop-blur-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

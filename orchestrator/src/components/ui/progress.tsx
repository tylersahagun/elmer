"use client";

import * as React from "react";
import { Progress as AnimatedProgress, type ProgressProps as AnimatedProgressProps } from "@/components/animate-ui/components/radix/progress";
import { cn } from "@/lib/utils";

interface ProgressProps extends Omit<AnimatedProgressProps, 'value'> {
  value?: number;
  indicatorClassName?: string;
  gradient?: boolean;
}

/**
 * Animated Progress component wrapper
 * Uses animate-ui's Progress component with additional styling options
 */
function Progress({ 
  value = 0, 
  className, 
  indicatorClassName,
  gradient = false,
  ...props 
}: ProgressProps) {
  return (
    <AnimatedProgress
      value={value}
      className={cn(
        "bg-slate-200/60 dark:bg-slate-700/60",
        className
      )}
      {...props}
    />
  );
}

export { Progress, type ProgressProps };

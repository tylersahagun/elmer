"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Waves, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BackgroundType } from "@/components/animate-ui/backgrounds/BackgroundProvider";

interface BackgroundTogglerProps {
  currentBackground: BackgroundType;
  onBackgroundChange: (bg: BackgroundType) => void;
  className?: string;
}

const backgroundOptions: { value: BackgroundType; label: string; icon: typeof Sparkles }[] = [
  { value: "stars", label: "Stars", icon: Sparkles },
  { value: "bubble", label: "Bubbles", icon: Waves },
  { value: "none", label: "None", icon: Palette },
];

function BackgroundToggler({
  currentBackground,
  onBackgroundChange,
  className,
}: BackgroundTogglerProps) {
  const currentOption = backgroundOptions.find((opt) => opt.value === currentBackground) || backgroundOptions[0];
  const CurrentIcon = currentOption.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative overflow-hidden",
            className
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBackground}
              initial={{ y: 20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <CurrentIcon className="w-5 h-5" />
            </motion.div>
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        {backgroundOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onBackgroundChange(option.value)}
              className={cn(
                "gap-2 cursor-pointer",
                currentBackground === option.value && "bg-purple-500/10 text-purple-400"
              )}
            >
              <Icon className="w-4 h-4" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { BackgroundToggler, type BackgroundTogglerProps };

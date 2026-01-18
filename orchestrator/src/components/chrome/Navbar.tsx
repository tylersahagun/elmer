"use client";

import { cn } from "@/lib/utils";
import { StatusPill } from "./StatusPill";
import { CommandChip, CommandText } from "./CommandChip";
import { Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { type ReactNode } from "react";

interface NavbarProps {
  /** Path to display (e.g., "~/elmer") */
  path?: string;
  /** Navigation command chips */
  commands?: Array<{
    command: string;
    args?: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }>;
  /** Custom right side content */
  rightContent?: ReactNode;
  /** Whether to show the theme toggle */
  showThemeToggle?: boolean;
  /** Whether to show the language selector */
  showLanguage?: boolean;
  /** Additional className */
  className?: string;
}

export function Navbar({
  path = "~/elmer",
  commands = [],
  rightContent,
  showThemeToggle = true,
  showLanguage = false,
  className,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-[#B8C0CC] dark:border-white/[0.14]",
        "bg-white/95 dark:bg-[#0B0F14]/95",
        "backdrop-blur-sm",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left section: Status + Path */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <StatusPill status="ready" />
            <span className="font-mono text-sm font-medium text-foreground">
              {path}
            </span>
          </div>

          {/* Center section: Command chips */}
          {commands.length > 0 && (
            <nav className="hidden md:flex items-center gap-2 overflow-x-auto">
              {commands.map((cmd, idx) => (
                <CommandChip
                  key={idx}
                  onClick={cmd.onClick}
                  active={cmd.active}
                  variant="outline"
                >
                  <CommandText
                    command={cmd.command}
                    args={cmd.args}
                  />
                </CommandChip>
              ))}
            </nav>
          )}

          {/* Right section: Theme toggle, Language, Custom */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightContent}
            
            {showThemeToggle && (
              <CommandChip
                variant="ghost"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-[34px] h-[34px] p-0 justify-center"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </CommandChip>
            )}

            {showLanguage && (
              <CommandChip variant="ghost" className="gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>EN</span>
              </CommandChip>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface SimpleNavbarProps {
  /** Path to display (e.g., "~/elmer", "~/projects/my-project") */
  path?: string;
  /** Custom right side content (back buttons, actions, etc.) */
  rightContent?: ReactNode;
  /** Whether to show the theme toggle (default: true) */
  showThemeToggle?: boolean;
  /** Additional className */
  className?: string;
}

// Simplified navbar for inner pages
export function SimpleNavbar({
  path = "~/elmer",
  rightContent,
  showThemeToggle = true,
  className,
}: SimpleNavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-[#B8C0CC] dark:border-white/[0.14]",
        "bg-white/95 dark:bg-[#0B0F14]/95",
        "backdrop-blur-sm",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left: Status + path */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
            <StatusPill status="ready" />
            <span className="font-mono text-sm font-medium text-foreground truncate">
              {path}
            </span>
          </div>

          {/* Right: Custom content + Theme toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightContent}
            
            {showThemeToggle && (
              <CommandChip
                variant="ghost"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="w-[34px] h-[34px] p-0 justify-center"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </CommandChip>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

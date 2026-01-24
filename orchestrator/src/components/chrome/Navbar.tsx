"use client";

import { cn } from "@/lib/utils";
import { useKanbanStore } from "@/lib/store";
import { StatusPill } from "./StatusPill";
import { CommandChip, CommandText } from "./CommandChip";
import { WaveV4D, ElmerWordmark } from "../brand/ElmerLogo";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sun, Moon, Globe, Menu, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
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
  const router = useRouter();

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
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left section: Logo (back navigation) + Status + Path */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <WaveV4D size={28} palette="forest" />
              <ElmerWordmark
                width={64}
                height={20}
                palette="forest"
                className="hidden sm:block"
              />
            </button>
            <div className="h-4 w-px bg-[#B8C0CC] dark:bg-white/[0.14]" />
            <StatusPill status="ready" />
            <span className="font-mono text-sm font-medium text-foreground hidden md:block">
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
                  <CommandText command={cmd.command} args={cmd.args} />
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
  /** Additional className */
  className?: string;
}

// Simplified navbar for inner pages with hamburger menu
export function SimpleNavbar({
  path = "~/elmer",
  rightContent,
  className,
}: SimpleNavbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  
  // Get stored workspace from store (persists across page navigation)
  const storedWorkspace = useKanbanStore((s) => s.workspace);

  // Check active state for nav items
  const isHomeActive = pathname === "/";
  const isKnowledgebaseActive = pathname?.includes("/knowledgebase");
  const isPersonasActive = pathname?.includes("/personas");
  const isSignalsActive = pathname?.includes("/signals");

  // Extract workspace ID from pathname, or fall back to stored workspace
  const workspaceIdFromPath = pathname?.match(/\/workspace\/([^\/]+)/)?.[1];
  const workspaceId = workspaceIdFromPath || storedWorkspace?.id;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "border-b border-[#B8C0CC] dark:border-white/[0.14]",
        "bg-white/95 dark:bg-[#0B0F14]/95",
        "backdrop-blur-sm",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left: Logo (back navigation) + Status + path */}
          <div className="flex items-center gap-3 flex-shrink-0 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <WaveV4D size={28} palette="forest" />
              <ElmerWordmark
                width={64}
                height={20}
                palette="forest"
                className="hidden sm:block"
              />
            </button>
            <div className="h-4 w-px bg-[#B8C0CC] dark:bg-white/[0.14]" />
            <StatusPill status="ready" />
            <span className="font-mono text-sm font-medium text-foreground truncate hidden md:block">
              {path}
            </span>
          </div>

          {/* Right: Custom content + Hamburger Menu */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {rightContent}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl border-border dark:border-[rgba(255,255,255,0.14)]"
              >
                {/* Navigation - Terminal style */}
                <Link href="/" className="w-full">
                  <DropdownMenuItem
                    className={cn(
                      "gap-2 font-mono text-sm",
                      isHomeActive && "bg-accent",
                    )}
                  >
                    <span className="text-emerald-500">$</span>
                    <span>cd</span>
                    <span className="text-muted-foreground">~</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/knowledgebase" className="w-full">
                  <DropdownMenuItem
                    className={cn(
                      "gap-2 font-mono text-sm",
                      isKnowledgebaseActive && "bg-accent",
                    )}
                  >
                    <span className="text-emerald-500">$</span>
                    <span>cd</span>
                    <span className="text-muted-foreground">/files</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/personas" className="w-full">
                  <DropdownMenuItem
                    className={cn(
                      "gap-2 font-mono text-sm",
                      isPersonasActive && "bg-accent",
                    )}
                  >
                    <span className="text-emerald-500">$</span>
                    <span>ls</span>
                    <span className="text-muted-foreground">personas/</span>
                  </DropdownMenuItem>
                </Link>

                {workspaceId && (
                  <Link
                    href={`/workspace/${workspaceId}/signals`}
                    className="w-full"
                  >
                    <DropdownMenuItem
                      className={cn(
                        "gap-2 font-mono text-sm",
                        isSignalsActive && "bg-accent",
                      )}
                    >
                      <span className="text-emerald-500">$</span>
                      <span>cat</span>
                      <span className="text-muted-foreground">signals/</span>
                    </DropdownMenuItem>
                  </Link>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="gap-2"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Auth section */}
                {status === "authenticated" && session?.user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">
                        {session.user.name || session.user.email}
                      </p>
                      {session.user.name && session.user.email && (
                        <p className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : status === "unauthenticated" ? (
                  <Link href="/login" className="w-full">
                    <DropdownMenuItem className="gap-2">
                      <User className="w-4 h-4" />
                      Sign in
                    </DropdownMenuItem>
                  </Link>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

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
import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { type ReactNode } from "react";
import { PresenceAvatarStack } from "@/components/presence/PresenceAvatarStack";
import { usePresenceHeartbeat, useWorkspacePresence } from "@/hooks/usePresence";

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
          <div className="flex items-center gap-3 shrink-0">
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
          <div className="flex items-center gap-2 shrink-0">
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
  /** Optional dropdown menu items (rendered before navigation) */
  menuItems?: ReactNode;
  /** Control dropdown menu open state */
  menuOpen?: boolean;
  /** Handle dropdown menu open state changes */
  onMenuOpenChange?: (open: boolean) => void;
}

// Simplified navbar for inner pages with hamburger menu
export function SimpleNavbar({
  path = "~/elmer",
  rightContent,
  className,
  menuItems,
  menuOpen,
  onMenuOpenChange,
}: SimpleNavbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Get stored workspace from store (persists across page navigation)
  const storedWorkspace = useKanbanStore((s) => s.workspace);

  // Check active state for nav items
  const isKnowledgebaseActive = pathname?.includes("/knowledgebase");
  const isIntelligenceActive = pathname?.includes("/intelligence");
  const isPersonasActive = pathname?.includes("/personas");
  const isSignalsActive = pathname?.includes("/signals");
  const isStatusActive = pathname?.includes("/status");
  const isControlCenterActive = pathname?.includes("/control-center");
  const isSwarmActive = pathname?.includes("/swarm");
  const isAgentsActive = pathname?.includes("/agents");
  const isTasksActive = pathname?.includes("/tasks");
  const isInboxActive = pathname?.includes("/inbox");
  const isSettingsActive = pathname?.includes("/settings");
  const isDashboardActive =
    pathname === "/" ||
    (pathname?.startsWith("/workspace/") &&
      !isKnowledgebaseActive &&
      !isIntelligenceActive &&
      !isPersonasActive &&
      !isSignalsActive &&
      !isStatusActive &&
      !isControlCenterActive &&
      !isSwarmActive &&
      !isAgentsActive &&
      !isTasksActive &&
      !isInboxActive &&
      !isSettingsActive);

  // Extract workspace ID from pathname, or fall back to stored workspace
  const workspaceIdFromPath = pathname?.match(/\/workspace\/([^\/]+)/)?.[1];
  const workspaceId = workspaceIdFromPath || storedWorkspace?.id;
  const dashboardHref = workspaceId ? `/workspace/${workspaceId}` : "/";
  const knowledgeHref = workspaceId
    ? `/workspace/${workspaceId}/knowledgebase`
    : "/knowledgebase";
  const personasHref = workspaceId
    ? `/workspace/${workspaceId}/personas`
    : "/personas";
  const intelligenceHref = workspaceId
    ? `/workspace/${workspaceId}/intelligence`
    : "/intelligence";
  const navItems = [
    { label: "Projects", href: dashboardHref },
    { label: "Intelligence", href: intelligenceHref },
    { label: "Knowledge", href: knowledgeHref },
    { label: "Personas", href: personasHref },
    workspaceId && {
      label: "Signals",
      href: `/workspace/${workspaceId}/signals`,
    },
    workspaceId && {
      label: "Status",
      href: `/workspace/${workspaceId}/status`,
    },
    workspaceId && {
      label: "Control",
      href: `/workspace/${workspaceId}/control-center`,
    },
    workspaceId && {
      label: "Swarm",
      href: `/workspace/${workspaceId}/swarm`,
    },
    workspaceId && {
      label: "Agent Catalog",
      href: `/workspace/${workspaceId}/agents`,
    },
    workspaceId && {
      label: "Inbox",
      href: `/workspace/${workspaceId}/inbox`,
    },
    workspaceId && {
      label: "Tasks",
      href: `/workspace/${workspaceId}/tasks`,
    },
    workspaceId && {
      label: "Settings",
      href: `/workspace/${workspaceId}/settings`,
    },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  usePresenceHeartbeat(workspaceId, pathname ?? undefined);
  const presence = useWorkspacePresence(workspaceId);

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
          <div className="flex items-center gap-3 shrink-0 min-w-0">
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
          <div className="flex items-center gap-1.5 shrink-0">
            {presence && presence.length > 0 && (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-border px-2 py-1">
                <PresenceAvatarStack entries={presence} max={4} size="sm" />
              </div>
            )}
            {rightContent}

            <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  data-testid="workspace-menu-trigger"
                  aria-label="Open workspace menu"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl border-border dark:border-[rgba(255,255,255,0.14)]"
              >
                {menuItems}
                {menuItems && <DropdownMenuSeparator />}
                {/* Navigation - Terminal style */}
                <Link href={dashboardHref} className="w-full">
                  <DropdownMenuItem
                    className={cn(
                      "gap-2 font-mono text-sm",
                      isDashboardActive && "bg-accent",
                    )}
                  >
                    <span className="text-emerald-500">$</span>
                    <span>ls</span>
                    <span className="text-muted-foreground">projects/</span>
                  </DropdownMenuItem>
                </Link>

                <Link href={intelligenceHref} className="w-full">
                  <DropdownMenuItem
                    className={cn(
                      "gap-2 font-mono text-sm",
                      isIntelligenceActive && "bg-accent",
                    )}
                  >
                    <span className="text-emerald-500">$</span>
                    <span>graph</span>
                    <span className="text-muted-foreground">intelligence/</span>
                  </DropdownMenuItem>
                </Link>

                <Link href={knowledgeHref} className="w-full">
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

                <Link href={personasHref} className="w-full">
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
                  <>
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

                    <Link
                      href={`/workspace/${workspaceId}/status`}
                      className="w-full"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 font-mono text-sm",
                          isStatusActive && "bg-accent",
                        )}
                      >
                        <span className="text-emerald-500">$</span>
                        <span>cat</span>
                        <span className="text-muted-foreground">status/</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={`/workspace/${workspaceId}/control-center`}
                      className="w-full"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 font-mono text-sm",
                          isControlCenterActive && "bg-accent",
                        )}
                      >
                        <span className="text-emerald-500">$</span>
                        <span>open</span>
                        <span className="text-muted-foreground">control-center</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={`/workspace/${workspaceId}/swarm`}
                      className="w-full"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 font-mono text-sm",
                          isSwarmActive && "bg-accent",
                        )}
                      >
                        <span className="text-emerald-500">$</span>
                        <span>run</span>
                        <span className="text-muted-foreground">swarm</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={`/workspace/${workspaceId}/agents`}
                      className="w-full"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 font-mono text-sm",
                          isAgentsActive && "bg-accent",
                        )}
                      >
                        <span className="text-emerald-500">$</span>
                        <span>open</span>
                        <span className="text-muted-foreground">agent-catalog</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={`/workspace/${workspaceId}/inbox`}
                      className="w-full"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 font-mono text-sm",
                          isInboxActive && "bg-accent",
                        )}
                      >
                        <span className="text-emerald-500">$</span>
                        <span>cat</span>
                        <span className="text-muted-foreground">inbox/</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={`/workspace/${workspaceId}/tasks`}
                      className="w-full"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 font-mono text-sm",
                          isTasksActive && "bg-accent",
                        )}
                      >
                        <span className="text-emerald-500">$</span>
                        <span>ls</span>
                        <span className="text-muted-foreground">tasks/</span>
                      </DropdownMenuItem>
                    </Link>

                    <Link
                      href={`/workspace/${workspaceId}/settings`}
                      className="w-full"
                    >
                      <DropdownMenuItem
                        className={cn(
                          "gap-2 font-mono text-sm",
                          isSettingsActive && "bg-accent",
                        )}
                      >
                        <span className="text-emerald-500">$</span>
                        <span>vim</span>
                        <span className="text-muted-foreground">settings</span>
                      </DropdownMenuItem>
                    </Link>
                  </>
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
                {isLoaded && user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">
                        {user.fullName || user.primaryEmailAddress?.emailAddress}
                      </p>
                      {user.fullName && user.primaryEmailAddress?.emailAddress && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.primaryEmailAddress.emailAddress}
                        </p>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ redirectUrl: "/login" })}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : isLoaded ? (
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
        <div className="pb-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive =
                (item.href === dashboardHref && isDashboardActive) ||
                (item.href.includes("intelligence") && isIntelligenceActive) ||
                (item.href.includes("knowledgebase") &&
                  isKnowledgebaseActive) ||
                (item.href.includes("personas") && isPersonasActive) ||
                (item.href.includes("signals") && isSignalsActive) ||
                (item.href.includes("/status") && isStatusActive) ||
                (item.href.includes("/control-center") &&
                  isControlCenterActive) ||
                (item.href.includes("/swarm") && isSwarmActive) ||
                (item.href.includes("agents") && isAgentsActive) ||
                (item.href.includes("/tasks") && isTasksActive) ||
                (item.href.includes("/inbox") && isInboxActive) ||
                (item.href.includes("settings") && isSettingsActive);
              return (
                <Link key={item.href} href={item.href} className="shrink-0">
                  <CommandChip
                    active={isActive}
                    variant="outline"
                    className="h-7 px-3 text-[11px]"
                  >
                    <span className="font-mono">{item.label}</span>
                  </CommandChip>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}

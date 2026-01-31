"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Window } from "@/components/chrome/Window";
import { Loader2, AlertCircle } from "lucide-react";
import { SimpleNavbar } from "@/components/chrome/Navbar";

/**
 * Legacy knowledgebase page - redirects to workspace-scoped version
 *
 * This page fetches the user's workspaces and redirects to the first
 * workspace's knowledge base. For proper workspace context, use
 * /workspace/[id]/knowledgebase instead.
 */
export default function KnowledgebasePage() {
  const router = useRouter();

  // Fetch workspaces to find default
  const { data: workspaces, isLoading: workspacesLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      return res.json();
    },
  });

  const defaultWorkspaceId = useMemo(() => {
    if (Array.isArray(workspaces) && workspaces.length > 0) {
      return workspaces[0].id;
    }
    return "";
  }, [workspaces]);

  // Redirect to workspace-scoped version once we have a workspace
  useEffect(() => {
    if (defaultWorkspaceId) {
      router.replace(`/workspace/${defaultWorkspaceId}/knowledgebase`);
    }
  }, [defaultWorkspaceId, router]);

  if (workspacesLoading) {
    return (
      <div className="min-h-screen">
        <SimpleNavbar path="~/knowledgebase" />
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground font-mono text-sm">
              Loading knowledge base...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen">
        <SimpleNavbar path="~/knowledgebase" />
        <div className="flex items-center justify-center p-8 min-h-[calc(100vh-56px)]">
          <Window title="error" className="max-w-md">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                No Workspaces Found
              </h2>
              <p className="text-muted-foreground mb-4 font-mono text-sm">
                Create a workspace first to access the knowledge base.
              </p>
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
            </div>
          </Window>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen">
      <SimpleNavbar path="~/knowledgebase" />
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground font-mono text-sm">
            Redirecting to workspace...
          </p>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "convex/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface Project {
  id: string;
  name: string;
}

interface ProjectLinkComboboxProps {
  workspaceId: string;
  excludeProjectIds?: string[];
  onSelect: (projectId: string) => void;
  isLoading?: boolean;
}

export function ProjectLinkCombobox({
  workspaceId,
  excludeProjectIds = [],
  onSelect,
  isLoading = false,
}: ProjectLinkComboboxProps) {
  // Fetch workspace projects
  const projectsData = useQuery(api.projects.list, {
    workspaceId: workspaceId as Id<"workspaces">,
  });
  const projectsLoading = projectsData === undefined;

  const availableProjects = (projectsData || [])
    .map((p: { _id: string; name: string }) => ({ id: p._id, name: p.name }))
    .filter((p: { id: string; name: string }) => !excludeProjectIds.includes(p.id));

  if (projectsLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading projects...
      </div>
    );
  }

  if (availableProjects.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        All projects linked
      </span>
    );
  }

  return (
    <Select
      onValueChange={onSelect}
      disabled={isLoading}
    >
      <SelectTrigger className="h-7 w-[180px] text-xs">
        <SelectValue placeholder="Link to project..." />
      </SelectTrigger>
      <SelectContent>
        {availableProjects.map((project: { id: string; name: string }) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

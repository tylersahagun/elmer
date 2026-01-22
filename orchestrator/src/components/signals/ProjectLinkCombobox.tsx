"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error("Failed to load workspace");
      const workspace = await res.json();
      return workspace.projects as Project[];
    },
  });

  const availableProjects = (projectsData || []).filter(
    (p) => !excludeProjectIds.includes(p.id)
  );

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
        {availableProjects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

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

interface Persona {
  id?: string;
  archetype_id: string;
  name: string;
}

interface PersonaLinkComboboxProps {
  workspaceId: string;
  excludePersonaIds?: string[];
  onSelect: (personaId: string) => void;
  isLoading?: boolean;
}

export function PersonaLinkCombobox({
  workspaceId,
  excludePersonaIds = [],
  onSelect,
  isLoading = false,
}: PersonaLinkComboboxProps) {
  // Fetch personas from API
  const { data: personasData, isLoading: personasLoading } = useQuery<{
    personas: Persona[];
  }>({
    queryKey: ["personas", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/personas?workspaceId=${workspaceId}`);
      if (!res.ok) return { personas: [] };
      const data = await res.json();
      // Ensure we always return the expected shape
      return { personas: Array.isArray(data.personas) ? data.personas : [] };
    },
    enabled: !!workspaceId,
  });

  const availablePersonas = (personasData?.personas || []).filter(
    (p) => !excludePersonaIds.includes(p.archetype_id)
  );

  if (personasLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading personas...
      </div>
    );
  }

  if (availablePersonas.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        All personas linked
      </span>
    );
  }

  return (
    <Select
      onValueChange={onSelect}
      disabled={isLoading}
    >
      <SelectTrigger className="h-7 w-[180px] text-xs">
        <SelectValue placeholder="Link to persona..." />
      </SelectTrigger>
      <SelectContent>
        {availablePersonas.map((persona) => (
          <SelectItem
            key={persona.id ?? persona.archetype_id}
            value={persona.id ?? persona.archetype_id}
          >
            {persona.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

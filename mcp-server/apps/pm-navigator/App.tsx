import React, { useEffect, useState } from "react";
import { useApp } from "@modelcontextprotocol/ext-apps/react";

interface Command {
  _id: string;
  name: string;
  type: string;
  description?: string | null;
  triggers?: string[] | null;
  enabled: boolean;
  metadata?: { filePath?: string } | null;
}

const PHASE_MAP: Record<string, string[]> = {
  "📥 Signals": ["ingest","slack","gmail","signals","synthesize","triage"],
  "🔬 Analysis": ["research","context","hypothesis","synthesize"],
  "📋 Definition": ["pm","prd","metrics","design","competitive","visual"],
  "🔨 Build": ["proto","prototype","figma","iterate","component","context-proto"],
  "✅ Validation": ["validate","jury","posthog","measure"],
  "🚀 Launch": ["feature-guide","pmm","notion","gtm"],
  "📊 Reporting": ["morning","eod","eow","status","team","digest"],
};

function classify(name: string): string {
  for (const [phase, keywords] of Object.entries(PHASE_MAP)) {
    if (keywords.some(k => name.includes(k))) return phase;
  }
  return "⚙️ Other";
}

export function App() {
  const { app } = useApp();
  const [commands, setCommands] = useState<Command[]>([]);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState<string | null>(null);

  useEffect(() => {
    if (!app) return;
    app.ontoolresult = (result: any) => {
      const sc = result?.structuredContent;
      if (Array.isArray(sc) && sc[0]?.name && sc[0]?.type === "command") {
        setCommands(sc as Command[]);
      }
    };
  }, [app]);

  const grouped: Record<string, Command[]> = {};
  for (const cmd of commands) {
    const phase = classify(cmd.name);
    grouped[phase] = grouped[phase] ?? [];
    grouped[phase].push(cmd);
  }

  const phases = Object.keys(grouped).sort();
  const filtered = (selectedPhase ? (grouped[selectedPhase] ?? []) : commands)
    .filter(c => !search || c.name.includes(search.toLowerCase()) || (c.description ?? "").toLowerCase().includes(search.toLowerCase()));

  const runCommand = async (cmd: Command) => {
    setRunning(cmd._id);
    try { await (app as any)?.callServerTool("elmer_run_agent", { agent_definition_id: cmd._id }); }
    finally { setRunning(null); }
  };

  if (commands.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", background: "#0b0f14", color: "#94a3b8", fontFamily: "sans-serif", fontSize: 12 }}>
        Call <code>elmer_list_commands</code> to browse PM commands
      </div>
    );
  }

  return (
    <div style={{ background: "#0b0f14", color: "#f1f5f9", fontFamily: "sans-serif", minWidth: 300, maxHeight: 480, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <h1 style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>PM Navigator · {commands.length} commands</h1>
        <input
          placeholder="Search commands…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", background: "#111827", border: "1px solid rgba(255,255,255,0.08)", color: "#f1f5f9", borderRadius: 6, padding: "5px 8px", fontSize: 11 }}
        />
      </div>

      {/* Phase filter chips */}
      <div style={{ padding: "6px 12px", display: "flex", gap: 4, overflowX: "auto", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <button
          onClick={() => setSelectedPhase(null)}
          style={{ background: !selectedPhase ? "#8b5cf6" : "transparent", color: !selectedPhase ? "white" : "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "3px 10px", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap" }}
        >
          All
        </button>
        {phases.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPhase(selectedPhase === p ? null : p)}
            style={{ background: selectedPhase === p ? "#8b5cf6" : "transparent", color: selectedPhase === p ? "white" : "#94a3b8", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999, padding: "3px 10px", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap" }}
          >
            {p} ({grouped[p]?.length ?? 0})
          </button>
        ))}
      </div>

      {/* Command list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 12px" }}>
        {filtered.slice(0, 20).map(cmd => (
          <div key={cmd._id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>/{cmd.name}</div>
              {cmd.description && <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cmd.description.slice(0, 60)}</div>}
            </div>
            <button
              onClick={() => runCommand(cmd)}
              disabled={!!running}
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 10, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {running === cmd._id ? "…" : "Run"}
            </button>
          </div>
        ))}
        {filtered.length > 20 && <div style={{ fontSize: 11, color: "#94a3b8", padding: "6px 0" }}>…and {filtered.length - 20} more (search to filter)</div>}
      </div>
    </div>
  );
}

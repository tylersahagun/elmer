import React, { useEffect, useState } from "react";
import { useApp } from "@modelcontextprotocol/ext-apps/react";

interface Signal {
  _id: string;
  verbatim: string;
  source: string;
  status: string;
  severity?: string | null;
}

interface SynthesizeData {
  signals: Signal[];
  unlinked: Signal[];
  total: number;
  unlinkedCount: number;
}

// Simple keyword cluster
function clusterSignals(signals: Signal[]) {
  const stopWords = new Set(["the","a","an","is","it","to","for","we","i","in","of","and","that","this","on","at","be","with","are","was","were","have","has","not","can","would","should","need","want","use","get"]);
  const wordMap: Record<string, Signal[]> = {};
  for (const s of signals) {
    const words = s.verbatim.toLowerCase().replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
    const seen = new Set<string>();
    for (const word of words) {
      if (seen.has(word)) continue;
      seen.add(word);
      wordMap[word] = wordMap[word] ?? [];
      wordMap[word].push(s);
    }
  }
  return Object.entries(wordMap)
    .filter(([, sigs]) => sigs.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)
    .map(([theme, sigs]) => ({ theme, signals: sigs }));
}

const SEV_COLOR: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#f59e0b", low: "#94a3b8" };

export function App() {
  const { app } = useApp();
  const [data, setData] = useState<SynthesizeData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [linking, setLinking] = useState<string | null>(null);

  useEffect(() => {
    if (!app) return;
    app.ontoolresult = (result: any) => {
      const sc = result?.structuredContent;
      if (sc?.signals && sc?.unlinked !== undefined) setData(sc as SynthesizeData);
    };
  }, [app]);

  if (!data) {
    return (
      <div style={{ padding: 20, textAlign: "center", background: "#0b0f14", color: "#94a3b8", fontFamily: "sans-serif", fontSize: 12 }}>
        Call <code>elmer_synthesize_signals</code> to load the signal map
      </div>
    );
  }

  const clusters = clusterSignals(data.unlinked);
  const selectedCluster = clusters.find(c => c.theme === selected);

  return (
    <div style={{ padding: 12, background: "#0b0f14", color: "#f1f5f9", fontFamily: "sans-serif", minWidth: 300 }}>
      {/* Header */}
      <h1 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Signal Map</h1>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
        {data.total} total · {data.unlinkedCount} unlinked · {clusters.length} clusters
      </div>

      {/* Cluster pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {clusters.map(c => (
          <button
            key={c.theme}
            onClick={() => setSelected(selected === c.theme ? null : c.theme)}
            style={{
              background: selected === c.theme ? "#8b5cf6" : "rgba(139,92,246,0.15)",
              border: `1px solid ${selected === c.theme ? "#8b5cf6" : "rgba(139,92,246,0.3)"}`,
              color: selected === c.theme ? "white" : "#c4b5fd",
              borderRadius: 9999,
              padding: "4px 12px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {c.theme} ({c.signals.length})
          </button>
        ))}
      </div>

      {/* Selected cluster detail */}
      {selectedCluster && (
        <div style={{ background: "#111827", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 10, padding: 10, marginBottom: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#c4b5fd" }}>
            "{selectedCluster.theme}" — {selectedCluster.signals.length} signals
          </div>
          {selectedCluster.signals.slice(0, 4).map(s => (
            <div key={s._id} style={{ fontSize: 11, color: "#94a3b8", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: SEV_COLOR[s.severity ?? ""] ?? "#94a3b8", marginRight: 4 }}>●</span>
              {s.verbatim.slice(0, 90)}{s.verbatim.length > 90 ? "…" : ""}
            </div>
          ))}
          <button
            onClick={async () => {
              setLinking(selectedCluster.theme);
              try { await (app as any)?.callServerTool("elmer_list_projects", {}); }
              finally { setLinking(null); }
            }}
            disabled={!!linking}
            style={{ marginTop: 8, background: "#8b5cf6", color: "white", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11 }}
          >
            {linking ? "Loading projects…" : "Link to Project →"}
          </button>
        </div>
      )}

      {/* Unlinked signal count */}
      {data.unlinkedCount === 0 ? (
        <div style={{ textAlign: "center", color: "#10b981", fontSize: 12, padding: 8 }}>✅ All signals are linked</div>
      ) : (
        <div style={{ fontSize: 11, color: "#94a3b8" }}>{data.unlinkedCount} signals need project links</div>
      )}
    </div>
  );
}

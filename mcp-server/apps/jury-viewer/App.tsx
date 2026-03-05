import React, { useEffect, useState } from "react";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import "../shared/styles.css";

interface Document {
  _id: string;
  type: string;
  title: string;
  content: string;
  version: number;
  reviewStatus: string;
}

interface ProjectData {
  project: { _id: string; name: string; stage: string };
  documents: Document[];
}

function parseVerdict(content: string): {
  verdict: string;
  approvalRate: number;
  concerns: string[];
} {
  const lower = content.toLowerCase();
  let verdict = "unknown";
  if (lower.includes("pass") || lower.includes("approved")) verdict = "pass";
  else if (lower.includes("fail") || lower.includes("rejected")) verdict = "fail";
  else if (lower.includes("conditional")) verdict = "conditional";

  const rateMatch = content.match(/(\d+)%/);
  const approvalRate = rateMatch ? parseInt(rateMatch[1]) : 0;

  const concerns: string[] = [];
  const concernMatch = content.match(/concern[s]?[:\s]+([^\n]+)/gi);
  if (concernMatch) {
    concerns.push(
      ...concernMatch
        .slice(0, 3)
        .map((c) => c.replace(/concern[s]?:\s*/i, "").slice(0, 80))
    );
  }

  return { verdict, approvalRate, concerns };
}

export function App() {
  const { app } = useApp();
  const [data, setData] = useState<ProjectData | null>(null);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    if (!app) return;
    app.ontoolresult = (result: any) => {
      const sc = result?.structuredContent;
      if (sc?.project) setData(sc as ProjectData);
    };
  }, [app]);

  if (!data) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 12 }}>
          Call <code>elmer_get_project</code> to load jury results
        </div>
      </div>
    );
  }

  const juryDoc = data.documents.find((d) => d.type === "jury_report");

  if (!juryDoc) {
    return (
      <div style={{ padding: 16, background: "#0b0f14", color: "#f1f5f9", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 16, marginBottom: 8 }}>{data.project.name}</h1>
        <div style={{ color: "#94a3b8", fontSize: 13 }}>
          No jury evaluation found. Run the validator agent first.
        </div>
      </div>
    );
  }

  const { verdict, approvalRate, concerns } = parseVerdict(juryDoc.content);
  const verdictColor =
    verdict === "pass" ? "#10b981" : verdict === "fail" ? "#ef4444" : "#f59e0b";

  const iterate = async () => {
    setAction("iterate");
    try {
      await (app as any)?.callServerTool("elmer_run_agent", {
        agent_definition_id: "iterator",
        project_id: data.project._id,
      });
    } finally {
      setAction(null);
    }
  };

  const advance = async () => {
    setAction("advance");
    try {
      await (app as any)?.callServerTool("elmer_advance_stage", {
        project_id: data.project._id,
      });
    } finally {
      setAction(null);
    }
  };

  return (
    <div
      style={{
        padding: 12,
        background: "#0b0f14",
        color: "#f1f5f9",
        fontFamily: "sans-serif",
        minWidth: 280,
      }}
    >
      <h1 style={{ fontSize: 15, marginBottom: 4 }}>{data.project.name} — Jury</h1>

      {/* Verdict */}
      <div
        style={{
          textAlign: "center",
          padding: "16px 12px",
          background: "#111827",
          border: `2px solid ${verdictColor}`,
          borderRadius: 12,
          marginBottom: 10,
        }}
      >
        <div style={{ fontSize: 28 }}>
          {verdict === "pass" ? "✅" : verdict === "fail" ? "❌" : "⚠️"}
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: verdictColor,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          {verdict}
        </div>
        {approvalRate > 0 && (
          <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
            {approvalRate}% approval
          </div>
        )}
      </div>

      {/* Concerns */}
      {concerns.length > 0 && (
        <div
          style={{
            background: "#111827",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#94a3b8",
              marginBottom: 6,
            }}
          >
            Top Concerns
          </div>
          {concerns.map((c, i) => (
            <div
              key={i}
              style={{
                fontSize: 12,
                color: "#f1f5f9",
                padding: "3px 0",
                paddingLeft: 12,
                borderLeft: "2px solid #374151",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={iterate}
          disabled={!!action}
          style={{
            flex: 1,
            background: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          {action === "iterate" ? "⏳ Running…" : "🔄 Iterate"}
        </button>
        {verdict === "pass" && (
          <button
            onClick={advance}
            disabled={!!action}
            style={{
              flex: 1,
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {action === "advance" ? "⏳…" : "→ Advance"}
          </button>
        )}
      </div>
    </div>
  );
}

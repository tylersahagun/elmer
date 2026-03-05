import React, { useEffect, useState } from "react";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import "../shared/styles.css";

interface Project {
  _id: string;
  name: string;
  stage: string;
  status: string;
  priority: string;
  metadata?: { tldr?: string };
}

interface Document {
  _id: string;
  type: string;
  title: string;
  version: number;
  reviewStatus: string;
}

interface ProjectData {
  project: Project;
  documents: Document[];
}

const STAGE_ORDER = ["inbox", "discovery", "define", "build", "validate", "launch"];
const DOC_TYPES = ["research", "prd", "design_brief", "engineering_spec", "prototype_notes", "jury_report"];

const STATUS_COLORS: Record<string, string> = {
  on_track: "var(--emerald)",
  at_risk: "var(--amber)",
  blocked: "var(--red)",
};

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

  const runAgent = async () => {
    if (!data) return;
    setAction("running");
    try {
      await (app as any)?.callServerTool("elmer_list_agents", {});
    } finally {
      setAction(null);
    }
  };

  const advanceStage = async () => {
    if (!data) return;
    setAction("advancing");
    try {
      await (app as any)?.callServerTool("elmer_advance_stage", { project_id: data.project._id });
    } finally {
      setAction(null);
    }
  };

  if (!data) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <div className="muted" style={{ fontSize: 12 }}>
          Call <code>elmer_get_project</code> to load a project dashboard
        </div>
      </div>
    );
  }

  const { project, documents } = data;
  const currentStageIdx = STAGE_ORDER.indexOf(project.stage);
  const docTypes = documents.map((d) => d.type);

  return (
    <div style={{ padding: 12, minWidth: 320 }}>
      {/* Header */}
      <div className="row" style={{ marginBottom: 10 }}>
        <div>
          <h1>{project.name}</h1>
          <div className="row" style={{ gap: 6, marginTop: 4 }}>
            <span className="badge" style={{ background: "rgba(139,92,246,0.2)", color: "var(--accent)" }}>
              {project.stage}
            </span>
            <span
              className="badge"
              style={{ background: "rgba(16,185,129,0.15)", color: STATUS_COLORS[project.status] ?? "var(--muted)" }}
            >
              {project.status?.replace("_", " ")}
            </span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--muted)" }}>
              {project.priority}
            </span>
          </div>
        </div>
      </div>

      {/* TL;DR */}
      {project.metadata?.tldr && (
        <div className="card" style={{ marginBottom: 8, borderLeft: "3px solid var(--accent)" }}>
          <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6 }}>
            {project.metadata.tldr}
          </p>
        </div>
      )}

      {/* Stage progress */}
      <div className="card" style={{ marginBottom: 8 }}>
        <div className="row" style={{ marginBottom: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "var(--muted)",
            }}
          >
            Stage
          </span>
        </div>
        <div className="row" style={{ gap: 4 }}>
          {STAGE_ORDER.map((s, i) => (
            <div
              key={s}
              title={s}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background:
                  i < currentStageIdx
                    ? "var(--accent)"
                    : i === currentStageIdx
                    ? "var(--emerald)"
                    : "var(--border)",
              }}
            />
          ))}
        </div>
        <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>
          {currentStageIdx + 1}/{STAGE_ORDER.length} — {project.stage}
        </div>
      </div>

      {/* Artifact checklist */}
      <div className="card" style={{ marginBottom: 8 }}>
        <h2>Artifacts</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {DOC_TYPES.map((type) => {
            const doc = documents.find((d) => d.type === type);
            return (
              <div key={type} className="row" style={{ gap: 6, padding: "4px 0" }}>
                <span style={{ fontSize: 14 }}>{doc ? "✅" : "⬜"}</span>
                <span style={{ fontSize: 11, color: doc ? "var(--text)" : "var(--muted)" }}>
                  {type.replace(/_/g, " ")}
                </span>
              </div>
            );
          })}
        </div>
        <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          {docTypes.length}/{DOC_TYPES.length} documents complete
        </div>
      </div>

      {/* Actions */}
      <div className="row" style={{ gap: 8 }}>
        <button className="btn" onClick={runAgent} disabled={!!action} style={{ flex: 1 }}>
          {action === "running" ? "⏳ Running…" : "▶ Run Agent"}
        </button>
        <button className="btn ghost" onClick={advanceStage} disabled={!!action} style={{ flex: 1 }}>
          {action === "advancing" ? "⏳ Advancing…" : "→ Advance Stage"}
        </button>
      </div>

      {documents.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>
            Recent documents
          </div>
          {documents.slice(0, 3).map((d) => (
            <div key={d._id} className="row" style={{ padding: "3px 0", gap: 8 }}>
              <span style={{ fontSize: 11 }}>{d.title}</span>
              <span className="gap" />
              <span
                className="badge muted"
                style={{ fontSize: 10, background: "rgba(255,255,255,0.06)" }}
              >
                v{d.version}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "@modelcontextprotocol/ext-apps/react";

interface Job {
  _id: string;
  type: string;
  status: string;
  projectId?: string | null;
  errorMessage?: string | null;
  _creationTime: number;
}

interface PendingQuestion {
  _id: string;
  jobId: string;
  questionText: string;
  choices?: string[] | null;
  _creationTime: number;
}

const STATUS_EMOJI: Record<string, string> = {
  running: "⚡",
  waiting_input: "⏸️",
  pending: "⏳",
  completed: "✅",
  failed: "❌",
  cancelled: "🚫",
};

const STATUS_COLOR: Record<string, string> = {
  running: "#8b5cf6",
  waiting_input: "#f59e0b",
  pending: "#94a3b8",
  completed: "#10b981",
  failed: "#ef4444",
  cancelled: "#6b7280",
};

export function App() {
  const { app } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [answering, setAnswering] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!app) return;
    setRefreshing(true);
    try {
      await (app as any).callServerTool("elmer_list_jobs", {});
      await (app as any).callServerTool("elmer_get_pending_questions", {});
    } finally {
      setRefreshing(false);
    }
  }, [app]);

  useEffect(() => {
    if (!app) return;
    app.ontoolresult = (result: any) => {
      const sc = result?.structuredContent;
      if (Array.isArray(sc)) {
        if (sc.length === 0) return;
        if (sc[0]?.questionText !== undefined) {
          setQuestions(sc as PendingQuestion[]);
        } else if (sc[0]?.type !== undefined) {
          setJobs(sc as Job[]);
        }
      }
    };
    loadData();
  }, [app, loadData]);

  const answerQuestion = async (questionId: string, response: string) => {
    setAnswering(questionId);
    try {
      await (app as any)?.callServerTool("elmer_respond_to_question", {
        question_id: questionId,
        response,
      });
      setQuestions((q) => q.filter((x) => x._id !== questionId));
    } finally {
      setAnswering(null);
    }
  };

  const activeJobs = jobs.filter((j) => ["running", "waiting_input", "pending"].includes(j.status));
  const recentJobs = jobs.filter((j) => ["completed", "failed"].includes(j.status)).slice(0, 5);

  return (
    <div style={{ padding: 12, background: "#0b0f14", color: "#f1f5f9", fontFamily: "sans-serif", minWidth: 300 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Agent Monitor</h1>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            {activeJobs.length} active · {questions.length} awaiting input
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={loadData}
          disabled={refreshing}
          style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 11 }}
        >
          {refreshing ? "↻" : "Refresh"}
        </button>
      </div>

      {/* HITL Questions — most prominent */}
      {questions.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {questions.map((q) => {
            const ago = Math.round((Date.now() - q._creationTime) / 60000);
            return (
              <div key={q._id} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: 10, marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 600, marginBottom: 4 }}>
                  ⏸ Awaiting input · {ago}m ago
                </div>
                <div style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{q.questionText}</div>
                {q.choices && q.choices.length > 0 ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {q.choices.map((choice) => (
                      <button
                        key={choice}
                        onClick={() => answerQuestion(q._id, choice)}
                        disabled={answering === q._id}
                        style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}
                      >
                        {answering === q._id ? "…" : choice}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Yes", "No", "Skip"].map((choice) => (
                      <button
                        key={choice}
                        onClick={() => answerQuestion(q._id, choice)}
                        disabled={answering === q._id}
                        style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", color: "#f1f5f9", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11 }}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 6 }}>Active</div>
          {activeJobs.map((j) => (
            <div key={j._id} style={{ background: "#111827", border: `1px solid ${STATUS_COLOR[j.status] ?? "#374151"}22`, borderRadius: 8, padding: "8px 10px", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>{STATUS_EMOJI[j.status] ?? "•"}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {j.type.replace(/_/g, " ")}
                </div>
                {j.projectId && <div style={{ fontSize: 10, color: "#94a3b8" }}>{j.projectId.slice(0, 8)}…</div>}
              </div>
              <span style={{ fontSize: 11, color: STATUS_COLOR[j.status], fontWeight: 600 }}>{j.status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent completions */}
      {recentJobs.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 6 }}>Recent</div>
          {recentJobs.map((j) => (
            <div key={j._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", opacity: 0.7 }}>
              <span style={{ fontSize: 12 }}>{STATUS_EMOJI[j.status] ?? "•"}</span>
              <span style={{ fontSize: 11, flex: 1 }}>{j.type.replace(/_/g, " ")}</span>
              {j.errorMessage && <span style={{ fontSize: 10, color: "#ef4444" }}>error</span>}
            </div>
          ))}
        </div>
      )}

      {jobs.length === 0 && questions.length === 0 && (
        <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 12 }}>
          No active jobs. Run an agent with <code>elmer_run_agent</code>.
        </div>
      )}
    </div>
  );
}

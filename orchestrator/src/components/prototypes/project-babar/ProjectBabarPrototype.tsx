"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  MessageSquareText,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/glass/GlassCard";
import { cn } from "@/lib/utils";
import {
  applyPrototypePrompt,
  buildPrototypeScenario,
  getJourneyPreset,
  projectBabarQuickPrompts,
  type HighlightedSection,
  type PrototypeJourney,
  type PrototypeLength,
  type PrototypePersona,
  type PrototypeStatus,
  type PrototypeView,
} from "./model";

const personas: Array<{ value: PrototypePersona; label: string }> = [
  { value: "sales-rep", label: "Sales rep" },
  { value: "sales-leader", label: "Sales leader" },
  { value: "csm", label: "CSM" },
];

const views: Array<{ value: PrototypeView; label: string; note: string }> = [
  {
    value: "full",
    label: "Full artifact",
    note: "Best for reviewing and sharing a polished recap.",
  },
  {
    value: "inline-chat",
    label: "Inline chat",
    note: "Best for edits, trust checks, and fast follow-up.",
  },
  {
    value: "reference-chip",
    label: "Reference chip",
    note: "Best when the artifact is supporting a broader AI workspace.",
  },
];

const lengths: Array<{ value: PrototypeLength; label: string }> = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "detailed", label: "Detailed" },
];

const states: Array<{ value: PrototypeStatus; label: string }> = [
  { value: "success", label: "Success" },
  { value: "loading-short", label: "Loading (short)" },
  { value: "loading-long", label: "Loading (long)" },
  { value: "low-confidence", label: "Low confidence" },
  { value: "error", label: "Error" },
  { value: "empty", label: "Empty" },
];

const journeys: Array<{ value: PrototypeJourney; label: string }> = [
  { value: "happy-path", label: "Happy path" },
  { value: "error-recovery", label: "Error recovery" },
  { value: "trust-review", label: "Trust review" },
];

function highlightedSectionClasses(active: boolean) {
  return cn(
    "rounded-2xl border p-4 transition-colors",
    active
      ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.18)]"
      : "border-white/12 bg-white/[0.04]",
  );
}

function SectionHeading({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
      </div>
      {typeof count === "number" ? (
        <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">
          {count}
        </Badge>
      ) : null}
    </div>
  );
}

function SegmentButton({
  selected,
  onClick,
  children,
  testId,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        selected
          ? "border-cyan-400/60 bg-cyan-500/15 text-white"
          : "border-white/12 bg-white/[0.04] text-white/70 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function ProjectBabarPrototype() {
  const [persona, setPersona] = useState<PrototypePersona>("sales-rep");
  const [activeView, setActiveView] = useState<PrototypeView>("full");
  const [status, setStatus] = useState<PrototypeStatus>("success");
  const [length, setLength] = useState<PrototypeLength>("medium");
  const [highlightedSection, setHighlightedSection] =
    useState<HighlightedSection>("action-items");
  const [savedPreference, setSavedPreference] = useState<string | null>(null);
  const [chatReply, setChatReply] = useState<string>(
    "I can tighten the recap, change the emphasis, or prepare a safer sharing version without sending anything automatically.",
  );
  const [recommendedAction, setRecommendedAction] = useState<string>(
    "Share the concise recap and let the drafted follow-up go out with human approval.",
  );
  const [promptInput, setPromptInput] = useState<string>(
    projectBabarQuickPrompts[0],
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [shareSent, setShareSent] = useState(false);
  const [journey, setJourney] = useState<PrototypeJourney>("happy-path");

  const scenario = useMemo(
    () =>
      buildPrototypeScenario({
        persona,
        activeView,
        status,
        length,
        highlightedSection,
        savedPreference,
        chatReply,
        recommendedAction,
      }),
    [
      activeView,
      chatReply,
      highlightedSection,
      length,
      persona,
      recommendedAction,
      savedPreference,
      status,
    ],
  );

  const applyJourney = (nextJourney: PrototypeJourney) => {
    const preset = getJourneyPreset(nextJourney);
    setJourney(nextJourney);
    setPersona(preset.persona);
    setActiveView(preset.activeView);
    setStatus(preset.status);
    setLength(preset.length);
    setHighlightedSection(preset.highlightedSection);
    setSavedPreference(preset.savedPreference);
    setChatReply(preset.chatReply);
    setRecommendedAction(preset.recommendedAction);
    setShareOpen(false);
    setPrivacyChecked(false);
    setShareSent(false);
  };

  const applyPrompt = (prompt: string) => {
    const updated = applyPrototypePrompt(scenario, prompt);
    setPromptInput(prompt);
    setPersona(updated.persona);
    setActiveView(updated.activeView);
    setLength(updated.length);
    setHighlightedSection(updated.highlightedSection);
    setSavedPreference(updated.savedPreference);
    setChatReply(updated.chatReply);
    setRecommendedAction(updated.recommendedAction);
    setShareSent(false);
    if (status === "error" || status === "empty") {
      setStatus("success");
    }
  };

  const statusBanner = (() => {
    switch (scenario.status) {
      case "loading-short":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          title: "Generating the recap",
          detail:
            "The transcript is already available, so this stays lightweight and fast.",
          tone: "border-cyan-400/40 bg-cyan-500/10 text-cyan-100",
        };
      case "loading-long":
        return {
          icon: <Clock3 className="h-4 w-4" />,
          title: "Still analyzing source context",
          detail:
            "Longer loading should explain what is happening instead of leaving the user guessing.",
          tone: "border-amber-400/40 bg-amber-500/10 text-amber-50",
        };
      case "low-confidence":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Human review recommended",
          detail:
            "Two sections depend on inference rather than explicit transcript evidence.",
          tone: "border-amber-400/40 bg-amber-500/10 text-amber-50",
        };
      case "error":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          title: "Generation failed safely",
          detail:
            "The user keeps control, sees the failure, and gets a concrete retry path.",
          tone: "border-rose-400/40 bg-rose-500/10 text-rose-50",
        };
      case "empty":
        return {
          icon: <MessageSquareText className="h-4 w-4" />,
          title: "No transcript is ready yet",
          detail:
            "The empty state should explain the dependency and point to the next useful action.",
          tone: "border-white/15 bg-white/5 text-white/80",
        };
      default:
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          title: "Share-ready recap",
          detail:
            "The artifact is concise, evidence-backed, and ready for a privacy-gated share.",
          tone: "border-emerald-400/40 bg-emerald-500/10 text-emerald-50",
        };
    }
  })();

  const shareDisabled = !privacyChecked || scenario.status === "error" || scenario.status === "empty";

  return (
    <div
      data-testid="project-babar-prototype"
      className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_32%),linear-gradient(180deg,rgba(8,12,19,0.98),rgba(4,7,12,1))]"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <GlassCard className="overflow-hidden border-white/12 bg-white/[0.05] p-0">
          <div className="grid gap-8 px-6 py-7 lg:grid-cols-[1.45fr_0.9fr] lg:px-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-cyan-400/15 text-cyan-100">Prototype</Badge>
                <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">
                  Project Babar
                </Badge>
                <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">
                  Meeting Summary + sharing
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  A clickable Project Babar prototype built from the active Meeting
                  Summary brief.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
                  This demo turns the current Babar initiative into something Robert
                  can review right now: three artifact directions, all major AI
                  states, a chat-based preference loop, and a privacy-gated sharing
                  flow.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5">
                  Launch target: May 4, 2026
                </span>
                <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5">
                  Beta target: April 15
                </span>
                <span className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5">
                  Trust-first sharing
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              <GlassCard className="border-white/12 bg-white/[0.04]">
                <p className="text-sm text-white/55">Current sprint focus</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Event page redesign, end-to-end sharing, and concise summary trust.
                </p>
              </GlassCard>
              <GlassCard className="border-white/12 bg-white/[0.04]">
                <p className="text-sm text-white/55">Key unresolved question</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  How much implicit learning should users feel before they ever see a
                  settings screen?
                </p>
              </GlassCard>
              <GlassCard className="border-white/12 bg-white/[0.04]">
                <p className="text-sm text-white/55">Prototype north star</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Deliver the “AskElephant did real work for me” lightbulb moment.
                </p>
              </GlassCard>
            </div>
          </div>
        </GlassCard>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <GlassCard className="h-fit border-white/12 bg-white/[0.04]">
            <div className="space-y-6">
              <section className="space-y-3">
                <SectionHeading eyebrow="Flow presets" title="Journey" />
                <div className="flex flex-wrap gap-2">
                  {journeys.map((item) => (
                    <SegmentButton
                      key={item.value}
                      selected={journey === item.value}
                      onClick={() => applyJourney(item.value)}
                      testId={`journey-${item.value}`}
                    >
                      {item.label}
                    </SegmentButton>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeading eyebrow="Audience lens" title="Persona" />
                <div className="flex flex-wrap gap-2">
                  {personas.map((item) => (
                    <SegmentButton
                      key={item.value}
                      selected={persona === item.value}
                      onClick={() => setPersona(item.value)}
                    >
                      {item.label}
                    </SegmentButton>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeading eyebrow="Creative exploration" title="Direction" />
                <div className="space-y-2">
                  {views.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      data-testid={`view-${item.value}`}
                      onClick={() => setActiveView(item.value)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition-colors",
                        activeView === item.value
                          ? "border-cyan-400/60 bg-cyan-500/12"
                          : "border-white/12 bg-white/[0.03] hover:border-white/25",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-white">{item.label}</p>
                        {activeView === item.value ? (
                          <Badge className="bg-cyan-400/20 text-cyan-100">
                            active
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-white/60">{item.note}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeading eyebrow="AI states" title="Scenario state" />
                <div className="flex flex-wrap gap-2">
                  {states.map((item) => (
                    <SegmentButton
                      key={item.value}
                      selected={status === item.value}
                      onClick={() => {
                        setStatus(item.value);
                        setShareSent(false);
                      }}
                      testId={`state-${item.value}`}
                    >
                      {item.label}
                    </SegmentButton>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeading eyebrow="Density" title="Summary length" />
                <div className="flex flex-wrap gap-2">
                  {lengths.map((item) => (
                    <SegmentButton
                      key={item.value}
                      selected={length === item.value}
                      onClick={() => setLength(item.value)}
                    >
                      {item.label}
                    </SegmentButton>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <SectionHeading eyebrow="Learning agent" title="Quick prompts" />
                <div className="space-y-2">
                  {projectBabarQuickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="w-full rounded-2xl border border-white/12 bg-white/[0.03] px-3 py-3 text-left text-sm text-white/80 transition-colors hover:border-white/25"
                      onClick={() => applyPrompt(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Input
                    data-testid="prototype-prompt-input"
                    value={promptInput}
                    onChange={(event) => setPromptInput(event.target.value)}
                    className="border-white/12 bg-white/[0.04] text-white placeholder:text-white/35"
                    placeholder="Tell the prototype how to adapt..."
                  />
                  <Button
                    data-testid="prototype-apply-prompt"
                    onClick={() => applyPrompt(promptInput)}
                    className="w-full"
                  >
                    Apply preference
                  </Button>
                </div>
              </section>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className={cn("border", statusBanner.tone)}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{statusBanner.icon}</div>
                  <div>
                    <p className="font-semibold">{statusBanner.title}</p>
                    <p className="mt-1 text-sm/6 text-inherit/80">{statusBanner.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-current/25 bg-transparent text-inherit">
                    {scenario.summary.meetingType}
                  </Badge>
                  <Badge variant="outline" className="border-current/25 bg-transparent text-inherit">
                    {scenario.summary.evidenceCount} evidence links
                  </Badge>
                </div>
              </div>
            </GlassCard>

            <div
              className={cn(
                "grid gap-6",
                activeView === "inline-chat"
                  ? "xl:grid-cols-[minmax(0,1fr)_320px]"
                  : "grid-cols-1",
              )}
            >
              <GlassCard className="border-white/12 bg-white/[0.04]">
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-white/10 text-white/80">
                          {views.find((item) => item.value === activeView)?.label}
                        </Badge>
                        <Badge variant="outline" className="border-white/15 bg-white/5 text-white/70">
                          {personas.find((item) => item.value === persona)?.label}
                        </Badge>
                        {savedPreference ? (
                          <Badge className="bg-emerald-500/20 text-emerald-100">
                            preference saved
                          </Badge>
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                          {scenario.summary.account}
                        </p>
                        <h2 className="mt-2 text-3xl font-semibold text-white">
                          {scenario.summary.title}
                        </h2>
                        <p className="mt-2 max-w-3xl text-base leading-7 text-white/70">
                          {scenario.summary.tldr}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {lengths.map((item) => (
                        <SegmentButton
                          key={item.value}
                          selected={length === item.value}
                          onClick={() => setLength(item.value)}
                        >
                          {item.label}
                        </SegmentButton>
                      ))}
                    </div>
                  </div>

                  {scenario.status === "loading-short" || scenario.status === "loading-long" ? (
                    <div className="space-y-4" data-testid="prototype-loading-state">
                      {[0, 1, 2].map((index) => (
                        <div
                          key={index}
                          className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                        >
                          <div className="h-4 w-40 rounded bg-white/10" />
                          <div className="mt-4 h-3 w-full rounded bg-white/8" />
                          <div className="mt-2 h-3 w-5/6 rounded bg-white/8" />
                        </div>
                      ))}
                    </div>
                  ) : scenario.status === "error" ? (
                    <div
                      data-testid="prototype-error-state"
                      className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6"
                    >
                      <h3 className="text-xl font-semibold text-white">
                        The transcript finished too late for an instant recap.
                      </h3>
                      <p className="mt-2 max-w-2xl text-white/70">
                        Instead of pretending everything worked, the experience tells
                        the user what failed, preserves their saved preference, and
                        gives them a clear retry path.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          data-testid="prototype-retry"
                          onClick={() => setStatus("success")}
                        >
                          Retry with saved format
                        </Button>
                        <Button variant="outline" className="border-white/15 bg-white/5 text-white">
                          Open transcript evidence
                        </Button>
                      </div>
                    </div>
                  ) : scenario.status === "empty" ? (
                    <div
                      data-testid="prototype-empty-state"
                      className="rounded-3xl border border-white/12 bg-white/[0.03] p-6"
                    >
                      <h3 className="text-xl font-semibold text-white">
                        No summary yet — but the user should still know what happens next.
                      </h3>
                      <p className="mt-2 max-w-2xl text-white/70">
                        This empty state is intentionally helpful: it anchors the
                        missing dependency on the transcript pipeline and keeps the
                        share flow disabled until a real artifact exists.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button onClick={() => setStatus("loading-short")}>
                          Simulate transcript completion
                        </Button>
                        <Button variant="outline" className="border-white/15 bg-white/5 text-white">
                          View pipeline status
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4" data-testid="prototype-summary-surface">
                      <div
                        className={highlightedSectionClasses(
                          highlightedSection === "takeaways",
                        )}
                      >
                        <SectionHeading
                          eyebrow="What happened"
                          title="Key takeaways"
                          count={scenario.summary.takeaways.length}
                        />
                        <div className="mt-4 space-y-3">
                          {scenario.summary.takeaways.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-white/8 bg-black/10 p-4"
                            >
                              <p className="font-medium text-white">{item.title}</p>
                              <p className="mt-2 text-sm leading-6 text-white/70">
                                {item.body}
                              </p>
                              <p className="mt-3 text-xs text-cyan-100/80">
                                {item.evidence}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={highlightedSectionClasses(
                          highlightedSection === "risks",
                        )}
                      >
                        <SectionHeading
                          eyebrow="What needs a human decision"
                          title="Open risks"
                          count={scenario.summary.risks.length}
                        />
                        <div className="mt-4 grid gap-3 lg:grid-cols-3">
                          {scenario.summary.risks.map((risk) => (
                            <div
                              key={risk.id}
                              className="rounded-2xl border border-white/8 bg-black/10 p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-white">{risk.title}</p>
                                <Badge
                                  className={cn(
                                    risk.confidence === "high"
                                      ? "bg-emerald-500/20 text-emerald-50"
                                      : risk.confidence === "medium"
                                        ? "bg-amber-500/20 text-amber-50"
                                        : "bg-white/10 text-white/80",
                                  )}
                                >
                                  {risk.confidence} confidence
                                </Badge>
                              </div>
                              <p className="mt-3 text-sm leading-6 text-white/70">
                                {risk.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={highlightedSectionClasses(
                          highlightedSection === "action-items",
                        )}
                      >
                        <SectionHeading
                          eyebrow="What to do next"
                          title="Action items"
                          count={scenario.summary.actionItems.length}
                        />
                        <div className="mt-4 space-y-3">
                          {scenario.summary.actionItems.map((action) => (
                            <div
                              key={action.id}
                              className="grid gap-3 rounded-2xl border border-white/8 bg-black/10 p-4 lg:grid-cols-[auto_minmax(0,1fr)_auto]"
                            >
                              <div className="pt-1">
                                <Checkbox checked />
                              </div>
                              <div>
                                <p className="font-medium text-white">{action.text}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/65">
                                  <span>{action.owner}</span>
                                  <span>•</span>
                                  <span>{action.due}</span>
                                  <span>•</span>
                                  <span>{action.source}</span>
                                </div>
                                <p className="mt-3 text-sm text-cyan-100/80">
                                  AskElephant will: {action.automation}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                className="border-white/15 bg-white/5 text-white"
                              >
                                Review
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div
                          className={highlightedSectionClasses(
                            highlightedSection === "share",
                          )}
                        >
                          <SectionHeading eyebrow="What happens after review" title="Next steps" />
                          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/70">
                            {scenario.summary.nextSteps.map((step) => (
                              <li
                                key={step}
                                className="rounded-2xl border border-white/8 bg-black/10 px-4 py-3"
                              >
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
                          <div className="flex items-center gap-2 text-white">
                            <ShieldCheck className="h-4 w-4 text-emerald-300" />
                            <p className="font-medium">Trust + sharing</p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-white/70">
                            {scenario.shareCallout}
                          </p>
                          {savedPreference ? (
                            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
                              {savedPreference}
                            </div>
                          ) : null}
                          <div className="mt-5 flex flex-col gap-3">
                            <Button
                              data-testid="prototype-share-button"
                              onClick={() => {
                                setShareOpen(true);
                                setShareSent(false);
                              }}
                            >
                              Preview share flow
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white/15 bg-white/5 text-white"
                            >
                              Open evidence map
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>

              {activeView === "inline-chat" ? (
                <GlassCard className="border-white/12 bg-white/[0.04]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-cyan-200" />
                      <p className="text-lg font-semibold text-white">
                        Inline learning agent
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                      <p className="text-sm leading-6 text-white/75">{scenario.chatReply}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/10 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                        Recommended human action
                      </p>
                      <p className="mt-2 text-base text-white/80">
                        {scenario.recommendedAction}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {projectBabarQuickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm text-white/80 hover:border-white/20"
                          onClick={() => applyPrompt(prompt)}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ) : null}

              {activeView === "reference-chip" ? (
                <GlassCard className="border-white/12 bg-white/[0.04]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <WandSparkles className="h-4 w-4 text-cyan-200" />
                      <p className="text-lg font-semibold">Reference-chip direction</p>
                    </div>
                    <div className="rounded-3xl border border-cyan-400/30 bg-cyan-500/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">
                            Meeting summary attached as working context
                          </p>
                          <p className="mt-1 text-sm text-cyan-50/80">
                            Use this when the artifact supports a broader Chief of Staff
                            conversation instead of taking over the whole page.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-cyan-300/30 bg-cyan-400/10 text-cyan-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open artifact
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ) : null}
            </div>

            <GlassCard className="border-white/12 bg-white/[0.04]">
              <div className="grid gap-6 lg:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                    Direction A
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">Full artifact</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    The safest default: polished, evidence-backed, and clearly ready
                    for review or sharing.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                    Direction B
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">Inline chat</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Best when the team wants the learning loop to feel visible and
                    editable without jumping into another workflow.
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                    Direction C
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    Reference chip
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Best when Meeting Summary becomes supporting context for the wider
                    Chief of Staff surface instead of acting as the primary destination.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent
          className="border-white/15 bg-slate-950/95 text-white sm:max-w-xl"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Share preview for Project Babar</DialogTitle>
            <DialogDescription className="text-white/60">
              The v1 recommendation is link sharing with an explicit privacy check
              before anything goes out.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm uppercase tracking-[0.28em] text-white/45">
                Share payload
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Concise discovery recap + owner-specific next actions
              </p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Link recipients can review the artifact, inspect evidence, and see
                which tasks AskElephant is proposing without silently sending
                anything.
              </p>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <Checkbox
                data-testid="prototype-share-privacy"
                checked={privacyChecked}
                onCheckedChange={(checked) => {
                  setPrivacyChecked(Boolean(checked));
                  setShareSent(false);
                }}
              />
              <div>
                <p className="font-medium text-white">
                  I reviewed the privacy gate before sharing externally
                </p>
                <p className="mt-1 text-sm leading-6 text-white/65">
                  Required because the current initiative research calls out
                  trust-before-share as a table-stakes behavior.
                </p>
              </div>
            </label>

            {shareSent ? (
              <div
                data-testid="prototype-share-success"
                className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4 text-sm text-emerald-50"
              >
                Share preview approved. In a production flow this is where Robert
                would receive the link-ready artifact with evidence intact.
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/15 bg-white/5 text-white"
              onClick={() => setShareOpen(false)}
            >
              Keep reviewing
            </Button>
            <Button
              data-testid="prototype-share-confirm"
              disabled={shareDisabled}
              onClick={() => setShareSent(true)}
            >
              Approve share preview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

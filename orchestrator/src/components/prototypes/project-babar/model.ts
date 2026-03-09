export type PrototypePersona = "sales-rep" | "sales-leader" | "csm";
export type PrototypeView = "full" | "inline-chat" | "reference-chip";
export type PrototypeStatus =
  | "success"
  | "loading-short"
  | "loading-long"
  | "low-confidence"
  | "error"
  | "empty";
export type PrototypeLength = "short" | "medium" | "detailed";
export type HighlightedSection =
  | "takeaways"
  | "risks"
  | "action-items"
  | "share";
export type PrototypeJourney = "happy-path" | "error-recovery" | "trust-review";

export interface PrototypeTakeaway {
  id: string;
  title: string;
  body: string;
  evidence: string;
}

export interface PrototypeRisk {
  id: string;
  title: string;
  detail: string;
  confidence: "high" | "medium" | "low";
}

export interface PrototypeActionItem {
  id: string;
  owner: string;
  text: string;
  due: string;
  automation: string;
  source: string;
}

export interface PrototypeSummary {
  title: string;
  meetingType: string;
  account: string;
  tldr: string;
  takeaways: PrototypeTakeaway[];
  risks: PrototypeRisk[];
  actionItems: PrototypeActionItem[];
  nextSteps: string[];
  evidenceCount: number;
}

export interface PrototypeScenario {
  persona: PrototypePersona;
  activeView: PrototypeView;
  status: PrototypeStatus;
  length: PrototypeLength;
  highlightedSection: HighlightedSection;
  savedPreference: string | null;
  chatReply: string;
  recommendedAction: string;
  summary: PrototypeSummary;
  shareCallout: string;
}

interface ScenarioOptions {
  persona?: PrototypePersona;
  activeView?: PrototypeView;
  status?: PrototypeStatus;
  length?: PrototypeLength;
  highlightedSection?: HighlightedSection;
  savedPreference?: string | null;
  chatReply?: string;
  recommendedAction?: string;
}

const baseTakeaways: PrototypeTakeaway[] = [
  {
    id: "budget",
    title: "Budget exists, but CFO approval is still gated by proof of rollout speed",
    body: "The buyer team wants a two-week pilot plan that proves recaps can land in HubSpot without manual cleanup.",
    evidence: '"We have budget. I just need to show finance that this will save my team time immediately." — 12:14',
  },
  {
    id: "handoff",
    title: "Sales-to-CS handoff is the biggest immediate pain point",
    body: "The team currently rewrites call notes into a welcome email and then duplicates key details in CRM.",
    evidence: '"Right now the handoff is two manual steps and things still fall through the cracks." — 18:42',
  },
  {
    id: "trust",
    title: "Trust hinges on concise output and visible evidence",
    body: "The rep wants a polished recap that can be shared externally without sounding generic or AI-generated.",
    evidence: '"If it sounds robotic, I still have to rewrite it before I send it." — 24:03',
  },
  {
    id: "timing",
    title: "Timing matters more than customization",
    body: "The team wants the summary ready before the rep leaves the parking lot, not a settings screen to manage later.",
    evidence: '"I do not want anything to load if the template is already known." — Internal design feedback',
  },
  {
    id: "prep-loop",
    title: "The recap should feed the next meeting prep without another workflow",
    body: "Open risks, commitments, and owner changes need to roll directly into the next prep packet.",
    evidence: '"Prep should know what changed since the last touch, not make me hunt for it." — Meeting Prep research',
  },
];

const baseRisks: PrototypeRisk[] = [
  {
    id: "latency",
    title: "Generation latency could break first-use trust",
    detail: "The team benchmark is effectively instant for known meeting types, while the current baseline is not instrumented.",
    confidence: "high",
  },
  {
    id: "learning",
    title: "Preference learning model is directionally right but technically underspecified",
    detail: "We still need a concrete v1 decision on how chat corrections persist and apply on the next meeting.",
    confidence: "medium",
  },
  {
    id: "sharing",
    title: "Sharing scope is not locked for open beta",
    detail: "External share, privacy gates, and delivery channel still need a committed v1 boundary.",
    confidence: "medium",
  },
];

const baseActionItems: PrototypeActionItem[] = [
  {
    id: "pilot-plan",
    owner: "Robert",
    text: "Send the customer a 2-week pilot plan using the meeting summary artifact as the centerpiece.",
    due: "Today, 4:30 PM",
    automation: "Draft the outbound email and attach the summary link.",
    source: "Customer request captured at 12:14",
  },
  {
    id: "release-gates",
    owner: "Tyler",
    text: "Lock the open beta release gates for summary speed, sharing, and trust messaging.",
    due: "Tomorrow, 10:00 AM",
    automation: "Turn this into a launch checklist in the project workspace.",
    source: "Babar next action list",
  },
  {
    id: "latency-baseline",
    owner: "Palmer",
    text: "Instrument `meeting_summary:generated` and capture generation latency percentile data.",
    due: "Tomorrow, 2:00 PM",
    automation: "Open the instrumentation brief and annotate missing fields.",
    source: "Metrics blocker",
  },
  {
    id: "prototype-review",
    owner: "Skylar",
    text: "Review the share flow and confirm the preferred artifact direction for customer demos.",
    due: "Thursday, 11:00 AM",
    automation: "Bundle screenshots for the internal focus group.",
    source: "Design in-progress milestone",
  },
];

const baseNextSteps = [
  "Share only after privacy review is complete and evidence links are visible.",
  "Bias the first beta experience toward concise discovery-call recaps.",
  "Carry unresolved risks forward into Meeting Prep instead of hiding them in notes.",
  "Treat action items as executable objects, not just text in a summary.",
];

function pickByLength<T>(items: T[], length: PrototypeLength): T[] {
  if (length === "short") return items.slice(0, Math.max(1, items.length - 2));
  if (length === "medium") return items.slice(0, Math.max(2, items.length - 1));
  return items;
}

function personaTldr(persona: PrototypePersona, length: PrototypeLength) {
  const concise =
    "AskElephant captured the critical buyer context, flagged rollout risk, and queued the next follow-through without another workflow.";
  const standard =
    "AskElephant turned this discovery call into a share-ready recap, surfaced the rollout blocker, and prepared the next actions that need a human decision before the pilot moves forward.";
  const detailed =
    "AskElephant translated this discovery call into a concise artifact the rep can share, isolated the rollout-speed blocker finance cares about, and lined up the owner-specific actions that keep the pilot moving without forcing the team back into workflow configuration.";

  if (persona === "sales-leader") {
    return length === "short"
      ? concise
      : length === "medium"
        ? "This recap highlights rollout risk, ownership clarity, and the minimum work needed to keep the deal moving."
        : "This recap gives leadership a fast read on rollout risk, execution confidence, and the concrete owner handoffs that determine whether the deal can progress without rework.";
  }

  if (persona === "csm") {
    return length === "short"
      ? concise
      : length === "medium"
        ? "This recap is tuned for handoff clarity: what the customer expects next, what could derail trust, and which details must carry into onboarding."
        : "This recap is tuned for handoff clarity, making the customer expectation, rollout blockers, and owner-specific next moves explicit so CS can pick up the thread without manual reconstruction.";
  }

  return length === "short"
    ? concise
    : length === "medium"
      ? standard
      : detailed;
}

function personaAction(persona: PrototypePersona) {
  switch (persona) {
    case "sales-leader":
      return "Review the risks-first variant before sharing with the wider revenue team.";
    case "csm":
      return "Validate that the handoff view is ready for onboarding and external sharing.";
    default:
      return "Share the concise recap and let the drafted follow-up go out with human approval.";
  }
}

export function buildPrototypeScenario(
  options: ScenarioOptions = {},
): PrototypeScenario {
  const persona = options.persona ?? "sales-rep";
  const activeView = options.activeView ?? "full";
  const status = options.status ?? "success";
  const length = options.length ?? "medium";
  const highlightedSection = options.highlightedSection ?? "action-items";

  return {
    persona,
    activeView,
    status,
    length,
    highlightedSection,
    savedPreference: options.savedPreference ?? null,
    chatReply:
      options.chatReply ??
      "I can tighten the recap, change the emphasis, or prepare a safer sharing version without sending anything automatically.",
    recommendedAction: options.recommendedAction ?? personaAction(persona),
    shareCallout:
      "Share as a link with privacy controls first; keep email delivery as a later beta decision.",
    summary: {
      title: "Project Babar — Meeting Summary",
      meetingType: "Discovery call",
      account: "MedRevive Health",
      tldr: personaTldr(persona, length),
      takeaways: pickByLength(baseTakeaways, length),
      risks: pickByLength(baseRisks, length),
      actionItems: pickByLength(baseActionItems, length),
      nextSteps: pickByLength(baseNextSteps, length),
      evidenceCount: 7,
    },
  };
}

export function applyPrototypePrompt(
  scenario: PrototypeScenario,
  prompt: string,
): PrototypeScenario {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("concise") || normalized.includes("short")) {
    return buildPrototypeScenario({
      ...scenario,
      length: "short",
      savedPreference:
        "Saved preference: keep future discovery-call summaries concise and ready to share.",
      chatReply:
        "Future discovery call summaries will default to a concise format and keep evidence links visible for trust.",
      highlightedSection: "takeaways",
    });
  }

  if (normalized.includes("risk") || normalized.includes("leadership")) {
    return buildPrototypeScenario({
      ...scenario,
      persona: "sales-leader",
      activeView: "inline-chat",
      highlightedSection: "risks",
      chatReply:
        "I reordered the artifact around risks and owner accountability so leadership can review the blockers first.",
      recommendedAction:
        "Review the blocker summary, then approve the pilot-plan follow-up.",
    });
  }

  if (normalized.includes("customer success") || normalized.includes("handoff")) {
    return buildPrototypeScenario({
      ...scenario,
      persona: "csm",
      highlightedSection: "share",
      chatReply:
        "I shifted the summary toward onboarding handoff detail and flagged the sections that should carry into the next prep packet.",
      recommendedAction:
        "Confirm the external-safe recap and then route the handoff version to CS.",
    });
  }

  return buildPrototypeScenario({
    ...scenario,
    chatReply:
      "I captured the request, but I still need a stronger signal before I change the default behavior for future meetings.",
    highlightedSection: scenario.highlightedSection,
  });
}

const journeyPresets: Record<PrototypeJourney, PrototypeScenario> = {
  "happy-path": buildPrototypeScenario({
    status: "success",
    activeView: "full",
    highlightedSection: "action-items",
    recommendedAction: "Preview the link share, approve it, and send it to the customer.",
  }),
  "error-recovery": buildPrototypeScenario({
    status: "error",
    activeView: "inline-chat",
    highlightedSection: "action-items",
    recommendedAction: "Retry generation with the last known discovery-call format and keep the user in control.",
    chatReply:
      "Generation failed because the transcript finished late. I can retry with the saved concise format once processing completes.",
  }),
  "trust-review": buildPrototypeScenario({
    status: "low-confidence",
    activeView: "reference-chip",
    highlightedSection: "risks",
    recommendedAction:
      "Inspect the low-confidence sections before sharing anything externally.",
    chatReply:
      "I marked the sections that need a human check before this goes out, but I preserved the evidence trail so edits stay fast.",
  }),
};

export function getJourneyPreset(journey: PrototypeJourney): PrototypeScenario {
  return journeyPresets[journey];
}

export const projectBabarQuickPrompts = [
  "Make future discovery call summaries more concise.",
  "Focus this summary on risks for leadership review.",
  "Tune this for customer success handoff.",
] as const;

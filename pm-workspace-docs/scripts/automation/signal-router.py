#!/usr/bin/env python3
"""
Signal router for webhook-ingested PM feedback.

Reads events from:
  pm-workspace-docs/inbox/webhook-events.jsonl

For each new event:
  1) Normalize customer / product / speaker / feedback payload
  2) Compute RICE score (reach, impact, confidence, effort)
  3) Route into destination queues (linear, notion, google_tasks)
  4) Persist run report and processing state

Usage:
  python3 signal-router.py
  python3 signal-router.py --dry-run
  python3 signal-router.py --max-events 20
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


SCRIPT_DIR = Path(__file__).parent
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_QUEUE_PATH = WORKSPACE_ROOT / "inbox" / "webhook-events.jsonl"
DEFAULT_STATUS_DIR = WORKSPACE_ROOT / "status" / "routing"
DEFAULT_STATE_PATH = DEFAULT_STATUS_DIR / "router-state.json"
DEFAULT_ROUTED_LOG = DEFAULT_STATUS_DIR / "routed-signals.jsonl"
DEFAULT_CONFIG_PATH = SCRIPT_DIR / "routing-config.json"

DEFAULT_CONFIG: Dict[str, Any] = {
    "rice": {
        "reach_defaults": {
            "enterprise": 8.0,
            "growth": 6.0,
            "starter": 4.0,
            "free": 2.0,
            "unknown": 3.0,
        },
        "impact_defaults": {
            "churn_risk": 3.0,
            "bug": 2.5,
            "incident": 3.0,
            "feature_request": 1.5,
            "customer_feedback": 1.0,
            "question": 0.75,
            "general": 1.0,
        },
        "confidence_base": 0.55,
        "effort_default": 3.0,
    },
    "routing": {
        "linear_min_score": 2.0,
        "notion_min_score": 1.0,
        "high_priority_score": 4.0,
        "urgent_keywords": [
            "critical",
            "urgent",
            "outage",
            "blocked",
            "cannot",
            "can't",
            "churn",
            "escalation",
        ],
    },
}


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def normalize_string(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def parse_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    text = normalize_string(value).lower().replace("%", "")
    if not text:
        return default
    try:
        return float(text)
    except ValueError:
        return default


def as_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def contains_any(text: str, terms: List[str]) -> bool:
    lowered = text.lower()
    return any(term.lower() in lowered for term in terms)


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default


def save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def read_jsonl(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    events: List[Dict[str, Any]] = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            events.append(payload)
    return events


def append_jsonl(path: Path, records: List[Dict[str, Any]]) -> None:
    if not records:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        for record in records:
            handle.write(json.dumps(record, ensure_ascii=True) + "\n")


def load_config(path: Path) -> Dict[str, Any]:
    merged = json.loads(json.dumps(DEFAULT_CONFIG))
    if not path.exists():
        return merged
    external = load_json(path, {})
    if not isinstance(external, dict):
        return merged
    for section, content in external.items():
        if isinstance(content, dict) and isinstance(merged.get(section), dict):
            merged[section].update(content)
        else:
            merged[section] = content
    return merged


def extract_customer(payload: Dict[str, Any]) -> Dict[str, Any]:
    customer_obj = payload.get("customer") if isinstance(payload.get("customer"), dict) else {}
    account_obj = payload.get("account") if isinstance(payload.get("account"), dict) else {}

    candidate = customer_obj or account_obj
    name = (
        normalize_string(candidate.get("name"))
        or normalize_string(payload.get("customer_name"))
        or normalize_string(payload.get("account_name"))
        or normalize_string(payload.get("company"))
    )
    tier = (
        normalize_string(candidate.get("tier"))
        or normalize_string(payload.get("customer_tier"))
        or normalize_string(payload.get("account_tier"))
        or "unknown"
    ).lower()
    arr = (
        parse_float(candidate.get("arr"), default=0.0)
        or parse_float(payload.get("arr"), default=0.0)
        or parse_float(payload.get("customer_arr"), default=0.0)
    )
    return {
        "id": normalize_string(candidate.get("id") or payload.get("customer_id")),
        "name": name,
        "tier": tier,
        "arr": arr,
    }


def extract_product(payload: Dict[str, Any]) -> Dict[str, Any]:
    product_obj = payload.get("product") if isinstance(payload.get("product"), dict) else {}
    return {
        "id": normalize_string(product_obj.get("id") or payload.get("product_id")),
        "name": (
            normalize_string(product_obj.get("name"))
            or normalize_string(payload.get("product_name"))
            or normalize_string(payload.get("initiative"))
            or normalize_string(payload.get("project"))
        ),
        "area": (
            normalize_string(product_obj.get("area"))
            or normalize_string(payload.get("product_area"))
            or normalize_string(payload.get("team"))
        ),
    }


def extract_speakers(payload: Dict[str, Any]) -> List[Dict[str, str]]:
    speakers: List[Dict[str, str]] = []

    participants = payload.get("participants")
    for item in as_list(participants):
        if isinstance(item, dict):
            name = normalize_string(item.get("name") or item.get("full_name") or item.get("display_name"))
            role = normalize_string(item.get("role"))
            if name:
                speakers.append({"name": name, "role": role})
        elif isinstance(item, str) and item.strip():
            speakers.append({"name": item.strip(), "role": ""})

    direct_speaker = payload.get("speaker")
    if isinstance(direct_speaker, dict):
        name = normalize_string(direct_speaker.get("name"))
        role = normalize_string(direct_speaker.get("role"))
        if name:
            speakers.insert(0, {"name": name, "role": role})
    elif isinstance(direct_speaker, str) and direct_speaker.strip():
        speakers.insert(0, {"name": direct_speaker.strip(), "role": ""})

    for actor_key in ("author", "user", "sender", "reporter", "requested_by"):
        actor = payload.get(actor_key)
        if isinstance(actor, dict):
            name = normalize_string(actor.get("name") or actor.get("displayName"))
            role = normalize_string(actor.get("role") or actor.get("title"))
            if name:
                speakers.append({"name": name, "role": role})
        elif isinstance(actor, str) and actor.strip():
            speakers.append({"name": actor.strip(), "role": ""})

    # Deduplicate by name while keeping first mention order.
    deduped: List[Dict[str, str]] = []
    seen: set[str] = set()
    for speaker in speakers:
        key = speaker["name"].lower()
        if key in seen:
            continue
        seen.add(key)
        deduped.append(speaker)
    return deduped


def extract_feedback_text(payload: Dict[str, Any]) -> Tuple[str, str]:
    ai_summary = payload.get("ai_summary") if isinstance(payload.get("ai_summary"), dict) else {}
    transcript = payload.get("transcript") if isinstance(payload.get("transcript"), dict) else {}

    summary_candidates = [
        payload.get("summary"),
        payload.get("description"),
        payload.get("message"),
        payload.get("text"),
        payload.get("body"),
        payload.get("content"),
        payload.get("title"),
        ai_summary.get("tldr"),
        " ".join(as_list(ai_summary.get("key_points"))),
    ]
    summary = ""
    for candidate in summary_candidates:
        text = normalize_string(candidate)
        if text:
            summary = text
            break

    full_text = (
        normalize_string(transcript.get("full_text"))
        or normalize_string(payload.get("transcript"))
        or summary
    )

    if len(summary) > 400:
        summary = summary[:397] + "..."
    if len(full_text) > 3000:
        full_text = full_text[:2997] + "..."

    return summary, full_text


def classify_feedback_type(source: str, text: str) -> str:
    lowered = text.lower()
    if any(term in lowered for term in ("outage", "incident", "sev1", "sev2")):
        return "incident"
    if any(term in lowered for term in ("bug", "broken", "error", "fails", "failing")):
        return "bug"
    if any(term in lowered for term in ("churn", "at risk", "cancel", "lost deal")):
        return "churn_risk"
    if any(term in lowered for term in ("feature request", "would love", "need ability", "request")):
        return "feature_request"
    if any(term in lowered for term in ("question", "how do", "why does")):
        return "question"
    if source == "askelephant":
        return "customer_feedback"
    return "general"


def classify_severity(payload: Dict[str, Any], text: str) -> str:
    priority = normalize_string(payload.get("priority") or payload.get("severity")).lower()
    if priority in {"p0", "critical", "urgent", "high"}:
        return "high"
    if priority in {"p1", "medium"}:
        return "medium"
    if priority in {"p2", "p3", "low"}:
        return "low"

    lowered = text.lower()
    if any(term in lowered for term in ("critical", "urgent", "blocked", "cannot", "can't", "outage")):
        return "high"
    if any(term in lowered for term in ("slow", "annoying", "workaround", "confusing")):
        return "medium"
    return "low"


def infer_effort(payload: Dict[str, Any], feedback_type: str, text: str, config: Dict[str, Any]) -> Tuple[float, str]:
    explicit = (
        parse_float(payload.get("effort"), default=0.0)
        or parse_float(payload.get("estimated_effort"), default=0.0)
        or parse_float(payload.get("story_points"), default=0.0)
    )
    if explicit > 0:
        return clamp(explicit, 0.5, 20.0), "explicit effort field in payload"

    t_shirt = normalize_string(payload.get("t_shirt_size")).upper()
    if t_shirt:
        sizes = {"XS": 1.0, "S": 2.0, "M": 4.0, "L": 8.0, "XL": 13.0}
        if t_shirt in sizes:
            return sizes[t_shirt], f"t_shirt_size={t_shirt}"

    lowered = text.lower()
    if any(term in lowered for term in ("migration", "rewrite", "refactor", "new integration", "architecture")):
        return 8.0, "inferred larger implementation scope"
    if any(term in lowered for term in ("copy change", "text update", "small fix", "ui polish")):
        return 2.0, "inferred small scope from text"
    if feedback_type in {"incident", "bug"}:
        return 3.0, "default bugfix effort"
    if feedback_type == "feature_request":
        return 5.0, "default feature effort"
    return float(config["rice"]["effort_default"]), "default effort fallback"


def infer_reach(
    payload: Dict[str, Any],
    customer: Dict[str, Any],
    text: str,
    config: Dict[str, Any],
) -> Tuple[float, str]:
    explicit = (
        parse_float(payload.get("reach"), default=0.0)
        or parse_float(payload.get("impacted_users"), default=0.0)
        or parse_float(payload.get("affected_accounts"), default=0.0)
    )
    if explicit > 0:
        if explicit > 50:
            mapped = clamp(1 + math.log10(explicit), 1.0, 10.0)
            return mapped, f"mapped from impacted_users={explicit}"
        return clamp(explicit, 1.0, 10.0), "explicit reach in payload"

    defaults = config["rice"]["reach_defaults"]
    tier = customer.get("tier", "unknown")
    base = parse_float(defaults.get(tier, defaults.get("unknown", 3.0)), default=3.0)

    arr = parse_float(customer.get("arr"), default=0.0)
    if arr >= 250000:
        base += 2.0
    elif arr >= 100000:
        base += 1.5
    elif arr >= 50000:
        base += 1.0

    lowered = text.lower()
    if any(term in lowered for term in ("multiple customers", "many customers", "all reps", "everyone")):
        base += 1.5
    if "single customer" in lowered:
        base -= 1.0

    return clamp(base, 1.0, 10.0), "tier/arr heuristic reach"


def infer_impact(feedback_type: str, severity: str, payload: Dict[str, Any], config: Dict[str, Any]) -> Tuple[float, str]:
    explicit = parse_float(payload.get("impact"), default=0.0)
    if explicit > 0:
        return clamp(explicit, 0.25, 3.0), "explicit impact in payload"

    defaults = config["rice"]["impact_defaults"]
    impact = parse_float(defaults.get(feedback_type, defaults.get("general", 1.0)), default=1.0)
    if severity == "high":
        impact = max(impact, 2.5)
    elif severity == "medium":
        impact = max(impact, 1.5)
    return clamp(impact, 0.25, 3.0), f"default impact for feedback_type={feedback_type}"


def infer_confidence(
    payload: Dict[str, Any],
    customer: Dict[str, Any],
    product: Dict[str, Any],
    speakers: List[Dict[str, str]],
    summary: str,
    source: str,
    config: Dict[str, Any],
) -> Tuple[float, str]:
    explicit = parse_float(payload.get("confidence"), default=0.0)
    if explicit > 1.0:
        explicit = explicit / 100.0
    if explicit > 0:
        return clamp(explicit, 0.1, 1.0), "explicit confidence in payload"

    confidence = parse_float(config["rice"]["confidence_base"], default=0.55)
    notes = ["base confidence"]
    if customer.get("name"):
        confidence += 0.1
        notes.append("customer identified")
    if product.get("name"):
        confidence += 0.1
        notes.append("product identified")
    if speakers:
        confidence += 0.1
        notes.append("speaker identified")
    if summary:
        confidence += 0.05
        notes.append("summary available")
    if source in {"askelephant", "linear", "github"}:
        confidence += 0.05
        notes.append(f"source={source}")
    return clamp(confidence, 0.3, 1.0), ", ".join(notes)


def infer_actionable(feedback_type: str, text: str) -> bool:
    lowered = text.lower()
    action_terms = [
        "build",
        "implement",
        "fix",
        "ship",
        "add support",
        "create",
        "update",
    ]
    if feedback_type in {"bug", "incident", "feature_request"}:
        return True
    return any(term in lowered for term in action_terms)


def priority_from_score(score: float, severity: str) -> str:
    if severity == "high" and score >= 2.5:
        return "P0"
    if score >= 4.0:
        return "P0"
    if score >= 2.5:
        return "P1"
    if score >= 1.2:
        return "P2"
    return "P3"


def normalize_event(event: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    payload = event.get("payload") if isinstance(event.get("payload"), dict) else {}
    source = normalize_string(event.get("source") or "unknown")
    summary, full_text = extract_feedback_text(payload)
    title_hint = normalize_string(payload.get("title") or payload.get("meeting_title"))
    classification_text = "\n".join(part for part in [title_hint, summary, full_text] if part)

    customer = extract_customer(payload)
    product = extract_product(payload)
    speakers = extract_speakers(payload)
    feedback_type = classify_feedback_type(source, classification_text)
    severity = classify_severity(payload, classification_text)
    actionable = infer_actionable(feedback_type, classification_text)

    reach, reach_reason = infer_reach(payload, customer, full_text, config)
    impact, impact_reason = infer_impact(feedback_type, severity, payload, config)
    confidence, confidence_reason = infer_confidence(
        payload,
        customer,
        product,
        speakers,
        summary,
        source,
        config,
    )
    effort, effort_reason = infer_effort(payload, feedback_type, full_text, config)
    score = round((reach * impact * confidence) / max(effort, 0.5), 2)
    priority = priority_from_score(score, severity)

    title_bits = [
        normalize_string(payload.get("title")),
        normalize_string(payload.get("meeting_title")),
        summary[:90] if summary else "",
    ]
    title = next((bit for bit in title_bits if bit), "Feedback item")

    return {
        "event_id": normalize_string(event.get("event_id"))
        or f"evt-{hashlib.sha1(json.dumps(payload, sort_keys=True).encode('utf-8')).hexdigest()[:16]}",
        "source": source,
        "event_type": normalize_string(event.get("event_type") or payload.get("event_type") or "unknown"),
        "received_at": normalize_string(event.get("received_at") or utc_now_iso()),
        "customer": customer,
        "product": product,
        "speakers": speakers,
        "feedback": {
            "title": title,
            "summary": summary or "No summary provided",
            "full_text_excerpt": full_text[:500] if full_text else "",
            "type": feedback_type,
            "severity": severity,
            "actionable": actionable,
        },
        "rice": {
            "reach": round(reach, 2),
            "impact": round(impact, 2),
            "confidence": round(confidence, 2),
            "effort": round(effort, 2),
            "score": score,
            "priority": priority,
            "reasons": {
                "reach": reach_reason,
                "impact": impact_reason,
                "confidence": confidence_reason,
                "effort": effort_reason,
            },
        },
        "owner_hint": normalize_string(payload.get("owner") or payload.get("assignee") or payload.get("requested_by")),
    }


def choose_routes(normalized: Dict[str, Any], config: Dict[str, Any]) -> Tuple[str, List[str], str]:
    source = normalized["source"]
    feedback = normalized["feedback"]
    rice = normalized["rice"]
    score = parse_float(rice.get("score"), default=0.0)
    feedback_type = feedback.get("type", "general")
    severity = feedback.get("severity", "low")
    actionable = bool(feedback.get("actionable"))
    summary = normalize_string(feedback.get("summary"))

    linear_score_min = parse_float(config["routing"].get("linear_min_score"), default=2.0)
    notion_score_min = parse_float(config["routing"].get("notion_min_score"), default=1.0)
    urgent_terms = config["routing"].get("urgent_keywords", [])

    linear_candidate = False
    notion_candidate = False
    tasks_candidate = False
    reasons: List[str] = []

    if source in {"linear", "github"}:
        linear_candidate = True
        reasons.append(f"source={source}")
    if feedback_type in {"bug", "incident"}:
        linear_candidate = True
        reasons.append(f"feedback_type={feedback_type}")
    if actionable and score >= linear_score_min:
        linear_candidate = True
        reasons.append("high-actionability signal")
    if feedback_type in {"feature_request", "customer_feedback", "churn_risk", "general", "question"}:
        notion_candidate = score >= notion_score_min
        if notion_candidate:
            reasons.append("discovery/research signal")
    if source == "askelephant":
        notion_candidate = True
        reasons.append("meeting transcript context")

    if score < notion_score_min or contains_any(summary, ["follow up", "remind", "check with"]):
        tasks_candidate = True
        reasons.append("follow-up task pattern")

    if contains_any(summary, urgent_terms) or severity == "high":
        linear_candidate = True
        reasons.append("urgent severity override")

    primary = "google_tasks"
    secondary: List[str] = []

    if linear_candidate:
        primary = "linear"
        if notion_candidate:
            secondary.append("notion")
        if tasks_candidate:
            secondary.append("google_tasks")
    elif notion_candidate:
        primary = "notion"
        if tasks_candidate:
            secondary.append("google_tasks")
    elif tasks_candidate:
        primary = "google_tasks"

    return primary, secondary, "; ".join(reasons) if reasons else "default routing"


def build_destination_entry(
    destination: str,
    normalized: Dict[str, Any],
    primary_destination: str,
    routing_reason: str,
) -> Dict[str, Any]:
    rice = normalized["rice"]
    feedback = normalized["feedback"]
    customer = normalized["customer"]
    product = normalized["product"]
    speakers = normalized["speakers"]
    speaker_name = speakers[0]["name"] if speakers else ""
    route_id = f"route-{normalized['event_id']}-{destination}"

    base = {
        "route_id": route_id,
        "destination": destination,
        "event_id": normalized["event_id"],
        "source": normalized["source"],
        "received_at": normalized["received_at"],
        "title": feedback["title"],
        "summary": feedback["summary"],
        "feedback_type": feedback["type"],
        "severity": feedback["severity"],
        "customer": customer,
        "product": product,
        "speaker": speaker_name,
        "rice": rice,
        "is_primary": destination == primary_destination,
        "routing_reason": routing_reason,
    }

    if destination == "linear":
        base["linear"] = {
            "suggested_priority": rice["priority"],
            "labels": [
                f"source:{normalized['source']}",
                f"feedback:{feedback['type']}",
                "signal-router",
            ],
            "description_hint": (
                f"Customer: {customer.get('name') or 'Unknown'}\n"
                f"Product: {product.get('name') or 'Unknown'}\n"
                f"Said by: {speaker_name or 'Unknown'}\n"
                f"RICE: {rice['score']} ({rice['reach']}/{rice['impact']}/{rice['confidence']}/{rice['effort']})"
            ),
        }
    elif destination == "notion":
        base["notion"] = {
            "suggested_database": "PM Feedback Inbox",
            "properties": {
                "Customer": customer.get("name"),
                "Product": product.get("name"),
                "Said By": speaker_name,
                "Feedback Type": feedback.get("type"),
                "RICE Score": rice.get("score"),
                "Priority": rice.get("priority"),
            },
        }
    elif destination == "google_tasks":
        due_hint = "today" if rice["priority"] in {"P0", "P1"} else "this week"
        base["google_tasks"] = {
            "task_title": f"[{rice['priority']}] Review feedback: {feedback['title'][:70]}",
            "due_hint": due_hint,
            "notes": (
                f"Customer: {customer.get('name') or 'Unknown'} | "
                f"Product: {product.get('name') or 'Unknown'} | "
                f"Speaker: {speaker_name or 'Unknown'} | "
                f"RICE: {rice['score']}"
            ),
        }
    return base


def route_event(normalized: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    primary, secondary, reason = choose_routes(normalized, config)
    destinations = [primary] + [item for item in secondary if item != primary]
    queue_entries = [build_destination_entry(dest, normalized, primary, reason) for dest in destinations]
    return {
        "event_id": normalized["event_id"],
        "routed_at": utc_now_iso(),
        "primary_destination": primary,
        "secondary_destinations": secondary,
        "destinations": destinations,
        "routing_reason": reason,
        "normalized": normalized,
        "queue_entries": queue_entries,
    }


def load_state(path: Path) -> Dict[str, Any]:
    state = load_json(path, {})
    if not isinstance(state, dict):
        state = {}
    ids = state.get("processed_event_ids")
    if not isinstance(ids, list):
        ids = []
    return {
        "processed_event_ids": ids,
        "total_processed": int(state.get("total_processed") or 0),
        "last_run_at": normalize_string(state.get("last_run_at")),
    }


def save_state(path: Path, state: Dict[str, Any]) -> None:
    keep = state["processed_event_ids"][-5000:]
    payload = {
        "processed_event_ids": keep,
        "total_processed": state.get("total_processed", 0),
        "last_run_at": utc_now_iso(),
    }
    save_json(path, payload)


def load_destination_queue(path: Path) -> List[Dict[str, Any]]:
    data = load_json(path, [])
    if isinstance(data, list):
        return data
    return []


def destination_files(status_dir: Path) -> Dict[str, Path]:
    return {
        "linear": status_dir / "linear-queue.json",
        "notion": status_dir / "notion-queue.json",
        "google_tasks": status_dir / "google-tasks-queue.json",
    }


def persist_destination_entries(
    destination_entries: Dict[str, List[Dict[str, Any]]],
    output_files: Dict[str, Path],
) -> None:
    for destination, entries in destination_entries.items():
        if not entries:
            continue
        queue_path = output_files[destination]
        existing = load_destination_queue(queue_path)
        existing.extend(entries)
        save_json(queue_path, existing)


def write_report(
    status_dir: Path,
    processed: List[Dict[str, Any]],
    skipped: int,
) -> Path:
    timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    report_path = status_dir / f"routing-report-{timestamp}.md"
    status_dir.mkdir(parents=True, exist_ok=True)

    by_destination = {"linear": 0, "notion": 0, "google_tasks": 0}
    for item in processed:
        by_destination[item["primary_destination"]] += 1

    lines = [
        f"# Routing Report: {timestamp}",
        "",
        f"- Processed events: {len(processed)}",
        f"- Skipped (already processed): {skipped}",
        f"- Primary Linear routes: {by_destination['linear']}",
        f"- Primary Notion routes: {by_destination['notion']}",
        f"- Primary Google Tasks routes: {by_destination['google_tasks']}",
        "",
        "## Top Signals",
    ]

    ranked = sorted(processed, key=lambda item: parse_float(item["normalized"]["rice"]["score"]), reverse=True)[:10]
    if not ranked:
        lines.append("- None")
    else:
        for item in ranked:
            normalized = item["normalized"]
            feedback = normalized["feedback"]
            rice = normalized["rice"]
            customer = normalized["customer"].get("name") or "Unknown"
            product = normalized["product"].get("name") or "Unknown"
            lines.append(
                (
                    f"- `{normalized['event_id']}` | `{item['primary_destination']}` | "
                    f"RICE {rice['score']} ({rice['priority']}) | "
                    f"Customer: {customer} | Product: {product} | "
                    f"{feedback['title'][:90]}"
                )
            )

    report_path.write_text("\n".join(lines), encoding="utf-8")
    return report_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Route webhook events with RICE scoring")
    parser.add_argument(
        "--queue-path",
        default=str(DEFAULT_QUEUE_PATH),
        help=f"Queue JSONL path (default: {DEFAULT_QUEUE_PATH})",
    )
    parser.add_argument(
        "--state-path",
        default=str(DEFAULT_STATE_PATH),
        help=f"Router state path (default: {DEFAULT_STATE_PATH})",
    )
    parser.add_argument(
        "--status-dir",
        default=str(DEFAULT_STATUS_DIR),
        help=f"Status output directory (default: {DEFAULT_STATUS_DIR})",
    )
    parser.add_argument(
        "--routed-log",
        default=str(DEFAULT_ROUTED_LOG),
        help=f"Routed JSONL log path (default: {DEFAULT_ROUTED_LOG})",
    )
    parser.add_argument(
        "--config",
        default=str(DEFAULT_CONFIG_PATH),
        help=f"Routing config JSON path (default: {DEFAULT_CONFIG_PATH})",
    )
    parser.add_argument("--max-events", type=int, default=0, help="Maximum number of new events to process")
    parser.add_argument("--dry-run", action="store_true", help="Compute routing without writing queue files")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    queue_path = Path(args.queue_path).expanduser().resolve()
    state_path = Path(args.state_path).expanduser().resolve()
    status_dir = Path(args.status_dir).expanduser().resolve()
    routed_log = Path(args.routed_log).expanduser().resolve()
    config_path = Path(args.config).expanduser().resolve()

    config = load_config(config_path)
    output_files = destination_files(status_dir)
    state = load_state(state_path)
    processed_ids = set(state["processed_event_ids"])

    events = read_jsonl(queue_path)
    newly_processed: List[Dict[str, Any]] = []
    destination_entries: Dict[str, List[Dict[str, Any]]] = {
        "linear": [],
        "notion": [],
        "google_tasks": [],
    }

    skipped = 0
    for event in events:
        event_id = normalize_string(event.get("event_id"))
        if not event_id:
            payload = event.get("payload", {})
            event_id = f"evt-{hashlib.sha1(json.dumps(payload, sort_keys=True).encode('utf-8')).hexdigest()[:16]}"
            event["event_id"] = event_id

        if event_id in processed_ids:
            skipped += 1
            continue

        normalized = normalize_event(event, config)
        routed = route_event(normalized, config)
        newly_processed.append(routed)
        processed_ids.add(normalized["event_id"])

        for entry in routed["queue_entries"]:
            destination_key = normalize_string(entry.get("destination"))
            if destination_key in destination_entries:
                destination_entries[destination_key].append(entry)

        if args.max_events and len(newly_processed) >= args.max_events:
            break

    if not args.dry_run:
        persist_destination_entries(destination_entries, output_files)
        append_jsonl(routed_log, newly_processed)
        state["processed_event_ids"] = list(processed_ids)
        state["total_processed"] = state.get("total_processed", 0) + len(newly_processed)
        save_state(state_path, state)

    report_path = write_report(status_dir, newly_processed, skipped)
    print(f"Processed events: {len(newly_processed)}")
    print(f"Skipped events: {skipped}")
    print(f"Queued entries -> Linear: {len(destination_entries['linear'])}")
    print(f"Queued entries -> Notion: {len(destination_entries['notion'])}")
    print(f"Queued entries -> Google Tasks: {len(destination_entries['google_tasks'])}")
    print(f"Report: {report_path}")
    if args.dry_run:
        print("Dry run mode: no queue files were updated.")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Parse Linear Product team issues and triage into Lane A/B/C for Notion Product Feedback sync."""

import json
import re
from pathlib import Path
from datetime import datetime, timezone

# In-scope Linear states
IN_SCOPE_STATES = {"Triage", "Needs Info", "Validated", "Ready for Engineering"}

# Lane C (skip): Internal ops/admin noise patterns
LANE_C_PATTERNS = [
    r"submit expense|expense.*receipt|reimbursement|accounting",
    r"log (the )?dinner|dinner meeting",
    r"type/question",
    r"internal.*ops|admin",
    r"^\[.*\] (?!.*customer|.*bug|.*feature)",  # Bracketed labels that aren't feedback
]
LANE_C_TITLE_KEYWORDS = {"expense", "receipt", "reimbursement", "dinner", "log meeting"}

# Lane A (high-confidence): Customer feedback indicators
LANE_A_INDICATORS = [
    r"customer.*quote|customer said|user said|feedback",
    r"bug|broken|doesn't work|error|crash",
    r"feature request|would like|want to|need to be able",
    r"usability|confusing|hard to find",
    r"churn|competitor|switched to|lost to",
    r"integration.*request|sync.*request",
    r"Customer / Account|Customer Quote|churn feedback",
]
LANE_A_LABELS = {"type/bug", "type/feedback", "type/feature", "type/question"}  # type/question WITH customer context goes A

# Type mapping heuristics
TYPE_KEYWORDS = {
    "Bug Report": ["bug", "broken", "error", "crash", "doesn't work", "fail", "issue"],
    "Feature Request": ["feature", "would like", "want to", "add", "support for"],
    "Usability Issue": ["confusing", "hard to find", "usability", "ux"],
    "Integration Request": ["integration", "sync", "connect", "hubspot", "salesforce", "crm"],
    "Competitive Loss": ["competitor", "churn", "switched", "lost to"],
    "Complaint": ["complaint", "frustrated", "annoying"],
    "Confusion": ["confusion", "unclear", "don't understand"],
    "Praise": ["love", "great", "awesome", "helpful", "works well"],
}

# Sentiment heuristics
SENTIMENT_CRITICAL = ["outage", "down", "critical", "blocker", "severe", "data loss"]
SENTIMENT_NEGATIVE = ["bug", "broken", "complaint", "frustrated", "blocker"]
SENTIMENT_POSITIVE = ["love", "great", "awesome", "praise", "helpful"]

# Feature area keywords
FEATURE_KEYWORDS = {
    "CRM Sync": ["crm", "sync", "salesforce", "hubspot"],
    "Workflows": ["workflow", "automation"],
    "Analytics": ["analytics", "report", "dashboard", "metric"],
    "Onboarding": ["onboarding", "setup", "initial"],
    "Meeting Intelligence": ["meeting", "recap", "transcript", "recording"],
    "Integrations": ["integration", "connect", "api"],
    "AI/Chat": ["chat", "ai", "assistant"],
    "People Intelligence": ["people", "contact", "person"],
    "Company Intelligence": ["company", "account"],
    "Engagement": ["engagement", "email"],
    "Settings": ["settings", "config", "preference"],
}

# Tags heuristics
TAGS_KEYWORDS = {
    "Strategic": ["strategic", "pillar", "core"],
    "Quick win": ["quick win", "easy", "simple"],
    "Competitive gap": ["competitor", "competitive"],
    "Churn driver": ["churn", "churned"],
    "Expansion blocker": ["expansion", "upsell", "blocker"],
}


def slugify(s: str) -> str:
    """Slugify for Feedback Key."""
    s = re.sub(r"[^\w\s-]", "", s.lower())
    return re.sub(r"[-\s]+", "-", s).strip("-")[:60]


def classify_type(title: str, desc: str, labels: list) -> str:
    """Map to Notion Type select."""
    combined = f"{title} {desc or ''}".lower()
    label_names = {lb.get("name", "").lower() for lb in (labels or [])}
    for t, kws in TYPE_KEYWORDS.items():
        if any(kw in combined for kw in kws):
            return t
    if "type/bug" in label_names:
        return "Bug Report"
    if "type/feature" in label_names or "type/improvement" in label_names:
        return "Feature Request"
    return "Feature Request"  # default


def classify_sentiment(title: str, desc: str) -> str:
    """Map to Notion Sentiment select."""
    combined = f"{title} {desc or ''}".lower()
    if any(kw in combined for kw in SENTIMENT_CRITICAL):
        return "Critical"
    if any(kw in combined for kw in SENTIMENT_NEGATIVE):
        return "Negative"
    if any(kw in combined for kw in SENTIMENT_POSITIVE):
        return "Positive"
    return "Neutral"


def classify_feature_area(title: str, desc: str, labels: list) -> list:
    """Map to Feature Area multi_select."""
    combined = f"{title} {desc or ''}".lower()
    label_names = " ".join(lb.get("name", "").lower() for lb in (labels or []))
    full = combined + " " + label_names
    found = []
    for area, kws in FEATURE_KEYWORDS.items():
        if any(kw in full for kw in kws):
            found.append(area)
    if not found:
        found = ["Meeting Intelligence"]  # default
    return found[:3]  # limit


def classify_tags(title: str, desc: str) -> list:
    """Map to Tags multi_select."""
    combined = f"{title} {desc or ''}".lower()
    found = []
    for tag, kws in TAGS_KEYWORDS.items():
        if any(kw in combined for kw in kws):
            found.append(tag)
    return found


def is_lane_c(issue: dict) -> tuple[bool, str]:
    """Return (is_lane_c, reason)."""
    title = (issue.get("title") or "").lower()
    labels = issue.get("labels") or []
    label_names = {lb.get("name", "").lower() for lb in labels}
    desc = (issue.get("description") or "").lower()

    for pat in LANE_C_PATTERNS:
        if re.search(pat, title, re.I) or re.search(pat, desc, re.I):
            return True, f"Matches skip pattern: {pat}"
    for kw in LANE_C_TITLE_KEYWORDS:
        if kw in title:
            return True, f"Title contains noise keyword: {kw}"
    # type/question with no customer/feedback context = often internal
    if "type/question" in label_names and not any(
        k in desc for k in ["customer", "user", "feedback", "quote", "bug", "feature"]
    ):
        if "expense" in title or "receipt" in title or "dinner" in title or "log" in title:
            return True, "Internal question (expense/admin)"
    return False, ""


def is_lane_a(issue: dict) -> bool:
    """High-confidence customer feedback."""
    desc = (issue.get("description") or "").lower()
    title = (issue.get("title") or "").lower()
    combined = title + " " + desc
    for ind in LANE_A_INDICATORS:
        if re.search(ind, combined):
            return True
    labels = issue.get("labels") or []
    for lb in labels:
        name = (lb.get("name") or "").lower()
        if "feedback" in name or "bug" in name or "feature" in name:
            return True
    return False


def parse_linear_files(paths: list[Path]) -> list[dict]:
    """Load and dedupe issues from Linear JSON files."""
    seen_ids = set()
    issues = []
    for p in paths:
        if not p.exists():
            continue
        raw = p.read_text(encoding="utf-8", errors="replace")
        data = json.loads(raw)
        for issue in data.get("data", {}).get("issues", []):
            iid = issue.get("id")
            if iid and iid not in seen_ids:
                state = (issue.get("state") or {}).get("name") or ""
                if state in IN_SCOPE_STATES:
                    seen_ids.add(iid)
                    issues.append(issue)
    return issues


def build_notion_props(issue: dict, lane: str) -> dict:
    """Build Notion property values for INSERT format (name, type, value)."""
    iid = issue["id"]
    title = (issue.get("title") or "Untitled")[:2000]
    desc = (issue.get("description") or "")[:2000]
    created = issue.get("createdAt", "")[:10]
    updated = issue.get("updatedAt", "")[:10]
    identifier = issue.get("identifier", "?")
    slug = slugify(title) or "untitled"

    fb_type = classify_type(title, desc, issue.get("labels") or [])
    sentiment = classify_sentiment(title, desc)
    feature_areas = classify_feature_area(title, desc, issue.get("labels") or [])
    tags = classify_tags(title, desc)

    confidence = 0.8 if lane == "A" else 0.5
    novelty = "Known" if lane == "A" else "Needs Review"

    # Notion INSERT uses name, type, value
    props = [
        {"name": "Feedback Title", "type": "title", "value": title},
        {"name": "Type", "type": "select", "value": fb_type},
        {"name": "Sentiment", "type": "select", "value": sentiment},
        {"name": "Source", "type": "select", "value": "Slack (internal)"},
        {"name": "Feature Area", "type": "multi_select", "value": ",".join(feature_areas)},
        {"name": "Tags", "type": "multi_select", "value": ",".join(tags) if tags else ""},
        {"name": "Verbatim Quote", "type": "rich_text", "value": desc if desc else "(No description)"},
        {"name": "Date", "type": "date", "value": created},
        {"name": "Feedback Key", "type": "rich_text", "value": f"linear|{identifier}|{slug}"},
        {"name": "Source Event ID", "type": "rich_text", "value": f"linear:{iid}"},
        {"name": "Occurrence Count", "type": "number", "value": "1"},
        {"name": "First Seen", "type": "date", "value": created},
        {"name": "Last Seen", "type": "date", "value": updated},
        {"name": "Novelty Status", "type": "select", "value": novelty},
        {"name": "Confidence", "type": "number", "value": str(confidence)},
        {"name": "Migration Source", "type": "select", "value": "Product Feedback"},
        {"name": "Migration Batch ID", "type": "rich_text", "value": "mig-2026-02-19-linear-product-sync-v1"},
    ]
    # Filter empty multi_select
    return [p for p in props if not (p["type"] == "multi_select" and not p["value"].strip())]


def main():
    base = Path("/Users/tylersahagun/.cursor/projects/Users-tylersahagun-Source-pm-workspace/agent-tools")
    files = [
        base / "bc04ea57-cf7a-4b0e-8b83-71642108e0b1.txt",
        base / "47ddc476-cf96-47f8-bfb4-46dfd383ac20.txt",
        base / "8a02cb5a-f1c2-4ffe-b338-ce92cddb742e.txt",
    ]
    issues = parse_linear_files(files)
    print(f"Total in-scope issues: {len(issues)}")

    lane_a, lane_b, lane_c = [], [], []
    for issue in issues:
        is_c, reason = is_lane_c(issue)
        if is_c:
            lane_c.append((issue, reason))
        elif is_lane_a(issue):
            lane_a.append(issue)
        else:
            lane_b.append(issue)

    print(f"Lane A (high-confidence): {len(lane_a)}")
    print(f"Lane B (needs-review): {len(lane_b)}")
    print(f"Lane C (skip): {len(lane_c)}")

    # Write audit for Lane C
    audit_dir = Path("/Users/tylersahagun/Source/pm-workspace/pm-workspace-docs/initiatives/active/feedback-intelligence")
    audit_dir.mkdir(parents=True, exist_ok=True)
    audit_path = audit_dir / "linear-to-notion-triage-audit-2026-02-18.md"
    lines = [
        "# Linear → Notion Triage Audit",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        "",
        "## Summary",
        f"- **Total in-scope**: {len(issues)}",
        f"- **Lane A (imported)**: {len(lane_a)}",
        f"- **Lane B (needs-review)**: {len(lane_b)}",
        f"- **Lane C (skipped)**: {len(lane_c)}",
        "",
        "## Skipped Issues (Lane C)",
        "",
        "| Linear ID | Identifier | Title | Reason |",
        "|-----------|------------|-------|--------|",
    ]
    for issue, reason in lane_c:
        lines.append(f"| {issue['id']} | {issue.get('identifier','?')} | {issue.get('title','')[:60]} | {reason} |")
    audit_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Audit written: {audit_path}")

    # Write lane payloads for sync script
    out_dir = Path("/Users/tylersahagun/Source/pm-workspace/.linear-notion-triage")
    out_dir.mkdir(exist_ok=True)
    lane_a_payloads = [
        {"issue": i, "props": build_notion_props(i, "A")}
        for i in lane_a
    ]
    lane_b_payloads = [
        {"issue": i, "props": build_notion_props(i, "B")}
        for i in lane_b
    ]
    (out_dir / "lane_a.json").write_text(json.dumps(lane_a_payloads, indent=2, default=str), encoding="utf-8")
    (out_dir / "lane_b.json").write_text(json.dumps(lane_b_payloads, indent=2, default=str), encoding="utf-8")
    (out_dir / "counts.json").write_text(json.dumps({
        "total_in_scope": len(issues),
        "lane_a": len(lane_a),
        "lane_b": len(lane_b),
        "lane_c": len(lane_c),
    }, indent=2), encoding="utf-8")
    print(f"Payloads written to {out_dir}")


if __name__ == "__main__":
    main()

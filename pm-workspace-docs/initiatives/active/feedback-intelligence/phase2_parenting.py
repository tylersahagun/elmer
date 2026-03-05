#!/usr/bin/env python3
"""
Phase 2 Parenting Script - Feedback Intelligence
Converts duplicate/near-duplicate Linear-imported rows into parent/sub-item structure.

Input: JSON file with Notion rows (from NOTION_QUERY_DATABASE_WITH_FILTER)
Output: Report + update commands
"""
import json
import re
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# Common stopwords (length >= 4 to match "strong token" rule, but exclude common words)
STOPWORDS = {
    "that", "this", "with", "from", "have", "were", "been", "being", "would",
    "could", "should", "their", "there", "what", "when", "which", "while",
    "about", "after", "before", "other", "into", "more", "some", "then",
    "also", "only", "just", "very", "your", "they", "will", "over", "make",
    "does", "like", "them", "need", "want", "same", "such", "most", "much",
}


def extract_text(prop: dict) -> str:
    """Extract plain text from Notion title or rich_text property."""
    if not prop:
        return ""
    val = prop.get("title") or prop.get("rich_text")
    if not val:
        return ""
    return "".join([x.get("plain_text", "") for x in val]).strip()


def extract_select(prop: dict) -> str:
    """Extract select option name."""
    if not prop or not prop.get("select"):
        return ""
    return (prop["select"].get("name") or "").strip()


def extract_multi_select(prop: dict) -> str:
    """Extract multi_select as sorted, pipe-joined string."""
    if not prop or not prop.get("multi_select"):
        return ""
    names = [o.get("name", "") for o in prop["multi_select"] if o.get("name")]
    return "|".join(sorted(names))


def extract_date(prop: dict) -> str | None:
    """Extract date start from date property."""
    if not prop or not prop.get("date") or not prop["date"].get("start"):
        return None
    return prop["date"]["start"]


def extract_number(prop: dict):
    """Extract number value."""
    if not prop or prop.get("number") is None:
        return None
    return prop["number"]


def normalize_title(title: str) -> str:
    """Normalize title: lowercase, remove bracket prefixes, issue keys, punctuation, collapse spaces."""
    s = title.lower().strip()
    # Remove bracket prefixes like [bug], [feature], etc.
    s = re.sub(r"^\[[^\]]*\]\s*", "", s)
    # Remove Linear-style issue keys (e.g. EPD-123, ASK-456)
    s = re.sub(r"\b[A-Z]{2,}-[0-9]+\b", "", s, flags=re.IGNORECASE)
    # Remove punctuation, collapse spaces
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def strong_tokens(s: str) -> list[str]:
    """Extract strong tokens: length>=4, excluding stopwords."""
    tokens = s.split()
    return [t for t in tokens if len(t) >= 4 and t.lower() not in STOPWORDS]


def build_cluster_key(title: str, type_val: str, feature_area: str) -> str:
    """Build conservative cluster key from title + type + feature area."""
    norm_title = normalize_title(title)
    tokens = strong_tokens(norm_title)
    title_part = " ".join(sorted(tokens))
    type_norm = (type_val or "").lower().replace(" ", "")
    fa_norm = (feature_area or "").lower().replace("|", " ").replace(" ", "")
    parts = [title_part, type_norm, fa_norm]
    return "||".join(p for p in parts if p)


def parse_row(page: dict) -> dict:
    """Parse a Notion page/row into a flat record."""
    props = page.get("properties", {})
    row_id = page.get("id", "")
    created = page.get("created_time", "")

    title = extract_text(props.get("Feedback Title", {}))
    type_val = extract_select(props.get("Type", {}))
    feature_area = extract_multi_select(props.get("Feature Area", {}))
    date_val = extract_date(props.get("Date", {}))
    source_event = extract_text(props.get("Source Event ID", {}))
    feedback_key = extract_text(props.get("Feedback Key", {}))
    confidence = extract_number(props.get("Confidence", {}))

    cluster_key = build_cluster_key(title, type_val, feature_area)

    return {
        "id": row_id,
        "title": title,
        "type": type_val,
        "feature_area": feature_area,
        "date": date_val,
        "created_time": created,
        "source_event": source_event,
        "feedback_key": feedback_key,
        "confidence": confidence if confidence is not None else 0,
        "cluster_key": cluster_key,
    }


def load_notion_results(json_path: str) -> list[dict]:
    """Load and parse Notion query results from JSON file."""
    with open(json_path) as f:
        data = json.load(f)

    # Handle MCP wrapper format
    if "data" in data:
        data = data["data"]
    results = data.get("results", [])

    rows = []
    for page in results:
        if page.get("object") != "page":
            continue
        row = parse_row(page)
        if row.get("source_event") and "linear:" in row["source_event"]:
            rows.append(row)
    return rows


def cluster_rows(rows: list[dict]) -> dict[str, list[dict]]:
    """Group rows by cluster_key. Only include keys with at least 2 rows."""
    by_key = defaultdict(list)
    for r in rows:
        key = r["cluster_key"]
        if not key:
            continue
        by_key[key].append(r)

    return {k: v for k, v in by_key.items() if len(v) >= 2}


def pick_parent(rows: list[dict]) -> dict:
    """Choose parent = oldest row by Date, or created_time if Date missing."""
    def sort_key(r):
        d = r.get("date")
        if d:
            return (d, r.get("created_time", ""))
        return ("9999-99-99", r.get("created_time", ""))

    return min(rows, key=sort_key)


def run(json_path: str, report_path: str) -> dict:
    """Run Phase 2 parenting logic. Returns stats for report."""
    rows = load_notion_results(json_path)
    total_scoped = len(rows)

    clusters = cluster_rows(rows)
    clusters_detected = len(clusters)

    parent_updates = []
    child_updates = []
    skipped_ambiguous = 0

    for key, members in clusters.items():
        if len(members) < 2:
            skipped_ambiguous += 1
            continue

        parent = pick_parent(members)
        children = [r for r in members if r["id"] != parent["id"]]

        dates = [r["date"] for r in members if r.get("date")]
        first_seen = min(dates) if dates else parent.get("date") or parent.get("created_time", "")[:10]
        last_seen = max(dates) if dates else parent.get("date") or parent.get("created_time", "")[:10]

        parent_conf = max(parent.get("confidence", 0) or 0, 0.9)
        parent_updates.append({
            "row_id": parent["id"],
            "occurrence_count": len(members),
            "first_seen": first_seen,
            "last_seen": last_seen,
            "novelty_status": "Known",
            "confidence": parent_conf,
            "title": parent["title"],
            "feedback_key": parent["feedback_key"],
        })

        for c in children:
            child_conf = max(c.get("confidence", 0) or 0, 0.8)
            child_updates.append({
                "row_id": c["id"],
                "parent_id": parent["id"],
                "parent_feedback_key": parent["feedback_key"],
                "novelty_status": "Known",
                "confidence": child_conf,
                "title": c["title"],
            })

    return {
        "total_scoped": total_scoped,
        "clusters_detected": clusters_detected,
        "parent_updates": parent_updates,
        "child_updates": child_updates,
        "skipped_ambiguous": skipped_ambiguous,
        "sample_parent_groups": [
            {
                "parent_id": p["row_id"],
                "feedback_key": p["feedback_key"],
                "title": p["title"],
                "count": p["occurrence_count"],
            }
            for p in parent_updates[:10]
        ],
    }


if __name__ == "__main__":
    json_path = sys.argv[1] if len(sys.argv) > 1 else "phase2_rows.json"
    report_path = sys.argv[2] if len(sys.argv) > 2 else "phase2-parenting-report-2026-02-18.md"
    stats = run(json_path, report_path)
    print(json.dumps(stats, indent=2))

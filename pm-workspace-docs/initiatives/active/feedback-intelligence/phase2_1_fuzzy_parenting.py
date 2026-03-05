#!/usr/bin/env python3
"""
Phase 2.1 Fuzzy Parenting — Feedback Intelligence
Conservative fuzzy matching for Linear-imported feedback duplicates.
- Build candidate pairs: same Type OR same Feature Area overlap
- Similarity: title normalization + token overlap + sequence similarity
- Thresholds: high >= 0.92 (auto-link), medium 0.78–0.92 (review), low ignore
"""
import json
import re
import sys
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

STOPWORDS = {
    "that", "this", "with", "from", "have", "were", "been", "being", "would",
    "could", "should", "their", "there", "what", "when", "which", "while",
    "about", "after", "before", "other", "into", "more", "some", "then",
    "also", "only", "just", "very", "your", "they", "will", "over", "make",
    "does", "like", "them", "need", "want", "same", "such", "most", "much",
}

HIGH_THRESHOLD = 0.92
MEDIUM_THRESHOLD = 0.78


def extract_text(prop: dict) -> str:
    if not prop:
        return ""
    val = prop.get("title") or prop.get("rich_text")
    if not val:
        return ""
    return "".join([x.get("plain_text", "") for x in val]).strip()


def extract_select(prop: dict) -> str:
    if not prop or not prop.get("select"):
        return ""
    return (prop["select"].get("name") or "").strip()


def extract_multi_select(prop: dict) -> list[str]:
    if not prop or not prop.get("multi_select"):
        return []
    return [o.get("name", "") for o in prop["multi_select"] if o.get("name")]


def extract_relation_ids(prop: dict) -> list[str]:
    if not prop or not prop.get("relation"):
        return []
    return [r.get("id") for r in prop["relation"] if r.get("id")]


def extract_date(prop: dict) -> str | None:
    if not prop or not prop.get("date") or not prop["date"].get("start"):
        return None
    return prop["date"]["start"]


def extract_number(prop: dict):
    if not prop or prop.get("number") is None:
        return None
    return prop["number"]


def normalize_title(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r"^\[[^\]]*\]\s*", "", s)
    s = re.sub(r"\b[A-Z]{2,}-[0-9]+\b", "", s, flags=re.IGNORECASE)
    s = re.sub(r"[^\w\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def strong_tokens(s: str) -> set[str]:
    tokens = s.split()
    return {t for t in tokens if len(t) >= 4 and t.lower() not in STOPWORDS}


def token_overlap_score(tokens_a: set[str], tokens_b: set[str]) -> float:
    if not tokens_a and not tokens_b:
        return 1.0
    inter = len(tokens_a & tokens_b)
    union = len(tokens_a | tokens_b)
    if union == 0:
        return 1.0
    return inter / union


def sequence_similarity(a: str, b: str) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def similarity_score(title_a: str, title_b: str) -> float:
    norm_a = normalize_title(title_a)
    norm_b = normalize_title(title_b)
    tokens_a = strong_tokens(norm_a)
    tokens_b = strong_tokens(norm_b)
    tok = token_overlap_score(tokens_a, tokens_b)
    seq = sequence_similarity(norm_a, norm_b)
    return 0.5 * tok + 0.5 * seq


def feature_area_overlap(fa_a: list[str], fa_b: list[str]) -> bool:
    if not fa_a or not fa_b:
        return False
    return bool(set(fa_a) & set(fa_b))


def same_type(type_a: str, type_b: str) -> bool:
    return bool(type_a and type_b and type_a == type_b)


def is_candidate_pair(a: dict, b: dict) -> bool:
    """Same Type OR same Feature Area overlap."""
    if a["id"] == b["id"]:
        return False
    type_ok = same_type(a["type"], b["type"])
    fa_ok = feature_area_overlap(a["feature_area_list"], b["feature_area_list"])
    return type_ok or fa_ok


def parse_row(page: dict) -> dict:
    props = page.get("properties", {})
    row_id = page.get("id", "")
    created = page.get("created_time", "")

    title = extract_text(props.get("Feedback Title", {}))
    type_val = extract_select(props.get("Type", {}))
    feature_area_list = extract_multi_select(props.get("Feature Area", {}))
    date_val = extract_date(props.get("Date", {}))
    source_event = extract_text(props.get("Source Event ID", {}))
    feedback_key = extract_text(props.get("Feedback Key", {}))
    confidence = extract_number(props.get("Confidence", {}))
    parent_ids = extract_relation_ids(props.get("Parent item", {}))

    return {
        "id": row_id,
        "title": title,
        "type": type_val,
        "feature_area_list": feature_area_list,
        "date": date_val,
        "created_time": created,
        "source_event": source_event,
        "feedback_key": feedback_key,
        "confidence": confidence if confidence is not None else 0,
        "has_parent": len(parent_ids) > 0,
    }


def load_rows(json_path: str) -> list[dict]:
    with open(json_path) as f:
        data = json.load(f)

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


def build_candidate_pairs(rows: list[dict]) -> list[tuple[dict, dict, float]]:
    pairs = []
    for i, a in enumerate(rows):
        for b in rows[i + 1 :]:
            if not is_candidate_pair(a, b):
                continue
            score = similarity_score(a["title"], b["title"])
            if score >= MEDIUM_THRESHOLD:
                pairs.append((a, b, score))
    return pairs


def pick_parent(rows: list[dict]) -> dict:
    def sort_key(r):
        d = r.get("date")
        if d:
            return (d, r.get("created_time", ""))
        return ("9999-99-99", r.get("created_time", ""))

    return min(rows, key=sort_key)


def resolve_merges(high_pairs: list[tuple[dict, dict, float]]) -> tuple[dict[str, dict], dict[str, list[str]]]:
    """
    Resolve high-confidence pairs into parent/child clusters.
    Returns: (parent_updates, child_links) where child_links maps child_id -> [parent_id].
    """
    uf = {}  # union-find: id -> representative id

    def find(x):
        if x not in uf:
            uf[x] = x
        if uf[x] != x:
            uf[x] = find(uf[x])
        return uf[x]

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            uf[ra] = rb

    id_to_row = {}
    for a, b, _ in high_pairs:
        id_to_row[a["id"]] = a
        id_to_row[b["id"]] = b
        union(a["id"], b["id"])

    # Group by root
    by_root = defaultdict(list)
    for rid in set(find(r) for r in id_to_row):
        for oid, row in id_to_row.items():
            if find(oid) == rid:
                by_root[rid].append(row)

    parent_updates = {}
    child_links = {}

    for members in by_root.values():
        if len(members) < 2:
            continue

        # Skip any cluster where a member already has Parent item set
        if any(m["has_parent"] for m in members):
            continue

        parent = pick_parent(members)
        children = [m for m in members if m["id"] != parent["id"]]

        dates = [m["date"] for m in members if m.get("date")]
        first_seen = min(dates) if dates else (parent.get("date") or parent.get("created_time", "")[:10])
        last_seen = max(dates) if dates else (parent.get("date") or parent.get("created_time", "")[:10])

        parent_conf = max(parent.get("confidence", 0) or 0, 0.9)
        parent_updates[parent["id"]] = {
            "occurrence_count": len(members),
            "first_seen": first_seen,
            "last_seen": last_seen,
            "novelty_status": "Known",
            "confidence": parent_conf,
            "feedback_key": parent["feedback_key"],
        }

        for c in children:
            child_conf = max(c.get("confidence", 0) or 0, 0.8)
            child_links[c["id"]] = {
                "parent_id": parent["id"],
                "parent_feedback_key": parent["feedback_key"],
                "novelty_status": "Known",
                "confidence": child_conf,
            }

    return parent_updates, child_links


def run(json_path: str) -> dict:
    rows = load_rows(json_path)
    scoped = len(rows)

    pairs = build_candidate_pairs(rows)
    high_pairs = [(a, b, s) for a, b, s in pairs if s >= HIGH_THRESHOLD]
    medium_pairs = [(a, b, s) for a, b, s in pairs if MEDIUM_THRESHOLD <= s < HIGH_THRESHOLD]

    parent_updates, child_links = resolve_merges(high_pairs)
    applied_parents = len(parent_updates)
    applied_children = len(child_links)

    return {
        "scoped_rows": scoped,
        "candidate_pairs": len(pairs),
        "high_confidence_pairs": len(high_pairs),
        "medium_confidence_pairs": len(medium_pairs),
        "parent_updates": parent_updates,
        "child_links": child_links,
        "high_merges_applied": applied_parents,
        "child_rows_linked": applied_children,
        "medium_review_candidates": medium_pairs,
        "failures": 0,
    }


if __name__ == "__main__":
    json_path = sys.argv[1] if len(sys.argv) > 1 else str(
        Path(__file__).parent / "phase2_rows.json"
    )
    stats = run(json_path)
    out = {
        "scoped_rows": stats["scoped_rows"],
        "candidate_pairs": stats["candidate_pairs"],
        "high_confidence_merges_applied": stats["high_merges_applied"],
        "parent_rows_updated": len(stats["parent_updates"]),
        "child_rows_linked": stats["child_rows_linked"],
        "medium_confidence_review_candidates": len(stats["medium_review_candidates"]),
        "failures": stats["failures"],
        "parent_updates": stats["parent_updates"],
        "child_links": stats["child_links"],
        "medium_pairs": [
            {
                "a_id": a["id"],
                "a_title": a["title"],
                "b_id": b["id"],
                "b_title": b["title"],
                "score": round(score, 4),
            }
            for a, b, score in stats["medium_review_candidates"]
        ],
    }
    print(json.dumps(out, indent=2))

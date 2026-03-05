#!/usr/bin/env python3
"""
Ingest provider exports from raw data directory into Obsidian notes.

Currently implemented:
- Claude export JSON (conversations.json)

Other providers are detected and reported as pending if no parser exists yet.
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable


DEFAULT_RAW_ROOT = Path(
    "/Users/tylersahagun/Library/Mobile Documents/com~apple~CloudDocs/data/raw"
)
DEFAULT_VAULT = Path(
    "/Users/tylersahagun/Library/Mobile Documents/com~apple~CloudDocs/data/obsidian-vault"
)
SUPPORTED_PROVIDERS = {"chatgpt", "claude", "cursor", "gemini", "perplexity"}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def safe_slug(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug[:80] if slug else "untitled"


def parse_iso(value: str) -> datetime:
    if not value:
        return datetime.now(timezone.utc)
    if value.endswith("Z"):
        value = value.replace("Z", "+00:00")
    return datetime.fromisoformat(value)


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def select_latest(paths: Iterable[Path]) -> Path | None:
    items = list(paths)
    if not items:
        return None
    return sorted(items, key=lambda p: p.stat().st_mtime, reverse=True)[0]


def render_claude_note(convo: dict, source_file: Path) -> tuple[str, str]:
    convo_id = convo.get("uuid", "")
    title = (convo.get("name") or "").strip() or f"Claude conversation {convo_id[:8]}"
    created_at = convo.get("created_at", "")
    updated_at = convo.get("updated_at", "")
    summary = (convo.get("summary") or "").strip()
    messages = convo.get("chat_messages") or []

    lines = []
    for idx, msg in enumerate(messages, start=1):
        role = msg.get("sender", "unknown")
        timestamp = msg.get("created_at", "")
        text = (msg.get("text") or "").strip()
        if not text:
            continue
        lines.append(f"### {idx}. {role} ({timestamp})")
        lines.append("")
        lines.append(text)
        lines.append("")

    message_block = "\n".join(lines).strip() or "_No text messages found._"
    frontmatter = [
        "---",
        f'title: "{title.replace(chr(34), chr(92) + chr(34))}"',
        'source: "llm-export"',
        'provider: "claude"',
        f'conversation_id: "{convo_id}"',
        f'created_at: "{created_at}"',
        f'updated_at: "{updated_at}"',
        f'imported_at: "{utc_now()}"',
        f'source_file: "{str(source_file)}"',
        f"message_count: {len(messages)}",
        "tags: [llm, claude, conversation]",
        "---",
        "",
    ]
    body = [
        f"# {title}",
        "",
        "## Summary",
        "",
        summary if summary else "_No summary provided in export._",
        "",
        "## Messages",
        "",
        message_block,
        "",
    ]

    note = "\n".join(frontmatter + body)
    filename = f"{safe_slug(title)}-{convo_id[:8] if convo_id else 'noid'}.md"
    return filename, note


def ingest_claude(raw_root: Path, vault_path: Path, limit: int | None = None) -> dict:
    convo_file = select_latest(raw_root.glob("claude/**/conversations.json"))
    if convo_file is None or not convo_file.exists():
        return {
            "provider": "claude",
            "status": "skipped",
            "reason": "No conversations.json found",
            "notes_written": 0,
        }

    data = json.loads(convo_file.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        return {
            "provider": "claude",
            "status": "failed",
            "reason": "Unexpected conversations payload",
            "notes_written": 0,
        }

    if limit is not None:
        data = data[:limit]

    created = 0
    updated = 0
    output_root = vault_path / "10_sources/providers/claude"

    for convo in data:
        filename, note = render_claude_note(convo, convo_file)
        dt = parse_iso(convo.get("created_at", ""))
        target = output_root / str(dt.year) / f"{dt.month:02d}" / filename
        existed = target.exists()
        write_text(target, note)
        if existed:
            updated += 1
        else:
            created += 1

    return {
        "provider": "claude",
        "status": "ok",
        "source_file": str(convo_file),
        "total_records": len(data),
        "notes_created": created,
        "notes_updated": updated,
    }


def detect_provider_state(raw_root: Path, provider: str) -> dict:
    p = raw_root / provider
    if not p.exists():
        return {"provider": provider, "status": "missing", "items": 0}
    items = [item for item in p.rglob("*") if item.is_file()]
    return {"provider": provider, "status": "detected", "items": len(items)}


def run(raw_root: Path, vault_path: Path, provider: str, limit: int | None = None) -> dict:
    run_id = utc_now()
    results = []

    providers = (
        sorted(SUPPORTED_PROVIDERS) if provider == "all" else [provider.lower()]
    )

    for item in providers:
        if item not in SUPPORTED_PROVIDERS:
            results.append({"provider": item, "status": "failed", "reason": "Unsupported"})
            continue

        if item == "claude":
            results.append(ingest_claude(raw_root, vault_path, limit=limit))
        else:
            state = detect_provider_state(raw_root, item)
            results.append(
                {
                    "provider": item,
                    "status": "pending_parser",
                    "detected_files": state["items"],
                    "reason": "Parser not implemented yet in this script",
                }
            )

    summary = {
        "generated_at": run_id,
        "raw_root": str(raw_root),
        "vault_path": str(vault_path),
        "provider_mode": provider,
        "results": results,
    }
    write_text(
        vault_path / "_system/reports/ingest-providers-report.json",
        json.dumps(summary, indent=2),
    )
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest LLM provider exports.")
    parser.add_argument("--raw-root", type=Path, default=DEFAULT_RAW_ROOT)
    parser.add_argument("--vault-path", type=Path, default=DEFAULT_VAULT)
    parser.add_argument(
        "--provider",
        type=str,
        default="all",
        help="Provider to ingest: all|chatgpt|claude|cursor|gemini|perplexity",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Optional record limit (useful for dry tests)",
    )
    args = parser.parse_args()
    result = run(args.raw_root, args.vault_path, args.provider, limit=args.limit)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Bootstrap an Obsidian vault for PM + LLM context workflows.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_VAULT = Path(
    "/Users/tylersahagun/Library/Mobile Documents/com~apple~CloudDocs/data/obsidian-vault"
)

FOLDERS = [
    "00_inbox",
    "10_sources/pm-workspace",
    "10_sources/providers/chatgpt",
    "10_sources/providers/claude",
    "10_sources/providers/cursor",
    "10_sources/providers/gemini",
    "10_sources/providers/perplexity",
    "20_entities/projects",
    "20_entities/people",
    "30_decisions",
    "40_context-packs",
    "_system/config",
    "_system/reports",
    "_system/templates",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build_templates(vault_path: Path) -> None:
    conversation_template = """---
title: "{{title}}"
source: "{{source}}"
provider: "{{provider}}"
conversation_id: "{{conversation_id}}"
created_at: "{{created_at}}"
updated_at: "{{updated_at}}"
imported_at: "{{imported_at}}"
project: "{{project}}"
tags: [llm, conversation]
---

# {{title}}

## Summary

{{summary}}

## Messages

{{messages}}
"""

    context_pack_template = """---
title: "{{date}} context pack"
pack_type: "daily"
generated_at: "{{generated_at}}"
tags: [context-pack]
---

# {{date}} Context Pack

## What changed

- 

## Open loops

- 

## Suggested focus

- 
"""

    write_file(vault_path / "_system/templates/conversation.md", conversation_template)
    write_file(vault_path / "_system/templates/context-pack.md", context_pack_template)


def build_config(vault_path: Path) -> None:
    config = {
        "schema_version": "v1",
        "created_at": utc_now(),
        "required_frontmatter": [
            "title",
            "source",
            "provider",
            "imported_at",
        ],
        "provider_directories": {
            "chatgpt": "10_sources/providers/chatgpt",
            "claude": "10_sources/providers/claude",
            "cursor": "10_sources/providers/cursor",
            "gemini": "10_sources/providers/gemini",
            "perplexity": "10_sources/providers/perplexity",
        },
        "report_directory": "_system/reports",
    }
    write_file(vault_path / "_system/config/pipeline.json", json.dumps(config, indent=2))


def bootstrap(vault_path: Path) -> dict:
    created = []
    for rel in FOLDERS:
        d = vault_path / rel
        d.mkdir(parents=True, exist_ok=True)
        created.append(str(d))

    build_templates(vault_path)
    build_config(vault_path)

    summary = {
        "vault_path": str(vault_path),
        "generated_at": utc_now(),
        "folders_created": len(FOLDERS),
        "status": "ok",
    }
    report_path = vault_path / "_system/reports/bootstrap-report.json"
    write_file(report_path, json.dumps(summary, indent=2))
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap an Obsidian vault.")
    parser.add_argument("--vault-path", type=Path, default=DEFAULT_VAULT)
    args = parser.parse_args()

    summary = bootstrap(args.vault_path)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()

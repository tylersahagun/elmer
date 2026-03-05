#!/usr/bin/env python3
"""
Webhook intake server for PM workspace signal routing.

Accepted endpoints:
  - POST /webhooks/askelephant
  - POST /webhooks/composio
  - GET  /health

Each accepted event is wrapped and appended to:
  pm-workspace-docs/inbox/webhook-events.jsonl

Usage:
  python3 webhook-server.py --port 3847
  PM_WEBHOOK_SECRET=... python3 webhook-server.py --port 3847
  python3 webhook-server.py --allow-unsigned
"""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import os
import threading
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import urlparse


SCRIPT_DIR = Path(__file__).parent
WORKSPACE_ROOT = SCRIPT_DIR.parent.parent
DEFAULT_QUEUE_PATH = WORKSPACE_ROOT / "inbox" / "webhook-events.jsonl"

WRITE_LOCK = threading.Lock()

SIGNATURE_HEADERS = [
    "webhook-signature",
    "x-webhook-signature",
    "x-askelephant-signature",
    "x-signature",
]

EVENT_TYPE_HEADERS = [
    "x-event-type",
    "x-askelephant-event",
    "x-composio-trigger",
]

EVENT_ID_HEADERS = [
    "x-event-id",
    "x-webhook-id",
    "x-composio-event-id",
    "x-request-id",
]


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def normalize_signature(raw_signature: str) -> str:
    value = raw_signature.strip()
    if "=" in value:
        value = value.split("=", 1)[1]
    return value.strip().lower()


def secure_compare_signature(secret: str, body: bytes, provided_signature: str) -> bool:
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, normalize_signature(provided_signature))


def first_header(headers: Any, candidates: list[str]) -> Optional[str]:
    for name in candidates:
        value = headers.get(name)
        if value:
            return value
    return None


def parse_json_body(raw_body: bytes) -> Dict[str, Any]:
    parsed = json.loads(raw_body.decode("utf-8"))
    if not isinstance(parsed, dict):
        raise ValueError("Webhook payload must be a JSON object")
    return parsed


def event_id_from_payload(payload: Dict[str, Any], raw_body: bytes, headers: Any) -> str:
    header_id = first_header(headers, EVENT_ID_HEADERS)
    if header_id:
        return header_id

    for key in ("event_id", "id", "webhook_id", "meeting_id"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()

    digest = hashlib.sha256(raw_body).hexdigest()[:20]
    return f"evt-{digest}"


def write_jsonl(path: Path, event: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(event, ensure_ascii=True)
    with WRITE_LOCK:
        with path.open("a", encoding="utf-8") as handle:
            handle.write(line + "\n")


class WebhookServer(ThreadingHTTPServer):
    def __init__(
        self,
        server_address: tuple[str, int],
        handler_class: type[BaseHTTPRequestHandler],
        queue_path: Path,
        secret: str,
        allow_unsigned: bool,
    ):
        super().__init__(server_address, handler_class)
        self.queue_path = queue_path
        self.secret = secret
        self.allow_unsigned = allow_unsigned


class RequestHandler(BaseHTTPRequestHandler):
    server: WebhookServer  # type: ignore[assignment]

    def _send_json(self, status: int, payload: Dict[str, Any]) -> None:
        response = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response)))
        self.end_headers()
        self.wfile.write(response)

    def _source_from_path(self) -> Optional[str]:
        path = urlparse(self.path).path.rstrip("/")
        if path == "/webhooks/askelephant":
            return "askelephant"
        if path == "/webhooks/composio":
            return "composio"
        return None

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path.rstrip("/")
        if path != "/health":
            self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Not found"})
            return
        self._send_json(
            HTTPStatus.OK,
            {
                "ok": True,
                "service": "pm-workspace-webhook-server",
                "timestamp": utc_now_iso(),
            },
        )

    def do_POST(self) -> None:  # noqa: N802
        source = self._source_from_path()
        if not source:
            self._send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "Unsupported endpoint"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid Content-Length"})
            return

        raw_body = self.rfile.read(content_length)
        if not raw_body:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Empty body"})
            return

        try:
            payload = parse_json_body(raw_body)
        except ValueError as exc:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(exc)})
            return
        except json.JSONDecodeError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": "Invalid JSON"})
            return

        signature = first_header(self.headers, SIGNATURE_HEADERS)
        if self.server.secret:
            if not signature:
                self._send_json(HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "Missing signature header"})
                return
            if not secure_compare_signature(self.server.secret, raw_body, signature):
                self._send_json(HTTPStatus.UNAUTHORIZED, {"ok": False, "error": "Invalid signature"})
                return
        elif not self.server.allow_unsigned:
            self._send_json(
                HTTPStatus.UNAUTHORIZED,
                {"ok": False, "error": "Unsigned requests are disabled. Set secret or pass --allow-unsigned"},
            )
            return

        event_id = event_id_from_payload(payload, raw_body, self.headers)
        event_type = first_header(self.headers, EVENT_TYPE_HEADERS) or str(
            payload.get("event_type") or payload.get("type") or "unknown"
        )

        envelope = {
            "event_id": event_id,
            "event_type": event_type,
            "source": source,
            "received_at": utc_now_iso(),
            "payload": payload,
        }

        write_jsonl(self.server.queue_path, envelope)
        self._send_json(
            HTTPStatus.ACCEPTED,
            {
                "ok": True,
                "event_id": event_id,
                "queued_at": envelope["received_at"],
            },
        )

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A003
        # Keep output compact for long-running local process.
        print(f"[{self.log_date_time_string()}] {format % args}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run PM workspace webhook intake server")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=3847, help="Bind port (default: 3847)")
    parser.add_argument(
        "--queue-path",
        default=str(DEFAULT_QUEUE_PATH),
        help=f"Path to JSONL queue file (default: {DEFAULT_QUEUE_PATH})",
    )
    parser.add_argument(
        "--secret-env",
        default="PM_WEBHOOK_SECRET",
        help="Environment variable containing shared secret",
    )
    parser.add_argument(
        "--allow-unsigned",
        action="store_true",
        help="Allow unsigned webhook requests (local testing only)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    queue_path = Path(args.queue_path).expanduser().resolve()
    secret = os.environ.get(args.secret_env, "")

    if not secret and not args.allow_unsigned:
        raise SystemExit(
            f"{args.secret_env} is not set and --allow-unsigned was not provided. "
            "Refusing to run an unsigned webhook intake server."
        )

    queue_path.parent.mkdir(parents=True, exist_ok=True)
    server = WebhookServer(
        (args.host, args.port),
        RequestHandler,
        queue_path=queue_path,
        secret=secret,
        allow_unsigned=args.allow_unsigned,
    )
    print(f"Webhook server listening on http://{args.host}:{args.port}")
    print(f"Queue file: {queue_path}")
    if secret:
        print(f"Signature verification: enabled ({args.secret_env})")
    else:
        print("Signature verification: disabled (--allow-unsigned)")
    server.serve_forever()


if __name__ == "__main__":
    main()

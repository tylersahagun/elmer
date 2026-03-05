#!/usr/bin/env python3
"""
LinkedIn job title enrichment script.

Adds linkedin_profile_url and linkedin_job_title columns (plus optional
linkedin_confidence and linkedin_source_url) to a CSV by:
1) Searching for LinkedIn profile URLs via a search API
2) Fetching profile HTML and extracting job titles

Usage:
  python pm-workspace-docs/scripts/linkedin_enrich.py \
    --input "/Users/tylersahagun/Downloads/job-title-research.csv" \
    --provider duckduckgo
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import os
import re
import time
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional, Tuple
from urllib.parse import urlencode, urlparse, urlunparse
from urllib.request import Request, urlopen


DEFAULT_INPUT = "/Users/tylersahagun/Downloads/job-title-research.csv"
DEFAULT_RATE_LIMIT = 1.0  # seconds
DEFAULT_TIMEOUT = 20
DEFAULT_CHECKPOINT_SUFFIX = ".checkpoint.json"
DEFAULT_QA_SUFFIX = ".qa.json"


@dataclass
class SearchResult:
    title: str
    link: str
    snippet: str


def read_json(path: str) -> Dict:
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: str, payload: Dict) -> None:
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)


def http_request(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    body: Optional[bytes] = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> bytes:
    request = Request(url, data=body, method=method)
    for key, value in (headers or {}).items():
        request.add_header(key, value)
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def rate_limit_sleep(last_call_ts: Optional[float], min_interval: float) -> float:
    now = time.time()
    if last_call_ts is None:
        return now
    elapsed = now - last_call_ts
    if elapsed < min_interval:
        time.sleep(min_interval - elapsed)
    return time.time()


def normalize_linkedin_url(raw_url: str) -> Optional[str]:
    if not raw_url:
        return None
    try:
        parsed = urlparse(raw_url)
    except Exception:
        return None

    hostname = parsed.netloc.lower()
    if "linkedin.com" not in hostname:
        return None

    path = parsed.path or ""
    if "/company/" in path or "/posts/" in path and "/in/" not in path:
        if "/posts/" in path:
            path = path.replace("/posts/", "/in/")
            path = path.split("_", 1)[0]
        else:
            return None

    if not path.startswith("/in/"):
        return None

    cleaned = urlunparse(
        ("https", "www.linkedin.com", path.rstrip("/"), "", "", "")
    )
    return cleaned


def extract_name_tokens(first_name: str, last_name: str) -> List[str]:
    return [t.lower() for t in [first_name.strip(), last_name.strip()] if t.strip()]


def score_candidate(
    result: SearchResult,
    first_name: str,
    last_name: str,
    company: str,
    company_domain: str,
) -> int:
    title = (result.title or "").lower()
    snippet = (result.snippet or "").lower()
    link = (result.link or "").lower()

    score = 0
    name_tokens = extract_name_tokens(first_name, last_name)
    full_name = " ".join(name_tokens).strip()

    if full_name and full_name in title:
        score += 5
    if full_name and full_name in snippet:
        score += 3

    if company and company.lower() in title:
        score += 3
    if company and company.lower() in snippet:
        score += 2
    if company_domain and company_domain.lower() in snippet:
        score += 2

    if "/in/" in link:
        score += 1
    if "linkedin.com/in" in link:
        score += 1

    if "linkedin" in title and not full_name:
        score -= 1

    return score


def search_serper(api_key: str, query: str) -> List[SearchResult]:
    payload = json.dumps({"q": query}).encode("utf-8")
    headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}
    data = http_request("https://google.serper.dev/search", method="POST", headers=headers, body=payload)
    response = json.loads(data.decode("utf-8"))
    results = []
    for item in response.get("organic", []):
        results.append(
            SearchResult(
                title=item.get("title", ""),
                link=item.get("link", ""),
                snippet=item.get("snippet", ""),
            )
        )
    return results


def search_serpapi(api_key: str, query: str) -> List[SearchResult]:
    params = urlencode({"engine": "google", "q": query, "api_key": api_key})
    url = f"https://serpapi.com/search.json?{params}"
    data = http_request(url)
    response = json.loads(data.decode("utf-8"))
    results = []
    for item in response.get("organic_results", []):
        results.append(
            SearchResult(
                title=item.get("title", ""),
                link=item.get("link", ""),
                snippet=item.get("snippet", ""),
            )
        )
    return results


def search_brave(api_key: str, query: str) -> List[SearchResult]:
    params = urlencode({"q": query})
    url = f"https://api.search.brave.com/res/v1/web/search?{params}"
    headers = {"X-Subscription-Token": api_key}
    data = http_request(url, headers=headers)
    response = json.loads(data.decode("utf-8"))
    results = []
    for item in response.get("web", {}).get("results", []):
        results.append(
            SearchResult(
                title=item.get("title", ""),
                link=item.get("url", ""),
                snippet=item.get("description", ""),
            )
        )
    return results


def search_duckduckgo(query: str) -> List[SearchResult]:
    params = urlencode({"q": query})
    url = f"https://duckduckgo.com/html/?{params}"
    headers = {"User-Agent": "Mozilla/5.0 (compatible; JobTitleEnricher/1.0)"}
    data = http_request(url, headers=headers)
    html_text = data.decode("utf-8", errors="ignore")
    results: List[SearchResult] = []
    for match in re.finditer(
        r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>',
        html_text,
        re.IGNORECASE | re.DOTALL,
    ):
        link = html.unescape(match.group(1))
        title = re.sub(r"<[^>]+>", "", match.group(2)).strip()
        results.append(SearchResult(title=title, link=link, snippet=""))
    return results


def search_web(provider: str, api_key: Optional[str], query: str) -> List[SearchResult]:
    if provider == "serper":
        if not api_key:
            raise ValueError("Missing API key for provider serper")
        return search_serper(api_key, query)
    if provider == "serpapi":
        if not api_key:
            raise ValueError("Missing API key for provider serpapi")
        return search_serpapi(api_key, query)
    if provider == "brave":
        if not api_key:
            raise ValueError("Missing API key for provider brave")
        return search_brave(api_key, query)
    if provider == "duckduckgo":
        return search_duckduckgo(query)
    raise ValueError(f"Unsupported provider: {provider}")


def pick_best_profile(
    results: Iterable[SearchResult],
    first_name: str,
    last_name: str,
    company: str,
    company_domain: str,
) -> Tuple[Optional[str], Optional[str]]:
    scored: List[Tuple[int, SearchResult, str]] = []
    for result in results:
        normalized = normalize_linkedin_url(result.link)
        if not normalized:
            continue
        scored.append(
            (
                score_candidate(result, first_name, last_name, company, company_domain),
                SearchResult(title=result.title, link=normalized, snippet=result.snippet),
                result.link,
            )
        )

    if not scored:
        return None, None
    scored.sort(key=lambda item: item[0], reverse=True)
    best = scored[0]
    return best[1].link, best[2]


def extract_og_title(html_text: str) -> Optional[str]:
    match = re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', html_text, re.IGNORECASE)
    if not match:
        return None
    return html.unescape(match.group(1)).strip()


def extract_headline(html_text: str) -> Optional[str]:
    match = re.search(r'"headline"\s*:\s*"([^"]+)"', html_text)
    if not match:
        return None
    return html.unescape(match.group(1)).strip()


def parse_job_title(og_title: Optional[str], headline: Optional[str]) -> Tuple[Optional[str], str]:
    if og_title:
        cleaned = og_title.replace("| LinkedIn", "").strip()
        if " – " in cleaned:
            parts = [p.strip() for p in cleaned.split(" – ")]
            if len(parts) >= 2:
                return parts[1], "high"
        if " - " in cleaned:
            parts = [p.strip() for p in cleaned.split(" - ")]
            if len(parts) >= 2:
                return parts[1], "high"

    if headline:
        return headline, "medium"

    return None, "low"


def fetch_profile_title(profile_url: str, rate_limit: float, last_call_ts: Optional[float]) -> Tuple[Optional[str], str, float]:
    last_call_ts = rate_limit_sleep(last_call_ts, rate_limit)
    headers = {"User-Agent": "Mozilla/5.0 (compatible; JobTitleEnricher/1.0)"}
    html_bytes = http_request(profile_url, headers=headers)
    html_text = html_bytes.decode("utf-8", errors="ignore")
    og_title = extract_og_title(html_text)
    headline = extract_headline(html_text)
    title, confidence = parse_job_title(og_title, headline)
    return title, confidence, last_call_ts


def safe_get(row: Dict[str, str], key: str) -> str:
    return (row.get(key) or "").strip()


def build_queries(first_name: str, last_name: str) -> List[str]:
    full_name = f"{first_name} {last_name}".strip()
    if not full_name:
        return []
    return [
        f"\"{full_name}\" site:linkedin.com/in",
        f"{full_name} site:linkedin.com/in",
        f"{full_name} site:linkedin.com",
    ]


def load_rows(path: str) -> Tuple[List[Dict[str, str]], List[str]]:
    with open(path, "r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fieldnames = list(reader.fieldnames or [])
    return rows, fieldnames


def write_rows(path: str, rows: List[Dict[str, str]], fieldnames: List[str]) -> None:
    tmp_path = f"{path}.tmp"
    with open(tmp_path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    os.replace(tmp_path, path)


def ensure_columns(fieldnames: List[str], new_fields: List[str]) -> List[str]:
    updated = list(fieldnames)
    for field in new_fields:
        if field not in updated:
            updated.append(field)
    return updated


def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich CSV with LinkedIn profile URLs and job titles.")
    parser.add_argument("--input", default=DEFAULT_INPUT, help="Path to CSV input")
    parser.add_argument("--provider", choices=["serper", "serpapi", "brave", "duckduckgo"], required=True)
    parser.add_argument("--api-key", default=None, help="Search API key (or env var)")
    parser.add_argument("--rate-limit-search", type=float, default=DEFAULT_RATE_LIMIT)
    parser.add_argument("--rate-limit-profile", type=float, default=DEFAULT_RATE_LIMIT)
    parser.add_argument("--checkpoint", default=None, help="Checkpoint JSON path")
    parser.add_argument("--max-rows", type=int, default=None)
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get(f"{args.provider.upper()}_API_KEY")
    if args.provider in {"serper", "serpapi", "brave"} and not api_key:
        raise SystemExit(f"Missing API key for provider {args.provider}")

    checkpoint_path = args.checkpoint or f"{args.input}{DEFAULT_CHECKPOINT_SUFFIX}"
    checkpoint = read_json(checkpoint_path)
    searched_ids = set(checkpoint.get("searched_ids", []))
    fetched_ids = set(checkpoint.get("fetched_ids", []))

    rows, fieldnames = load_rows(args.input)
    fieldnames = ensure_columns(
        fieldnames,
        ["linkedin_profile_url", "linkedin_job_title", "linkedin_confidence", "linkedin_source_url"],
    )

    search_last_ts = None
    fetch_last_ts = None

    # Pass 1: search LinkedIn profile URLs
    for idx, row in enumerate(rows):
        if args.max_rows and idx >= args.max_rows:
            break
        row_id = row.get("id") or str(idx)
        if row_id in searched_ids:
            continue

        if safe_get(row, "linkedin_profile_url"):
            searched_ids.add(row_id)
            continue

        first_name = safe_get(row, "first_name")
        last_name = safe_get(row, "last_name")
        company = safe_get(row, "company_name")
        company_domain = safe_get(row, "company_domain")

        queries = build_queries(first_name, last_name)
        best_url = None
        source_url = None

        for query in queries:
            search_last_ts = rate_limit_sleep(search_last_ts, args.rate_limit_search)
            for attempt in range(3):
                try:
                    results = search_web(args.provider, api_key, query)
                    best_url, source_url = pick_best_profile(
                        results, first_name, last_name, company, company_domain
                    )
                    break
                except Exception:
                    time.sleep(2 ** attempt)
            if best_url:
                break

        if best_url:
            row["linkedin_profile_url"] = best_url
            row["linkedin_source_url"] = source_url or best_url

        searched_ids.add(row_id)
        if idx % 50 == 0:
            write_json(
                checkpoint_path,
                {"searched_ids": list(searched_ids), "fetched_ids": list(fetched_ids)},
            )

    # Pass 2: fetch profile and extract job title
    for idx, row in enumerate(rows):
        if args.max_rows and idx >= args.max_rows:
            break
        row_id = row.get("id") or str(idx)
        if row_id in fetched_ids:
            continue

        profile_url = safe_get(row, "linkedin_profile_url")
        if not profile_url or safe_get(row, "linkedin_job_title"):
            fetched_ids.add(row_id)
            continue

        for attempt in range(3):
            try:
                title, confidence, fetch_last_ts = fetch_profile_title(
                    profile_url, args.rate_limit_profile, fetch_last_ts
                )
                if title:
                    row["linkedin_job_title"] = title
                    row["linkedin_confidence"] = confidence
                else:
                    row["linkedin_confidence"] = "low"
                break
            except Exception:
                time.sleep(2 ** attempt)

        fetched_ids.add(row_id)
        if idx % 50 == 0:
            write_json(
                checkpoint_path,
                {"searched_ids": list(searched_ids), "fetched_ids": list(fetched_ids)},
            )

    # Write updated CSV in place
    write_rows(args.input, rows, fieldnames)

    # QA report
    total = len(rows)
    with_urls = sum(1 for row in rows if safe_get(row, "linkedin_profile_url"))
    with_titles = sum(1 for row in rows if safe_get(row, "linkedin_job_title"))
    failures = total - with_titles
    qa_report = {
        "total_rows": total,
        "linkedin_urls_found": with_urls,
        "linkedin_titles_found": with_titles,
        "title_failures": failures,
    }
    write_json(f"{args.input}{DEFAULT_QA_SUFFIX}", qa_report)

    write_json(
        checkpoint_path,
        {"searched_ids": list(searched_ids), "fetched_ids": list(fetched_ids)},
    )


if __name__ == "__main__":
    main()

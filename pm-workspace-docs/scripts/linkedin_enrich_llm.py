#!/usr/bin/env python3
"""
LinkedIn job title enrichment script using LLM-powered web search.

Uses Perplexity Sonar API for LinkedIn profile discovery, then HTML parsing
to extract job titles. Falls back to DuckDuckGo if Perplexity doesn't find
a profile.

Two-pass approach:
  Pass 1: Search for LinkedIn profile URLs via Perplexity Sonar
  Pass 2: Fetch profile HTML and extract job titles

Usage:
  export PERPLEXITY_API_KEY="pplx-..."
  python pm-workspace-docs/scripts/linkedin_enrich_llm.py \
    --input "/Users/tylersahagun/Downloads/job-title-research.csv" \
    --rate-limit 1.0 \
    --max-rows 100
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
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlencode, urlparse, urlunparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


# === Configuration ===

DEFAULT_INPUT = "/Users/tylersahagun/Downloads/job-title-research.csv"
DEFAULT_RATE_LIMIT_SEARCH = 1.0  # seconds between Perplexity requests
DEFAULT_RATE_LIMIT_FETCH = 2.0  # seconds between LinkedIn fetches
DEFAULT_TIMEOUT = 30
DEFAULT_CHECKPOINT_INTERVAL = 25
CHECKPOINT_SUFFIX = ".checkpoint.json"
QA_SUFFIX = ".qa.json"

PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
PERPLEXITY_MODEL = "sonar"


# === Data Classes ===

@dataclass
class SearchResult:
    """A search result from DuckDuckGo fallback."""
    title: str
    link: str
    snippet: str


# === Utility Functions ===

def read_json(path: str) -> Dict:
    """Read JSON file, return empty dict if not exists."""
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: str, payload: Dict) -> None:
    """Write JSON file with pretty formatting."""
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, sort_keys=True)


def http_request(
    url: str,
    method: str = "GET",
    headers: Optional[Dict[str, str]] = None,
    body: Optional[bytes] = None,
    timeout: int = DEFAULT_TIMEOUT,
) -> bytes:
    """Make HTTP request and return response bytes."""
    request = Request(url, data=body, method=method)
    for key, value in (headers or {}).items():
        request.add_header(key, value)
    with urlopen(request, timeout=timeout) as response:
        return response.read()


def rate_limit_sleep(last_call_ts: Optional[float], min_interval: float) -> float:
    """Sleep if needed to maintain rate limit, return current timestamp."""
    now = time.time()
    if last_call_ts is not None:
        elapsed = now - last_call_ts
        if elapsed < min_interval:
            time.sleep(min_interval - elapsed)
    return time.time()


def safe_get(row: Dict[str, str], key: str) -> str:
    """Safely get string value from row dict."""
    return (row.get(key) or "").strip()


def normalize_linkedin_url(raw_url: str) -> Optional[str]:
    """
    Normalize a LinkedIn profile URL to canonical format.
    Returns None if not a valid profile URL.
    """
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
    
    # Handle posts URLs that might contain profile info
    if "/posts/" in path and "/in/" not in path:
        path = path.replace("/posts/", "/in/")
        path = path.split("_", 1)[0]
    
    # Reject company pages
    if "/company/" in path and "/in/" not in path:
        return None

    if not path.startswith("/in/"):
        return None

    # Clean and rebuild URL
    cleaned = urlunparse(
        ("https", "www.linkedin.com", path.rstrip("/"), "", "", "")
    )
    return cleaned


def extract_linkedin_url_from_text(text: str) -> Optional[str]:
    """Extract and normalize LinkedIn profile URL from text."""
    # Pattern to match LinkedIn URLs
    patterns = [
        r'https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+/?',
        r'linkedin\.com/in/[a-zA-Z0-9_-]+/?',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            url = match.group(0)
            if not url.startswith("http"):
                url = "https://" + url
            normalized = normalize_linkedin_url(url)
            if normalized:
                return normalized
    
    return None


# === Pass 1: LinkedIn URL Discovery ===

def search_linkedin_perplexity(
    first_name: str,
    last_name: str,
    company: str,
    api_key: str,
    timeout: int = DEFAULT_TIMEOUT,
) -> Tuple[Optional[str], str]:
    """
    Search for LinkedIn profile URL using Perplexity Sonar API.
    
    Returns:
        (url, source) where source is "perplexity_sonar" or None if not found
    """
    full_name = f"{first_name} {last_name}".strip()
    if not full_name:
        return None, "no_name"
    
    # Build prompt for Perplexity
    prompt = f"""Find the LinkedIn profile URL for this person:

Name: {full_name}
Company: {company}

Instructions:
1. Search for their LinkedIn profile at linkedin.com/in/
2. Return ONLY the full LinkedIn profile URL (e.g., https://linkedin.com/in/username)
3. If you cannot find a matching profile with high confidence, respond with exactly: NOT_FOUND
4. Do not guess or return similar names - only return if confident it's the right person"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    payload = json.dumps({
        "model": PERPLEXITY_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,  # Low temperature for factual responses
        "max_tokens": 200,
    }).encode("utf-8")
    
    try:
        response_bytes = http_request(
            PERPLEXITY_API_URL,
            method="POST",
            headers=headers,
            body=payload,
            timeout=timeout,
        )
        response = json.loads(response_bytes.decode("utf-8"))
        
        # Extract content from response
        content = response.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        if "NOT_FOUND" in content.upper():
            return None, "perplexity_not_found"
        
        # Try to extract LinkedIn URL from response
        url = extract_linkedin_url_from_text(content)
        if url:
            return url, "perplexity_sonar"
        
        return None, "perplexity_no_url"
        
    except HTTPError as e:
        log(f"  Perplexity API error: {e.code} {e.reason}")
        return None, f"perplexity_error_{e.code}"
    except URLError as e:
        log(f"  Perplexity network error: {e.reason}")
        return None, "perplexity_network_error"
    except Exception as e:
        print(f"  Perplexity exception: {e}")
        return None, "perplexity_exception"


def search_duckduckgo(query: str) -> List[SearchResult]:
    """Search DuckDuckGo and return results (fallback method)."""
    params = urlencode({"q": query})
    url = f"https://duckduckgo.com/html/?{params}"
    headers = {"User-Agent": "Mozilla/5.0 (compatible; JobTitleEnricher/1.0)"}
    
    try:
        data = http_request(url, headers=headers, timeout=DEFAULT_TIMEOUT)
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
    except Exception as e:
        log(f"  DuckDuckGo error: {e}")
        return []


def search_linkedin_duckduckgo(
    first_name: str,
    last_name: str,
    company: str,
) -> Tuple[Optional[str], str]:
    """
    Fallback: Search for LinkedIn profile using DuckDuckGo.
    
    Returns:
        (url, source) where source is "duckduckgo_fallback" or None if not found
    """
    full_name = f"{first_name} {last_name}".strip()
    if not full_name:
        return None, "no_name"
    
    # Try multiple query variations
    queries = [
        f'"{full_name}" site:linkedin.com/in',
        f'{full_name} {company} site:linkedin.com/in',
        f'{full_name} site:linkedin.com',
    ]
    
    name_tokens = [t.lower() for t in [first_name.strip(), last_name.strip()] if t]
    
    for query in queries:
        results = search_duckduckgo(query)
        
        for result in results:
            normalized = normalize_linkedin_url(result.link)
            if not normalized:
                continue
            
            # Basic validation: check if name appears in title
            title_lower = result.title.lower()
            if any(token in title_lower for token in name_tokens):
                return normalized, "duckduckgo_fallback"
    
    return None, "duckduckgo_not_found"


# === Pass 2: Job Title Extraction ===

def extract_og_title(html_text: str) -> Optional[str]:
    """Extract og:title meta tag content from HTML."""
    match = re.search(
        r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"',
        html_text,
        re.IGNORECASE
    )
    if not match:
        # Try alternate format
        match = re.search(
            r'<meta[^>]+content="([^"]+)"[^>]+property="og:title"',
            html_text,
            re.IGNORECASE
        )
    if not match:
        return None
    return html.unescape(match.group(1)).strip()


def extract_headline(html_text: str) -> Optional[str]:
    """Extract headline from LinkedIn JSON-LD or inline JSON."""
    match = re.search(r'"headline"\s*:\s*"([^"]+)"', html_text)
    if not match:
        return None
    return html.unescape(match.group(1)).strip()


def parse_job_title_from_og(og_title: Optional[str]) -> Optional[str]:
    """
    Parse job title from og:title which typically has format:
    "Name - Title | LinkedIn" or "Name – Title | LinkedIn"
    """
    if not og_title:
        return None
    
    # Remove LinkedIn suffix
    cleaned = og_title.replace("| LinkedIn", "").strip()
    
    # Split on common separators
    for separator in [" – ", " - ", " — "]:
        if separator in cleaned:
            parts = [p.strip() for p in cleaned.split(separator)]
            if len(parts) >= 2:
                # Second part is usually the title
                return parts[1]
    
    return None


def fetch_job_title(
    profile_url: str,
    timeout: int = DEFAULT_TIMEOUT,
) -> Tuple[Optional[str], str]:
    """
    Fetch LinkedIn profile and extract job title.
    
    Returns:
        (job_title, confidence) where confidence is "high", "medium", or "low"
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
    }
    
    try:
        html_bytes = http_request(profile_url, headers=headers, timeout=timeout)
        html_text = html_bytes.decode("utf-8", errors="ignore")
        
        # Try og:title first (most reliable)
        og_title = extract_og_title(html_text)
        job_title = parse_job_title_from_og(og_title)
        
        if job_title:
            return job_title, "high"
        
        # Fall back to headline JSON
        headline = extract_headline(html_text)
        if headline:
            return headline, "medium"
        
        # If we got og_title but couldn't parse title, return what we have
        if og_title:
            return og_title, "low"
        
        return None, "low"
        
    except HTTPError as e:
        print(f"  LinkedIn fetch error: {e.code}")
        return None, "fetch_error"
    except Exception as e:
        log(f"  LinkedIn fetch exception: {e}")
        return None, "fetch_error"


# === CSV Operations ===

def load_rows(path: str) -> Tuple[List[Dict[str, str]], List[str]]:
    """Load CSV rows and fieldnames."""
    with open(path, "r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fieldnames = list(reader.fieldnames or [])
    return rows, fieldnames


def write_rows(path: str, rows: List[Dict[str, str]], fieldnames: List[str]) -> None:
    """Write rows to CSV, using atomic write."""
    tmp_path = f"{path}.tmp"
    with open(tmp_path, "w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    os.replace(tmp_path, path)


def ensure_columns(fieldnames: List[str], new_fields: List[str]) -> List[str]:
    """Add new columns if they don't exist."""
    updated = list(fieldnames)
    for field in new_fields:
        if field not in updated:
            updated.append(field)
    return updated


# === Main Processing ===

def log(msg: str) -> None:
    """Print with immediate flush for visibility."""
    print(msg, flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Enrich CSV with LinkedIn profile URLs and job titles using LLM search."
    )
    parser.add_argument(
        "--input",
        default=DEFAULT_INPUT,
        help="Path to CSV input file"
    )
    parser.add_argument(
        "--api-key",
        default=None,
        help="Perplexity API key (or set PERPLEXITY_API_KEY env var)"
    )
    parser.add_argument(
        "--rate-limit-search",
        type=float,
        default=DEFAULT_RATE_LIMIT_SEARCH,
        help="Seconds between search API calls"
    )
    parser.add_argument(
        "--rate-limit-fetch",
        type=float,
        default=DEFAULT_RATE_LIMIT_FETCH,
        help="Seconds between LinkedIn profile fetches"
    )
    parser.add_argument(
        "--max-rows",
        type=int,
        default=None,
        help="Maximum rows to process (for testing)"
    )
    parser.add_argument(
        "--skip-pass1",
        action="store_true",
        help="Skip Pass 1 (URL discovery), only run Pass 2"
    )
    parser.add_argument(
        "--skip-pass2",
        action="store_true",
        help="Skip Pass 2 (title extraction), only run Pass 1"
    )
    parser.add_argument(
        "--checkpoint-interval",
        type=int,
        default=DEFAULT_CHECKPOINT_INTERVAL,
        help="Save checkpoint every N rows"
    )
    args = parser.parse_args()

    # Get API key
    api_key = args.api_key or os.environ.get("PERPLEXITY_API_KEY")
    if not api_key and not args.skip_pass1:
        log("Warning: No Perplexity API key provided. Will use DuckDuckGo fallback only.")
        log("Set PERPLEXITY_API_KEY env var or use --api-key for better results.")
    
    # Load checkpoint
    checkpoint_path = f"{args.input}{CHECKPOINT_SUFFIX}"
    checkpoint = read_json(checkpoint_path)
    searched_ids = set(checkpoint.get("searched_ids", []))
    fetched_ids = set(checkpoint.get("fetched_ids", []))
    
    # Load CSV
    log(f"Loading CSV: {args.input}")
    rows, fieldnames = load_rows(args.input)
    fieldnames = ensure_columns(
        fieldnames,
        ["linkedin_profile_url", "linkedin_job_title", "linkedin_confidence", "linkedin_source"],
    )
    
    total_rows = len(rows)
    max_rows = args.max_rows or total_rows
    log(f"Total rows: {total_rows}, Processing: {min(max_rows, total_rows)}")
    
    search_last_ts = None
    fetch_last_ts = None
    
    # === Pass 1: LinkedIn URL Discovery ===
    if not args.skip_pass1:
        log("\n=== Pass 1: LinkedIn URL Discovery ===")
        pass1_found = 0
        pass1_skipped = 0
        pass1_failed = 0
        
        for idx, row in enumerate(rows):
            if idx >= max_rows:
                break
            
            row_id = row.get("id") or str(idx)
            
            # Skip if already searched
            if row_id in searched_ids:
                pass1_skipped += 1
                continue
            
            # Skip if already has URL
            if safe_get(row, "linkedin_profile_url"):
                searched_ids.add(row_id)
                pass1_skipped += 1
                continue
            
            first_name = safe_get(row, "first_name")
            last_name = safe_get(row, "last_name")
            company = safe_get(row, "company_name")
            
            log(f"[{idx+1}/{max_rows}] Searching: {first_name} {last_name} @ {company}")
            
            url = None
            source = None
            
            # Try Perplexity first
            if api_key:
                search_last_ts = rate_limit_sleep(search_last_ts, args.rate_limit_search)
                url, source = search_linkedin_perplexity(first_name, last_name, company, api_key)
                if url:
                    log(f"  Found via Perplexity: {url}")
            
            # Fall back to DuckDuckGo
            if not url:
                search_last_ts = rate_limit_sleep(search_last_ts, args.rate_limit_search)
                url, source = search_linkedin_duckduckgo(first_name, last_name, company)
                if url:
                    log(f"  Found via DuckDuckGo: {url}")
            
            if url:
                row["linkedin_profile_url"] = url
                row["linkedin_source"] = source
                pass1_found += 1
            else:
                row["linkedin_source"] = source
                pass1_failed += 1
                log(f"  Not found ({source})")
            
            searched_ids.add(row_id)
            
            # Checkpoint
            if (idx + 1) % args.checkpoint_interval == 0:
                write_json(checkpoint_path, {
                    "searched_ids": list(searched_ids),
                    "fetched_ids": list(fetched_ids),
                })
                write_rows(args.input, rows, fieldnames)
                print(f"  [Checkpoint saved at row {idx+1}]")
        
        print(f"\nPass 1 complete: Found {pass1_found}, Skipped {pass1_skipped}, Failed {pass1_failed}")
    
    # === Pass 2: Job Title Extraction ===
    if not args.skip_pass2:
        log("\n=== Pass 2: Job Title Extraction ===")
        pass2_extracted = 0
        pass2_skipped = 0
        pass2_failed = 0
        
        for idx, row in enumerate(rows):
            if idx >= max_rows:
                break
            
            row_id = row.get("id") or str(idx)
            
            # Skip if already fetched
            if row_id in fetched_ids:
                pass2_skipped += 1
                continue
            
            # Skip if no URL or already has title
            profile_url = safe_get(row, "linkedin_profile_url")
            if not profile_url:
                fetched_ids.add(row_id)
                pass2_skipped += 1
                continue
            
            if safe_get(row, "linkedin_job_title"):
                fetched_ids.add(row_id)
                pass2_skipped += 1
                continue
            
            first_name = safe_get(row, "first_name")
            last_name = safe_get(row, "last_name")
            
            print(f"[{idx+1}/{max_rows}] Fetching title: {first_name} {last_name}")
            
            fetch_last_ts = rate_limit_sleep(fetch_last_ts, args.rate_limit_fetch)
            
            # Retry logic
            job_title = None
            confidence = "low"
            for attempt in range(3):
                job_title, confidence = fetch_job_title(profile_url)
                if job_title or confidence != "fetch_error":
                    break
                log(f"  Retry {attempt + 1}/3...")
                time.sleep(2 ** attempt)
            
            if job_title:
                row["linkedin_job_title"] = job_title
                row["linkedin_confidence"] = confidence
                log(f"  Title: {job_title} (confidence: {confidence})")
                pass2_extracted += 1
            else:
                row["linkedin_confidence"] = confidence
                log(f"  No title extracted (confidence: {confidence})")
                pass2_failed += 1
            
            fetched_ids.add(row_id)
            
            # Checkpoint
            if (idx + 1) % args.checkpoint_interval == 0:
                write_json(checkpoint_path, {
                    "searched_ids": list(searched_ids),
                    "fetched_ids": list(fetched_ids),
                })
                write_rows(args.input, rows, fieldnames)
                log(f"  [Checkpoint saved at row {idx+1}]")
        
        log(f"\nPass 2 complete: Extracted {pass2_extracted}, Skipped {pass2_skipped}, Failed {pass2_failed}")
    
    # === Final Save ===
    print("\n=== Saving Results ===")
    write_rows(args.input, rows, fieldnames)
    write_json(checkpoint_path, {
        "searched_ids": list(searched_ids),
        "fetched_ids": list(fetched_ids),
    })
    
    # === QA Report ===
    total = len(rows)
    with_urls = sum(1 for row in rows if safe_get(row, "linkedin_profile_url"))
    with_titles = sum(1 for row in rows if safe_get(row, "linkedin_job_title"))
    high_conf = sum(1 for row in rows if safe_get(row, "linkedin_confidence") == "high")
    medium_conf = sum(1 for row in rows if safe_get(row, "linkedin_confidence") == "medium")
    low_conf = sum(1 for row in rows if safe_get(row, "linkedin_confidence") == "low")
    
    qa_report = {
        "total_rows": total,
        "linkedin_urls_found": with_urls,
        "linkedin_titles_found": with_titles,
        "high_confidence": high_conf,
        "medium_confidence": medium_conf,
        "low_confidence": low_conf,
        "not_found": total - with_titles,
    }
    
    qa_path = f"{args.input}{QA_SUFFIX}"
    write_json(qa_path, qa_report)
    
    log(f"\nQA Report saved to: {qa_path}")
    log(json.dumps(qa_report, indent=2))
    log("\nDone!")


if __name__ == "__main__":
    main()

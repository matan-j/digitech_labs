---
name: yt-search
description: Search YouTube for the latest trending videos on any topic. Returns structured results with titles, channels, view counts, publication dates, and content summaries. Use when the user asks to find YouTube videos, search for trending content, or research what creators are making about a subject.
argument-hint: <topic> [--limit N] [--year YYYY]
disable-model-invocation: false
allowed-tools: WebSearch WebFetch
---

# yt-search — YouTube Trend Scanner

Search YouTube for the most relevant, trending videos on a given topic. Return structured, actionable results.

## How to Use

Invoke with: `/yt-search <topic>`

Examples:
- `/yt-search Claude Code skills`
- `/yt-search Claude Code MCP hooks 2026`
- `/yt-search AI coding tools comparison`

---

## Execution Flow

### Step 1 — Run parallel searches

Search for the topic from multiple angles simultaneously:

1. `"$ARGUMENTS" YouTube trending 2025 2026` — general trending
2. `"$ARGUMENTS" YouTube tutorial most viewed` — tutorial content
3. `"$ARGUMENTS" site:youtube.com` — direct YouTube search
4. `"$ARGUMENTS" YouTube channel views viral` — viral/high-view content
5. `"$ARGUMENTS" YouTube creator review breakdown` — creator analysis videos

Use WebSearch for all 5 queries. Run them in parallel when possible.

### Step 2 — Fetch deeper data (optional)

For any result with a direct YouTube URL or article that reviews multiple videos:
- Fetch the page with WebFetch
- Extract: video title, creator name, view count, upload date, key topics covered, why it's valuable

### Step 3 — Deduplicate and rank

Remove duplicate videos. Rank results by:
1. View count (highest first)
2. Recency (2026 > 2025)
3. Relevance to the exact topic

### Step 4 — Output structured results

---

## Output Format

Always output results in this exact structure:

```
YT-SEARCH RESULTS
Topic: <topic searched>
Date searched: <today's date>
Videos found: <N>
─────────────────────────────────────────────

[1] VIDEO TITLE
    Channel: <channel name>
    Views: <view count or estimate>
    Published: <date or approximate>
    URL: <YouTube URL if available>
    Topics covered: <bullet list of 3-5 key topics>
    Why valuable: <1-2 sentence summary of what makes this video useful>
    Trending signal: <HIGH / MEDIUM / LOW based on views + recency>

[2] ...

─────────────────────────────────────────────
TOP TRENDS OBSERVED:
- <Pattern 1 across these videos>
- <Pattern 2>
- <Pattern 3>

RECOMMENDED WATCH ORDER: [N], [N], [N] (for the most complete coverage)
```

---

## Rules

1. Never fabricate view counts — use estimates if exact number is unavailable, and mark as "~"
2. Always state if a video is behind a paywall or requires subscription
3. If no YouTube results are found directly, find articles/roundups that review YouTube content on the topic
4. Include non-English videos only if they rank very high and note the language
5. Minimum 5 results, maximum 15 results
6. Flag videos older than 18 months with: `⚠️ May be outdated`
7. If a video is part of a series, note it: `Part N of M-part series`

---

## Fallback Strategy

If direct YouTube search yields few results:
1. Search for "[topic] tutorial" on Reddit, Medium, DEV.to
2. Search for "[topic] YouTube roundup" or "best [topic] videos"
3. Search for "[topic] channel" to find creator channels that cover this topic
4. Report what was found with transparency about the search strategy used

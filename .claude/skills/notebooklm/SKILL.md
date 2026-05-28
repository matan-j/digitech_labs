---
name: notebooklm
description: Deep research synthesis engine. Accepts any combination of sources (YouTube video summaries, URLs, documents, pasted text) — extracts key insights, maps themes, identifies gaps, and generates a visual HTML infographic. Runs entirely inside Claude Code with no external tool dependency. Use when the user wants to synthesize research, analyze multiple sources, or produce a visual knowledge blueprint.
argument-hint: <sources or topic> [--style blueprint|handwritten|minimal] [--output analysis|infographic|both]
disable-model-invocation: false
---

# notebooklm — Research Synthesis Engine

Claude-powered synthesis engine. Replicates the core value of NotebookLM — source ingestion, cross-source analysis, insight extraction, and visual output — without any dependency on external tools, browser automation, or Google accounts.

**Works for every team member from any machine. No setup required.**

## How to Use

Invoke with: `/notebooklm <sources or context>`

Examples:
- `/notebooklm [paste video summaries or URLs here]`
- `/notebooklm Claude Code skills research --output both`
- `/notebooklm [topic] --style blueprint`

---

## Phase 1 — Source Ingestion

Accept any combination of:
- YouTube video summaries (from `/yt-search` output)
- Direct URLs (fetch with WebFetch)
- Pasted text blocks
- Topic name only (search with WebSearch first)

If only a topic is provided, run 3-4 WebSearch queries to collect source material before analysis.

---

## Phase 2 — Deep Analysis

Process all sources and extract:

### A. Key Themes
Identify 5-8 major themes that appear across sources. For each theme:
- Theme name
- How many sources mention it
- Most important insight per theme
- Contradictions or debates across sources

### B. Top Entities
Extract recurring: tools, people, companies, concepts, metrics.
Map their frequency and importance across sources.

### C. Knowledge Gaps
What do the sources NOT cover? What questions remain unanswered?

### D. Surprising Findings
What's counterintuitive, controversial, or unexpected?

### E. Source Quality Assessment
Rate each source: PRIMARY (original research/data) / SECONDARY (analysis) / TERTIARY (opinion/aggregation)

---

## Phase 3 — Synthesis Document

Write a structured analysis in this format:

```
NOTEBOOKLM SYNTHESIS
Topic: <topic>
Sources analyzed: <N>
Date: <today>
─────────────────────────────────────

## Executive Summary
<3-4 sentences: what do these sources collectively say? What's the main takeaway?>

## Top 5 Insights
1. [Insight] — supported by [source N, N]
2. ...

## Key Themes Map
[Theme 1]: [brief description] — appears in X/N sources
[Theme 2]: ...

## Contradictions & Debates
- [Point A] vs [Point B]: sources disagree on...

## Knowledge Gaps
- [What's missing from the current discourse]

## Recommended Actions / Next Steps
1. ...

## Source Quality Breakdown
- PRIMARY: [list]
- SECONDARY: [list]
─────────────────────────────────────
```

---

## Phase 4 — Visual Infographic (HTML)

Generate a self-contained HTML infographic file. Save it as `notebooklm-infographic.html` in the current directory.

### Style Options

**blueprint** (default): Dark navy background (#0a1628), white/cyan lines, graph paper grid, drafting aesthetic
**handwritten**: Cream paper background, dark ink, sketch-style borders, hand-drawn feeling
**minimal**: White background, clean typography, simple data visualization

### Infographic Structure

The HTML infographic must include these sections:

1. **Hero Header** — Topic title + subtitle + date
2. **Top Insights Panel** — 5 key insights as numbered cards
3. **Themes Visualization** — Bubble chart or grid showing themes by frequency
4. **Top Skills/Tools Ranking** — Bar chart or ranked list with install/star counts
5. **Source Quality Breakdown** — Visual pie or badge system
6. **Knowledge Gaps** — "Missing pieces" section
7. **Key Quote** — Most compelling quote or stat from the research

### Blueprint Style Specifications

```css
Background: #0a1628 (dark navy)
Grid: rgba(100, 149, 237, 0.15) (cornflower blue, light)
Primary text: #e8f4fd (near white)
Accent lines: #4fc3f7 (cyan blue)
Highlight: #ffd54f (amber yellow)
Secondary: #81c784 (mint green)
Font: "Courier New" or monospace for labels
Header font: bold sans-serif, uppercase, letter-spaced
Borders: 1-2px solid rgba(79, 195, 247, 0.6)
Corner marks: engineering drawing corner brackets
Annotations: handwritten-style angled labels
Stamp/badge elements: circular seals with "VERIFIED" / "TRENDING" / "OFFICIAL"
```

### Handwritten Style Specifications

```css
Background: #fef9f0 (warm cream)
Paper texture: repeating subtle lines or dot grid
Primary text: #1a1a2e (near black ink)
Accent: #c0392b (red ink highlights)
Secondary: #2c3e50 (dark blue ink)
Font: "Patrick Hand", "Caveat", or serif with slight irregularity
Borders: rough, slightly uneven
Elements: hand-drawn circles, arrows, underlines
Stars/checkmarks: sketch style
```

### Required HTML Features

- Fully self-contained (no external dependencies except Google Fonts CDN)
- Responsive layout
- Print-friendly (works at A4 / Letter size)
- CSS animations subtle (fade-in on load, max 0.5s)
- Dark/Light toggle if blueprint style
- All data rendered as actual HTML elements (not images)

---

## Output Checklist

Before completing, verify:
- [ ] Synthesis document is written
- [ ] HTML infographic is generated and saved
- [ ] At least 5 insights identified
- [ ] All sources credited
- [ ] File path reported to user

## Supporting Files

- See [templates/blueprint.md](templates/blueprint.md) for the full HTML blueprint template
- See [templates/handwritten.md](templates/handwritten.md) for the handwritten style template

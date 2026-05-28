---
name: yt-analyze
description: Deep analysis of a YouTube video. Takes a URL or transcript and produces: key insights, core concepts, target audience profile, pedagogic potential, content map, and Digitech course fit assessment. Use when evaluating a video as source material for a course, or when understanding what a video teaches and how.
argument-hint: <youtube-url or transcript> [--purpose course|research|summary] [--audience grade-7|grade-10|adult]
disable-model-invocation: false
---

# yt-analyze — YouTube Video Deep Analyzer

Takes a YouTube URL or pasted transcript → produces a full content intelligence report.
Built for Digitech's course production pipeline.

---

## Inputs

Accept any of:
- YouTube URL → automatically runs `/yt-transcript` first to get the text
- Pasted transcript text
- `/yt-transcript` output (pass directly)

---

## Execution Flow

### Step 1 — Acquire Transcript

If a YouTube URL is provided:
1. Run `/yt-transcript <url>` to extract the full text
2. Note: video title, channel, duration, language

If transcript is pasted directly: use as-is.

### Step 2 — Extract Metadata from Content

Read the transcript and identify:
- **Topic** — main subject in one sentence
- **Format** — lecture / interview / demo / tutorial / documentary / debate
- **Presenter style** — talking head / screencast / animated / in-person
- **Estimated audience** — who this was made for (age, level, background)
- **Language register** — academic / casual / professional / simplified
- **Pacing** — words per minute estimate, density of new information

### Step 3 — Build Content Map

Identify the structure of the video:

```
CONTENT MAP
─────────────────────────────────────
[00:00–02:30]  Opening / Hook         → <what happens>
[02:30–08:00]  Core Concept 1         → <concept name + 1-line summary>
[08:00–12:00]  Example / Demo         → <what is demonstrated>
[12:00–18:00]  Core Concept 2         → <concept name>
...
[XX:XX–end]    Closing / CTA          → <how it ends>
```

### Step 4 — Extract Key Learning Points

List 5–10 specific, concrete things a viewer learns:
- Not summaries — actual learnable facts, skills, or perspectives
- Mark each as: CONCEPT / SKILL / FACT / FRAMEWORK / EXAMPLE

### Step 5 — Surprising & Quotable Moments

Find 3–5 moments that would work as:
- Opening triggers for a lesson (surprising fact, challenge, question)
- Direct quotes for slides
- Anecdotes for worksheets

Format:
```
HOOK MOMENT [N]
Timestamp: [MM:SS]
Quote: "<exact or paraphrased text>"
Why it works: <1 sentence — what makes this grabby>
Best use: opening trigger / slide quote / worksheet anchor
```

### Step 6 — Pedagogic Assessment

Evaluate the video for educational use:

```
PEDAGOGIC ASSESSMENT
─────────────────────────────────────
Theory density:      HIGH / MEDIUM / LOW
Active elements:     YES / NO (does the video invite participation?)
Concrete examples:   <count and quality>
Real-world anchors:  <count and quality>
Age fit:             Grades <X–Y> | Adults | Expert only
Hebrew adaptation:   EASY / MEDIUM / HARD (based on terminology density)
Estimated usability: READY / NEEDS_ADAPTATION / REFERENCE_ONLY

Strengths for classroom use:
- <bullet>
Weaknesses / gaps:
- <bullet>
```

### Step 7 — Digitech Course Fit

Assess how this video maps to the Digitech pipeline:

```
DIGITECH COURSE FIT
─────────────────────────────────────
Usable as:
  [ ] Full course source (covers enough for 4h+)
  [ ] Single module source (1 lesson worth)
  [ ] Research reference only
  [ ] Opening trigger only

Maps to STEP:  1-RESEARCH / 2-CURRICULUM / 3-SLIDES / 5-MARKETING

Suggested course slug: <proposed-slug>
Suggested title (Hebrew): <כותרת מוצעת>
Estimated audience grade: <band>
Estimated duration possible: <X hours>

Key content to extract: <what specifically to take from this video>
Content gaps (what a full course would need that this video doesn't cover):
- <gap 1>
- <gap 2>
```

---

## Output Format (final summary)

```
YT-ANALYZE REPORT
─────────────────────────────────────
Video:    <title>
Channel:  <channel>
URL:      <url>
Duration: <MM:SS> | Words: <N>
Analyzed: <date>

TOPIC: <one sentence>
FORMAT: <type>
AUDIENCE: <who it's for>

CONTENT MAP: [N sections identified]
KEY LEARNINGS: [N points]
HOOK MOMENTS: [N found]

PEDAGOGIC SCORE:
  Theory density:   <level>
  Examples:         <N>
  Age fit:          <grades>
  Hebrew adapt:     <difficulty>

DIGITECH FIT:
  Use as:           <type>
  Suggested course: <slug>
  Audience grade:   <band>
  Gaps to fill:     <N>

─────────────────────────────────────
[Full detail sections follow]
```

---

## Rules

1. Never hallucinate content — only analyze what's in the transcript
2. Timestamps are estimates if working from text only — mark as `~`
3. Hebrew title suggestion must follow `hebrew-style.md` rules
4. Pedagogic assessment must reference Digitech's `pedagogic-method.md` criteria
5. If video is shorter than 10 minutes, note that it's too short to anchor a full course

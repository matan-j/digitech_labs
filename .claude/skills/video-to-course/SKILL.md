---
name: video-to-course
description: Full pipeline that converts one or more YouTube videos into a complete Digitech course package. Takes YouTube URLs → extracts transcripts → analyzes content → generates course brief → runs the full production pipeline. Use when the user provides YouTube videos as the primary source for building a new course.
argument-hint: <youtube-url> [<url2> ...] [--grade 7|9|11] [--hours 4|6|8] [--slug my-course-slug]
disable-model-invocation: false
---

# video-to-course — YouTube → Digitech Course Pipeline

Full automation: YouTube video(s) → production-ready course package.
Runs the complete pipeline from source videos to pilot-ready materials.

---

## When to Use

- You have 1–5 YouTube videos on a topic and want to build a course from them
- You found trending content via `/yt-search` and want to turn it into curriculum
- A team member shared a video and wants it converted to Digitech format
- You want to build a course rapidly with real-world content as the foundation

---

## Pipeline Flow

```
INPUT: YouTube URL(s)
  ↓
STAGE 1 — EXTRACT     /yt-transcript on each URL
  ↓
STAGE 2 — ANALYZE     /yt-analyze on each video
  ↓
STAGE 3 — SYNTHESIZE  /notebooklm to merge insights across all videos
  ↓
STAGE 4 — BRIEF       Auto-generate Course_Brief from synthesis
  ↓
STAGE 5 — PRODUCE     Full pipeline via skill-research → skill-curriculum → skill-slides → skill-interactive → skill-marketing → skill-qa
  ↓
OUTPUT: Complete Course_<slug>/ package
```

---

## Stage 1 — Extract Transcripts

For each URL provided:
1. Run `/yt-transcript <url>`
2. Store result with video metadata
3. Report: title, channel, duration, word count

If any video has no transcript:
- Note it and continue with others
- Flag in course brief as: `⚠️ VIDEO N — no transcript, used metadata only`

---

## Stage 2 — Analyze Each Video

For each transcript:
1. Run `/yt-analyze <transcript>`
2. Extract: content map, key learnings, hook moments, pedagogic score
3. Score each video: STRONG / MEDIUM / WEAK as course source

---

## Stage 3 — Cross-Video Synthesis

With all video analyses:
1. Run `/notebooklm` with all analyses as input
2. Identify:
   - Combined topic coverage (what all videos together teach)
   - Gaps (what's missing for a complete course)
   - Best hook moments across all videos
   - Strongest examples and case studies
   - Recommended module structure based on video content

---

## Stage 4 — Auto-Generate Course Brief

Build `00_Admin/Course_Brief.md` and `course_brief.json` from synthesis:

```
course_slug:      <derived from topic + grade>
title:            <Hebrew title from synthesis>
audience_grade:   <from /yt-analyze audience assessment or user arg>
duration_hours:   <from user arg or estimated from content volume>
final_output:     <suggested based on content type>
prerequisites:    <derived from content complexity>
constraints:      <ask user if unclear, otherwise assume standard>
language:         Hebrew
branding_profile: Digitech standard
source_videos:    [list of URLs]
```

**If `--grade` and `--hours` were not provided:**
Suggest values based on analysis and confirm with user before continuing.

---

## Stage 5 — Full Course Production

Run the complete pipeline sequentially:

1. `skill-research` — using video synthesis as primary source material
   - `Research_Output.md` pulls directly from video analysis key learnings
   - `Podcast_Script.md` adapted from best video quotes
   - `Evidence_Snippets.md` from hook moments

2. `skill-curriculum` — build curriculum mapped to video content
   - Modules align with video content map sections
   - Activities inspired by video examples
   - Hook triggers sourced from best video moments

3. `skill-slides` — build slide deck
   - Image prompts reference visual style of source videos
   - Key data points from video content

4. `skill-interactive` — build game/quiz
   - Questions based on video content
   - Challenge scenarios from video examples

5. `skill-marketing` — build marketing assets
   - Video script references source topic credibility
   - One-pager highlights real-world examples from videos

6. `skill-qa` — QA the full package

---

## Output Structure

```
Course_<slug>/
  00_Admin/
    Course_Brief.md
    course_brief.json
    status.json
    Source_Videos.md         ← NEW: list of all input videos with metadata
  01_Research/
    Research_Blueprint.html  ← from /notebooklm
    Video_Analysis_[N].md    ← from /yt-analyze for each video
    Research_Output.md
    ...
  02_Curriculum/ ...
  03_Slides/ ...
  04_Interactive/ ...
  05_Marketing/ ...
  07_Export/ ...
```

---

## Source_Videos.md Format

Created automatically in `00_Admin/`:

```
SOURCE VIDEOS
─────────────────────────────────────
Course: <slug>
Generated: <date>

[1] <Video Title>
    Channel:   <channel>
    URL:       <url>
    Duration:  <MM:SS>
    Language:  <lang>
    Score:     STRONG / MEDIUM / WEAK
    Used for:  <which stages this video contributed to>

[2] ...
─────────────────────────────────────
COMBINED COVERAGE: <total minutes of source material>
GAPS IDENTIFIED: <N gaps flagged for human research>
```

---

## Rules

1. Always run `/yt-transcript` first — never analyze based on URL metadata alone
2. If videos are in English, translate all student-facing content to Hebrew
3. Preserve English technical terms in parentheses on first use
4. Never force-fit video content into a module — flag gaps honestly
5. If source videos together cover less than 60% of a full course → warn user and list what needs to be added manually
6. Respect all `pedagogic-method.md`, `age-adaptation.md`, and `hebrew-style.md` rules
7. Follow `file-naming.md` — no exceptions

---
name: yt-transcript
description: Extract the full transcript from any YouTube video URL. Returns cleaned, timestamped text in the video's language with optional Hebrew translation. Use when the user provides a YouTube link and wants to read, analyze, or process its content. No API key required.
argument-hint: <youtube-url> [--lang he|en|auto] [--timestamps] [--translate-to he]
disable-model-invocation: false
---

# yt-transcript — YouTube Transcript Extractor

Extracts full transcripts from YouTube videos using `youtube-transcript-api` (no API key, no browser).
Falls back to yt-dlp if the primary method fails.

**Works for any team member. Requires Python + youtube-transcript-api installed.**

---

## Setup (one-time per machine)

```bash
pip install youtube-transcript-api
```

---

## Execution Flow

### Step 1 — Extract Video ID

Parse the video ID from any YouTube URL format:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

### Step 2 — Run Transcript Extraction

Use the bundled Python script:

```bash
python ~/.claude/skills/yt-transcript/scripts/extract.py "$ARGUMENTS"
```

Or if running in project context:

```bash
python .claude/skills/yt-transcript/scripts/extract.py "$ARGUMENTS"
```

### Step 3 — Process Output

The script returns JSON with:
- `title` — video title
- `channel` — channel name
- `duration` — video duration
- `language` — detected language
- `transcript` — array of `{start, duration, text}` objects
- `full_text` — clean concatenated text

### Step 4 — Format Output

Present the transcript in this structure:

```
YT-TRANSCRIPT
─────────────────────────────
Title:    <video title>
Channel:  <channel name>
URL:      <original URL>
Duration: <MM:SS>
Language: <detected>
Words:    <word count>
─────────────────────────────

FULL TRANSCRIPT:
<clean text with paragraph breaks every ~5 sentences>

─────────────────────────────
TIMESTAMPED VERSION (if requested):
[00:00] <text>
[01:23] <text>
...
```

### Step 5 — Hebrew Translation (if requested)

If `--translate-to he` is passed, or if the user asks for Hebrew:
- Translate the full transcript to Hebrew
- Preserve key terms in English in parentheses where needed
- Apply Digitech hebrew-style.md rules to the output

---

## Fallback Chain

1. **youtube-transcript-api** (primary — fastest, no auth)
2. **yt-dlp subtitle extraction** (if primary fails or no captions)
3. **Manual notice** — report that no transcript is available and suggest alternatives

If no transcript exists at all:
```
⚠️ NO TRANSCRIPT AVAILABLE
Video: <title>
Reason: <no captions / private / age-restricted>
Alternatives:
- Use yt-dlp to download audio and run Whisper locally
- Check if a manual transcript was linked in the video description
```

---

## Output Rules

- Always show word count and estimated reading time
- Strip filler words from auto-generated captions ("um", "uh", repeated words)
- Fix paragraph breaks — auto-captions have none
- Preserve speaker labels if detectable
- Max output: 15,000 words (truncate with notice if longer)

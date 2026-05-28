# skill-research

**Trigger:** STEP 1 of pipeline, or `/generate-asset research`
**Purpose:** Build a knowledge base for the course topic. Produce structured research outputs ready for curriculum building.

---

## Inputs
- `Course_Brief.md` (topic, audience, duration, constraints)

## Rules to Load
- `age-adaptation.md` — to calibrate research depth and vocabulary

---

## Pre-Research Tools (run before writing files)

Before writing any research files, use these skills to gather live data:

### A. YouTube Trend Scan (optional but recommended)
Run `/yt-search <topic>` to find:
- What content creators and educators are making on this topic
- Which angles are trending vs. oversaturated
- Real-world examples and case studies from videos
- Visual and pedagogic approaches others have used

### B. Source Synthesis
Run `/notebooklm <sources>` with the yt-search results + any URLs to:
- Extract key themes across sources
- Identify knowledge gaps
- Produce an insight map before writing the curriculum

Use the notebooklm synthesis output to inform `Research_Output.md` and `Infographic_Ideas.md`.

---

## Execution Steps

### 1. Write Research_Brief.md
Define what to research:
- Core concepts to cover
- Key questions the course must answer
- Real-world examples and case studies to find
- Data or statistics relevant to the topic
- Common misconceptions to address
- Age-appropriate entry points

### 2. Write Sources_List.md
Suggest 5–8 high-quality sources:
- Type per source: article / dataset / video / report / database
- Short note on what to extract from each
- Mark which are suitable for student-facing vs teacher-facing use

### 3. Write Research_Output.md
Synthesize core knowledge:
- 5–8 key factual points the course must cover
- 2–3 surprising or counterintuitive facts (for opening triggers)
- 2–3 real-world examples appropriate for the audience grade
- Key vocabulary with simple definitions

### 4. Write Evidence_Snippets.md
Produce 4–6 short evidence items:
- Each is 2–4 sentences
- Each is cited or attributed
- Each can be used as a slide anchor, discussion prompt, or worksheet element

### 5. Write Infographic_Ideas.md
Suggest 3–5 infographic concepts:

```
INFOGRAPHIC [N]
Title: [what the infographic is about]
Format: [comparison / timeline / flowchart / statistic highlight / map]
Key data points: [what numbers or facts to feature]
Audience use: [slide / handout / wall poster / student worksheet]
```

### 6. Write Podcast_Script.md
Write a 60–90 second spoken summary of the topic:
- Opening hook (1 surprising fact or question)
- 3 core ideas in plain language
- One real-world story or example
- Closing call to reflection

---

## Output Quality Standard
- Research_Output.md contains no fewer than 5 factual points
- All infographic ideas are specific, not generic
- Podcast script is 60–90 seconds when read aloud (150–200 words)
- All outputs are calibrated to the audience_grade
- Evidence snippets are directly usable in curriculum building

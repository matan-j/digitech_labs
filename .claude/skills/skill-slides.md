# skill-slides

**Trigger:** STEP 3 of pipeline, or `/generate-asset slides`
**Purpose:** Produce a complete slide deck specification, copy, and visual brief.

---

## Inputs
- `Course_Brief.md`
- `02_Curriculum/Syllabus.md`
- `02_Curriculum/Lesson_Plans.md`
- `01_Research/Infographic_Ideas.md`

## Rules to Load
- `slide-rules.md`
- `age-adaptation.md`

---

## Execution Steps

### 1. Determine Slide Count
Based on `duration_hours`:
- 4h → 12–14 slides
- 6h → 16–20 slides
- 8h → 20–24 slides

### 2. Write Slide_Deck_Spec.md
Map every slide using the format from `slide-rules.md`:

```
SLIDE [N]
Type: [content / interaction / activity / transition / opening / closing]
Title: [slide title]
Visual: [image / icon / chart / whitespace / text only]
Copy: [exact text on slide]
Facilitator note: [what the teacher says or does]
Duration: [time on this slide]
```

Ensure:
- Slide 1 is Opening
- Slide 2 is Learning Goals
- One interaction slide every 4–5 content slides
- Final slide is Summary + Output Reminder

### 3. Write Slide_Copy.md
All slide text in a clean, copyable format:

```markdown
## Slide [N] — [Title]
**Headline:** [title text]
**Body:**
- [bullet 1]
- [bullet 2]
- [bullet 3]
**CTA / Prompt (if interaction slide):** [question or action]
```

### 4. Write Visual_Assets_Brief.md

```markdown
# Visual Assets Brief — [Course Title]

## Overall Style
[Clean minimal / Bold data-focused / Illustrated / etc.]

## Color Palette
- Primary: [color / hex]
- Secondary: [color / hex]
- Accent: [color / hex]
- Background: [white / dark / light gray]

## Typography
- Heading font: [suggestion]
- Body font: [suggestion]

## Icon Style
[Flat icons / outlined / illustrated]

## Canva Template Starting Point
[Suggest a Canva template category or describe the layout logic]

## Per-Module Visual Direction
| Module | Visual Approach                    |
|--------|------------------------------------|
| 1      | [e.g., data visualization examples] |
| 2      | [e.g., real company logos + stats]  |
```

### 5. Write Image_Prompts.md
For every slide that calls for an image or visual:

```
SLIDE [N] — [slide title]
Image prompt: [1–2 sentence English description for Canva/Gemini]
Style: photographic / illustrated / data visual / infographic
Mood: [energetic / calm / professional / playful]
Avoid: stock clichés, cluttered layouts, text on image
```

---

## Output Quality Standard
- Slide count is within limits per course duration
- Every interaction slide has a specific prompt or question
- Copy is short (no paragraphs on slides)
- Visual brief gives enough direction for a designer without additional questions
- Image prompts are Canva/Gemini-ready — specific, not generic

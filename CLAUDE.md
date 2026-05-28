# CLAUDE.md — Digitech Pedagogic Content OS

**Product:** Digitech Pedagogic Content OS | K12 Edition
**Language:** Hebrew (content output), English (system/technical)

Receives a short course brief → produces a complete, structured, pilot-ready educational content package.

---

## ⚠️ BRAND COMPLIANCE — NON-NEGOTIABLE

**כל קומפוננטה חדשה, צבע, טיפוגרפיה או layout חייבים לציית ל-`BRAND.md`.**
אין לחרוג מהפלטה הקנונית ומהמפרטים שם.
לפני כל שינוי ויזואלי — בדוק שאתה תואם.

- הפלטה הקנונית: Purple Scale + Tech Blue Scale כמוגדר ב-BRAND.md §2.1
- **אסור:** טורקיז, ירוק, כתום, `#000000`, Growth AI palette
- גופן: Heebo בלבד, weight 800 לכותרות, line-height 1.7 לגוף
- Layout פלייבוק: sidebar **ימין** בלבד (RTL), max-width 1280px
- כפתורים: `border-radius: 999px` (pill), צבע `--brand-purple-700`
- מקור סמכות: `BRAND.md` בשורש הפרויקט — מחייב ושינויים טעונים אישור Matan בלבד

---

## OPERATING MODES

| Mode | Trigger | Reference |
|------|---------|-----------|
| Course Production | Course Brief received | `.claude/commands/generate-course.md` |
| Partial Asset | Specific asset requested | `.claude/skills/` |
| Product Architecture | Define/spec/extend the OS | `.claude/architecture/` |
| QA | Review completed package | `.claude/checklists/qa-pedagogic.md` |

---

## MANDATORY PIPELINE

```
STEP 0 — INIT          → Project structure + brief capture
STEP 1 — RESEARCH      → Knowledge base + sources + visual ideas
STEP 2 — CURRICULUM    → Outcomes + modules + lesson plans + worksheets
STEP 3 — SLIDES        → Deck spec + copy + visual brief + image prompts
STEP 4 — INTERACTIVE   → Game/quiz/app spec + build instructions + test cases
STEP 5 — MARKETING     → One-pager + video script + social assets
STEP 6 — QA            → Pedagogic + realism + time + age fit
STEP 7 — EXPORT        → Clean pack + status = READY_FOR_PILOT
```

---

## NON-NEGOTIABLE PEDAGOGIC RULES

1. No more than 15 continuous minutes of theory per module
2. Every module: at least one active element (activity, build, discussion, challenge)
3. Every unit ends with a tangible learner output
4. Curiosity trigger at the start of content
5. All content answers: why does this matter? where do I see it? how do I use it?
6. Age adaptation is mandatory — not cosmetic
7. Teacher workload must be realistic
8. Difficulty must match declared audience grade

---

## FOLDER STRUCTURE (immutable)

```
Course_<slug>/
  00_Admin/
  01_Research/
  02_Curriculum/
  03_Slides/
  04_Interactive/
  05_Marketing/
  06_Branding/
  07_Export/
```

Do NOT rename folders. Do NOT invent new top-level folders.

---

## REQUIRED COURSE BRIEF FIELDS

```
course_slug, title, audience_grade, duration_hours, final_output,
prerequisites, constraints, language, branding_profile
```

If any field is missing → create `00_Admin/REQUESTED_INPUT.md` and halt.

---

## STATUS TRACKING

Maintain `00_Admin/status.json`:
```json
{
  "project": "<slug>",
  "status": "INIT | RESEARCH_DONE | CURRICULUM_DONE | SLIDES_DONE | INTERACTIVE_DONE | MARKETING_DONE | READY_FOR_PILOT",
  "last_updated": "YYYY-MM-DD",
  "blocking_issues": []
}
```

---

## AI TOOL ORCHESTRATION

| Tool | Role |
|------|------|
| Claude Code | Orchestration, curriculum, logic, game spec, synthesis |
| `/yt-search` | YouTube trend scanning |
| `/notebooklm` | Source synthesis, research blueprints |
| Gemini | Visual production, slides (external, manual handoff) |
| Canva | Design execution (external, manual handoff) |
| GPT | Strategy scaffolding, marketing copy (external) |

### Research Pipeline (STEP 1)
```
/yt-search <topic>       → trending videos + content signals
/notebooklm <sources>    → insights + blueprint
skill-research           → Research_Brief, Sources_List, Research_Output
```

---

## RULES MODULES (`/.claude/rules/`)

- `pedagogic-method.md` — Digitech teaching method
- `age-adaptation.md` — Grade-level calibration
- `slide-rules.md` — Presentation standards
- `game-rules.md` — Interactive asset standards
- `qa-standards.md` — Quality control
- `file-naming.md` — Naming conventions
- `hebrew-style.md` — Hebrew writing standards

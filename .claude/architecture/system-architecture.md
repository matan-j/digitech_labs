# system-architecture.md — Digitech Pedagogic Content OS Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│              DIGITECH PEDAGOGIC CONTENT OS           │
│                   K12 Edition v1.0                   │
└─────────────────────────────────────────────────────┘

INPUT                    PIPELINE                    OUTPUT
──────               ─────────────────            ──────────
Course Brief    →    ORCHESTRATOR AGENT    →    Course Package
(9 fields)           │                          (7 folders,
                     ├─ STEP 0: INIT             20+ files)
                     ├─ STEP 1: RESEARCH         │
                     ├─ STEP 2: CURRICULUM       │
                     ├─ STEP 3: SLIDES           ├─ Pilot-ready
                     ├─ STEP 4: INTERACTIVE      ├─ Canva-ready
                     ├─ STEP 5: MARKETING        ├─ Teacher-ready
                     ├─ STEP 6: QA               └─ Builder-ready
                     └─ STEP 7: EXPORT
```

---

## Layer Architecture

### Layer 1 — Input (Course Brief Intake)
**Source:** Manual input / Google Form / CLI
**Output:** `Course_Brief.md` + `course_brief.json`
**Validation:** 9 required fields — halt if any missing

### Layer 2 — Orchestration (Claude Code)
**Role:** Pipeline controller, status tracker, QA enforcer
**Operates:** Sequential stage execution
**State:** `status.json`

### Layer 3 — Domain Production (Specialized Agents)
Each agent handles one pipeline stage using a specific skill.

```
Research Agent    → skill-research   → 01_Research/
Curriculum Agent  → skill-curriculum → 02_Curriculum/
Slides Agent      → skill-slides     → 03_Slides/
Interactive Agent → skill-interactive → 04_Interactive/
Marketing Agent   → skill-marketing  → 05_Marketing/
QA Agent          → skill-qa         → 07_Export/
```

### Layer 4 — External Tools (Human-assisted or API)
```
NotebookLM  → Enriches 01_Research/ (manual input step)
Gemini      → Produces visuals from 03_Slides/Visual_Assets_Brief.md
Canva       → Final design from 06_Branding/ + 03_Slides/
Wordwall    → Builds game from 04_Interactive/Build_Instructions.md
```

### Layer 5 — QA & Export
**QA Agent** scores all outputs against 8 dimensions.
**Status** → `READY_FOR_PILOT` or `NEEDS_REVISION`

---

## Data Flow

```
Course_Brief.json
      │
      ▼
Research_Output.md ──────────────┐
      │                          │
      ▼                          ▼
Syllabus.md ──────────► Slide_Deck_Spec.md
      │                          │
      ▼                          ▼
Lesson_Plans.md          Slide_Copy.md
      │
      ▼
Game_Spec.md ──────────► Build_Instructions.md
      │                          │
      ▼                          ▼
Test_Cases.md            QA_Checklist.md
                                 │
                                 ▼
                         Final_Checklist.md
                                 │
                                 ▼
                         status = READY_FOR_PILOT
```

---

## File Count Per Course Package

| Folder        | Files | Status        |
|---------------|-------|---------------|
| 00_Admin      | 4–5   | Always        |
| 01_Research   | 6     | Always        |
| 02_Curriculum | 6     | Always        |
| 03_Slides     | 4     | Always        |
| 04_Interactive| 3–4   | Always        |
| 05_Marketing  | 3     | Always        |
| 06_Branding   | 3     | Template-based|
| 07_Export     | 2     | Always        |
| **TOTAL**     | **31–33** | Per course |

---

## Environments

| Environment | Purpose                              |
|-------------|--------------------------------------|
| Local       | Claude Code production runs          |
| Google Drive| Human review + school delivery       |
| Canva       | Visual design + final slide export   |
| Wordwall    | Game deployment for classroom        |

---

## MVP Scope (Current)

**In scope:**
- Full pipeline STEP 0–7
- Hebrew-primary output
- K12 (grades 7–12 focus, especially 9th grade)
- Manual NotebookLM step (no API integration)
- Canva-ready specs (no auto-generation)
- Wordwall / Glide build instructions (no deployment)

**Out of scope (Phase 2):**
- Auto-deploy to Google Slides via API
- Canva API integration
- Multi-user collaboration
- Analytics dashboard
- Adult edition
- Auto-trigger from Google Form via n8n

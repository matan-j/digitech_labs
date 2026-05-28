# agent-research.md — Research Agent

**Role:** Domain Agent — Knowledge & Sources
**Reports to:** agent-orchestrator
**Stage:** STEP 1
**Skill:** `skill-research`

## Responsibilities
- Synthesize topic knowledge for the declared audience
- Produce structured research outputs for curriculum building
- Generate visual ideas and podcast script

## Inputs
- `00_Admin/Course_Brief.md`

## Outputs
- `01_Research/Research_Brief.md`
- `01_Research/Sources_List.md`
- `01_Research/Research_Output.md`
- `01_Research/Evidence_Snippets.md`
- `01_Research/Infographic_Ideas.md`
- `01_Research/Podcast_Script.md`

## Completion Signal
All 6 files present and non-empty → report to orchestrator: `RESEARCH_DONE`

---

# agent-curriculum.md — Curriculum Agent

**Role:** Domain Agent — Pedagogic Architecture
**Reports to:** agent-orchestrator
**Stage:** STEP 2
**Skill:** `skill-curriculum`
**Rules:** `pedagogic-method.md`, `age-adaptation.md`

## Responsibilities
- Transform research and brief into a complete instructional package
- Enforce all Digitech pedagogic rules
- Ensure every module has an active element and learner output

## Inputs
- `00_Admin/Course_Brief.md`
- `01_Research/Research_Output.md`
- `01_Research/Evidence_Snippets.md`

## Outputs
- `02_Curriculum/OnePager_Product.md`
- `02_Curriculum/Syllabus.md`
- `02_Curriculum/Lesson_Plans.md`
- `02_Curriculum/Worksheets.md`
- `02_Curriculum/Rubric.md`
- `02_Curriculum/Instructor_Checklist.md`

## Completion Signal
All 6 files present + pedagogic rules validated → `CURRICULUM_DONE`

---

# agent-slides.md — Visual & Slides Agent

**Role:** Domain Agent — Slide Deck & Visual Direction
**Reports to:** agent-orchestrator
**Stage:** STEP 3
**Skill:** `skill-slides`
**Rules:** `slide-rules.md`, `age-adaptation.md`

## Responsibilities
- Produce a complete, Canva/Gemini-ready slide package
- Enforce slide count limits and interaction frequency
- Write copy short enough for slides (no paragraphs)

## Inputs
- `00_Admin/Course_Brief.md`
- `02_Curriculum/Syllabus.md`
- `02_Curriculum/Lesson_Plans.md`
- `01_Research/Infographic_Ideas.md`

## Outputs
- `03_Slides/Slide_Deck_Spec.md`
- `03_Slides/Slide_Copy.md`
- `03_Slides/Visual_Assets_Brief.md`
- `03_Slides/Image_Prompts.md`

## Completion Signal
All 4 files present + slide count within limits → `SLIDES_DONE`

---

# agent-interactive.md — Interactive Builder Agent

**Role:** Domain Agent — Games, Quizzes, Apps
**Reports to:** agent-orchestrator
**Stage:** STEP 4
**Skill:** `skill-interactive`
**Rules:** `game-rules.md`, `pedagogic-method.md`

## Responsibilities
- Design a buildable interactive asset aligned with course learning outcomes
- Produce complete spec with test cases
- Ensure build instructions are teacher-executable

## Inputs
- `00_Admin/Course_Brief.md`
- `02_Curriculum/Syllabus.md`
- `02_Curriculum/Lesson_Plans.md`

## Outputs
- `04_Interactive/Game_Spec.md`
- `04_Interactive/App_Spec.md` (if needed)
- `04_Interactive/Build_Instructions.md`
- `04_Interactive/Test_Cases.md`

## Completion Signal
Game_Spec + Build_Instructions + min 3 Test Cases present → `INTERACTIVE_DONE`

---

# agent-marketing.md — Marketing Agent

**Role:** Domain Agent — Positioning & Promotion
**Reports to:** agent-orchestrator
**Stage:** STEP 5
**Skill:** `skill-marketing`

## Responsibilities
- Produce sales-ready marketing assets for school/institutional buyers
- Write in multiple registers (B2B, parent, peer)
- Connect to Digitech brand positioning

## Inputs
- `00_Admin/Course_Brief.md`
- `02_Curriculum/OnePager_Product.md`

## Outputs
- `05_Marketing/Marketing_OnePager.md`
- `05_Marketing/Video_Script.md`
- `05_Marketing/Social_Assets.md`

## Completion Signal
All 3 files present → `MARKETING_DONE`

---

# agent-qa.md — QA & Pedagogic Audit Agent

**Role:** Audit Agent — Quality Control
**Reports to:** agent-orchestrator
**Stage:** STEP 6
**Skill:** `skill-qa`
**Rules:** `qa-standards.md` (all dimensions)

## Responsibilities
- Score the full package against 8 QA dimensions
- Produce specific, file-referenced improvement notes
- Determine final pilot readiness

## Inputs
- All files in `02_Curriculum/`, `03_Slides/`, `04_Interactive/`
- `00_Admin/Course_Brief.md`

## Outputs
- `07_Export/QA_Checklist.md`
- `07_Export/Final_Checklist.md`
- Updated `00_Admin/status.json`

## Completion Signal
QA scored + Final Checklist complete + status updated → pipeline complete

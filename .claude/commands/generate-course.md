# /generate-course

**Trigger:** `/generate-course`
**Purpose:** Run the full pipeline from Course Brief to READY_FOR_PILOT.

---

## Inputs Required

Before running, confirm the following fields are present in the brief:

- `course_slug`
- `title`
- `audience_grade`
- `duration_hours`
- `final_output`
- `prerequisites`
- `constraints`
- `language`
- `branding_profile`

If any field is missing → create `00_Admin/REQUESTED_INPUT.md` with a list of what is needed. Stop.

---

## Execution Sequence

### STEP 0 — INIT
1. Run skill: `skill-init-project`
2. Create full folder structure under `Course_<slug>/`
3. Write `00_Admin/Course_Brief.md`
4. Write `00_Admin/course_brief.json`
5. Write `00_Admin/status.json` → status: `INIT`

### STEP 1 — RESEARCH
1. Run skill: `skill-research`
2. Output: `01_Research/Research_Brief.md`, `Sources_List.md`, `Research_Output.md`, `Infographic_Ideas.md`, `Podcast_Script.md`
3. Update status → `RESEARCH_DONE`

### STEP 2 — CURRICULUM
1. Run skill: `skill-curriculum`
2. Output: `Syllabus.md`, `Lesson_Plans.md`, `Worksheets.md`, `Rubric.md`, `Instructor_Checklist.md`, `OnePager_Product.md`
3. Validate: pedagogy rules, active learning, learner output
4. Update status → `CURRICULUM_DONE`

### STEP 3 — SLIDES
1. Run skill: `skill-slides`
2. Output: `Slide_Deck_Spec.md`, `Slide_Copy.md`, `Visual_Assets_Brief.md`, `Image_Prompts.md`
3. Validate: slide count within limit, no paragraph-heavy slides
4. Update status → `SLIDES_DONE`

### STEP 4 — INTERACTIVE
1. Run skill: `skill-interactive`
2. Output: `Game_Spec.md`, `App_Spec.md`, `Build_Instructions.md`, `Test_Cases.md`
3. Validate: test cases present, flow is buildable, scoring defined
4. Update status → `INTERACTIVE_DONE`

### STEP 5 — MARKETING
1. Run skill: `skill-marketing`
2. Output: `Marketing_OnePager.md`, `Video_Script.md`, `Social_Assets.md`
3. Update status → `MARKETING_DONE`

### STEP 6 — QA
1. Run skill: `skill-qa`
2. Output: `QA_Checklist.md`, `Final_Checklist.md`
3. If issues found → log in `Final_Checklist.md` under ISSUES
4. Update status → `READY_FOR_PILOT`

### STEP 7 — EXPORT SUMMARY
Print:
- Full file list
- QA summary
- Any blocking issues
- Suggested next iteration improvements

---

## Failure Protocol

If any step fails:
1. Log error in `00_Admin/status.json` under `blocking_issues`
2. Write a note at the top of the affected file: `⚠️ INCOMPLETE — reason`
3. Do not silently skip
4. Do not mark status as complete if step was skipped

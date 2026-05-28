# skill-qa

**Trigger:** STEP 6 of pipeline, or `/qa-review`
**Purpose:** Run structured quality control across the full course package.

---

## Inputs
- All files in `00_Admin/`, `02_Curriculum/`, `03_Slides/`, `04_Interactive/`
- `Course_Brief.md` as the baseline reference

## Rules to Load
- `qa-standards.md` — scoring criteria
- `pedagogic-method.md` — active learning requirements
- `game-rules.md` — interactive asset completeness
- `slide-rules.md` — slide construction standards

---

## Execution Steps

### 1. Load and Read All Key Files
- `Course_Brief.md`
- `Syllabus.md`
- `Lesson_Plans.md`
- `Worksheets.md`
- `Game_Spec.md`
- `Test_Cases.md`
- `Slide_Deck_Spec.md`

### 2. Score Each QA Dimension
Apply criteria from `qa-standards.md`:
1. Pedagogic Clarity
2. Age Fit
3. Realistic Time
4. Active Learning Presence
5. Learner Output Existence
6. Teacher Workload
7. Interactive Element Quality
8. Instructional Flow Coherence

### 3. Write QA_Checklist.md
Use the output format from `qa-standards.md`. Be specific in notes.

### 4. Write Final_Checklist.md

```markdown
# Final Checklist — [Course Title]

## File Completeness
- [ ] 00_Admin — all required files present
- [ ] 01_Research — all required files present
- [ ] 02_Curriculum — all required files present
- [ ] 03_Slides — all required files present
- [ ] 04_Interactive — all required files present
- [ ] 05_Marketing — all required files present
- [ ] 07_Export — QA_Checklist.md present

## Pedagogic Readiness
- [ ] All modules have active elements
- [ ] Final learner output is defined
- [ ] Opening trigger exists in each module
- [ ] Time allocation is realistic

## Technical Readiness
- [ ] Game is buildable from spec
- [ ] Test cases cover main flow
- [ ] Build instructions are teacher-executable

## Marketing Readiness
- [ ] Marketing OnePager is complete
- [ ] Video Script is complete

## OVERALL STATUS
[ ] READY_FOR_PILOT
[ ] NEEDS_REVISION
[ ] BLOCKED

## Blocking Issues (if any)
1. [issue + file reference]

## Next Iteration Suggestions
- [improvement idea]
```

### 5. Update status.json
- If all PASS or WARN: `READY_FOR_PILOT`
- If any FAIL: `NEEDS_REVISION` + add to `blocking_issues`

---

## Output Quality Standard
- Every QA dimension has a score AND specific notes
- Improvements are specific (not "improve the content")
- Example of good note: "Module 3 Lesson_Plans.md has no activity — add a 10-min classification task after the theory block"
- Example of bad note: "Some modules need more engagement"

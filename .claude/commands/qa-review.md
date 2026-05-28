# /qa-review

**Trigger:** `/qa-review <course_slug>`
**Purpose:** Run full pedagogic QA on an existing course package.

## Steps

1. Load `00_Admin/Course_Brief.md` to understand context
2. Load `02_Curriculum/Lesson_Plans.md` and `Syllabus.md`
3. Load `04_Interactive/Game_Spec.md` and `Test_Cases.md`
4. Run skill: `skill-qa`
5. Output scored `QA_Checklist.md` with:
   - PASS / FAIL per criterion
   - Specific improvement notes (not generic)
   - Priority ranking of fixes
6. Update `status.json` if issues change readiness

## QA Dimensions
- Pedagogic clarity
- Age fit
- Realistic time allocation
- Active learning presence
- Learner output existence
- Teacher workload
- Interactive element quality
- Instructional flow coherence

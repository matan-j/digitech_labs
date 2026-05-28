# skill-init-project

**Trigger:** Called by `/generate-course` at STEP 0, or when a new course project is started.
**Purpose:** Create the full project folder skeleton and initialize the brief.

---

## Inputs
- `course_brief` — all 9 required fields (see CLAUDE.md)

## Execution Steps

1. Create folder: `Course_<course_slug>/`
2. Create all 8 subfolders: `00_Admin` through `07_Export`
3. Create all required placeholder files in each folder (see `file-naming.md`)
4. Write `00_Admin/Course_Brief.md` using template below
5. Write `00_Admin/course_brief.json` using template below
6. Write `00_Admin/Project_Folder_Plan.md` with a one-line description of each folder
7. Write `00_Admin/status.json` with status: `INIT`
8. Return: "Project initialized. Ready for STEP 1 — RESEARCH."

---

## Output: Course_Brief.md Template

```markdown
# Course Brief — [title]

## Identification
- **Slug:** [course_slug]
- **Title:** [title]
- **Language:** [language]
- **Branding:** [branding_profile]

## Audience
- **Grade:** [audience_grade]
- **Prerequisites:** [prerequisites]

## Scope
- **Duration:** [duration_hours] hours
- **Final Output:** [final_output]

## Constraints
[constraints — devices, internet, installs, platforms]

## Notes
[any additional context from the brief]
```

---

## Output: course_brief.json Template

```json
{
  "course_slug": "",
  "title": "",
  "audience_grade": "",
  "duration_hours": 0,
  "final_output": "",
  "prerequisites": "",
  "constraints": "",
  "language": "",
  "branding_profile": "",
  "created_at": "YYYY-MM-DD"
}
```

---

## Output Quality Standard
- All 8 folders exist
- All required files are created (may be empty placeholders)
- Course_Brief.md is complete with no blank fields
- status.json is present and correct

# file-naming.md — Naming Conventions

## Folder Naming

Always use this exact structure. No exceptions.

```
Course_<course_slug>/
  00_Admin/
  01_Research/
  02_Curriculum/
  03_Slides/
  04_Interactive/
  05_Marketing/
  06_Branding/
  07_Export/
```

`course_slug` format: lowercase, hyphens only, no spaces
Examples: `big-data-9th`, `ai-basics-7th`, `data-viz-10th`

---

## File Naming — Required Files

### 00_Admin/
- `Course_Brief.md`
- `course_brief.json`
- `Project_Folder_Plan.md`
- `status.json`
- `REQUESTED_INPUT.md` (only if inputs are missing)

### 01_Research/
- `Research_Brief.md`
- `Sources_List.md`
- `Research_Output.md`
- `Evidence_Snippets.md`
- `Infographic_Ideas.md`
- `Podcast_Script.md`

### 02_Curriculum/
- `OnePager_Product.md`
- `Syllabus.md`
- `Lesson_Plans.md`
- `Worksheets.md`
- `Rubric.md`
- `Instructor_Checklist.md`

### 03_Slides/
- `Slide_Deck_Spec.md`
- `Slide_Copy.md`
- `Visual_Assets_Brief.md`
- `Image_Prompts.md`

### 04_Interactive/
- `Game_Spec.md`
- `App_Spec.md`
- `Build_Instructions.md`
- `Test_Cases.md`

### 05_Marketing/
- `Marketing_OnePager.md`
- `Video_Script.md`
- `Social_Assets.md`

### 06_Branding/
- `Brand_Guidelines.md`
- `Canva_Template_Spec.md`
- `Asset_Naming.md`

### 07_Export/
- `QA_Checklist.md`
- `Final_Checklist.md`

---

## Versioning

If regenerating an existing file, use:
`OriginalName_v2.md`, `OriginalName_v3.md`

Never overwrite silently. Always version.

---

## Prohibited Naming

- No spaces in filenames
- No Hebrew in filenames (content inside is Hebrew, filenames are English)
- No special characters except underscore and hyphen
- No `.txt` — use `.md` for all content files
- No `.json` except `course_brief.json` and `status.json`

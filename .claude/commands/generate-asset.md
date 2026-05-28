# /generate-asset

**Trigger:** `/generate-asset <asset_type> <course_slug>`
**Purpose:** Generate a single asset for an existing course without running the full pipeline.

## Supported Asset Types

| Asset Type       | Skill Invoked         | Output File                    |
|------------------|-----------------------|-------------------------------|
| `worksheet`      | `skill-worksheet`     | `02_Curriculum/Worksheets.md` |
| `game`           | `skill-interactive`   | `04_Interactive/Game_Spec.md` |
| `slides`         | `skill-slides`        | `03_Slides/Slide_Deck_Spec.md` |
| `rubric`         | `skill-rubric`        | `02_Curriculum/Rubric.md`     |
| `marketing`      | `skill-marketing`     | `05_Marketing/`               |
| `video-script`   | `skill-video-script`  | `05_Marketing/Video_Script.md` |
| `social`         | `skill-social-assets` | `05_Marketing/Social_Assets.md` |
| `research`       | `skill-research`      | `01_Research/`                |
| `instructor`     | `skill-instructor`    | `02_Curriculum/Instructor_Checklist.md` |

## Execution

1. Load existing `Course_Brief.md` for context
2. Check current `status.json` — warn if prerequisite stage incomplete
3. Run the matching skill
4. Write output to correct folder
5. Do not overwrite existing files without confirmation — append `_v2` suffix

## Usage Examples

```
/generate-asset worksheet big-data-9th
/generate-asset game big-data-9th
/generate-asset video-script big-data-9th
```

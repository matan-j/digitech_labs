# glossary.md — Project Glossary

## System Terms

| Term                | Meaning                                                                 |
|---------------------|-------------------------------------------------------------------------|
| Course Brief        | The 9-field input form that starts a course production run              |
| course_slug         | Machine-readable course ID (e.g., `big-data-9th`)                       |
| Pipeline            | The 7-stage production sequence (INIT → READY_FOR_PILOT)                |
| status.json         | File tracking current production stage                                  |
| READY_FOR_PILOT     | Final status — package is complete and classroom-testable               |
| NEEDS_REVISION      | QA found blocking issues — must be fixed before pilot                   |
| Skill               | A reusable, self-contained execution module (e.g., skill-curriculum)    |
| Agent               | A specialized role that uses one or more skills                         |
| Orchestrator        | The master agent that runs the pipeline and coordinates all agents      |

## Pedagogic Terms

| Term                | Meaning                                                                 |
|---------------------|-------------------------------------------------------------------------|
| Curiosity Trigger   | The opening hook that activates student interest at the start of a unit |
| Active Element      | Any task, discussion, game, or build activity (not passive listening)   |
| Learner Output      | The concrete thing a student produces by the end of a lesson or course  |
| Module              | A self-contained teaching unit (typically 20–45 min)                    |
| Rubric              | Scoring criteria for student work (3 criteria × 3 levels)               |
| Exit Ticket         | A short end-of-lesson understanding check                               |
| Scaffold            | Structured support that reduces task complexity for younger learners    |
| Audience Band       | Elementary / Middle School / High School                                |

## File Terms

| Term                | Meaning                                                                 |
|---------------------|-------------------------------------------------------------------------|
| Slide_Deck_Spec     | Describes what appears on each slide (not the copy itself)              |
| Slide_Copy          | The exact text that appears on each slide                               |
| Game_Spec           | Complete game design document — objective, flow, scoring, rules         |
| Build_Instructions  | Step-by-step setup guide for a non-technical teacher                    |
| Test_Cases          | Scenarios to verify the game/app works correctly                        |
| QA_Checklist        | Scored review of the full package against 8 pedagogic dimensions        |
| Final_Checklist     | File completeness + readiness check for pilot                           |

## Tool Roles

| Tool         | Role in System                                           |
|--------------|----------------------------------------------------------|
| Claude Code  | Orchestration, curriculum writing, game spec, QA         |
| NotebookLM   | Deep research, source synthesis, podcast script          |
| Gemini       | Visual production, slide design, infographic generation  |
| Canva        | Design execution, final visual assets, templates         |
| GPT          | Strategic scaffolding, marketing copy                    |
| Wordwall     | Quick classroom game deployment                          |
| Glide/AppSheet | No-code micro-app for classroom use                   |

# skill-interactive

**Trigger:** STEP 4 of pipeline, or `/generate-asset game`
**Purpose:** Design a complete, buildable interactive learning asset.

---

## Inputs
- `Course_Brief.md`
- `02_Curriculum/Syllabus.md`
- `02_Curriculum/Lesson_Plans.md`

## Rules to Load
- `game-rules.md`
- `pedagogic-method.md`

---

## Decision: Game vs App

| Condition                                    | Choose         |
|----------------------------------------------|----------------|
| Live classroom, group competition             | Classroom game |
| Knowledge check with scoring                 | Quiz           |
| Data entry or personalized tracking needed   | Micro-app      |
| Multi-step decision scenario                 | Simulation     |

Default: design a Classroom Game unless brief specifies otherwise.

---

## Execution Steps

### 1. Write Game_Spec.md

```markdown
# Game Spec — [Game Title]

## Game Summary
[1–2 sentences: what is this game, what do students do]

## Educational Goal
[Which learning outcome this game reinforces]

## Player Role
[Who is the student in this game — e.g., Data Detective, Algorithm Engineer]

## Platform
[Wordwall / Kahoot / Physical cards / Google Slides + timer / Custom]

## Duration
[X–Y minutes total]

## Stage Flow

### Stage 1 — [Setup]
[What happens — duration]

### Stage 2 — [Core Round 1]
[What happens — duration]

### Stage 3 — [Mid-point / Escalation]
[What happens — duration]

### Stage 4 — [Core Round 2]
[What happens — duration]

### Stage 5 — [Final / Reveal / Leaderboard]
[What happens — duration]

## Scoring Logic
- [Action] = [N] points
- Bonus: [condition] = [N] extra points
- Max possible score: [N]

## Win / Completion Condition
[What constitutes finishing or winning]

## Feedback System
[How students know if their answer was correct — immediate]

## Materials Needed
[List everything required: cards, devices, projector, etc.]

## Teacher Setup Time
[Realistic estimate in minutes]
```

### 2. Write App_Spec.md (if needed)

```markdown
# App Spec — [App Name]

## Purpose
[What the app does in the classroom]

## Platform
[Glide / AppSheet / Google Forms + Sheets / No-code tool]

## Screens

### Screen 1 — [Name]
[What the student sees and does]

### Screen 2 — [Name]
[...]

## Database Schema
| Field           | Type    | Purpose               |
|-----------------|---------|-----------------------|
| student_name    | text    | identify entry        |
| [field]         | [type]  | [purpose]             |

## Logic Flow
[Simple decision tree or numbered logic steps]

## Teacher View
[What the teacher sees to monitor progress]
```

### 3. Write Build_Instructions.md

Step-by-step setup, executable by a non-technical teacher:

```markdown
# Build Instructions — [Game/App Title]

## Platform: [name]
## Estimated Setup Time: [X min]

## Step-by-Step Setup
1. [Action]
2. [Action]
...

## Asset Checklist
- [ ] [image / card / text file needed]
- [ ] [...]

## Device Requirements for Students
[Phone / Laptop / Nothing — just paper]

## Fallback Plan
[What to do if technology fails during the session]
```

### 4. Write Test_Cases.md

Minimum 3, maximum 7 test cases:

```markdown
## TEST CASE [N]
Scenario: [what the student is shown]
Expected action: [what they should do]
Expected result: [what happens]
Edge case: [wrong answer or unexpected behavior]
Pass condition: [how to verify this works]
```

---

## Output Quality Standard
- Game Spec has all 7 required sections
- Stage flow has no more than 5 stages
- Scoring is unambiguous
- Build Instructions are executable without prior technical knowledge
- Minimum 3 test cases covering main flow + 1 edge case
- Duration is within game time limits from `game-rules.md`

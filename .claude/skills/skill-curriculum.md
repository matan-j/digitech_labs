# skill-curriculum

**Trigger:** STEP 2 of pipeline, or `/generate-asset curriculum`
**Purpose:** Transform research and brief into a full curriculum package.

---

## Inputs
- `Course_Brief.md`
- `01_Research/Research_Output.md`
- `01_Research/Evidence_Snippets.md`

## Rules to Load
- `pedagogic-method.md`
- `age-adaptation.md`

---

## Execution Steps

### 1. Write OnePager_Product.md
One-page course description:
- Course title and audience
- What learners will be able to do (3–5 outcomes)
- What makes this course engaging
- What the final learner output is
- What tools/platforms are used
- Ideal for: [type of class, school, event]

### 2. Write Syllabus.md

```markdown
# [Course Title] — Syllabus

## Learning Outcomes
1. [verb] [specific skill or knowledge] — measurable
2. ...

## Final Learner Output
[what the student produces at the end]

## Module Breakdown

| Module | Title                | Duration | Activity Type |
|--------|---------------------|----------|---------------|
| 1      | [title]              | [X min]  | [type]        |
| 2      | ...                  | ...      | ...           |

## Tools Used
[list tools with access notes]

## Prerequisites
[what students need to know before starting]
```

### 3. Write Lesson_Plans.md
For each module, use the MODULE FLOW TEMPLATE from `pedagogic-method.md`:

```markdown
## MODULE [N] — [Title]
Duration: [X] minutes

### Opening Trigger
[The question, scenario, or challenge that opens this module]

### Theory Block
[Key concept — max 15 min, written as teacher-facing explanation]

### Guided Example
[Concrete example to demonstrate the concept]

### Student Activity
[What students do — instructions clear enough for a substitute teacher]
Materials needed: [...]
Time: [X min]

### Share / Check / Reflect
[How students share or validate understanding]

### Bridge to Next Module
[One sentence that connects this module to the next]

### Learner Output for This Module
[What the student has produced or completed by the end]
```

### 4. Write Worksheets.md
Design 1 worksheet per 2 modules (or as needed):

```markdown
## Worksheet [N] — [Title]

Target: Module [N]
Time to complete: [X min]

### Section A — [name]
[Task with instructions]

### Section B — [name]
[Task with instructions]

### Extension (optional)
[For fast finishers]
```

### 5. Write Rubric.md
3 criteria, 3 levels per criterion:

```markdown
# Rubric — [Course Title]

| Criterion         | Excellent (3)          | Adequate (2)           | Needs Work (1)       |
|-------------------|------------------------|------------------------|----------------------|
| [criterion 1]     | [description]          | [description]          | [description]        |
| [criterion 2]     | [description]          | [description]          | [description]        |
| [criterion 3]     | [description]          | [description]          | [description]        |
```

### 6. Write Instructor_Checklist.md
Pre-session setup list for the teacher:

```markdown
# Instructor Checklist — [Course Title]

## Before the Session
- [ ] [preparation step]
- [ ] [platform setup]
- [ ] [materials printed or prepared]

## During the Session
- [ ] [timing check per module]
- [ ] [activity facilitation note]

## After the Session
- [ ] [collect learner outputs]
- [ ] [note what worked / didn't]
```

---

## Output Quality Standard
- Learning outcomes are specific and measurable (use action verbs)
- Module timings sum to declared `duration_hours`
- Each module contains an activity per `pedagogic-method.md` rules
- Final learner output is defined and achievable
- Worksheets have clear instructions without author dependency
- Rubric criteria match the declared `final_output`

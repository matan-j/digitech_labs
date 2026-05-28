# qa-standards.md — Quality Control Criteria

Use these criteria when running `/qa-review` or `skill-qa`.

---

## QA DIMENSIONS AND SCORING

For each dimension: PASS / WARN / FAIL

### Dimension 1 — Pedagogic Clarity
- Is the instructional goal clear?
- Does the lesson flow logically from trigger → theory → activity → output?
- Are transitions between stages explicit?

| Score | Meaning                                         |
|-------|-------------------------------------------------|
| PASS  | Flow is clear, logical, and easy to follow      |
| WARN  | Flow exists but has gaps or unclear transitions |
| FAIL  | No clear flow, or flow is confusing/broken      |

### Dimension 2 — Age Fit
- Is language appropriate for the declared audience band?
- Are examples relevant and recognizable to the target age?
- Is task length appropriate for the cognitive stamina of the band?

| Score | Meaning                                          |
|-------|--------------------------------------------------|
| PASS  | Content is clearly calibrated to the age band    |
| WARN  | Mostly appropriate but has one or two mismatches |
| FAIL  | Clearly wrong for the age — would not work       |

### Dimension 3 — Realistic Time Allocation
- Does the total declared time match the declared `duration_hours`?
- Are individual module times realistic (not too short, not inflated)?
- Is the number of slides within the limit for the course duration?

| Score | Meaning                                                        |
|-------|----------------------------------------------------------------|
| PASS  | Times are realistic and add up correctly                       |
| WARN  | Times are slightly off or one module is unrealistically short  |
| FAIL  | Total time is significantly off, or modules are clearly wrong  |

### Dimension 4 — Active Learning Presence
- Does every module contain at least one active element?
- Is there no module that is purely lecture/text?

| Score | Meaning                                      |
|-------|----------------------------------------------|
| PASS  | Every module has an active component         |
| WARN  | Most modules do, one is passive              |
| FAIL  | Multiple passive modules, no activities      |

### Dimension 5 — Learner Output Existence
- Does the full unit or course end with a concrete learner output?
- Is the output tangible and verifiable?

| Score | Meaning                                            |
|-------|----------------------------------------------------|
| PASS  | Clear tangible output defined and achievable       |
| WARN  | Output exists but is vague or hard to verify       |
| FAIL  | No learner output defined                          |

### Dimension 6 — Teacher Workload
- Can a teacher who did not design this course run it from these materials?
- Is the instructor checklist complete?
- Are setup requirements realistic?

| Score | Meaning                                               |
|-------|-------------------------------------------------------|
| PASS  | Materials are self-sufficient for a prepared teacher  |
| WARN  | Teacher would need to fill gaps but mostly manageable |
| FAIL  | Materials require the original author to run the class |

### Dimension 7 — Interactive Element Quality
- If a game or quiz is included, is it buildable?
- Does it have test cases?
- Is the scoring defined?

| Score | Meaning                                       |
|-------|-----------------------------------------------|
| PASS  | Fully spec'd, buildable, tested               |
| WARN  | Mostly complete but missing one element       |
| FAIL  | Vague idea, not buildable without major work  |

### Dimension 8 — Instructional Flow Coherence
- Does the content build logically from simpler to more complex?
- Are knowledge gaps avoided (no prerequisites assumed without setup)?
- Does real-world relevance appear at the right points?

| Score | Meaning                                            |
|-------|----------------------------------------------------|
| PASS  | Logical progression, no jumps                      |
| WARN  | Minor sequencing issue but not fatal               |
| FAIL  | Content jumps in complexity, prerequisites missing |

---

## QA CHECKLIST OUTPUT FORMAT

```
QA REVIEW — Course: <slug>
Reviewer: Claude Code
Date: YYYY-MM-DD
─────────────────────────────────────────

[1] Pedagogic Clarity        → PASS / WARN / FAIL
    Notes: ...

[2] Age Fit                  → PASS / WARN / FAIL
    Notes: ...

[3] Realistic Time           → PASS / WARN / FAIL
    Notes: ...

[4] Active Learning          → PASS / WARN / FAIL
    Notes: ...

[5] Learner Output           → PASS / WARN / FAIL
    Notes: ...

[6] Teacher Workload         → PASS / WARN / FAIL
    Notes: ...

[7] Interactive Quality      → PASS / WARN / FAIL
    Notes: ...

[8] Instructional Flow       → PASS / WARN / FAIL
    Notes: ...

─────────────────────────────────────────
OVERALL STATUS: READY_FOR_PILOT / NEEDS_REVISION / BLOCKED

PRIORITY FIXES (if applicable):
1. [specific fix with file reference]
2. [specific fix with file reference]

NEXT ITERATION SUGGESTIONS:
- ...
```

---

## FAILURE THRESHOLDS

| Condition                      | Action                          |
|--------------------------------|---------------------------------|
| 1 FAIL                         | Flag, add to blocking issues    |
| 2+ FAILs                       | Status = NEEDS_REVISION         |
| Any FAIL in Dimensions 4 or 5  | Must be fixed before pilot      |
| All PASS / WARN only           | Status = READY_FOR_PILOT        |

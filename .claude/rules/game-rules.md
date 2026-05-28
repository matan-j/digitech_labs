# game-rules.md — Interactive Asset Standards

Apply these rules when generating Game_Spec.md, App_Spec.md, Build_Instructions.md, or Test_Cases.md.

---

## INTERACTIVE ASSET TYPES

| Type          | Best For                              | Platform Suggestion        |
|---------------|---------------------------------------|----------------------------|
| Classroom game | Live group competition               | Wordwall, Kahoot, physical |
| Quiz          | Knowledge check with scoring          | Wordwall, Google Forms     |
| Challenge     | Problem-solving flow                  | Slides + timer             |
| Simulation    | Decision-making scenarios             | Custom HTML / Glide        |
| Mini app      | Data entry, visualization, tracking  | Glide, AppSheet, no-code   |

---

## GAME SPEC REQUIRED ELEMENTS

Every `Game_Spec.md` must define:

### 1. Game Objective
- One clear sentence: what does the player win by doing?
- Example: "Earn the most points by correctly classifying data types before the timer ends"

### 2. Player Role
- Who is the student in this game? (Detective, Analyst, Data Engineer, etc.)
- This increases engagement and ownership

### 3. Flow Steps (max 5 main stages)

```
Stage 1 — [Setup / Intro] — [duration]
Stage 2 — [Core challenge round 1] — [duration]
Stage 3 — [Mid-point] — [duration]
Stage 4 — [Core challenge round 2 or escalation] — [duration]
Stage 5 — [Final / Reveal / Leaderboard] — [duration]
```

### 4. Scoring Logic
- How points are earned
- Bonus conditions
- Penalty conditions (if any)
- Max possible score

### 5. Win / Completion Condition
- What does "done" look like?
- Is there a time limit?
- Is there a score threshold?

### 6. Feedback System
- Immediate feedback on each answer: YES / NO / explanation
- No silent scoring — learner always knows if they were right

### 7. Leaderboard (optional)
- If used: how is it displayed?
- Class-wide / team / individual

### 8. Materials Needed
- Physical cards? Digital device? Screen? Paper?
- Teacher-side setup requirements

---

## GAME TIME LIMITS

| Setting            | Target Duration |
|--------------------|-----------------|
| Warm-up game       | 5–10 min        |
| Main classroom game | 15–25 min      |
| Full session game  | Max 30 min      |

Never design a game that takes more than 30 minutes in a school context.

---

## TEST CASES REQUIRED FORMAT

Every game must have 3–7 test cases in `Test_Cases.md`:

```
TEST CASE [N]
Scenario: [what the student is shown or asked]
Expected action: [what they should do]
Expected result: [what the system / teacher / card shows]
Edge case: [what happens if student gives wrong answer or unexpected input]
Pass condition: [how to confirm this works correctly]
```

---

## BUILD INSTRUCTIONS REQUIRED FORMAT

`Build_Instructions.md` must specify:

1. **Platform choice** and why (Wordwall / Glide / AppSheet / Google Slides + macro / physical)
2. **Step-by-step setup** (numbered, executable by a non-technical teacher)
3. **Asset list** (images, cards, texts, data needed)
4. **Teacher setup time estimate**
5. **Student device requirements** (phone / computer / nothing)
6. **Fallback** — what to do if technology fails

---

## MINIMUM QUALITY BAR FOR INTERACTIVE ASSETS

A game spec is COMPLETE when:
- [ ] Objective is specific and achievable
- [ ] Flow has no more than 5 stages
- [ ] Scoring is unambiguous
- [ ] Feedback is immediate
- [ ] Build instructions are executable by a non-developer
- [ ] Test cases cover the main flow + one edge case
- [ ] Time estimate is realistic for the classroom context

A game spec is INCOMPLETE if:
- Vague objective ("students will interact with data")
- No scoring definition
- No flow stages
- No test cases
- No build instructions
- Duration is unmarked

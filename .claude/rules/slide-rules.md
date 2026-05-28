# slide-rules.md — Presentation Construction Standards

Apply these rules when generating Slide_Deck_Spec.md, Slide_Copy.md, or any slide-related asset.

---

## SLIDE COUNT LIMITS

| Course Duration | Max Slides |
|-----------------|------------|
| 4 hours         | 12–14      |
| 6 hours         | 16–20      |
| 8 hours         | 20–24      |

Never exceed these limits. If content requires more → condense or split into activities.

---

## MANDATORY DECK STRUCTURE

Every deck must contain:

1. **Opening Slide** — Course title + visual hook (not a text block)
2. **Goal Slide** — What the learner will be able to do by the end
3. **Module Slides** — Per module: intro + content + activity prompt
4. **Interaction Slides** — One every 5 slides minimum
5. **Closing Slide** — Summary + final output reminder + what's next

---

## SLIDE COPY RULES

| Rule                          | Standard                                      |
|-------------------------------|-----------------------------------------------|
| Title per slide               | Max 8 words                                   |
| Bullets per slide             | Max 5                                         |
| Words per bullet              | Max 10                                        |
| Paragraphs                    | NEVER on a slide                              |
| Font note                     | Specify heading + body in Visual Brief        |
| Language register             | Match audience band                           |

---

## INTERACTION SLIDE TYPES

Insert one of these every 4–5 content slides:

- **Poll/Question slide** — "Which of these is an example of big data?"
- **Discussion prompt** — "Talk to the person next to you: where did you encounter this today?"
- **Challenge slide** — "You have 90 seconds — find the error in this dataset"
- **Prediction slide** — "What do you think happens next?"
- **Reflection slide** — "Write one thing you now understand that you didn't before"
- **Quick check slide** — "Thumbs up if you can explain this to a friend"

---

## VISUAL BRIEF REQUIREMENTS

Every slide deck spec must include a `Visual_Assets_Brief.md` with:

1. Overall visual style (clean/bold/minimal/colorful)
2. Dominant color palette (2–3 colors + neutral)
3. Image direction per key slide (not per every slide)
4. Icon style preference (flat / outlined / illustrated)
5. Canva template or starting format recommendation
6. Font pairing suggestion (heading + body)

---

## IMAGE PROMPTS REQUIREMENTS

For every slide that calls for an image, write a Canva-ready or Gemini-ready image prompt:

```
Slide [N] — [slide title]
Image prompt: [description in English, 1–2 sentences]
Style: [photographic / illustrated / data visual / infographic]
Mood: [energetic / calm / professional / playful]
Avoid: [stock photo clichés, text on image, cluttered layouts]
```

---

## FACILITATOR DESIGN PRINCIPLE

Slides must support the facilitator, not replace them.

Good slides:
- Set the scene
- Display the question or challenge
- Show the visual that anchors understanding
- Cue the activity

Bad slides:
- Read the lesson to the teacher
- Contain full explanations the teacher should be saying
- Replace the discussion with a wall of text
- Make the learner passive

---

## SLIDE SPEC FORMAT

When writing `Slide_Deck_Spec.md`, use this structure per slide:

```
SLIDE [N]
Type: [content / interaction / activity / transition / opening / closing]
Title: [slide title]
Visual: [describe what appears visually — image, icon, chart, whitespace]
Copy: [exact text that appears on slide — short]
Facilitator note: [what the teacher says or does during this slide]
Duration: [how long to spend on this slide]
```

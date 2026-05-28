import { CourseBrief } from '../../types';

export function getSlidesSystemPrompt(): string {
  return `אתה מעצב תוכן ומצגות בכיר של Digitech. אתה בונה מצגות שתומכות במנחה — לא מחליפות אותו.

כללי מצגות Digitech — חובה:

מגבלות כמות שקפים:
- 4 שעות → 12-14 שקפים
- 6 שעות → 16-20 שקפים
- 8 שעות → 20-24 שקפים
לעולם לא לחרוג. אם תוכן דורש יותר → לדחוס לפעילות.

מבנה חובה:
1. שקף פתיחה — ויזואל חזק, לא בלוק טקסט
2. שקף מטרות — מה הלומד יוכל לעשות בסוף
3. שקפי מודול — פתיחה + תוכן + פרומפט פעילות
4. שקף אינטראקטיבי — אחד לכל 4-5 שקפי תוכן
5. שקף סיום — סיכום + תזכורת תוצר + מה הלאה

כללי Copy:
- כותרת: מקסימום 8 מילים
- Bullets: מקסימום 5 לשקף, 10 מילים לכל bullet
- אין פסקאות על שקף — לעולם

סוגי שקפים אינטראקטיביים:
- שאלה / סקר / פרומפט לדיון / אתגר / ניחוי / רפלקציה / בדיקה מהירה

פורמט קבצים:
=== FILE: filename.md ===
[content]
=== END FILE ===`;
}

// Part 1: Slide_Deck_Spec + Slide_Copy
export function getSlidesUserPromptPart1(brief: CourseBrief): string {
  return `צור את מפרט ותוכן המצגת לקורס. צור שני קבצים.

**נתוני הקורס:**
- שם: ${brief.title}
- קהל: ${brief.targetAudience} | גיל: ${brief.ageGroup}
- משך: ${brief.duration}
- כלים: ${brief.tools}
- טון: ${brief.tone}

כמות שקפים לפי משך (${brief.duration}): 4h=12-14, 6h=16-20, 8h=20-24. קבע את המספר המדויק.
שקף אינטראקטיבי אחד לכל 4-5 שקפי תוכן — חובה.

=== FILE: Slides/Slide_Deck_Spec.md ===
# מפרט מצגת: ${brief.title}

[לכל שקף — SLIDE [N]:
SLIDE [N]
Type: [content / interaction / activity / transition / opening / closing]
Title: [כותרת — מקסימום 8 מילים]
Visual: [תיאור מה מופיע ויזואלית]
Copy: [הטקסט המדויק על השקף]
Facilitator note: [מה המנחה אומר / עושה]
Duration: [משך על השקף]
]
=== END FILE ===

=== FILE: Slides/Slide_Copy.md ===
# תוכן שקפים: ${brief.title}

[לכל שקף:
## Slide [N] — [כותרת]
**Headline:** [טקסט הכותרת]
**Body:**
- [bullet 1 — מקסימום 10 מילים]
- [bullet 2]
**CTA / Prompt (לשקפי אינטראקציה):** [שאלה או פעולה]
]
=== END FILE ===`;
}

// Part 2: Visual_Assets_Brief + Image_Prompts
export function getSlidesUserPromptPart2(brief: CourseBrief): string {
  return `צור את הנחיות הויזואל ופרומפטי התמונות למצגת "${brief.title}" עבור קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}), טון: ${brief.tone}.

=== FILE: Slides/Visual_Assets_Brief.md ===
# Visual Assets Brief: ${brief.title}

## Overall Style
[תיאור הסגנון הויזואלי הכולל]

## Color Palette
- Primary: [צבע / HEX]
- Secondary: [צבע / HEX]
- Accent: [צבע / HEX]
- Background: [לבן / כהה / אפור בהיר]

## Typography
- Heading font: [הצעה]
- Body font: [הצעה]

## Icon Style
[Flat / Outlined / Illustrated]

## Canva Template Starting Point
[המלצת קטגוריית תבנית + לוגיקת פריסה]

## Per-Module Visual Direction
| מודול | גישה ויזואלית |
|-------|--------------|
[לכל מודול]
=== END FILE ===

=== FILE: Slides/Image_Prompts.md ===
# Image Prompts: ${brief.title}

[לכל שקף עם תמונה:
SLIDE [N] — [כותרת]
Image prompt: [תיאור 1-2 משפטים באנגלית — לCanva/Gemini]
Style: photographic / illustrated / data visual / infographic
Mood: [energetic / calm / professional / playful]
Avoid: stock clichés, cluttered layouts, text on image
]
=== END FILE ===`;
}

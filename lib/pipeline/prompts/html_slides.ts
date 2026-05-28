import { CourseBrief } from '../../types';

export function getHtmlSlidesSystemPrompt(): string {
  return `אתה מומחה ב-Reveal.js ועיצוב מצגות חינוכיות. אתה יוצר קובץ HTML מלא ועצמאי שמשתמש ב-Reveal.js מ-CDN.

כללים מחייבים:
1. פלט: HTML גולמי בלבד — ללא markdown fences, ללא הסברים
2. קובץ אחד עצמאי — כל הסגנונות והסקריפטים inline או מ-CDN
3. כיוון RTL: dir="rtl" על <html>, גופן Heebo מ-Google Fonts
4. כל שקף = <section> אחד ב-Reveal.js
5. עיצוב: כהה ומקצועי, צבעי Digitech (כחול #1E40AF, רקע #0F172A, accent #38BDF8)
6. שמור placeholder לתמונות: <!-- IMAGE_SLIDE_N --> בתוך ה-<section> המתאים
7. שקפים אינטראקטיביים: כפתורי הצבעה / קלט פשוט
8. אנימציות: data-fragment-index בלבד — אל תסתמך על תוספים חיצוניים

מבנה HTML:
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title>...</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/black.css">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
  <style>/* custom styles */</style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>...</section>
      ...
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
  <script>Reveal.initialize({...})</script>
</body>
</html>`;
}

export function getHtmlSlidesUserPrompt(brief: CourseBrief, spec: string, copy: string, visualBrief: string): string {
  return `צור מצגת Reveal.js מלאה לקורס "${brief.title}" עבור ${brief.targetAudience}.

## מפרט המצגת (Slide_Deck_Spec.md):
${spec}

## תוכן המצגת (Slide_Copy.md):
${copy}

## הנחיות עיצוב (Visual_Assets_Brief.md):
${visualBrief}

---

הוראות:
- צור <section> לכל SLIDE N מהמפרט
- השתמש בכותרת, copy ו-Facilitator note מהמפרט
- עבור כל שקף שיש בו Visual: השאר <!-- IMAGE_SLIDE_N --> כ-placeholder
- שקפים אינטראקטיביים (סוג interaction): הוסף כפתורי הצבעה פשוטים
- הנחיות מנחה: הצג בפינה תחתונה קטנה (font-size: 0.5em, opacity: 0.6)
- שמור על עיצוב נקי — לא יותר מ-5 bullets לשקף
- פלט HTML גולמי בלבד`;
}

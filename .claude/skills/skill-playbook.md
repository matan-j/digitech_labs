# skill-playbook

**Trigger:** `/playbook` or direct content paste with playbook request
**Purpose:** Generate a complete interactive HTML playbook from raw content — no pipeline needed.

---

## What This Skill Does

Takes any educational content (syllabus, lesson plans, course outline, raw text) and produces a single self-contained `playbook.html` file — a digital learning page students open in a browser.

Output matches the Digitech playbook standard:
- Fixed header with progress bar
- Right sidebar with module navigation
- Per-module: curiosity trigger → content → callout → video → activity → quiz
- Interactive quizzes with immediate feedback
- Vimeo video embeds (or placeholders)
- RTL Hebrew, Heebo font

---

## Input Format

Send a message with this structure:

```
/playbook

## BRIEF
שם: [course title]
קהל: [target audience]
גיל: [age group]

## DESIGN
[see Design Instructions below — or write "Digitech Standard" to use defaults]

## VIDEOS
מודול 1: https://vimeo.com/123456789
מודול 1 סרטון 2: https://vimeo.com/987654321
מודול 2: https://vimeo.com/111111111

## CONTENT
[paste full content here — syllabus, lesson plans, modules, any text]
```

---

## Design Instructions — Full Spec

Include a `## DESIGN` block to control every visual aspect:

```
## DESIGN
סגנון: [dark / light / brand]
צבע רקע: #0F172A
צבע כרטיסים: #1E293B
צבע accent: #38BDF8
צבע כפתורים: #1E40AF
צבע טקסט ראשי: #F1F5F9
צבע טקסט משני: #94A3B8
גופן: Heebo          ← או כל Google Font אחר
לוגו טקסט: Digitech  ← טקסט בהדר במקום לוגו תמונה
סגנון callout: bordered  ← bordered / filled / minimal
סגנון שאלות: cards      ← cards / list / bubbles
```

### מצבים מוכנים מראש (shortcuts)
- `Digitech Standard` — #0F172A + #38BDF8 + Heebo (ברירת מחדל)
- `Light Professional` — רקע לבן, כחול כהה, Inter
- `Brand Custom` — ואז ציין כל צבע בנפרד

---

## Video Format

מספר סרטונים באותו מודול — כותבים שורות נפרדות עם אותו שם מודול:

```
מודול 1: https://vimeo.com/111111111
מודול 1 סרטון 2: https://vimeo.com/222222222
מודול 1 סרטון 3: https://vimeo.com/333333333
מודול 2: https://vimeo.com/444444444
```

כל סרטון יופיע ברצף כרונולוגי בתוך המודול.

---

## Output

Claude מחזיר קובץ HTML מלא בין תגי קוד:

```html
<!DOCTYPE html>
...
</html>
```

שומרים כ-`playbook.html` ופותחים בדפדפן — או מעלים ל-Vercel/GitHub Pages.

---

## Execution Rules

1. כל מודול בתוכן = section נפרד בסיידבר
2. לפחות שאלה אחת לכל מודול (4 אפשרויות, פידבק מיידי)
3. אם יש Vimeo URL — embed iframe responsive
4. אם אין — video-placeholder מעוצב
5. מספר סרטונים? — כולם מוטמעים ברצף עם כותרת לכל אחד
6. צבעים מה-DESIGN block מחליפים את ברירות המחדל
7. פלט HTML גולמי בלבד — מתחיל ב-`<!DOCTYPE html>`

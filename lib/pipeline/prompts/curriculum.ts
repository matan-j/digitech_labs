import { CourseBrief } from '../../types';

export function getCurriculumSystemPrompt(): string {
  return `אתה מעצב פדגוגי בכיר של Digitech. אתה בונה תכניות לימודים שעובדות בכיתה אמיתית, עם מורה אמיתי, עם תלמידים אמיתיים.

כללי הלמידה הפעילה של Digitech — חובה בכל מודול:
1. כל מודול נפתח ב-Curiosity Trigger — שאלה, תרחיש, עובדה מפתיעה, או אתגר. לעולם לא: "היום נלמד על..."
2. בלוק תיאוריה — מקסימום 15 דקות רצופות. אחרי כל בלוק תיאוריה → פעילות מיידית
3. כל מודול כולל לפחות אלמנט אחד פעיל: פעילות, תרגיל, דיון, משימת בנייה, אתגר, רפלקציה, עבודת קבוצה, משחק
4. כל יחידה מסתיימת בתוצר תלמיד קונקרטי וניתן לאימות
5. שלוש שאלות שחייבות להופיע: למה זה חשוב? איפה רואים את זה? איך אני משתמש בזה?
6. בדיקת הבנה inline — לפחות אחת לכל מודול
7. רמת הקושי, אורך הפעילות, והדוגמאות — חייבים להיות מותאמים לגיל המוצהר

תבנית MODULE FLOW — השתמש בה לכל מודול:
[1] Opening Trigger (2-3 דקות)
[2] בלוק תיאוריה קצר (5-12 דקות, מקסימום 15)
[3] דוגמה מונחית (3-5 דקות)
[4] פעילות תלמיד (8-15 דקות)
[5] שיתוף / בדיקה / רפלקציה (3-5 דקות)
[6] גשר למודול הבא (1-2 דקות)
[7] תוצר תלמיד לסיום מודול

פורמט קבצים:
=== FILE: filename.md ===
[content]
=== END FILE ===`;
}

// Part 1: OnePager_Product + Syllabus (2 short files)
export function getCurriculumUserPromptPart1(brief: CourseBrief): string {
  return `בנה את חלק א׳ מתכנית הלימודים לקורס. צור שני קבצים.

**נתוני הקורס:**
- שם: ${brief.title}
- קהל: ${brief.targetAudience} | גיל: ${brief.ageGroup}
- משך: ${brief.duration} | פורמט: ${brief.format}
- מטרה: ${brief.goal}
- כלים: ${brief.tools}
- ידע קודם: ${brief.prerequisites || 'אין'}
- הערות: ${brief.additionalNotes || 'אין'}

=== FILE: Curriculum/OnePager_Product.md ===
# ${brief.title} — תיאור הקורס

## קהל יעד
[${brief.targetAudience} | גיל ${brief.ageGroup}]

## מה הלומדים יוכלו לעשות בסוף
1. [פועל + מיומנות ספציפית — ניתן לאימות]
2.
3.
4.
5.

## תוצר תלמיד סופי
[מה התלמיד מייצר — קונקרטי]

## מה הופך את הקורס למעניין
- [נקודה 1]
- [נקודה 2]
- [נקודה 3]

## כלים ופלטפורמות
[רשימה + הערת גישה לכל כלי]

## מתאים ל
[סוג כיתה / בית ספר / אירוע]
=== END FILE ===

=== FILE: Curriculum/Syllabus.md ===
# סילבוס: ${brief.title}

## תוצאות למידה
1. [פועל + מיומנות — ניתן לאימות]
2.
3.
4.
5.

## תוצר תלמיד סופי
[מה התלמיד מייצר בסיום הקורס]

## פירוט מודולים

| מודול | כותרת | משך | סוג פעילות |
|-------|-------|-----|------------|
[מלא לכל מודולי הקורס — סכום = ${brief.duration}]

## כלים בשימוש
[כלי + הערת גישה / דרישה]

## ידע מוקדם נדרש
[${brief.prerequisites || 'אין'}]
=== END FILE ===`;
}

// Part 2: Lesson_Plans module 1 only
export function getCurriculumUserPromptPart2(brief: CourseBrief): string {
  return `כתוב תכנית שיעור מלאה למודול 1 בלבד של קורס "${brief.title}".
קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}). משך כולל הקורס: ${brief.duration}.

השתמש בתבנית MODULE FLOW המלאה (7 שלבים). מודול 1 = מבוא וכניסה לנושא.

=== FILE: Curriculum/Lesson_Plans.md ===
# תכניות שיעור: ${brief.title}

## מודול 1 — [כותרת]
**משך:** [X דקות]

### [1] Opening Trigger (2-3 דקות)
[שאלה / תרחיש / עובדה מפתיעה — לא "היום נלמד"]

### [2] Theory Block (מקסימום 15 דקות)
[הסבר למנחה — ברור, ממוקד]

### [3] Guided Example (3-5 דקות)
[דוגמה קונקרטית מותאמת לגיל ${brief.ageGroup}]

### [4] Student Activity (8-15 דקות)
**הוראות:** [ברורות למחנך חליפי]
**חומרים:** [...] | **זמן:** [X דקות]

### [5] Share / Check / Reflect (3-5 דקות)
[כיצד התלמידים מאמתים הבנה]

### [6] Bridge to Next Module (1-2 דקות)
[משפט אחד]

### [7] Learner Output
[מה התלמיד הפיק]
=== END FILE ===`;
}

// Part 3: Lesson_Plans modules 2-3
export function getCurriculumUserPromptPart3(brief: CourseBrief): string {
  return `כתוב תכניות שיעור מלאות למודולים 2-3 של קורס "${brief.title}".
קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}). משך כולל הקורס: ${brief.duration}.

השתמש בתבנית MODULE FLOW המלאה (7 שלבים) לכל מודול.
מודול 2 = העמקה ופעילות ראשית. מודול 3 = יישום מעשי.

=== FILE: Curriculum/Lesson_Plans_Part2.md ===
# תכניות שיעור (המשך): ${brief.title}

## מודול 2 — [כותרת]
**משך:** [X דקות]
[7 שלבים מלאים]

---

## מודול 3 — [כותרת]
**משך:** [X דקות]
[7 שלבים מלאים]
=== END FILE ===`;
}

// Part 4: Lesson_Plans modules 4-5 (final modules + wrap-up)
export function getCurriculumUserPromptPart4(brief: CourseBrief): string {
  return `כתוב תכניות שיעור מלאות למודולים 4-5 (המודולים האחרונים) של קורס "${brief.title}".
קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}). משך כולל הקורס: ${brief.duration}.

השתמש בתבנית MODULE FLOW המלאה (7 שלבים) לכל מודול.
מודול 4 = בניית תוצר. מודול 5 = הצגה וסיכום.

=== FILE: Curriculum/Lesson_Plans_Part3.md ===
# תכניות שיעור (סיום): ${brief.title}

## מודול 4 — [כותרת]
**משך:** [X דקות]
[7 שלבים מלאים]

---

## מודול 5 — [כותרת]
**משך:** [X דקות]
[7 שלבים מלאים]
=== END FILE ===`;
}

// Part 5: Worksheets + Rubric + Instructor_Checklist
export function getCurriculumUserPromptPart5(brief: CourseBrief): string {
  return `בנה את קבצי ההערכה וההנחיה לקורס "${brief.title}" עבור קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}), משך: ${brief.duration}, תוצר: ${brief.goal}.

=== FILE: Curriculum/Worksheets.md ===
# דפי עבודה: ${brief.title}

[דף עבודה אחד לכל 2 מודולים. לכל דף:
## דף עבודה [N] — [כותרת]
**מודול יעד:** [N] | **זמן למילוי:** [X דקות]

### חלק א׳ — [שם]
[משימה עם הוראות ברורות בלי תלות במחבר]

### חלק ב׳ — [שם]
[משימה]

### הרחבה (לסיימנים מוקדם)
[משימה נוספת — לא חובה]
]
=== END FILE ===

=== FILE: Curriculum/Rubric.md ===
# רובריקת הערכה: ${brief.title}

| קריטריון | מצוין (3) | מספיק (2) | חסר (1) |
|----------|-----------|-----------|---------|
| [קריטריון 1 — שקף את תוצר התלמיד: ${brief.goal}] | | | |
| [קריטריון 2] | | | |
| [קריטריון 3] | | | |

## הנחיות לבודק
[כיצד להשתמש ברובריקה]
=== END FILE ===

=== FILE: Curriculum/Instructor_Checklist.md ===
# Instructor Checklist: ${brief.title}

## לפני השיעור
- [ ] [שלב הכנה 1]
- [ ] [הגדרת פלטפורמה / כלי]
- [ ] [חומרים מודפסים / זמינים דיגיטלית]
- [ ] [בדיקת ציוד טכני]

## במהלך השיעור
- [ ] [בדיקת עמידה בזמן מודול X]
- [ ] [הנחיית פעילות X — שים לב ל...]
- [ ] [בדיקת הבנה — שאל: "..."]

## בסיום
- [ ] [איסוף תוצרי תלמידים]
- [ ] [תיעוד מה עבד / לא עבד]
- [ ] [Follow-up נדרש]
=== END FILE ===`;
}

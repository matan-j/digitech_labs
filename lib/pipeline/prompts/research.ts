import { CourseBrief } from '../../types';

export function getResearchSystemPrompt(): string {
  return `אתה מומחה פדגוגי ומחקר תוכן בכיר של Digitech — חברה ישראלית המלמדת מיומנויות דיגיטליות, AI, ועסקים.

כללי חובה:
- כל המחקר מותאם לגיל ורמת הקהל — לא גנרי
- כל פריט מחקר חייב להיות שמיש ישירות בתכנית הלימודים
- כל פלט מחקר כולל לפחות 2 עובדות מפתיעות שיכולות לשמש כ-Curiosity Trigger
- מקורות מוגדרים לפי שימוש: teacher-facing / student-facing
- Evidence Snippets הם בין 2-4 משפטים — לא יותר
- Podcast Script נכתב כשפה מדוברת, לא קריאה של רשימות
- Infographic Ideas מפורטים עם נקודות נתון ספציפיות, לא כותרות בלבד

כאשר אתה מייצר מספר קבצים, השתמש בפורמט הבא בלבד:
=== FILE: filename.md ===
[content]
=== END FILE ===`;
}

// Part 1: Research_Brief + Sources_List + Research_Output (3 files)
export function getResearchUserPromptPart1(brief: CourseBrief): string {
  return `בצע מחקר תוכן לקורס הבא וצור שלושה קבצים.

**נתוני הקורס:**
- שם: ${brief.title}
- קהל יעד: ${brief.targetAudience}
- גיל / שכבה: ${brief.ageGroup}
- משך: ${brief.duration}
- מטרה: ${brief.goal}
- כלים: ${brief.tools}
- ידע קודם: ${brief.prerequisites || 'אין'}
- הגבלות: ${brief.additionalNotes || 'אין'}

=== FILE: Research/Research_Brief.md ===
# Research Brief: ${brief.title}

## שאלות מפתח שהקורס חייב לענות
[6-8 שאלות ספציפיות — לא כותרות נושא]

## מושגי ליבה
[3-5 מושגים שהתלמיד חייב להבין לעומק — עם הסבר למה כל אחד קריטי]

## תפיסות שגויות נפוצות
[2-3 מיסקונספציות שמגיע מהתלמידים — וכיצד לטפל בכל אחת]

## נקודות כניסה מותאמות לגיל ${brief.ageGroup}
[3 נקודות — דוגמאות, אנלוגיות, או הקשרים שמדברים לגיל הזה ספציפית]
=== END FILE ===

=== FILE: Research/Sources_List.md ===
# מקורות ומשאבים: ${brief.title}

[לכל מקור:
## מקור [N] — [שם]
- סוג: [מאמר / מאגר נתונים / סרטון / דוח / כלי]
- מה לחלץ: [ספציפי]
- קהל: [student-facing / teacher-facing]
- התאמה לגיל ${brief.ageGroup}: [גבוה / בינוני / נמוך]
]


=== FILE: Research/Research_Output.md ===
# Research Output: ${brief.title}

## עובדות מפתח (6-8)
[כל עובדה — משפט אחד ברור ומדויק]

## Curiosity Triggers — עובדות מפתיעות
[2-3 עובדות מסומנות: ⚡ CURIOSITY TRIGGER — לשימוש כפתיחה לשיעור]

## דוגמאות מהעולם האמיתי
[2-3 דוגמאות המתאימות לגיל ${brief.ageGroup} — ספציפיות, לא גנריות]

## מילון מושגים
| מושג | הגדרה פשוטה |
|------|-------------|
[10-15 מושגים]
=== END FILE ===`;
}

// Part 2: Evidence_Snippets + Infographic_Ideas + Podcast_Script (3 files)
export function getResearchUserPromptPart2(brief: CourseBrief): string {
  return `צור שלושה קבצי מחקר תומכים לקורס "${brief.title}" עבור קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}).

=== FILE: Research/Evidence_Snippets.md ===
# Evidence Snippets: ${brief.title}

[4-6 קטעי עדות שמישים. לכל קטע:
## קטע [N]
[2-4 משפטים — ישיר ושמיש]
**ייחוס:** [מקור]
**שימוש מוצע:** [עוגן שקף / פרומפט לדיון / אלמנט בדף עבודה]
]
=== END FILE ===

=== FILE: Research/Infographic_Ideas.md ===
# רעיונות לאינפוגרפיקה: ${brief.title}

[3-5 רעיונות. לכל רעיון:
INFOGRAPHIC [N]
כותרת: [מה האינפוגרפיקה מציגה]
פורמט: [השוואה / ציר זמן / תרשים זרימה / הדגשת נתון / מפה]
נקודות נתון עיקריות: [הספרות / העובדות הספציפיות שיופיעו]
שימוש בקורס: [שקף / דף עבודה / פוסטר כיתה / דף תלמיד]
]
=== END FILE ===

=== FILE: Research/Podcast_Script.md ===
# Podcast Script: ${brief.title}

## פורמט: סקריפט מדובר | משך: 60-90 שניות

---

[HOOK — 10 שניות]
[עובדה מפתיעה או שאלה שפותחת — לא "שלום וברוכים הבאים"]

[CORE IDEAS — 40-50 שניות]
[3 רעיונות מרכזיים בשפה מדוברת, טבעית — לא רשימת bullets]

[STORY / EXAMPLE — 15 שניות]
[סיפור קצר או דוגמה אחת קונקרטית]

[CLOSE — 10 שניות]
[שאלה שמזמינה הרהור — לא סיכום]

---
**ספירת מילים:** [N] מילים (~[N] שניות קריאה)
=== END FILE ===`;
}

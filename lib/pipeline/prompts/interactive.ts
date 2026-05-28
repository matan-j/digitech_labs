import { CourseBrief } from '../../types';

export function getInteractiveSystemPrompt(): string {
  return `אתה מעצב חוויות למידה אינטראקטיביות בכיר של Digitech. אתה בונה משחקים ופעילויות שעובדים בכיתה אמיתית.

כללי נכסים אינטראקטיביים של Digitech — חובה:

בחירת סוג:
- כיתה חיה, תחרות קבוצתית → Classroom Game
- בדיקת ידע עם ניקוד → Quiz
- הזנת נתונים / מעקב אישי → Micro-app
- תרחיש קבלת החלטות רב-שלבי → Simulation
ברירת מחדל: Classroom Game

מגבלות זמן: חימום 5-10 דק׳, מרכזי 15-25 דק׳, מקסימום 30 דק׳.

Game Spec חייב לכלול: מטרה, תפקיד שחקן, 5 שלבי flow מקסימום, ניקוד ספציפי, תנאי ניצחון, פידבק מיידי, חומרים, זמן הכנה.
Build Instructions חייבות להיות ברות ביצוע על ידי מחנך שאינו טכני.
Test Cases — מינימום 3, מקסימום 7.

פורמט קבצים:
=== FILE: filename.md ===
[content]
=== END FILE ===`;
}

// Part 1: Game_Spec + App_Spec
export function getInteractiveUserPromptPart1(brief: CourseBrief): string {
  return `עצב את הנכס האינטראקטיבי המרכזי לקורס. צור שני קבצים.

**נתוני הקורס:**
- שם: ${brief.title}
- קהל: ${brief.targetAudience} | גיל: ${brief.ageGroup}
- כלים: ${brief.tools}
- מטרה: ${brief.goal}
- הגבלות: ${brief.additionalNotes || 'אין'}

בחר סוג (Game / Quiz / Micro-app / Simulation) ונמק. ברירת מחדל: Classroom Game.

=== FILE: Interactive/Game_Spec.md ===
# Game Spec: ${brief.title}

## סיכום המשחק
[1-2 משפטים]

## מטרה חינוכית
[איזה תוצאת למידה המשחק מחזק]

## תפקיד השחקן
[מי התלמיד במשחק]

## פלטפורמה
[Wordwall / Kahoot / כרטיסים פיזיים / Google Slides + טיימר / אחר]

## משך: [X-Y דקות סה״כ]

## שלבי Flow

### שלב 1 — [Setup]
[מה קורה — משך]

### שלב 2 — [Core Round 1]
[מה קורה — משך]

### שלב 3 — [Mid-point]
[מה קורה — משך]

### שלב 4 — [Core Round 2]
[מה קורה — משך]

### שלב 5 — [Final / Reveal]
[מה קורה — משך]

## לוגיקת ניקוד
- [פעולה] = [N] נקודות
- בונוס: [תנאי] = [N] נקודות נוספות
- ניקוד מקסימלי: [N]

## תנאי ניצחון / סיום

## מערכת פידבק
[כיצד התלמיד יודע אם ענה נכון — מיידי]

## חומרים נדרשים

## זמן הכנת מנחה: [X דקות]
=== END FILE ===

=== FILE: Interactive/App_Spec.md ===
# App Spec: ${brief.title}

[אם Micro-app / Simulation — מלא מפרט מסכים + database schema + logic flow.
אם Classroom Game / Quiz — כתוב:
Not applicable — Classroom Game chosen. See Game_Spec.md.]
=== END FILE ===`;
}

// Part 2: Build_Instructions + Test_Cases
export function getInteractiveUserPromptPart2(brief: CourseBrief): string {
  return `צור את הוראות הבנייה ומקרי הבדיקה לנכס האינטראקטיבי של קורס "${brief.title}" עבור קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}).

=== FILE: Interactive/Build_Instructions.md ===
# Build Instructions: ${brief.title}

## פלטפורמה: [שם]
**נימוק:** [למה הפלטפורמה הזו]
## זמן הכנה מוערך: [X דקות]

## שלבי הקמה
1. [פעולה]
2. [פעולה]
[המשך]

## רשימת נכסים
- [ ] [תמונה / כרטיס / קובץ נדרש]

## דרישות מכשיר לתלמידים
[טלפון / מחשב נייד / כלום — רק נייר]

## תכנית גיבוי לתקלה טכנית
[מה לעשות אם הטכנולוגיה נכשלת]
=== END FILE ===

=== FILE: Interactive/Test_Cases.md ===
# Test Cases: ${brief.title}

[3-7 תרחישים. לכל תרחיש:
## TEST CASE [N]
Scenario: [מה התלמיד רואה]
Expected action: [מה הוא עושה]
Expected result: [מה קורה]
Edge case: [תשובה שגויה או קלט בלתי צפוי]
Pass condition: [כיצד מאמתים שזה עובד]

כסה: Flow ראשי + לפחות תרחיש קצה אחד + תרחיש תשובה שגויה]
=== END FILE ===`;
}

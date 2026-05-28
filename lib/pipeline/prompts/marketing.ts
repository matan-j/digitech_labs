import { CourseBrief } from '../../types';

export function getMarketingSystemPrompt(): string {
  return `אתה מנהל שיווק ותוכן של Digitech. אתה כותב חומרי שיווק לקורסי חינוך שמגיעים למנהלי בתי ספר, מרכזי תכניות, הורים, ומתבגרים.

כללי שיווק Digitech — חובה:

Marketing OnePager — קורא היעד: מנהל בית ספר / מרכז תכניות:
- חייב לענות: מה, למי, למה שונה, מה הם מקבלים
- תוצר תלמיד הסופי חייב להופיע — זה מה שמוכר
- 400-600 מילה — מתאים לדף מודפס אחד
- שפה: עברית עסקית-חינוכית, לא שיווקית מדי

Video Script — 60-90 שניות (150-225 מילה):
- נכתב כשפה מדוברת — לא קריאה של bullet points
- HOOK חייב לעצור גלילה — שאלה, עובדה, או הצהרה חדה
- מבנה: Hook → בעיה → פתרון → הוכחה → CTA

Social Posts — כל פוסט שונה מהאחרים:
- LinkedIn: קהל מקצועי (מנהלים, מחנכים) — 150-200 מילה, סיפור + ערך + CTA
- Instagram/Facebook: קהל הורים/נוער — 50-80 מילה, ויזואלי, ישיר
- WhatsApp: מרכז בית ספר — 2-4 שורות, קצר וברור, פעולה ברורה

פורמט קבצים:
=== FILE: filename.md ===
[content]
=== END FILE ===`;
}

export function getMarketingUserPromptPart1(brief: CourseBrief): string {
  return `צור Marketing OnePager לקורס "${brief.title}".
קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}). משך: ${brief.duration}. תוצר: ${brief.goal}. כלים: ${brief.tools}.

=== FILE: Marketing/Marketing_OnePager.md ===
# ${brief.title} — סקירת התכנית

## The Problem
[1-2 משפטים: מה הפער שהקורס ממלא עבור בתי ספר]

## What Students Will Do
- [תוצאה בשפת פעולת תלמיד — לא "ילמדו", אלא "ייצרו / יבנו / ינתחו"]
- [תוצאה 2]
- [תוצאה 3]

## What Makes This Different
- [נקודת הבדל 1 — ספציפי, לא גנרי]
- [נקודת הבדל 2]
- [נקודת הבדל 3]

## Final Student Output
[התוצר הקונקרטי שהתלמיד מייצר]

## Who Is It For
**שכבה:** [גיל / כיתה]
**גודל קבוצה מומלץ:** [N תלמידים]
**סוג כיתה / אירוע:** [...]

## What's Included
- [ ] [מספר מפגשים + אורכם]
- [ ] [דפי עבודה]
- [ ] [משחק / פעילות אינטראקטיבית]
- [ ] [מדריך מנחה]
- [ ] [רובריקת הערכה]

## What You Need
[ציוד / אינטרנט / דרישות מוקדמות]

## Pricing / Contact
[placeholder]
=== END FILE ===`;
}

export function getMarketingUserPromptPart2(brief: CourseBrief): string {
  return `צור Video Script ו-Social Assets לקורס "${brief.title}".
קהל: ${brief.targetAudience} (גיל ${brief.ageGroup}). משך: ${brief.duration}. תוצר: ${brief.goal}.

=== FILE: Marketing/Video_Script.md ===
# Video Script: ${brief.title}

## פורמט: [Talking Head / Voiceover / Screen Record]
## משך: [60 / 75 / 90 שניות]

---

[HOOK — 10 שניות]
[שאלה, עובדה, או הצהרה שעוצרת גלילה — לא "שלום"]

[PROBLEM — 10-15 שניות]
[מה התלמידים חסרים / מה המחנכים מתקשים ללמד]

[SOLUTION — 20-25 שניות]
[מה הקורס עושה — ספציפי, לא גנרי]

[PROOF / EXAMPLE — 15 שניות]
[דוגמה קונקרטית אחת: מה תלמיד עושה או מייצר]

[CTA — 10 שניות]
[פעולה ברורה: צור קשר / קישור / פיילוט]

---
**Speaker notes:** [הנחיות למצולם]
**Visual cues:** [מה מוצג על המסך בכל חלק]
=== END FILE ===

=== FILE: Marketing/Social_Assets.md ===
# Social Assets: ${brief.title}

## Post 1 — LinkedIn (קהל מקצועי: מחנכים, מנהלים)
[150-200 מילה — פתיחה בסיפור, ערך מרכזי, CTA ברור]

---

## Post 2 — Instagram / Facebook (הורים / נוער)
[50-80 מילה — ישיר, ויזואלי, ממוקד בתוצאה]

---

## Post 3 — WhatsApp (מרכז בית ספר)
[2-4 שורות קצרות — מה, מתי, ואיך ליצור קשר]

---

## Hashtag Suggestions
[5-8 hashtags — עברית ו/או אנגלית]

## Image Direction per Post
- LinkedIn: [תיאור ויזואל]
- Instagram/Facebook: [תיאור ויזואל]
- WhatsApp: [אין צורך]
=== END FILE ===`;
}

export function getMarketingUserPrompt(brief: CourseBrief): string {
  return `צור חבילת שיווק מלאה לקורס. הפלט חייב לכלול שלושה קבצים מלאים.

**נתוני הקורס:**
- שם: ${brief.title}
- קהל: ${brief.targetAudience} | גיל: ${brief.ageGroup}
- משך: ${brief.duration} | פורמט: ${brief.format}
- מטרה: ${brief.goal}
- כלים: ${brief.tools}
- הערות: ${brief.additionalNotes || 'אין'}

---

**קובץ 1 — Marketing_OnePager.md**
עמוד אחד לקורא: מנהל בית ספר או מרכז תכניות. מבנה חובה:
The Problem → What Students Will Do → What Makes This Different → Final Student Output → Who Is It For → What's Included → What You Need → Pricing / Contact

**קובץ 2 — Video_Script.md**
סקריפט מדובר 60-90 שניות. מבנה: Hook (10 שניות) → Problem (10-15 שניות) → Solution (20-25 שניות) → Proof/Example (15 שניות) → CTA (10 שניות).
כולל: Speaker notes + Visual cues לכל חלק.

**קובץ 3 — Social_Assets.md**
3 פוסטים לפלטפורמות שונות — לא אותה ההודעה מפורמטת מחדש:
- LinkedIn: סיפור + ערך + CTA לקהל מקצועי
- Instagram/Facebook: קצר + ויזואלי לקהל הורים/נוער
- WhatsApp: ישיר למרכז בית ספר
כולל: 5-8 hashtags + הנחיית ויזואל לכל פוסט.

---

=== FILE: Marketing/Marketing_OnePager.md ===
# ${brief.title} — סקירת התכנית

## The Problem
[1-2 משפטים: מה הפער שהקורס ממלא עבור בתי ספר]

## What Students Will Do
- [תוצאה בשפת פעולת תלמיד — לא "ילמדו", אלא "ייצרו / יבנו / ינתחו"]
- [תוצאה 2]
- [תוצאה 3]

## What Makes This Different
- [נקודת הבדל 1 — ספציפי, לא גנרי]
- [נקודת הבדל 2]
- [נקודת הבדל 3]

## Final Student Output
[התוצר הקונקרטי שהתלמיד מייצר — מה שהופך את הקורס לאמיתי לקורא]

## Who Is It For
**שכבה:** [גיל / כיתה]
**גודל קבוצה מומלץ:** [N תלמידים]
**סוג כיתה / אירוע:** [...]

## What's Included
- [ ] [מספר מפגשים + אורכם]
- [ ] [דפי עבודה]
- [ ] [משחק / פעילות אינטראקטיבית]
- [ ] [מדריך מנחה]
- [ ] [רובריקת הערכה]

## What You Need
[ציוד / אינטרנט / דרישות מוקדמות — כנה ומדויק]

## Pricing / Contact
[השאר כ-placeholder או לפי הבריף]
=== END FILE ===

=== FILE: Marketing/Video_Script.md ===
# Video Script: ${brief.title}

## פורמט: [Talking Head / Voiceover / Screen Record]
## משך: [60 / 75 / 90 שניות]

---

[HOOK — 10 שניות]
[שאלה, עובדה, או הצהרה שעוצרת גלילה — לא "שלום"]

[PROBLEM — 10-15 שניות]
[מה התלמידים חסרים / מה המחנכים מתקשים ללמד]

[SOLUTION — 20-25 שניות]
[מה הקורס עושה — ספציפי, לא גנרי]

[PROOF / EXAMPLE — 15 שניות]
[דוגמה קונקרטית אחת: מה תלמיד עושה או מייצר]

[CTA — 10 שניות]
[פעולה ברורה: צור קשר / קישור / פיילוט]

---
**Speaker notes:** [הנחיות למצולם — קצב, הדגשות]
**Visual cues:** [מה מוצג על המסך בכל חלק]
=== END FILE ===

=== FILE: Marketing/Social_Assets.md ===
# Social Assets: ${brief.title}

## Post 1 — LinkedIn (קהל מקצועי: מחנכים, מנהלים)
[150-200 מילה — פתיחה בסיפור, ערך מרכזי, CTA ברור. אל תפתח ב"אני שמח לשתף"]

---

## Post 2 — Instagram / Facebook (הורים / נוער)
[50-80 מילה — ישיר, ויזואלי, ממוקד בתוצאה. לא להתחיל ב"פוסט חדש"]

---

## Post 3 — WhatsApp (מרכז בית ספר)
[2-4 שורות קצרות — מה, מתי, ואיך ליצור קשר. ישיר לחלוטין]

---

## Hashtag Suggestions
[5-8 hashtags רלוונטיים — עברית ו/או אנגלית]

## Image Direction per Post
- LinkedIn: [תיאור ויזואל]
- Instagram/Facebook: [תיאור ויזואל]
- WhatsApp: [תיאור ויזואל / לא נדרש]
=== END FILE ===`;
}

import { CourseBrief } from '../../types';

export function getGameHtmlSystemPrompt(): string {
  return `אתה מפתח משחקים חינוכיים. אתה יוצר קובץ HTML/JS עצמאי ומלא — משחק שרץ ישירות בדפדפן.

כללים מחייבים:
1. פלט: HTML גולמי בלבד — ללא markdown fences, ללא הסברים
2. קובץ אחד עצמאי — כל ה-CSS וה-JS inline, ללא CDN חיצוני
3. RTL: dir="rtl", גופן Heebo מ-Google Fonts (הדבק @import ב-<style>)
4. עיצוב: כהה ומקצועי, #0F172A רקע, #38BDF8 accent, #1E40AF כפתורים
5. עובד ב-iframe עם sandbox="allow-scripts allow-same-origin"
6. ללא: localStorage, window.top, window.opener, popups, fetch
7. כל לוגיקת המשחק ב-JavaScript inline ב-<script> tag
8. Responsive: עובד ב-viewport של 800px × 600px לפחות
9. מסך פתיחה → שלבי המשחק → מסך ניקוד סיום

מבנה נדרש:
- מסך START עם כותרת ומטרת המשחק
- שלבים לפי ה-Flow Stages ב-Game_Spec
- ניקוד חי גלוי בכל עת
- פידבק מיידי אחרי כל תשובה (✓ / ✗ + הסבר קצר)
- מסך FINISH עם ניקוד סופי ואפשרות לשחק שוב`;
}

export function getGameHtmlUserPrompt(brief: CourseBrief, gameSpec: string): string {
  return `צור משחק HTML מלא ופעיל לקורס "${brief.title}" עבור ${brief.targetAudience}.

## מפרט המשחק (Game_Spec.md):
${gameSpec}

---

הוראות:
- עקוב אחרי ה-Flow Stages המוגדרים במפרט
- יישם את מערכת הניקוד המוגדרת (נקודות לתשובה נכונה, בונוס אם יש)
- כל שאלה/אתגר: תוכן אמיתי בעברית הקשור ל"${brief.title}"
- לפחות 5-8 שאלות/אתגרים
- פידבק מיידי: הצג אם נכון/לא נכון + הסבר קצר (מילה-שתיים)
- טיימר אם מוגדר במפרט
- פלט HTML גולמי בלבד`;
}

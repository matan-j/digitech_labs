import type { Course } from './types';

/**
 * Seed data — these courses get written to disk on first boot
 * if no learn.json exists anywhere yet. After seeding, the source of truth
 * is the on-disk learn.json files in ~/Documents/Digitech-Courses/Course_*.
 */
export const SEED_COURSES: Course[] = [
  {
    slug: 'ai-agents',
    title: 'קורס סוכני AI',
    tagline: 'בנו סוכני AI פרקטיים — מאפיון ועד פריסה.',
    description:
      'קורס מעמיק לבניית סוכני AI מקצה לקצה. נעבור מאפיון נכון של משימה, דרך בניית הסוכן, חיבור לכלים, ועד פריסה ובדיקות. מתאים למקצוענים שרוצים לקפוץ מ-Prompt Engineering ל-Agentic Engineering.',
    audience: 'תיכון + מקצועי',
    cover: 'hero',
    lastUpdated: '19.2.2026',
    lessons: [
      {
        num: 1,
        slug: '1',
        title: 'הקדמה לסוכני AI ואיפיון נכון',
        vimeoId: '76979871',
        duration: '1h 12m',
        body: `
ברוכים הבאים לשיעור הראשון של קורס סוכני AI. בשיעור זה נתעמק במהות הסוכנים, נבין מה ההבדל בין Prompt רגיל לבין Agent, ונעבור על התהליך הנכון לאיפיון משימה לפני שמתחילים לבנות.

## מה זה סוכן AI?

סוכן AI הוא לא עוד פרומפט. זהו רכיב שמקבל מטרה, יכול לתכנן, להשתמש בכלים, ולקבל החלטות לאורך זמן. בניגוד לצ'אט שמגיב לשאלה, **סוכן** מבצע משימה מורכבת באופן עצמאי.

<span class="timestamp">2:25</span> נדבר על שלושה סוגים של סוכנים — Routing, Tool-using, Multi-agent.

<span class="timestamp">8:14</span> נראה הדגמה חיה של GPT שמבצע משימה אמיתית בכלים חיצוניים.

## איפיון נכון של משימה

לפני שאתם בונים סוכן, חובה לענות על שלוש שאלות:

1. **מה הקלט?** מה המידע שהסוכן מקבל בכל הפעלה.
2. **מה הפלט הצפוי?** איך נראית "הצלחה". מספר, מסמך, פעולה?
3. **מה הכלים שעומדים לרשותו?** API, חיפוש, קוד, שליחת מייל.

<span class="timestamp">19:40</span> נכנס לתבנית האפיון של Digitech — דף אחד שמכסה הכל.

## טעויות נפוצות

- בניית סוכן בלי הגדרת "Done"
- שימוש במודל גדול מדי למשימה פשוטה
- חוסר Logging — בלי לוגים אין דרך לדבג

## מה עושים בשיעור הבא?

נתחיל לבנות את הסוכן הראשון שלנו ב-OpenAI Assistants API. נחבר אותו לכלי חיצוני ונראה אותו רץ בפועל.
        `.trim(),
        resources: [
          { id: 'r1', title: 'תבנית איפיון סוכן (Excel)', url: '#', sizeMB: 0.01, kind: 'xlsx' },
          { id: 'r2', title: 'מצגת השיעור (PDF)', url: '#', sizeMB: 5.4, kind: 'pdf' },
        ],
      },
      { num: 2, slug: '2', title: 'בניית הסוכן הראשון', vimeoId: '76979871', duration: '1h 38m', body: 'תוכן השיעור השני יהיה כאן. נבנה סוכן ראשון מאפס.' },
      { num: 3, slug: '3', title: 'חיבור לכלים חיצוניים', vimeoId: '76979871', duration: '1h 42m', body: 'תוכן השיעור השלישי יהיה כאן. נחבר את הסוכן ל-API חיצוני.' },
      { num: 4, slug: '4', title: 'זיכרון ו-Memory חיצוני', vimeoId: '76979871', duration: '1h 16m', body: 'תוכן השיעור הרביעי יהיה כאן. נטמיע זיכרון ארוך טווח.' },
      { num: 5, slug: '5', title: 'Multi-Agent Orchestration', vimeoId: '76979871', duration: '1h 36m', body: 'תוכן השיעור החמישי יהיה כאן. נבנה מערכת רב-סוכנית.' },
      { num: 6, slug: '6', title: 'פריסה לפרודקשן', vimeoId: '76979871', duration: '59m 20s', body: 'תוכן השיעור השישי יהיה כאן. נעלה את הסוכן לפרודקשן.' },
    ],
    linkedAgents: [
      { id: 'a1', title: 'מפרק המשימות', href: '#' },
      { id: 'a2', title: 'סוכן לבניית סוכנים', href: '#' },
    ],
  },
  {
    slug: 'big-data-9th',
    title: 'נתונים גדולים — כיתה ט׳',
    tagline: 'מבוא ל-Big Data לתלמידי תיכון.',
    description:
      'קורס בן 4 שעות שנותן לתלמידים מבוא חי ופרקטי לעולם הנתונים הגדולים. דרך משחקים, אתגרים ומקרי בוחן אמיתיים.',
    audience: 'כיתה ט׳',
    cover: 'header',
    lastUpdated: '14.4.2026',
    lessons: [
      { num: 1, slug: '1', title: 'מה זה Big Data ולמה זה משנה לי?', vimeoId: '76979871', duration: '38m', body: 'תוכן ראשוני לשיעור.' },
      { num: 2, slug: '2', title: 'איך מאחסנים מאגר ענק?', vimeoId: '76979871', duration: '42m', body: 'תוכן שיעור 2.' },
      { num: 3, slug: '3', title: 'תרגול קבוצתי — הסיווג הגדול', vimeoId: '76979871', duration: '55m', body: 'תוכן שיעור 3.' },
    ],
  },
];

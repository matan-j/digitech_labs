# Digitech Playbook — Brand & Design System

> **מטרת הקובץ:** ספק עיצובי יחיד ומחייב לכל הפלייבוקים הדיגיטליים של Digitech.  
> הקובץ הזה נקרא ע"י Claude Code בתחילת כל session, ומחייב את כל הקומפוננטות, הצבעים, הטיפוגרפיה וההתנהגות של ה-UI.  
> **עקרון על:** כל פלייבוק חדש חייב להרגיש כאילו יצא מאותה חברה, באותו יום, ע"י אותו מעצב.

---

## 1. זהות הברנד (Essence)

**Digitech = Tech × Business × Education.**  
השפה הוויזואלית: **מינימליסטית, חדה, פרקטית.**  
לא: חמימה-ילדותית, לא מלאה-אייקונים-חמודים, לא "מסע רוחני".

**אנקרים:**
- **Deep Purple + Tech Blue** = הזהות הצבעונית הלא-ניתנת-למיקוח.
- **עברית RTL בגופן thick-bold** = כל הכותרות.
- **הרבה מרחב לבן** = הפלייבוק הוא כלי עבודה, לא כרזה.
- **אפקטי כהה נקודתיים** = Hero, Header, כרטיסי הדגש בלבד.

---

## 2. מערכת הצבעים (Color System)

### 2.1 הפלטה הקנונית — חובה להשתמש רק בצבעים האלה

```css
/* ========== PRIMARY — Purple Scale ========== */
--brand-purple-950: #1A0F3D;   /* Deepest. Hero backgrounds, cover cards.          */
--brand-purple-900: #2E1A5C;   /* Dark sections, footer, sidebar (dark mode).      */
--brand-purple-800: #3D2678;   /* Gradient stops, deep accents.                    */
--brand-purple-700: #4A2E8F;   /* PRIMARY BRAND PURPLE. Buttons, active states.    */
--brand-purple-600: #5B3AAE;   /* Hover states on primary.                         */
--brand-purple-500: #7A5FBF;   /* Secondary buttons, highlights.                   */
--brand-purple-400: #9B85D4;   /* Borders, dividers on dark bg.                    */
--brand-purple-300: #C4B8E6;   /* Soft highlights, lavender accents.               */
--brand-purple-200: #E0D9F2;   /* Subtle backgrounds, tags.                        */
--brand-purple-100: #F0ECF9;   /* Hover backgrounds on light mode.                 */
--brand-purple-50:  #F7F5FC;   /* Alt background, card surface on light mode.      */

/* ========== SECONDARY — Tech Blue Scale ========== */
--brand-blue-900:   #0A2F7D;   /* Dark blue anchors.                               */
--brand-blue-700:   #1E4FD6;   /* Deep tech blue.                                  */
--brand-blue-600:   #2E5FFF;   /* TECH-BLUE ACCENT. Links, progress, CTA secondary.*/
--brand-blue-500:   #4A7AFF;   /* Hover for blue elements.                         */
--brand-blue-400:   #7AA0FF;   /* Subtle blue highlight.                           */
--brand-blue-100:   #DCE7FF;   /* Info backgrounds.                                */

/* ========== NEUTRAL — Grayscale (cool, slight purple tint) ========== */
--neutral-950:      #0F0A1F;   /* Primary text on light mode.                      */
--neutral-900:      #1A1333;   /* Body text.                                       */
--neutral-700:      #3D3459;   /* Secondary text.                                  */
--neutral-500:      #6B6485;   /* Tertiary text, captions.                         */
--neutral-300:      #C8C4D4;   /* Dividers, disabled.                              */
--neutral-200:      #E4E1EC;   /* Light borders.                                   */
--neutral-100:      #F4F2F8;   /* Alt surface.                                     */
--neutral-0:        #FFFFFF;   /* Base surface light mode.                         */

/* ========== SEMANTIC ========== */
--success:          #10B981;
--warning:          #F59E0B;
--danger:           #EF4444;
--info:             var(--brand-blue-600);
```

### 2.2 Gradients (השתמש בזהירות, לא יותר מ-1 לעמוד)

```css
/* Hero Gradient — the brand signature gradient (from the cover image). */
--gradient-hero:
  linear-gradient(
    135deg,
    var(--brand-purple-900) 0%,
    var(--brand-purple-700) 50%,
    var(--brand-blue-700) 100%
  );

/* Subtle header gradient — for dark section backgrounds */
--gradient-header:
  linear-gradient(180deg, var(--brand-purple-950) 0%, var(--brand-purple-800) 100%);

/* Accent line — for horizontal dividers in hero sections */
--gradient-line:
  linear-gradient(90deg, var(--brand-purple-700), var(--brand-blue-600));
```

### 2.3 חוקי שימוש — חובה

| רכיב | Light Mode | Dark Mode |
|---|---|---|
| רקע עמוד | `--neutral-0` (#FFFFFF) | `--brand-purple-950` |
| רקע כרטיס תוכן | `--brand-purple-50` | `--brand-purple-900` |
| טקסט ראשי | `--neutral-950` | `--neutral-0` |
| טקסט משני | `--neutral-700` | `--brand-purple-300` |
| כפתור ראשי (רקע) | `--brand-purple-700` | `--brand-purple-600` |
| כפתור ראשי (טקסט) | `--neutral-0` | `--neutral-0` |
| קישור | `--brand-blue-600` | `--brand-blue-400` |
| בורדר עדין | `--neutral-200` | `--brand-purple-800` |
| progress bar | gradient: `--brand-purple-700` → `--brand-blue-600` | אותו |
| Hero section | `--gradient-hero` | `--gradient-hero` (זהה) |

**איסור מוחלט:**
- ❌ טורקיז, טיל, ירוק (זה לא הברנד. זה Growth AI).
- ❌ כתום, אדום-ורוד, זהב (חוץ מסמנטי בלבד).
- ❌ שחור מוחלט (`#000000`). תמיד `--neutral-950`.
- ❌ לבן מוחלט על סגול עמוק ללא עובי גופן 600+ (קריאות נפגעת).

---

## 3. טיפוגרפיה (Typography)

### 3.1 Font Stack

```css
/* Hebrew + Latin — both supported in all families */
--font-display: 'Heebo', 'Rubik', 'Assistant', system-ui, -apple-system, sans-serif;
--font-body:    'Heebo', 'Rubik', 'Assistant', system-ui, -apple-system, sans-serif;
--font-mono:    'JetBrains Mono', 'Menlo', 'Consolas', monospace;
```

**הורדה מחייבת (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### 3.2 Type Scale

| שם | Size | Line-Height | Weight | שימוש |
|---|---|---|---|---|
| `display-xl` | 56px / 3.5rem | 1.05 | 800 | Hero title (cover page בלבד) |
| `display-lg` | 44px / 2.75rem | 1.1 | 800 | כותרת עמוד שלב |
| `display-md` | 32px / 2rem | 1.15 | 700 | כותרת סקשן |
| `heading-lg` | 24px / 1.5rem | 1.3 | 700 | כותרת תת-סקשן |
| `heading-md` | 20px / 1.25rem | 1.4 | 600 | כותרת כרטיס |
| `heading-sm` | 18px / 1.125rem | 1.4 | 600 | תת-כותרת |
| `body-lg` | 18px / 1.125rem | 1.7 | 400 | פסקאות עיקריות (חובה 1.7 ל-RTL) |
| `body-md` | 16px / 1rem | 1.7 | 400 | ברירת מחדל |
| `body-sm` | 14px / 0.875rem | 1.6 | 400 | משני |
| `caption` | 13px / 0.8125rem | 1.5 | 500 | תגיות, מטא |
| `eyebrow` | 12px / 0.75rem | 1.2 | 700 | אותיות גדולות, tracking-wider |

### 3.3 חוקי טיפוגרפיה עברית

- כל כותרות Display ב-`font-weight: 800` (Heebo ExtraBold). לא פחות.
- פסקאות: `line-height: 1.7` מינימום (עברית דורשת יותר נשימה מאנגלית).
- אנגלית מוטמעת בתוך עברית: שמור על אותו גודל, אל תחליף משפחת גופן.
- שמות תוכניות דו-שוניים (`Master Brand | שיווק דיגיטלי`): השאר את הפיפ `|` עם רווח משני צדיו. זו חתימה של הברנד.
- **איסור:** ללא עיצוב עקום (italic) בעברית. Heebo Italic לא קיים, תוצאת ה-fallback מכוערת.

---

## 4. Layout & Spacing

### 4.1 Spacing Scale (Tailwind-compatible)

```
0:   0
1:   4px
2:   8px
3:   12px
4:   16px   ← base
6:   24px
8:   32px
12:  48px
16:  64px
20:  80px
24:  96px
```

### 4.2 Layout חובה לפלייבוק

**Desktop (>1024px):**
- Sidebar (RTL = צד ימין): `width: 320px`, קבוע, sticky.
- Content area: `max-width: 760px`, מרכז, `padding: 48px 64px`.
- Total page width: לא חורג מ-`1280px` (centered).

**Tablet (768px–1024px):**
- Sidebar: collapsible drawer מצד ימין (hamburger).
- Content: `padding: 32px 24px`.

**Mobile (<768px):**
- Sidebar: drawer מלא-גובה, overlay עם blur.
- Content: `padding: 24px 16px`.
- Title scale מוקטן ב-20% (display-lg → 36px).

### 4.3 Border Radius

```css
--radius-sm: 6px;    /* תגיות, inputs קטנים */
--radius-md: 10px;   /* כפתורים, inputs */
--radius-lg: 16px;   /* כרטיסים */
--radius-xl: 24px;   /* Hero cards, modals */
--radius-pill: 999px;/* כפתור עגול, badges */
```

**חוק:** כפתורים ראשיים = `--radius-pill` (כמו ב-Growth AI). כרטיסים = `--radius-lg`.

---

## 5. Components — מפרט חובה

### 5.1 Sidebar (Chronological Navigation)

**Structure:**
```
┌─ Sidebar (width: 320px) ──────────────┐
│  [Logo Digitech + שם הפלייבוק]      │
│  ─────────────────────────────────── │
│  [Progress Bar: X/Y שלבים]           │
│  ─────────────────────────────────── │
│  ▼ שלב 1 — כותרת     ✓              │  ← completed
│  ▼ שלב 2 — כותרת     ●              │  ← active (purple dot)
│    שלב 3 — כותרת                    │
│    שלב 4 — כותרת                    │
│    ...                              │
│  ─────────────────────────────────── │
│  [Toggle Dark/Light]  [Download PDF] │
└──────────────────────────────────────┘
```

**Styling:**
- Background: `--neutral-0` (light) / `--brand-purple-950` (dark).
- Border לצד השמאלי (RTL): `1px solid --neutral-200`.
- פריט פעיל: רקע `--brand-purple-100`, טקסט `--brand-purple-700`, left-border (RTL) 3px solid `--brand-purple-700`.
- פריט שהושלם: icon `✓` בצבע `--success`, טקסט `--neutral-500` (מעומעם).
- Progress bar: `height: 6px`, `--gradient-line` fill, `--neutral-200` background, `--radius-pill`.

### 5.2 Content Card (Body)

```css
.content-card {
  background: var(--neutral-0);
  border-radius: var(--radius-lg);
  padding: 32px;
  border: 1px solid var(--neutral-200);
  /* אין shadow חזק — רק דק ועדין */
  box-shadow: 0 1px 3px rgba(26, 15, 61, 0.04), 0 4px 12px rgba(26, 15, 61, 0.02);
}
```

### 5.3 Hero / Section Opener (כהה)

```css
.hero {
  background: var(--gradient-hero);
  color: var(--neutral-0);
  border-radius: var(--radius-xl);
  padding: 64px 48px;
  position: relative;
  overflow: hidden;
}

/* Subtle mesh overlay — adds depth without distraction */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 80%, rgba(122, 95, 191, 0.25), transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(46, 95, 255, 0.2),  transparent 60%);
  pointer-events: none;
}
```

### 5.4 Buttons

```css
/* Primary — CTA ראשי */
.btn-primary {
  background: var(--brand-purple-700);
  color: var(--neutral-0);
  padding: 14px 28px;
  border-radius: var(--radius-pill);
  font-weight: 600;
  font-size: 16px;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background: var(--brand-purple-600);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(74, 46, 143, 0.25);
}

/* Secondary — פעולה משנית */
.btn-secondary {
  background: transparent;
  color: var(--brand-purple-700);
  border: 1.5px solid var(--brand-purple-700);
  padding: 13px 28px;
  border-radius: var(--radius-pill);
  font-weight: 600;
}

/* Ghost — link-like */
.btn-ghost {
  color: var(--brand-blue-600);
  padding: 8px 16px;
  font-weight: 500;
}
```

**חוק:** רק 1 כפתור `primary` לכל viewport. יותר מזה = היררכיה שבורה.

### 5.5 Vimeo Embed

**חובה:**
- Aspect ratio: 16:9.
- `loading="lazy"` כברירת מחדל.
- Poster/placeholder עם icon Play לבן במרכז על רקע `--gradient-hero` עם blur.
- `border-radius: var(--radius-lg)`.
- לחיצה ראשונה: טען iframe + autoplay.
- Privacy: Vimeo `dnt=1` (Do Not Track) תמיד.

```jsx
<VimeoEmbed 
  id="76979871" 
  title="שלב 1 — פתיחה"
  posterGradient="hero"
  dnt={true}
/>
```

### 5.6 Progress Bar

```css
.progress-track {
  height: 6px;
  background: var(--neutral-200);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--brand-purple-700), var(--brand-blue-600));
  transition: width 0.4s ease;
  border-radius: var(--radius-pill);
}
```

### 5.7 Code Block / Prompt Box (חשוב לפלייבוקי AI)

```css
.prompt-box {
  background: var(--brand-purple-950);
  color: var(--neutral-0);
  border-radius: var(--radius-md);
  padding: 20px 24px;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  direction: ltr; /* prompts are typically LTR */
  text-align: left;
}
.prompt-box .copy-btn {
  position: absolute;
  top: 12px;
  left: 12px; /* LTR inside RTL parent */
  background: var(--brand-purple-700);
  color: white;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}
```

### 5.8 Quiz / Knowledge Check

- רקע: `--brand-purple-50`.
- בורדר: `1.5px solid --brand-purple-200`.
- תשובות: כפתורים ברוחב מלא, `--radius-md`.
- תשובה נכונה נבחרה: רקע `--success`, טקסט לבן, icon ✓.
- תשובה שגויה: רקע `--danger` (רך), רעד קצר (shake).

---

## 6. אייקונים (Icons)

**ספרייה מחייבת:** `lucide-react` (מינימליסטית, עקבית, תומכת RTL דרך transform).  
**גודל ברירת מחדל:** `20px`. בכותרות גדולות: `24px` או `28px`.  
**צבע:** יורש מהטקסט (`currentColor`) — לעולם לא קבוע hard-coded.

**לא להשתמש ב:** emoji-icons צבעוניים מרובי-אייקוני, Font Awesome (כבד מדי), איורים חמודים.

---

## 7. Motion / Interaction

### 7.1 Durations

```css
--duration-fast:   150ms;  /* hover, micro-interactions */
--duration-base:   250ms;  /* רגיל */
--duration-slow:   400ms;  /* page transitions, drawer */
```

### 7.2 Easings

```css
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);     /* default */
--ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);       /* material */
```

### 7.3 חוקי Motion

- **אסור:** bounce, wobble, rainbow. זה לא Duolingo.
- **מותר:** fade, slide (קצר, <12px), scale עדין (0.98 → 1).
- **Hero gradient:** יכול לקבל `background-position` animation איטי (20s+) — אבל רק בעמוד פתיחה.
- **צ'ק-לחיצה בסיידבר:** checkmark מופיע עם scale 0 → 1.2 → 1 ב-400ms.

---

## 8. Accessibility (חובה)

- **ניגודיות:** WCAG AA מינימום. טקסט על סגול-700 חייב להיות לבן או `--brand-purple-50`.
- **Focus states:** `outline: 2px solid --brand-blue-500`, `outline-offset: 2px`. לעולם לא להסיר.
- **RTL:** `dir="rtl"` על ה-`<html>`, לא על divs בודדים. Tailwind `rtl:` variants לכל כיווניות.
- **Keyboard:** כל פעולה חייבת להיות נגישה ב-Tab + Enter. Sidebar items = `<a>`, לא `<div onClick>`.
- **Screen readers:** Hebrew `lang="he"` על ה-html, וידאו עם `<track>` לכתוביות אם קיים.
- **Motion:** כבד `prefers-reduced-motion` — ביטול כל האנימציות.

---

## 9. Logo Usage

**לוגו Digitech:**
- גודל מינימלי: `120px` ברוחב.
- Clear space: גובה של אות D מכל צד.
- על רקע לבן: הלוגו המקורי.
- על רקע סגול עמוק (`--brand-purple-900`+): גרסה לבנה.
- **איסור:** אל תשנה צבעים, אל תוסיף צל, אל תמתח.

**Sub-brand בתוך הפלייבוק** (כמו "מאסטר ברנד AI"):
- בתור Badge, `--radius-pill`, רקע `--brand-purple-700`, טקסט לבן.
- אפשר להוסיף icon קטן משמאל לטקסט (בעברית = משמאל, כי זה badge RTL).

---

## 10. Do's & Don'ts

### ✅ DO
- תמיד להתחיל עמוד שלב עם כרטיס Hero כהה (gradient) לכותרת + meta.
- להשאיר הרבה white-space סביב טקסט.
- להשתמש ב-purple-700 כצבע ברירת המחדל לכל CTA.
- לבדוק ב-RTL *ו*-LTR (קוד/prompts).
- לוודא ניגודיות AA לפני merge.

### ❌ DON'T
- לא לערבב עם פלטת Growth AI (טורקיז/טיל/ירוק).
- לא להשתמש ביותר מ-gradient אחד בעמוד.
- לא להוסיף אימוג'ים בכותרות (בגוף הטקסט — מותר במידה).
- לא להעמיס Shadows כבדים. הברנד מינימליסטי.
- לא להשתמש ב-`font-style: italic` בעברית.
- לא ליצור layout עם סיידבר משמאל. **תמיד מימין** (RTL נכון).
- לא לשבור את מוסכמת השמות הדו-שונית `English | עברית`.

---

## 11. Tailwind Config Snippet (to extend)

```js
// tailwind.config.js — theme.extend
colors: {
  brand: {
    purple: {
      50:  '#F7F5FC',  100: '#F0ECF9',  200: '#E0D9F2',
      300: '#C4B8E6',  400: '#9B85D4',  500: '#7A5FBF',
      600: '#5B3AAE',  700: '#4A2E8F',  800: '#3D2678',
      900: '#2E1A5C',  950: '#1A0F3D',
    },
    blue: {
      100: '#DCE7FF',  400: '#7AA0FF',  500: '#4A7AFF',
      600: '#2E5FFF',  700: '#1E4FD6',  900: '#0A2F7D',
    },
  },
  neutral: {
    0:   '#FFFFFF',   100: '#F4F2F8',  200: '#E4E1EC',
    300: '#C8C4D4',   500: '#6B6485',  700: '#3D3459',
    900: '#1A1333',   950: '#0F0A1F',
  },
},
fontFamily: {
  display: ['Heebo', 'Rubik', 'system-ui', 'sans-serif'],
  sans:    ['Heebo', 'Rubik', 'system-ui', 'sans-serif'],
  mono:    ['JetBrains Mono', 'Menlo', 'monospace'],
},
borderRadius: {
  sm: '6px', md: '10px', lg: '16px', xl: '24px', pill: '999px',
},
backgroundImage: {
  'gradient-hero':   'linear-gradient(135deg, #2E1A5C 0%, #4A2E8F 50%, #1E4FD6 100%)',
  'gradient-header': 'linear-gradient(180deg, #1A0F3D 0%, #3D2678 100%)',
  'gradient-line':   'linear-gradient(90deg, #4A2E8F, #2E5FFF)',
},
```

---

## 12. Checklist לפני Deploy של פלייבוק חדש

- [ ] כל צבע בשימוש מהפלטה הקנונית (אין hex hardcoded מחוץ לרשימה).
- [ ] Heebo נטען מ-Google Fonts בהד.
- [ ] `dir="rtl"` על ה-`<html>`, `lang="he"`.
- [ ] Dark mode toggle עובד על כל העמודים.
- [ ] Progress bar נשמר ב-localStorage תחת key ייחודי לפלייבוק.
- [ ] כל Vimeo embed עם `dnt=1` ו-`loading="lazy"`.
- [ ] Lighthouse: Performance > 90, Accessibility > 95.
- [ ] בדיקה במובייל (iPhone + Android) ו-desktop Chrome/Safari.
- [ ] לוגו Digitech + sub-brand badge במיקום נכון ב-sidebar.
- [ ] No teal. No green. No Growth AI palette contamination.

---

**מסמך זה הוא הסמכות העליונה לעיצוב כל פלייבוק של Digitech. שינויים טעונים אישור Matan בלבד.**

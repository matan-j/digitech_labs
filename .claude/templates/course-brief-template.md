# TEMPLATE: Course Brief

Copy this template to start a new course.
Fill all 9 fields. If a field is unknown, write "TBD" — the system will halt and request it.

---

```markdown
# Course Brief — [TITLE]

## Identification
- **course_slug:** [lowercase-hyphenated-id]
- **title:** [Full Course Title in Hebrew]
- **language:** Hebrew / English / Mixed
- **branding_profile:** Digitech Standard / Custom

## Audience
- **audience_grade:** [e.g., כיתה ט׳ / Grade 9 / Ages 14–15]
- **prerequisites:** [e.g., יכולת בסיסית בגיליון אלקטרוני]

## Scope
- **duration_hours:** [4 / 6 / 8]
- **final_output:** [e.g., ניתוח נתונים אישי עם Flourish ו-Google Sheets]

## Constraints
- Devices: [מחשב נייד / טלפון / אין]
- Internet: [נדרש / לא נדרש]
- Installs: [אין / רשימת כלים]
- Platform restrictions: [e.g., רק כלים חינמיים]

## Additional Notes
[כל הקשר נוסף שרלוונטי למוריםה / לבית הספר / לקורס]
```

---

## JSON Version

```json
{
  "course_slug": "",
  "title": "",
  "audience_grade": "",
  "duration_hours": 0,
  "final_output": "",
  "prerequisites": "",
  "constraints": {
    "devices": "",
    "internet": "",
    "installs": "",
    "platform_restrictions": ""
  },
  "language": "Hebrew",
  "branding_profile": "Digitech Standard",
  "created_at": "YYYY-MM-DD"
}
```

---

## Example — Completed Brief

```json
{
  "course_slug": "big-data-9th",
  "title": "빅 데이터 ושימוש בנתונים",
  "audience_grade": "כיתה ט׳",
  "duration_hours": 8,
  "final_output": "ניתוח נתונים אישי: דשבורד ב-Flourish עם 3 תרשימים ופרשנות כתובה",
  "prerequisites": "היכרות בסיסית עם Google Sheets",
  "constraints": {
    "devices": "מחשב נייד",
    "internet": "נדרש",
    "installs": "אין — רק כלים מבוססי ווב",
    "platform_restrictions": "כלים חינמיים בלבד"
  },
  "language": "Hebrew",
  "branding_profile": "Digitech Standard",
  "created_at": "2025-01-01"
}
```

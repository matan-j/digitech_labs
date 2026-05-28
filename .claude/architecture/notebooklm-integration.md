# NotebookLM Integration Architecture
# Digitech Labs — Internal Reference

---

## המצב הנוכחי

| שאלה | תשובה |
|---|---|
| יש API רשמי? | **לא.** Google לא חשפו API ציבורי לNotebookLM |
| יש ספרייה לא רשמית? | **כן.** `notebooklm-py` (teng-lin/notebooklm-py, 2.3K ⭐) |
| האותנטיקציה | Browser-based OAuth פעם אחת → cookies נשמרות locally |
| יציבות | **לא מובטחת.** Unofficial API, Google יכולים לשנות בלי התראה |
| מה אפשר לייצר | Podcast, Video, Slides, Quiz, Flashcards, Infographic, Mind Map, Report |

---

## ארכיטקטורה מומלצת לצוות

### Option A — NotebookLM as a Service (מומלץ)

```
עובד/מחשב כלשהו
      ↓  POST /api/notebooklm/generate
  [Digitech Internal API Server]
  (Railway / Render / VPS)
      ↓  notebooklm-py
  [Google NotebookLM]
      ↓  artifact (podcast MP3, slides PDF, etc.)
  [Digitech Internal API Server]
      ↓  URL להורדה
  עובד
```

**יתרונות:**
- כל עובד משתמש דרך API פשוט — אין צורך ב-Python / דפדפן / Google account
- Google account אחד על השרת
- אפשר לנהל rate limiting ולוגים מרכזיים

**השרת (FastAPI wrapper):**

```python
# server.py — ~80 שורות
from fastapi import FastAPI, HTTPException
from notebooklm import NotebookLMClient
import asyncio

app = FastAPI()

@app.post("/generate/podcast")
async def generate_podcast(sources: list[str], title: str):
    async with await NotebookLMClient.from_storage() as client:
        nb = await client.notebooks.create(title)
        for url in sources:
            await client.sources.add_url(nb.id, url)
        status = await client.artifacts.generate_audio(nb.id)
        await client.artifacts.wait_for_completion(nb.id, status.task_id)
        path = await client.artifacts.download_audio(nb.id, f"/tmp/{nb.id}.mp3")
        return {"file": path, "notebook_id": nb.id}

@app.post("/generate/quiz")
async def generate_quiz(sources: list[str], title: str):
    # same pattern...

@app.post("/generate/slides")
async def generate_slides(sources: list[str], title: str):
    # same pattern...
```

**Deploy על Railway (הכי פשוט):**
```bash
# requirements.txt
notebooklm-py[browser]
fastapi
uvicorn
playwright

# Dockerfile
FROM python:3.11-slim
RUN pip install notebooklm-py[browser] fastapi uvicorn playwright
RUN playwright install chromium --with-deps
COPY . .
# One-time auth step: run notebooklm login on the server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Challenge:** ה-`notebooklm login` צריך להיעשות פעם אחת על השרת interactively.
פתרון: SSH לשרת, הרץ `notebooklm login`, הכנס credentials → נשמרים לצמיתות.

---

### Option B — Claude-Powered Synthesis (קיים כבר ✅)

הסקיל `/notebooklm` שבנינו — עובד עכשיו, לכל הצוות, בלי שום תשתית.

**מה הוא עושה שNotebookLM לא:**
- מייצר HTML infographic מותאם לDigntech
- עובד על כל content type (לא רק URLs)
- מחזיר structured data שניתן לשלב ישיר בפייפליין

**מה הוא לא עושה שNotebookLM כן:**
- ❌ Podcast audio (MP3) — שיחה מדוברת בין שני דמויות
- ❌ Video overview (MP4) — סרטון מסיכום
- ❌ Slide deck מעוצב (PPTX/PDF) — Google מייצרים עיצוב אמיתי
- ❌ Flashcards אינטראקטיביים

---

## מה לבנות ומתי

| Feature | מה צריך | מתי לבנות |
|---|---|---|
| Research synthesis + infographic | `/notebooklm` (קיים ✅) | עכשיו — כבר עובד |
| Podcast מסרטון | Option A server | כשיש צורך ב-audio deliverable |
| Quiz מסרטון | Option A server | כשהפלטפורמה מוכנה לcontent delivery |
| Video overview | Option A server | כשיש לקוח שמבקש |

---

## MCP Server (אופציה עתידית)

אם רוצים לשלב NotebookLM כ-MCP tool ב-Claude Code:

```typescript
// notebooklm-mcp/index.ts
const server = new McpServer({ name: "notebooklm" });

server.tool("generate_podcast", async ({ sources, title }) => {
  const res = await fetch("http://your-server/generate/podcast", {
    method: "POST",
    body: JSON.stringify({ sources, title })
  });
  return await res.json();
});
```

זה מאפשר: `/notebooklm generate_podcast [sources]` ישירות מ-Claude Code.

---

## המלצה לדיגיטק

**שלב 1 (עכשיו):** השתמש ב`/notebooklm` הקיים לכל research synthesis.

**שלב 2 (כשצריך audio):** Deploy שרת FastAPI + notebooklm-py על Railway (~$5/month).
זמן בנייה: ~4 שעות עבודה.

**שלב 3 (אופציונלי):** עטוף כ-MCP server כדי לקרוא לו ישיר מ-Claude Code.

---

## סיכון

`notebooklm-py` הוא unofficial. אם Google ישנו ה-API:
- השרת יפסיק לעבוד
- נצטרך לעדכן את הספרייה
- אין SLA

**Mitigation:** זה לא core infrastructure — זה enhancement. אם נפסק, הפלטפורמה ממשיכה לעבוד עם `/notebooklm` הקיים.

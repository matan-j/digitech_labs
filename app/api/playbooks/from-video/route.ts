import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 300;

const PLAYBOOK_FROM_VIDEO_SYSTEM = `אתה עוזר מקצועי שהופך תמלולי וידאו למדריכי HTML מובנים בעברית.
פלט: HTML גולמי בלבד (מתחיל ב-<!DOCTYPE html>).
עיצוב: Heebo, RTL, dir="rtl", רקע לבן, צבעי brand-purple, פילים לכפתורים.
מבנה: מבוא קצר, ראשי-פרקים, רעיונות מרכזיים, צעדים-לפעולה, סיכום.
שמור על הקול של הדובר; אל תמציא חומר; אל תהפוך את התמלול לסיכום-נקודות יבש.`;

function buildUserPrompt(title: string, transcript: string): string {
  return `הפוך את התמלול הזה למדריך HTML עשיר וקריא בעברית.

## כותרת
${title}

## תמלול גולמי
${transcript}

## דרישות
- כותרת ראשית = הכותרת לעיל
- כותרות-משנה (h2) לכל פרק לוגי שעולה מהתמלול
- פסקאות ברורות עם רעיונות מרכזיים
- "נקודות לפעולה" בסוף כל פרק (3-5 בולטים)
- סיכום קצר בסוף
- פלט HTML מלא, כולל <style> פנימי לעיצוב המינימלי הנדרש (Heebo, RTL, max-width 760px)`;
}

async function fetchVimeoTranscript(): Promise<string | null> {
  // Vimeo's auto-captions are not exposed via a stable public API.
  // For V1 we rely on the customer providing transcripts ahead of time
  // (e.g. uploaded as a resource). If/when we wire Vimeo's Captions API
  // here, return the joined caption text. Until then: return null and let
  // the caller surface a 422 to the UI.
  return null;
}

export async function POST(request: Request) {
  const { profile } = await requireAdmin();

  const body = await request.json().catch(() => ({}));
  const lessonId: string | undefined = body.lesson_id;
  const transcriptOverride: string | undefined = body.transcript;
  if (!lessonId) return NextResponse.json({ error: 'lesson_id_required' }, { status: 400 });

  const supabase = await createClient();
  const { data: lesson, error: lErr } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .maybeSingle();
  if (lErr || !lesson) return NextResponse.json({ error: 'lesson_not_found' }, { status: 404 });

  // Source the transcript: explicit override > Vimeo API attempt
  let transcript = transcriptOverride?.trim();
  if (!transcript && lesson.vimeo_id) {
    const fetched = await fetchVimeoTranscript();
    if (fetched) transcript = fetched;
  }

  if (!transcript) {
    return NextResponse.json(
      {
        error: 'transcript_unavailable',
        message: 'אין תמלול זמין לסרטון זה. הדבק תמלול ידני בשדה transcript או הוסף אותו כקובץ resource.',
      },
      { status: 422 },
    );
  }

  let html: string;
  try {
    html = await generateContent(PLAYBOOK_FROM_VIDEO_SYSTEM, buildUserPrompt(lesson.title, transcript));
  } catch (err) {
    console.error('[playbooks/from-video] Claude error:', err);
    return NextResponse.json({ error: 'claude_failed', message: err instanceof Error ? err.message : 'unknown' }, { status: 500 });
  }
  html = html.trim().replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();

  const { data: playbook, error } = await supabase
    .from('playbooks')
    .insert({
      source_type: 'video',
      source_id: lesson.id,
      title: `Playbook: ${lesson.title}`,
      html_content: html,
      created_by: profile.id,
    })
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: 'save_failed', message: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: playbook.id, title: playbook.title });
}

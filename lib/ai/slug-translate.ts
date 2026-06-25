// AI-backed slug generation: translate a Hebrew (or mixed) title into a short,
// readable English slug via Claude. If the model call fails (no network, API
// error, empty result) we fall back to letter-by-letter transliteration via
// toSlug() so slug creation NEVER breaks — meeting the "always works in real
// time" requirement while keeping the AI translation as the primary path.
//
// Server-only: imports lib/claude (needs ANTHROPIC_API_KEY).

import { generateContent } from '@/lib/claude';
import { toSlug } from '@/lib/utils/slug';

const SYSTEM = `You convert Hebrew (or mixed Hebrew/English) product, course, guide, and content titles into short English URL slugs.
Rules:
- Translate the MEANING into natural English. Do NOT transliterate letter-by-letter.
- Output ONLY the slug: lowercase English words separated by single hyphens.
- Use 2 to 5 words. No punctuation, no quotes, no explanations, no trailing period.
- Transliterate brand or personal names that have no English translation.
Examples:
"בינה מלאכותית לעסקים" -> "ai-for-business"
"ניתוח נתונים מתקדם" -> "advanced-data-analysis"
"עולם הביג דאטה" -> "big-data-world"`;

/**
 * Best-effort English slug for a title. Always returns a usable slug:
 * the AI translation when available, otherwise the transliteration fallback.
 */
export async function translateToSlug(text: string): Promise<string> {
  const raw = (text ?? '').trim();
  const fallback = toSlug(raw);
  if (!raw) return fallback;

  try {
    // retries=1 → fail fast to the transliteration fallback instead of stalling
    // the create request / live form preview on transient API errors.
    const out = await generateContent(SYSTEM, `Title: ${raw}\nSlug:`, 1);
    return toSlug(out) || fallback;
  } catch (err) {
    console.error('[slug:translate] falling back to transliteration:', err);
    return fallback;
  }
}

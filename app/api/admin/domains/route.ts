import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase/server';
import { DOMAIN_COLOR_OPTIONS, type DomainColor } from '@/lib/learn/domains';
import { toSlug, ensureUniqueSlug } from '@/lib/utils/slug';
import { translateToSlug } from '@/lib/ai/slug-translate';

function isColor(v: unknown): v is DomainColor {
  return typeof v === 'string' && (DOMAIN_COLOR_OPTIONS as readonly string[]).includes(v);
}

export async function GET() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('label', { ascending: true });
  if (error) {
    return NextResponse.json({ error: 'fetch_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json().catch(() => ({}));
  const label = (body.label ?? '').toString().trim();
  if (!label) return NextResponse.json({ error: 'label_required' }, { status: 400 });

  const color: DomainColor = isColor(body.color) ? body.color : 'slate';

  // id = provided slug (sanitized) or an AI/transliterated slug from the label.
  const provided = (body.id ?? body.slug ?? '').toString().trim();
  const base = (provided ? toSlug(provided) : await translateToSlug(label)) || `domain-${Date.now()}`;

  const supabase = createServiceClient();

  const id = await ensureUniqueSlug(base, async (c) => {
    const { count } = await supabase
      .from('domains')
      .select('id', { count: 'exact', head: true })
      .eq('id', c);
    return (count ?? 0) > 0;
  });

  const { data, error } = await supabase
    .from('domains')
    .insert({
      id,
      label,
      color,
      sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
    })
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: 'create_failed', message: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data });
}

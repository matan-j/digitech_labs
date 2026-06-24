import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Resolve a short code -> original course path and redirect.
// The target is stored as a same-origin relative path, so `new URL(path, req.url)`
// rebuilds the correct absolute URL for whatever host we're running on
// (localhost in dev, the real domain in prod) — nothing is hardcoded.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const supabase = await createClient();
  const { data } = await supabase
    .from('short_links')
    .select('target_path')
    .eq('code', code)
    .maybeSingle();

  const destination = data?.target_path ?? '/learn/courses';
  return NextResponse.redirect(new URL(destination, req.url));
}

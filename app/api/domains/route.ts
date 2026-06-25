import { NextResponse } from 'next/server';
import { listDomains } from '@/lib/learn/db';

// Public, read-only. Powers the domain dropdowns/filters in client components.
// Falls back to the seeded 6 inside listDomains() if the table isn't there yet.
export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await listDomains();
  return NextResponse.json({ items });
}

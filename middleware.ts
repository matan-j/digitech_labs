import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const ADMIN_PREFIXES = ['/admin', '/learn-admin'];
const AUTH_REQUIRED_PREFIXES = ['/account', '/upgrade/success'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, supabase } = await updateSession(request);

  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p))
    || ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if (!requiresAuth) return response;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = `?return=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  // Admin route guard
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/learn';
      homeUrl.search = '';
      return NextResponse.redirect(homeUrl);
    }
  }

  return response;
}

export const config = {
  // Run on every path except static assets and image optimisation
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)'],
};

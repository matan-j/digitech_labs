import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

const ADMIN_PREFIXES = ['/admin', '/learn-admin'];
const AUTH_REQUIRED_PREFIXES = ['/account', '/upgrade/success'];

// Paths under /admin that must remain publicly accessible (no auth) so the
// admin login flow itself can render. Anything else under /admin is gated.
const ADMIN_PUBLIC_PATHS = new Set<string>(['/admin/login']);

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, supabase } = await updateSession(request);

  // /admin/login is reachable without auth — otherwise the form could never render.
  if (ADMIN_PUBLIC_PATHS.has(pathname)) return response;

  const isAdmin = isAdminPath(pathname);
  const requiresAuth =
    isAdmin || AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!requiresAuth) return response;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    // Admin paths get their own dedicated login screen; everything else uses /login.
    loginUrl.pathname = isAdmin ? '/admin/login' : '/login';
    loginUrl.search = `?return=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  // Admin route guard — authenticated but not an admin -> back to learner area.
  if (isAdmin) {
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

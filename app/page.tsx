import { redirect } from 'next/navigation';

/**
 * Root path goes straight to the Learning Hub.
 *
 * The legacy CMS dashboard that used to live at "/" is now reachable only via
 * its named routes (/new, /new-playbook, /course/[slug], /learn-admin/*) for
 * authenticated admins on local dev. In production the CMS file-based pipeline
 * does not run (Vercel filesystem is read-only); use /admin/* instead.
 */
export default function Home() {
  redirect('/learn');
}

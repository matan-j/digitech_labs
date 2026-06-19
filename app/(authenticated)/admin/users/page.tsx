import { createServiceClient } from '@/lib/supabase/server';
import UsersTable from './UsersTable';

export const metadata = { title: 'ניהול משתמשים — Digitech Learning Hub' };
export const dynamic = 'force-dynamic';

type ProfileRow = {
  id: string;
  role: 'admin' | 'subscriber' | 'creator';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'none';
  current_period_end: string | null;
};

export type UserRow = {
  id: string;
  email: string | null;
  created_at: string;
} & ProfileRow;

export default async function UsersAdminPage() {
  const admin = createServiceClient();

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 200 }),
    admin.from('profiles').select('*'),
  ]);

  const profilesById = new Map<string, ProfileRow>((profiles ?? []).map((p: ProfileRow) => [p.id, p]));
  const users: UserRow[] = (authData?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? null,
    created_at: u.created_at,
    role: profilesById.get(u.id)?.role ?? 'subscriber',
    subscription_status: profilesById.get(u.id)?.subscription_status ?? 'none',
    current_period_end: profilesById.get(u.id)?.current_period_end ?? null,
  }));

  return (
    <div className="px-8 py-8 max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-950">משתמשים</h1>
        <p className="text-sm text-neutral-500 mt-1">{users.length} משתמשים רשומים. נהל תפקיד וגישה.</p>
      </header>
      <UsersTable users={users} />
    </div>
  );
}

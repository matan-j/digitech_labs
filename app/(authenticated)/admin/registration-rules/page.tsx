import { listRegistrationRules, listContent } from '@/lib/learn/db';
import type { GrantableResource } from '@/lib/learn/registration-rules';
import RegistrationRulesManager from './RegistrationRulesManager';

export const dynamic = 'force-dynamic';

export default async function RegistrationRulesAdminPage() {
  const [rules, courses, bundles] = await Promise.all([
    listRegistrationRules(),
    listContent('course'),
    listContent('bundle'),
  ]);

  const resources: GrantableResource[] = [
    ...courses.map((c) => ({ id: c.id, title: c.title, type: 'course' as const })),
    ...bundles.map((b) => ({ id: b.id, title: b.title, type: 'bundle' as const })),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-neutral-950">כללי הרשמה</h1>
        <p className="text-sm text-neutral-500 mt-1">
          הענקת גישה אוטומטית לקורסים ומוצרים לכל משתמש שנרשם בטווח תאריכים שתבחר.
        </p>
      </header>
      <RegistrationRulesManager initialRules={rules} resources={resources} />
    </div>
  );
}

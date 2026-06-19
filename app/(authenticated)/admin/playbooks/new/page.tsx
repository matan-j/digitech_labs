import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import NewPlaybookForm from './NewPlaybookForm';

export const metadata = { title: 'פלייבוק חדש — Digitech Learning Hub' };

export default function NewPlaybookPage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <Link href="/admin/playbooks" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה לרשימה
      </Link>
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-neutral-950">פלייבוק חדש</h1>
        <p className="text-sm text-neutral-500 mt-1">צור פלייבוק ידני — אחר כך תוכל לערוך תוכן, סיווג, וידאו וקאבר.</p>
      </header>

      <NewPlaybookForm />
    </div>
  );
}

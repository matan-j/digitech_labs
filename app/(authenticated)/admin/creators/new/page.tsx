import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import NewCreatorForm from './NewCreatorForm';

export const metadata = { title: 'יוצר חדש — Digitech Learning Hub' };

export default function NewCreatorPage() {
  return (
    <div className="px-8 py-8 max-w-2xl">
      <Link href="/admin/creators" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4">
        <ArrowRight className="w-3.5 h-3.5" />
        חזרה ליוצרים
      </Link>
      <h1 className="text-2xl font-extrabold text-neutral-950 mb-6">יוצר חדש</h1>
      <NewCreatorForm />
    </div>
  );
}

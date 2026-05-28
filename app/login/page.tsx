import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata = {
  title: 'התחברות — Digitech Learning Hub',
};

type Props = {
  searchParams: Promise<{ return?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { return: returnTo } = await searchParams;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-brand-purple-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
        <Link href="/learn" className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-pill bg-brand-purple-700 flex items-center justify-center text-white font-bold">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-neutral-950 text-lg leading-tight">Digitech</span>
            <span className="text-xs text-neutral-500 leading-tight">Learning Hub</span>
          </div>
        </Link>
        <h1 className="text-2xl font-extrabold text-neutral-950 mb-1.5">ברוך הבא</h1>
        <p className="text-sm text-neutral-600 mb-6">
          התחבר עם כתובת המייל שלך
        </p>
        <LoginForm returnTo={returnTo} />
      </div>
    </main>
  );
}

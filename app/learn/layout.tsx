import NavSidebar from '@/components/learn/NavSidebar';
import MobileTopBar from '@/components/learn/MobileTopBar';
import { getCurrentUser } from '@/lib/auth';
import { getBrandLogoUrl } from '@/lib/brand';

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, logoUrl] = await Promise.all([getCurrentUser(), getBrandLogoUrl()]);
  return (
    <div className="min-h-screen bg-brand-purple-50">
      <NavSidebar auth={auth} logoUrl={logoUrl} />
      <MobileTopBar auth={auth} logoUrl={logoUrl} />
      <main className="lg:mr-64 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { getPlaybook } from '@/lib/learn/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPlaybook(id);
  return { title: p ? p.title : 'פלייבוק לא נמצא' };
}

// Playbooks are full standalone HTML documents (Heebo, RTL, brand styles).
// We serve them inside a sandboxed iframe rendered from a Blob so they don't
// inherit the learn layout and can't escape to the parent app's scope.
export default async function PlaybookViewer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playbook = await getPlaybook(id);
  if (!playbook) notFound();

  return (
    <div className="min-h-screen bg-white">
      <iframe
        title={playbook.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        srcDoc={playbook.html_content}
        className="w-full h-screen border-0"
      />
    </div>
  );
}

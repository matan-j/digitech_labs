import { FileSpreadsheet, FileText, FileType, Link as LinkIcon } from 'lucide-react';
import type { Resource } from '@/lib/learn/types';

const ICONS = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  docx: FileType,
  link: LinkIcon,
} as const;

export default function ResourcesCard({ resources }: { resources: Resource[] }) {
  if (!resources || resources.length === 0) return null;

  return (
    <section className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6">
      <h3 className="font-bold text-neutral-950 mb-4">משאבי השיעור</h3>
      <ul className="space-y-2">
        {resources.map((r) => {
          const Icon = ICONS[r.kind ?? 'link'] ?? LinkIcon;
          return (
            <li key={r.id}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-3 px-3 py-3
                  rounded-md border border-neutral-200
                  hover:border-brand-purple-300 hover:bg-brand-purple-50
                  transition-colors
                "
              >
                <span className="w-10 h-10 rounded-md bg-brand-purple-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-brand-purple-700" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-neutral-950 truncate">
                    {r.title}
                  </span>
                  {r.sizeMB != null && (
                    <span className="block text-xs text-neutral-500 mt-0.5">
                      {r.sizeMB} MB
                    </span>
                  )}
                </span>
                <span className="text-xs text-brand-purple-700 font-semibold ms-2 shrink-0">
                  הורדה
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

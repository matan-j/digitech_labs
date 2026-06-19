import { Play, FileText, ExternalLink, BookOpen } from 'lucide-react';
import { resolveGuideThumbnail } from '@/lib/learn/placeholder';
import type { GuideContentKind } from '@/lib/learn/types';

const KIND_ICON: Record<GuideContentKind, typeof Play> = {
  youtube: Play,
  vimeo: Play,
  pdf: FileText,
  link: ExternalLink,
  article: BookOpen,
};

/**
 * Guide thumbnail with branded fallback.
 * Resolves cover_url → YouTube auto-thumb → branded purple placeholder
 * (gradient + content-kind icon). The video play badge shows for video kinds.
 */
export default function GuideThumbnail({
  coverUrl,
  contentKind,
  contentUrl,
  videoUrl,
  className = '',
}: {
  coverUrl?: string | null;
  contentKind?: GuideContentKind | null;
  contentUrl?: string | null;
  videoUrl?: string | null;
  className?: string;
}) {
  const src = resolveGuideThumbnail({ cover_url: coverUrl, content_kind: contentKind, content_url: contentUrl, video_url: videoUrl });
  const kind = contentKind ?? 'article';
  const Icon = KIND_ICON[kind];
  const isVideo = kind === 'youtube' || kind === 'vimeo';

  return (
    <div
      className={['relative overflow-hidden', className].join(' ')}
      style={
        src
          ? { backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundImage: 'linear-gradient(135deg, var(--color-brand-purple-100), var(--color-brand-purple-50) 70%, #FFFFFF)' }
      }
    >
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center text-brand-purple-300">
          <Icon className="w-10 h-10" strokeWidth={1.6} />
        </div>
      )}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center text-white shadow-lg ring-1 ring-white/30">
            <Play className="w-5 h-5 ms-0.5 fill-white" strokeWidth={0} />
          </span>
        </div>
      )}
    </div>
  );
}
